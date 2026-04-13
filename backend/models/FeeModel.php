<?php

require_once __DIR__ . '/../helpers/fee_schema.php';

class FeeModel
{
    private PDO $conn;

    private array $paymentModes = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'];

    private array $dueStatuses = ['Pending', 'Partial', 'Paid', 'Overdue'];

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureFeeSchema($conn);
    }

    public function getMeta(): array
    {
        $courses = $this->conn
            ->query("SELECT id, name FROM courses ORDER BY name ASC")
            ->fetchAll(PDO::FETCH_ASSOC);

        $batches = $this->conn
            ->query(
                "SELECT b.id, b.name, b.course_id, c.name AS course_name
                 FROM batches b
                 LEFT JOIN courses c ON c.id = b.course_id
                 ORDER BY b.name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        $enrollments = $this->conn
            ->query(
                "SELECT
                    sc.id,
                    sc.student_id,
                    sc.course_id,
                    sc.batch_id,
                    sc.total_fee,
                    sc.discount,
                    sc.due_date,
                    sc.installment_count,
                    CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                    s.admission_no,
                    s.phone,
                    c.name AS course_name,
                    b.name AS batch_name
                 FROM student_course sc
                 INNER JOIN students s ON s.id = sc.student_id
                 INNER JOIN courses c ON c.id = sc.course_id
                 LEFT JOIN batches b ON b.id = sc.batch_id
                 ORDER BY s.first_name ASC, s.last_name ASC"
            )
            ->fetchAll(PDO::FETCH_ASSOC);

        return [
            'payment_modes' => $this->paymentModes,
            'due_statuses' => $this->dueStatuses,
            'courses' => array_map(
                static fn (array $course) => [
                    'id' => (int) $course['id'],
                    'course_name' => $course['name'],
                ],
                $courses
            ),
            'batches' => array_map(
                static fn (array $batch) => [
                    'id' => (int) $batch['id'],
                    'batch_name' => $batch['name'],
                    'course_id' => (int) $batch['course_id'],
                    'course_name' => $batch['course_name'],
                ],
                $batches
            ),
            'enrollments' => array_map(
                fn (array $enrollment) => $this->transformEnrollment($enrollment),
                $enrollments
            ),
        ];
    }

    public function paginate(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $limit = max(1, min(25, (int) ($filters['limit'] ?? 8)));
        $offset = ($page - 1) * $limit;

        $aggregateJoin = $this->paymentAggregateJoin();
        [$whereSql, $params] = $this->buildFilters($filters);

        $countStmt = $this->conn->prepare(
            "SELECT COUNT(*) AS total
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             {$aggregateJoin}
             {$whereSql}"
        );
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $summarySql = $this->summarySql($whereSql);
        $summaryStmt = $this->conn->prepare($summarySql);
        $summaryStmt->execute($params);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $itemsStmt = $this->conn->prepare(
            "SELECT
                sc.id,
                sc.student_id,
                sc.course_id,
                sc.batch_id,
                sc.total_fee,
                sc.discount,
                sc.joined_date,
                sc.due_date,
                sc.installment_count,
                sc.notes,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                s.phone,
                c.name AS course_name,
                b.name AS batch_name,
                COALESCE(payments.tuition_paid, 0) AS tuition_paid,
                COALESCE(payments.late_fee_paid, 0) AS late_fee_paid,
                COALESCE(payments.total_collected, 0) AS total_collected,
                payments.last_payment_date,
                COALESCE(payments.payment_count, 0) AS payment_count
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             {$aggregateJoin}
             {$whereSql}
             ORDER BY COALESCE(payments.last_payment_date, sc.created_at) DESC, sc.id DESC
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value) {
            $itemsStmt->bindValue(':' . $key, $value);
        }
        $itemsStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $itemsStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $itemsStmt->execute();

        $items = array_map(
            fn (array $row) => $this->transformLedger($row),
            $itemsStmt->fetchAll(PDO::FETCH_ASSOC)
        );

        return [
            'items' => $items,
            'meta' => [
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'total_pages' => max(1, $limit > 0 ? (int) ceil($total / $limit) : 1),
                ],
                'summary' => [
                    'ledger_count' => (int) ($summary['ledger_count'] ?? 0),
                    'total_collected' => (float) ($summary['total_collected'] ?? 0),
                    'pending_fees' => (float) ($summary['pending_fees'] ?? 0),
                    'overdue_fees' => (float) ($summary['overdue_fees'] ?? 0),
                    'today_collection' => (float) ($summary['today_collection'] ?? 0),
                ],
            ],
        ];
    }

    public function find(int $ledgerId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                sc.id,
                sc.student_id,
                sc.course_id,
                sc.batch_id,
                sc.total_fee,
                sc.discount,
                sc.joined_date,
                sc.due_date,
                sc.installment_count,
                sc.notes,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                s.phone,
                s.email,
                c.name AS course_name,
                b.name AS batch_name,
                COALESCE(payments.tuition_paid, 0) AS tuition_paid,
                COALESCE(payments.late_fee_paid, 0) AS late_fee_paid,
                COALESCE(payments.total_collected, 0) AS total_collected,
                payments.last_payment_date,
                COALESCE(payments.payment_count, 0) AS payment_count
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             {$this->paymentAggregateJoin()}
             WHERE sc.id = :ledger_id
             LIMIT 1"
        );
        $stmt->execute(['ledger_id' => $ledgerId]);
        $ledger = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ledger) {
            return null;
        }

        $paymentsStmt = $this->conn->prepare(
            "SELECT
                id,
                amount_paid,
                late_fee,
                payment_date,
                payment_method,
                transaction_id,
                receipt_number,
                remarks,
                created_at
             FROM fees
             WHERE student_course_id = :ledger_id
             ORDER BY payment_date DESC, id DESC"
        );
        $paymentsStmt->execute(['ledger_id' => $ledgerId]);
        $payments = $paymentsStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'ledger' => $this->transformLedger($ledger),
            'payments' => array_map(
                fn (array $payment) => $this->transformPayment($payment),
                $payments
            ),
        ];
    }

    public function configurePlan(array $payload): array
    {
        $ledgerId = (int) $payload['student_course_id'];
        if (!$this->find($ledgerId)) {
            throw new RuntimeException('Fee plan not found.');
        }

        $stmt = $this->conn->prepare(
            "UPDATE student_course
             SET total_fee = :total_fee,
                 discount = :discount,
                 due_date = :due_date,
                 installment_count = :installment_count,
                 notes = :notes
             WHERE id = :ledger_id"
        );

        $stmt->execute([
            'total_fee' => $payload['total_fee'],
            'discount' => $payload['discount'],
            'due_date' => $payload['due_date'],
            'installment_count' => $payload['installment_count'],
            'notes' => $payload['notes'],
            'ledger_id' => $ledgerId,
        ]);

        return $this->find($ledgerId);
    }

    public function recordPayment(array $payload): array
    {
        $ledgerId = (int) $payload['student_course_id'];
        $ledger = $this->find($ledgerId);
        if (!$ledger) {
            throw new RuntimeException('Fee plan not found.');
        }

        $remainingDue = (float) ($ledger['ledger']['due_amount'] ?? 0);
        if ((float) $payload['amount_paid'] > $remainingDue + 0.0001) {
            throw new InvalidArgumentException('Payment amount cannot exceed the pending due amount.');
        }

        $this->conn->beginTransaction();

        try {
            $insertStmt = $this->conn->prepare(
                "INSERT INTO fees (
                    student_course_id,
                    amount_paid,
                    late_fee,
                    payment_date,
                    payment_method,
                    transaction_id,
                    receipt_number,
                    remarks
                 ) VALUES (
                    :student_course_id,
                    :amount_paid,
                    :late_fee,
                    :payment_date,
                    :payment_method,
                    :transaction_id,
                    '',
                    :remarks
                 )"
            );

            $insertStmt->execute([
                'student_course_id' => $ledgerId,
                'amount_paid' => $payload['amount_paid'],
                'late_fee' => $payload['late_fee'],
                'payment_date' => $payload['payment_date'],
                'payment_method' => $payload['payment_method'],
                'transaction_id' => $payload['transaction_id'],
                'remarks' => $payload['remarks'],
            ]);

            $paymentId = (int) $this->conn->lastInsertId();
            $receiptNumber = sprintf('RCPT-%s-%05d', date('Y', strtotime($payload['payment_date'])), $paymentId);

            $updateReceiptStmt = $this->conn->prepare(
                "UPDATE fees SET receipt_number = :receipt_number WHERE id = :payment_id"
            );
            $updateReceiptStmt->execute([
                'receipt_number' => $receiptNumber,
                'payment_id' => $paymentId,
            ]);

            $this->conn->commit();

            return $this->find($ledgerId);
        } catch (Throwable $exception) {
            $this->conn->rollBack();
            throw $exception;
        }
    }

    public function getReceipt(int $paymentId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT
                f.id,
                f.amount_paid,
                f.late_fee,
                f.payment_date,
                f.payment_method,
                f.transaction_id,
                f.receipt_number,
                f.remarks,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                s.phone,
                c.name AS course_name,
                b.name AS batch_name
             FROM fees f
             INNER JOIN student_course sc ON sc.id = f.student_course_id
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             WHERE f.id = :payment_id
             LIMIT 1"
        );
        $stmt->execute(['payment_id' => $paymentId]);
        $receipt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$receipt) {
            return null;
        }

        return $this->transformPayment($receipt) + [
            'student_name' => $receipt['full_name'],
            'student_id' => $receipt['admission_no'],
            'phone' => $receipt['phone'],
            'course_name' => $receipt['course_name'],
            'batch_name' => $receipt['batch_name'],
        ];
    }

    private function buildFilters(array $filters): array
    {
        $where = [];
        $params = [];

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $where[] = "(CONCAT_WS(' ', s.first_name, s.last_name) LIKE :search
                OR s.admission_no LIKE :search
                OR s.phone LIKE :search
                OR c.name LIKE :search
                OR b.name LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if (!empty($filters['course_id'])) {
            $where[] = 'sc.course_id = :course_id';
            $params['course_id'] = (int) $filters['course_id'];
        }

        if (!empty($filters['batch_id'])) {
            $where[] = 'sc.batch_id = :batch_id';
            $params['batch_id'] = (int) $filters['batch_id'];
        }

        $dueStatus = trim((string) ($filters['due_status'] ?? ''));
        if ($dueStatus !== '') {
            if ($dueStatus === 'Paid') {
                $where[] = "(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0)) <= 0";
            } elseif ($dueStatus === 'Overdue') {
                $where[] = "(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0)) > 0 AND sc.due_date < CURDATE()";
            } elseif ($dueStatus === 'Partial') {
                $where[] = "COALESCE(payments.tuition_paid, 0) > 0 AND (sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0)) > 0";
            } elseif ($dueStatus === 'Pending') {
                $where[] = "COALESCE(payments.tuition_paid, 0) = 0 AND (sc.total_fee - sc.discount) > 0";
            }
        }

        $paymentFrom = trim((string) ($filters['payment_from'] ?? ''));
        if ($paymentFrom !== '') {
            $where[] = 'payments.last_payment_date >= :payment_from';
            $params['payment_from'] = $paymentFrom;
        }

        $paymentTo = trim((string) ($filters['payment_to'] ?? ''));
        if ($paymentTo !== '') {
            $where[] = 'payments.last_payment_date <= :payment_to';
            $params['payment_to'] = $paymentTo;
        }

        return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
    }

    private function paymentAggregateJoin(): string
    {
        return "
            LEFT JOIN (
                SELECT
                    student_course_id,
                    SUM(amount_paid) AS tuition_paid,
                    SUM(late_fee) AS late_fee_paid,
                    SUM(amount_paid + late_fee) AS total_collected,
                    MAX(payment_date) AS last_payment_date,
                    COUNT(*) AS payment_count
                FROM fees
                GROUP BY student_course_id
            ) payments ON payments.student_course_id = sc.id
        ";
    }

    private function summarySql(string $whereSql): string
    {
        return "
            SELECT
                COUNT(*) AS ledger_count,
                COALESCE(SUM(COALESCE(payments.total_collected, 0)), 0) AS total_collected,
                COALESCE(SUM(GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0)), 0) AS pending_fees,
                COALESCE(SUM(
                    CASE
                        WHEN sc.due_date < CURDATE()
                             AND GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0) > 0
                        THEN GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0)
                        ELSE 0
                    END
                ), 0) AS overdue_fees,
                COALESCE(SUM(COALESCE(today_payments.today_collection, 0)), 0) AS today_collection
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             {$this->paymentAggregateJoin()}
             LEFT JOIN (
                SELECT
                    student_course_id,
                    SUM(amount_paid + late_fee) AS today_collection
                FROM fees
                WHERE payment_date = CURDATE()
                GROUP BY student_course_id
             ) today_payments ON today_payments.student_course_id = sc.id
             {$whereSql}
        ";
    }

    private function transformEnrollment(array $row): array
    {
        return [
            'student_course_id' => (int) $row['id'],
            'student_id' => (int) $row['student_id'],
            'student_code' => $row['admission_no'],
            'student_name' => $row['full_name'],
            'phone' => $row['phone'],
            'course_id' => (int) $row['course_id'],
            'course_name' => $row['course_name'],
            'batch_id' => $row['batch_id'] ? (int) $row['batch_id'] : null,
            'batch_name' => $row['batch_name'],
            'total_fee' => (float) $row['total_fee'],
            'discount' => (float) $row['discount'],
            'due_date' => $row['due_date'] ?? null,
            'installment_count' => $row['installment_count'] !== null ? (int) $row['installment_count'] : null,
        ];
    }

    private function transformLedger(array $row): array
    {
        $netFee = max((float) $row['total_fee'] - (float) $row['discount'], 0);
        $paid = (float) ($row['tuition_paid'] ?? 0);
        $lateFees = (float) ($row['late_fee_paid'] ?? 0);
        $due = max($netFee - $paid, 0);

        if ($due <= 0.0001) {
            $status = 'Paid';
        } elseif ($paid > 0) {
            $status = ($row['due_date'] && $row['due_date'] < date('Y-m-d')) ? 'Overdue' : 'Partial';
        } else {
            $status = ($row['due_date'] && $row['due_date'] < date('Y-m-d')) ? 'Overdue' : 'Pending';
        }

        return [
            'id' => (int) $row['id'],
            'student_course_id' => (int) $row['id'],
            'student_id' => (int) $row['student_id'],
            'student_code' => $row['admission_no'],
            'student_name' => $row['full_name'],
            'phone' => $row['phone'],
            'course_id' => (int) $row['course_id'],
            'course_name' => $row['course_name'],
            'batch_id' => $row['batch_id'] ? (int) $row['batch_id'] : null,
            'batch_name' => $row['batch_name'],
            'total_fee' => (float) $row['total_fee'],
            'discount' => (float) $row['discount'],
            'net_fee' => $netFee,
            'amount_paid' => $paid,
            'late_fee_collected' => $lateFees,
            'total_collected' => (float) ($row['total_collected'] ?? 0),
            'due_amount' => $due,
            'due_date' => $row['due_date'] ?? null,
            'installment_count' => $row['installment_count'] !== null ? (int) $row['installment_count'] : null,
            'payment_count' => (int) ($row['payment_count'] ?? 0),
            'last_payment_date' => $row['last_payment_date'] ?? null,
            'joined_date' => $row['joined_date'] ?? null,
            'notes' => $row['notes'] ?? '',
            'due_status' => $status,
        ];
    }

    private function transformPayment(array $row): array
    {
        $amountPaid = (float) $row['amount_paid'];
        $lateFee = (float) ($row['late_fee'] ?? 0);

        return [
            'id' => (int) $row['id'],
            'amount_paid' => $amountPaid,
            'late_fee' => $lateFee,
            'total_collected' => $amountPaid + $lateFee,
            'payment_date' => $row['payment_date'],
            'payment_method' => $row['payment_method'],
            'transaction_id' => $row['transaction_id'] ?? null,
            'receipt_number' => $row['receipt_number'] ?? null,
            'remarks' => $row['remarks'] ?? '',
            'created_at' => $row['created_at'] ?? null,
        ];
    }
}
