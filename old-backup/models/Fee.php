<?php

declare(strict_types=1);

class Fee extends BaseModel
{
    public function all(array $filters = []): array
    {
        $sql = 'SELECT f.*,
                       f.`STATUS` AS status,
                       s.name AS student_name,
                       s.phone,
                       COALESCE(c.course_name, s.course) AS course_name
                FROM fees f
                INNER JOIN students s ON s.id = f.student_id
                LEFT JOIN courses c ON c.id = s.course_id
                WHERE 1 = 1';

        $params = [];

        if (!empty($filters['search'])) {
            $sql .= ' AND (s.name LIKE :search OR s.phone LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND f.`STATUS` = :status';
            $params['status'] = $filters['status'];
        }

        $sql .= ' ORDER BY f.id DESC';

        return $this->db->select($sql, $params);
    }

    public function find(int $id): ?array
    {
        return $this->db->selectOne(
            'SELECT f.*,
                    f.`STATUS` AS status,
                    s.name AS student_name,
                    s.phone,
                    s.email,
                    COALESCE(c.course_name, s.course) AS course_name
             FROM fees f
             INNER JOIN students s ON s.id = f.student_id
             LEFT JOIN courses c ON c.id = s.course_id
             WHERE f.id = :id
             LIMIT 1',
            ['id' => $id]
        );
    }

    public function createPlan(array $data): int
    {
        $totalFees = (float) $data['total_fees'];
        $paid = (float) $data['paid'];
        $remaining = max($totalFees - $paid, 0);
        $status = $remaining <= 0 ? 'Paid' : 'Pending';

        return $this->db->transaction(function (Database $db) use ($data, $totalFees, $paid, $remaining, $status): int {
            $feeId = $db->insert(
                'INSERT INTO fees (
                    student_id, total_fees, paid, remaining, `STATUS`, installment_amount, last_payment_date, created_at
                 ) VALUES (
                    :student_id, :total_fees, :paid, :remaining, :status, :installment_amount, :last_payment_date, NOW()
                 )',
                [
                    'student_id' => $data['student_id'],
                    'total_fees' => $totalFees,
                    'paid' => $paid,
                    'remaining' => $remaining,
                    'status' => $status,
                    'installment_amount' => $data['installment_amount'],
                    'last_payment_date' => $paid > 0 ? ($data['payment_date'] ?: date('Y-m-d')) : null,
                ]
            );

            if ($paid > 0) {
                $db->insert(
                    'INSERT INTO fee_installments (fee_id, student_id, amount, payment_date, payment_mode, note)
                     VALUES (:fee_id, :student_id, :amount, :payment_date, :payment_mode, :note)',
                    [
                        'fee_id' => $feeId,
                        'student_id' => $data['student_id'],
                        'amount' => $paid,
                        'payment_date' => $data['payment_date'] ?: date('Y-m-d'),
                        'payment_mode' => $data['payment_mode'] ?: 'Cash',
                        'note' => $data['note'] ?: 'Initial payment',
                    ]
                );
            }

            return $feeId;
        });
    }

    public function addInstallment(int $feeId, float $amount, string $paymentDate, string $paymentMode, ?string $note = null): void
    {
        $fee = $this->find($feeId);

        if (!$fee) {
            throw new RuntimeException('Fee record not found.');
        }

        if ((float) $fee['remaining'] <= 0) {
            throw new RuntimeException('This fee plan is already fully paid.');
        }

        if ($amount > (float) $fee['remaining']) {
            throw new RuntimeException('Installment amount cannot exceed pending fees.');
        }

        $newPaid = (float) $fee['paid'] + $amount;
        $newRemaining = max((float) $fee['total_fees'] - $newPaid, 0);
        $status = $newRemaining <= 0 ? 'Paid' : 'Pending';

        $this->db->transaction(function (Database $db) use ($fee, $feeId, $amount, $paymentDate, $paymentMode, $note, $newPaid, $newRemaining, $status): void {
            $db->execute(
                'UPDATE fees
                 SET paid = :paid,
                     remaining = :remaining,
                     `STATUS` = :status,
                     last_payment_date = :last_payment_date
                 WHERE id = :id',
                [
                    'paid' => $newPaid,
                    'remaining' => $newRemaining,
                    'status' => $status,
                    'last_payment_date' => $paymentDate,
                    'id' => $feeId,
                ]
            );

            $db->insert(
                'INSERT INTO fee_installments (fee_id, student_id, amount, payment_date, payment_mode, note)
                 VALUES (:fee_id, :student_id, :amount, :payment_date, :payment_mode, :note)',
                [
                    'fee_id' => $feeId,
                    'student_id' => $fee['student_id'],
                    'amount' => $amount,
                    'payment_date' => $paymentDate,
                    'payment_mode' => $paymentMode,
                    'note' => $note ?: 'Installment payment',
                ]
            );
        });
    }

    public function installments(int $feeId): array
    {
        return $this->db->select(
            'SELECT *
             FROM fee_installments
             WHERE fee_id = :fee_id
             ORDER BY payment_date DESC, id DESC',
            ['fee_id' => $feeId]
        );
    }

    public function totalCollected(): float
    {
        return (float) ($this->db->scalar('SELECT COALESCE(SUM(paid), 0) FROM fees') ?? 0);
    }

    public function totalPending(): float
    {
        return (float) ($this->db->scalar('SELECT COALESCE(SUM(GREATEST(remaining, 0)), 0) FROM fees') ?? 0);
    }

    public function paymentRowsForExport(): array
    {
        return $this->db->select(
            'SELECT s.name AS student_name,
                    COALESCE(c.course_name, s.course) AS course_name,
                    f.total_fees,
                    f.paid,
                    f.remaining,
                    f.`STATUS` AS status,
                    f.installment_amount,
                    f.last_payment_date
             FROM fees f
             INNER JOIN students s ON s.id = f.student_id
             LEFT JOIN courses c ON c.id = s.course_id
             ORDER BY s.name ASC'
        );
    }

    public function pendingRiskCandidates(): array
    {
        return $this->db->select(
            'SELECT f.id,
                    f.student_id,
                    s.name AS student_name,
                    f.total_fees,
                    f.paid,
                    f.remaining,
                    f.last_payment_date,
                    COUNT(fi.id) AS installment_count
             FROM fees f
             INNER JOIN students s ON s.id = f.student_id
             LEFT JOIN fee_installments fi ON fi.fee_id = f.id
             WHERE f.remaining > 0
             GROUP BY f.id
             ORDER BY f.remaining DESC, f.last_payment_date ASC'
        );
    }

    public function pendingReminders(int $limit = 5): array
    {
        $rows = $this->db->select(
            'SELECT f.id,
                    s.name AS student_name,
                    s.phone,
                    f.remaining,
                    f.last_payment_date,
                    f.installment_amount
             FROM fees f
             INNER JOIN students s ON s.id = f.student_id
             WHERE f.remaining > 0
             ORDER BY f.remaining DESC, f.last_payment_date ASC
             LIMIT ' . (int) $limit
        );

        return array_map(static function (array $row): array {
            $days = $row['last_payment_date']
                ? (int) floor((time() - strtotime($row['last_payment_date'])) / 86400)
                : 0;

            $row['message'] = $row['student_name'] . ' has ' . currency($row['remaining']) . ' pending' .
                ($days > 0 ? ' and last paid ' . $days . ' days ago.' : '.');

            return $row;
        }, $rows);
    }

    public function monthlyCollections(int $months = 6): array
    {
        return $this->db->select(
            'SELECT DATE_FORMAT(payment_date, "%Y-%m") AS month_key, SUM(amount) AS total
             FROM fee_installments
             WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL ' . (int) $months . ' MONTH)
             GROUP BY DATE_FORMAT(payment_date, "%Y-%m")
             ORDER BY month_key ASC'
        );
    }
}
