<?php

require_once __DIR__ . '/../helpers/student_schema.php';
require_once __DIR__ . '/../helpers/course_schema.php';
require_once __DIR__ . '/../helpers/batch_schema.php';
require_once __DIR__ . '/../helpers/fee_schema.php';
require_once __DIR__ . '/../helpers/attendance_schema.php';

class DashboardModel
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureStudentSchema($conn);
        ensureCourseSchema($conn);
        ensureBatchSchema($conn);
        ensureFeeSchema($conn);
        ensureAttendanceSchema($conn);
    }

    public function overview(): array
    {
        $overview = $this->overviewStats();
        $alerts = $this->alertsPayload();
        $insights = $this->insightsPayload($overview, $alerts);

        return [
            'overview' => $overview,
            'charts' => [
                'revenue_trend' => $this->revenueTrend(),
                'attendance_trend' => $this->attendanceTrend(),
                'course_performance' => $this->coursePerformance(),
            ],
            'recent_activity' => $this->recentActivity(),
            'alerts' => $alerts,
            'insights' => $insights,
        ];
    }

    private function overviewStats(): array
    {
        $paymentsJoin = $this->paymentsAggregateSql();

        $stmt = $this->conn->query(
            "SELECT
                (SELECT COUNT(*) FROM students) AS total_students,
                (SELECT COUNT(*) FROM students WHERE status = 'Active') AS active_students,
                (SELECT COUNT(*) FROM courses WHERE status = 'Active') AS active_courses,
                (SELECT COUNT(*) FROM batches) AS total_batches,
                (SELECT COUNT(*) FROM batches WHERE status = 'Active') AS active_batches,
                (SELECT COUNT(*) FROM batches WHERE status = 'Planned') AS planned_batches,
                (SELECT COUNT(*) FROM students
                    WHERE admission_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS new_admissions_month,
                (SELECT COALESCE(SUM(amount_paid + COALESCE(late_fee, 0)), 0) FROM fees) AS fees_collected,
                (SELECT COALESCE(SUM(amount_paid + COALESCE(late_fee, 0)), 0)
                    FROM fees
                    WHERE payment_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ) AS revenue_this_month,
                (SELECT COALESCE(SUM(amount_paid + COALESCE(late_fee, 0)), 0)
                    FROM fees
                    WHERE payment_date = CURDATE()
                ) AS today_collection,
                (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS expenses_total,
                (
                    SELECT COALESCE(
                        SUM(GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0)),
                        0
                    )
                    FROM student_course sc
                    {$paymentsJoin}
                ) AS pending_fees,
                (
                    SELECT COALESCE(
                        SUM(
                            CASE
                                WHEN sc.due_date < CURDATE()
                                     AND GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0) > 0
                                THEN GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0)
                                ELSE 0
                            END
                        ),
                        0
                    )
                    FROM student_course sc
                    {$paymentsJoin}
                ) AS overdue_fees,
                (
                    SELECT COUNT(*)
                    FROM (
                        SELECT
                            b.id,
                            b.capacity,
                            COALESCE(stats.student_count, 0) AS student_count
                        FROM batches b
                        LEFT JOIN (
                            SELECT batch_id, COUNT(DISTINCT student_id) AS student_count
                            FROM student_course
                            WHERE batch_id IS NOT NULL
                            GROUP BY batch_id
                        ) stats ON stats.batch_id = b.id
                        WHERE b.capacity IS NOT NULL AND b.capacity > 0
                    ) underfilled
                    WHERE (underfilled.student_count / underfilled.capacity) < 0.5
                ) AS underfilled_batches"
        );

        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $attendanceTodayStmt = $this->conn->query(
            "SELECT
                COUNT(*) AS total_records,
                SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_records
             FROM attendance
             WHERE date = CURDATE()"
        );
        $attendanceToday = $attendanceTodayStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $totalRecords = (int) ($attendanceToday['total_records'] ?? 0);
        $attendedRecords = (int) ($attendanceToday['attended_records'] ?? 0);

        $feesCollected = (float) ($row['fees_collected'] ?? 0);
        $expensesTotal = (float) ($row['expenses_total'] ?? 0);

        return [
            'total_students' => (int) ($row['total_students'] ?? 0),
            'active_students' => (int) ($row['active_students'] ?? 0),
            'active_courses' => (int) ($row['active_courses'] ?? 0),
            'active_batches' => (int) ($row['active_batches'] ?? 0),
            'total_batches' => (int) ($row['total_batches'] ?? 0),
            'planned_batches' => (int) ($row['planned_batches'] ?? 0),
            'fees_collected' => $feesCollected,
            'revenue_this_month' => (float) ($row['revenue_this_month'] ?? 0),
            'pending_fees' => (float) ($row['pending_fees'] ?? 0),
            'overdue_fees' => (float) ($row['overdue_fees'] ?? 0),
            'today_collection' => (float) ($row['today_collection'] ?? 0),
            'expenses_total' => $expensesTotal,
            'net_profit' => $feesCollected - $expensesTotal,
            'new_admissions_month' => (int) ($row['new_admissions_month'] ?? 0),
            'today_attendance_percentage' => $totalRecords > 0
                ? round(($attendedRecords / $totalRecords) * 100, 1)
                : 0,
            'underfilled_batches' => (int) ($row['underfilled_batches'] ?? 0),
        ];
    }

    private function revenueTrend(): array
    {
        $start = new DateTime('first day of this month');
        $start->modify('-5 months');

        $revenueStmt = $this->conn->prepare(
            "SELECT
                DATE_FORMAT(payment_date, '%Y-%m-01') AS month_key,
                SUM(amount_paid + COALESCE(late_fee, 0)) AS total
             FROM fees
             WHERE payment_date >= :start_date
             GROUP BY month_key
             ORDER BY month_key ASC"
        );
        $revenueStmt->execute(['start_date' => $start->format('Y-m-d')]);
        $revenueRows = $revenueStmt->fetchAll(PDO::FETCH_ASSOC);

        $expenseStmt = $this->conn->prepare(
            "SELECT
                DATE_FORMAT(date, '%Y-%m-01') AS month_key,
                SUM(amount) AS total
             FROM expenses
             WHERE date >= :start_date
             GROUP BY month_key
             ORDER BY month_key ASC"
        );
        $expenseStmt->execute(['start_date' => $start->format('Y-m-d')]);
        $expenseRows = $expenseStmt->fetchAll(PDO::FETCH_ASSOC);

        $revenueMap = [];
        foreach ($revenueRows as $row) {
            $revenueMap[$row['month_key']] = (float) $row['total'];
        }

        $expenseMap = [];
        foreach ($expenseRows as $row) {
            $expenseMap[$row['month_key']] = (float) $row['total'];
        }

        $points = [];
        $cursor = clone $start;
        for ($i = 0; $i < 6; $i++) {
            $monthKey = $cursor->format('Y-m-01');
            $revenue = $revenueMap[$monthKey] ?? 0;
            $expense = $expenseMap[$monthKey] ?? 0;

            $points[] = [
                'label' => $cursor->format('M'),
                'month_key' => $monthKey,
                'revenue' => $revenue,
                'expenses' => $expense,
                'profit' => $revenue - $expense,
            ];

            $cursor->modify('+1 month');
        }

        return $points;
    }

    private function attendanceTrend(): array
    {
        $start = new DateTime('today');
        $start->modify('-6 days');

        $stmt = $this->conn->prepare(
            "SELECT
                date,
                COUNT(*) AS total_records,
                SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_records,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_records
             FROM attendance
             WHERE date >= :start_date
             GROUP BY date
             ORDER BY date ASC"
        );
        $stmt->execute(['start_date' => $start->format('Y-m-d')]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[$row['date']] = $row;
        }

        $points = [];
        $cursor = clone $start;
        for ($i = 0; $i < 7; $i++) {
            $dateKey = $cursor->format('Y-m-d');
            $row = $map[$dateKey] ?? null;
            $total = (int) ($row['total_records'] ?? 0);
            $attended = (int) ($row['attended_records'] ?? 0);

            $points[] = [
                'label' => $cursor->format('D'),
                'date' => $dateKey,
                'attendance_percentage' => $total > 0 ? round(($attended / $total) * 100, 1) : 0,
                'present_count' => $attended,
                'absent_count' => (int) ($row['absent_records'] ?? 0),
                'total_records' => $total,
            ];

            $cursor->modify('+1 day');
        }

        return $points;
    }

    private function coursePerformance(): array
    {
        $stmt = $this->conn->query(
            "SELECT
                c.id,
                c.name AS course_name,
                COUNT(DISTINCT sc.student_id) AS enrolled_students,
                COALESCE(SUM(payments.total_collected), 0) AS collected_amount,
                COALESCE(
                    SUM(GREATEST(sc.total_fee - sc.discount - COALESCE(payments.tuition_paid, 0), 0)),
                    0
                ) AS pending_amount
             FROM courses c
             LEFT JOIN student_course sc ON sc.course_id = c.id
             LEFT JOIN (
                SELECT
                    student_course_id,
                    SUM(amount_paid) AS tuition_paid,
                    SUM(amount_paid + COALESCE(late_fee, 0)) AS total_collected
                FROM fees
                GROUP BY student_course_id
             ) payments ON payments.student_course_id = sc.id
             GROUP BY c.id, c.name
             ORDER BY enrolled_students DESC, collected_amount DESC, c.name ASC
             LIMIT 6"
        );

        return array_map(
            static fn (array $row): array => [
                'course_id' => (int) $row['id'],
                'course_name' => $row['course_name'],
                'enrolled_students' => (int) $row['enrolled_students'],
                'collected_amount' => (float) $row['collected_amount'],
                'pending_amount' => (float) $row['pending_amount'],
            ],
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );
    }

    private function recentActivity(): array
    {
        $items = [];

        $studentsStmt = $this->conn->query(
            "SELECT
                id,
                admission_no,
                CONCAT_WS(' ', first_name, last_name) AS full_name,
                COALESCE(admission_date, DATE(created_at)) AS activity_date,
                created_at
             FROM students
             ORDER BY created_at DESC
             LIMIT 4"
        );
        foreach ($studentsStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'type' => 'student',
                'title' => $row['full_name'] . ' was admitted',
                'description' => 'Student ID ' . $row['admission_no'] . ' joined the institute.',
                'date' => $row['activity_date'],
                'timestamp' => $row['created_at'] ?? $row['activity_date'],
                'href' => '/admin/students/' . (int) $row['id'],
            ];
        }

        $paymentsStmt = $this->conn->query(
            "SELECT
                f.id,
                sc.id AS ledger_id,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                f.amount_paid,
                f.payment_date,
                f.created_at,
                f.receipt_number
             FROM fees f
             INNER JOIN student_course sc ON sc.id = f.student_course_id
             INNER JOIN students s ON s.id = sc.student_id
             ORDER BY COALESCE(f.created_at, f.payment_date) DESC, f.id DESC
             LIMIT 4"
        );
        foreach ($paymentsStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'type' => 'payment',
                'title' => 'Payment recorded for ' . $row['full_name'],
                'description' => 'Receipt ' . ($row['receipt_number'] ?: 'generated') . ' captured a payment of Rs. ' . number_format((float) $row['amount_paid'], 0),
                'date' => $row['payment_date'],
                'timestamp' => $row['created_at'] ?? $row['payment_date'],
                'href' => '/admin/fees/' . (int) $row['ledger_id'],
            ];
        }

        $sessionsStmt = $this->conn->query(
            "SELECT
                MAX(a.id) AS id,
                a.batch_id,
                a.date,
                MAX(a.created_at) AS created_at,
                b.name AS batch_name,
                COUNT(*) AS total_records,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count
             FROM attendance a
             INNER JOIN batches b ON b.id = a.batch_id
             GROUP BY a.batch_id, a.date, b.name
             ORDER BY a.date DESC, id DESC
             LIMIT 4"
        );
        foreach ($sessionsStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'type' => 'attendance',
                'title' => 'Attendance marked for ' . $row['batch_name'],
                'description' => (int) $row['total_records'] . ' records saved with ' . (int) $row['absent_count'] . ' absences.',
                'date' => $row['date'],
                'timestamp' => $row['created_at'] ?? $row['date'],
                'href' => '/admin/attendance',
            ];
        }

        $coursesStmt = $this->conn->query(
            "SELECT id, name, created_at
             FROM courses
             ORDER BY created_at DESC
             LIMIT 3"
        );
        foreach ($coursesStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'type' => 'course',
                'title' => $row['name'] . ' course created',
                'description' => 'A new course is now available for admissions and batch planning.',
                'date' => date('Y-m-d', strtotime((string) $row['created_at'])),
                'timestamp' => $row['created_at'],
                'href' => '/admin/courses/' . (int) $row['id'],
            ];
        }

        $batchesStmt = $this->conn->query(
            "SELECT id, name, created_at
             FROM batches
             ORDER BY created_at DESC
             LIMIT 3"
        );
        foreach ($batchesStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'type' => 'batch',
                'title' => $row['name'] . ' batch configured',
                'description' => 'The batch is ready for student assignment and attendance tracking.',
                'date' => date('Y-m-d', strtotime((string) $row['created_at'])),
                'timestamp' => $row['created_at'],
                'href' => '/admin/batches/' . (int) $row['id'],
            ];
        }

        usort(
            $items,
            static fn (array $left, array $right): int =>
                strtotime((string) $right['timestamp']) <=> strtotime((string) $left['timestamp'])
        );

        return array_slice($items, 0, 8);
    }

    private function alertsPayload(): array
    {
        $ledgerRows = $this->ledgerCandidates();
        $today = new DateTime('today');
        $nextWeek = (clone $today)->modify('+7 days');

        $pendingFeeStudents = [];
        $upcomingDues = [];
        $paymentRiskStudents = [];

        foreach ($ledgerRows as $row) {
            $netFee = max((float) $row['total_fee'] - (float) $row['discount'], 0);
            $paid = (float) ($row['tuition_paid'] ?? 0);
            $dueAmount = max($netFee - $paid, 0);
            if ($dueAmount <= 0.0001) {
                continue;
            }

            $dueDate = !empty($row['due_date']) ? new DateTime($row['due_date']) : null;
            $daysOverdue = $dueDate && $dueDate < $today ? (int) $today->diff($dueDate)->format('%a') : 0;

            $item = [
                'ledger_id' => (int) $row['ledger_id'],
                'student_id' => (int) $row['student_id'],
                'student_name' => $row['full_name'],
                'student_code' => $row['admission_no'],
                'course_name' => $row['course_name'],
                'batch_name' => $row['batch_name'],
                'due_date' => $row['due_date'],
                'due_amount' => $dueAmount,
                'payment_count' => (int) ($row['payment_count'] ?? 0),
                'days_overdue' => $daysOverdue,
            ];

            $pendingFeeStudents[] = $item;

            if ($dueDate && $dueDate >= $today && $dueDate <= $nextWeek) {
                $upcomingDues[] = $item;
            }

            $riskScore = 0;
            if ($daysOverdue > 0) {
                $riskScore += 3;
            }
            if ($daysOverdue >= 15) {
                $riskScore += 2;
            }
            if ((int) ($row['payment_count'] ?? 0) === 0) {
                $riskScore += 2;
            }
            if ($netFee > 0 && $paid < ($netFee * 0.4)) {
                $riskScore += 1;
            }
            if ($dueDate && $dueDate <= $nextWeek) {
                $riskScore += 1;
            }

            if ($riskScore >= 4) {
                $item['risk_score'] = $riskScore;
                $paymentRiskStudents[] = $item;
            }
        }

        usort(
            $pendingFeeStudents,
            static fn (array $left, array $right): int =>
                [$right['days_overdue'], $right['due_amount']] <=> [$left['days_overdue'], $left['due_amount']]
        );
        usort(
            $upcomingDues,
            static fn (array $left, array $right): int =>
                strtotime((string) $left['due_date']) <=> strtotime((string) $right['due_date'])
        );
        usort(
            $paymentRiskStudents,
            static fn (array $left, array $right): int =>
                [$right['risk_score'], $right['due_amount']] <=> [$left['risk_score'], $left['due_amount']]
        );

        $lowAttendanceStudents = $this->lowAttendanceStudents();
        $underfilledBatches = $this->underfilledBatches();

        return [
            'pending_fee_students' => array_slice($pendingFeeStudents, 0, 5),
            'payment_risk_students' => array_slice($paymentRiskStudents, 0, 5),
            'low_attendance_students' => $lowAttendanceStudents,
            'underfilled_batches' => $underfilledBatches,
            'upcoming_dues' => array_slice($upcomingDues, 0, 5),
        ];
    }

    private function insightsPayload(array $overview, array $alerts): array
    {
        $paymentRiskCount = count($alerts['payment_risk_students']);
        $lowAttendanceCount = count($alerts['low_attendance_students']);
        $underfilledCount = count($alerts['underfilled_batches']);
        $upcomingDueCount = count($alerts['upcoming_dues']);

        $cards = [
            [
                'title' => 'students may not complete payment',
                'value' => $paymentRiskCount,
                'tone' => $paymentRiskCount > 0 ? 'destructive' : 'positive',
                'description' => $paymentRiskCount > 0
                    ? 'Based on overdue dues, low collection progress, and missed payments.'
                    : 'No payment risk students were detected today.',
            ],
            [
                'title' => 'students have low attendance',
                'value' => $lowAttendanceCount,
                'tone' => $lowAttendanceCount > 0 ? 'warning' : 'positive',
                'description' => $lowAttendanceCount > 0
                    ? 'These students are under the 75% attendance threshold.'
                    : 'Attendance risk is currently under control.',
            ],
            [
                'title' => 'batches are underfilled',
                'value' => $underfilledCount,
                'tone' => $underfilledCount > 0 ? 'warning' : 'positive',
                'description' => $underfilledCount > 0
                    ? 'Consider moving leads or reallocating capacity.'
                    : 'Current batch capacity looks healthy.',
            ],
        ];

        $suggestions = [];
        if ($paymentRiskCount > 0) {
            $suggestions[] = 'Send fee reminders to overdue students before the next due window.';
        }
        if ($lowAttendanceCount > 0) {
            $suggestions[] = 'Reach out to guardians for low-attendance students and review batch timing conflicts.';
        }
        if ($underfilledCount > 0) {
            $suggestions[] = 'Promote underfilled batches or merge similar schedules to improve utilization.';
        }
        if ($upcomingDueCount > 0) {
            $suggestions[] = 'Queue reminders for upcoming dues due within the next 7 days.';
        }
        if (!$suggestions) {
            $suggestions[] = 'Operations look healthy right now. Focus on new admissions and batch growth.';
        }

        return [
            'headline' => 'Institute pulse for ' . date('d M Y'),
            'subheadline' => 'Revenue, attendance, collections, and batch utilization are combined here so you can act faster.',
            'cards' => $cards,
            'suggestions' => $suggestions,
            'priority_counts' => [
                'payment_risk' => $paymentRiskCount,
                'low_attendance' => $lowAttendanceCount,
                'upcoming_dues' => $upcomingDueCount,
            ],
            'today_snapshot' => [
                'collection' => (float) $overview['today_collection'],
                'attendance_percentage' => (float) $overview['today_attendance_percentage'],
            ],
        ];
    }

    private function ledgerCandidates(): array
    {
        $stmt = $this->conn->query(
            "SELECT
                sc.id AS ledger_id,
                sc.student_id,
                sc.total_fee,
                sc.discount,
                sc.due_date,
                COALESCE(payments.tuition_paid, 0) AS tuition_paid,
                COALESCE(payments.payment_count, 0) AS payment_count,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                c.name AS course_name,
                b.name AS batch_name
             FROM student_course sc
             INNER JOIN students s ON s.id = sc.student_id
             INNER JOIN courses c ON c.id = sc.course_id
             LEFT JOIN batches b ON b.id = sc.batch_id
             {$this->paymentsAggregateSql()}
             ORDER BY sc.id DESC"
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function lowAttendanceStudents(): array
    {
        $stmt = $this->conn->query(
            "SELECT
                a.student_id,
                CONCAT_WS(' ', s.first_name, s.last_name) AS full_name,
                s.admission_no,
                b.name AS batch_name,
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_sessions
             FROM attendance a
             INNER JOIN students s ON s.id = a.student_id
             INNER JOIN batches b ON b.id = a.batch_id
             WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 45 DAY)
             GROUP BY a.student_id, s.first_name, s.last_name, s.admission_no, b.name
             HAVING total_sessions > 0
                AND ((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100) < 75
             ORDER BY ((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100) ASC, total_sessions DESC
             LIMIT 5"
        );

        return array_map(
            static function (array $row): array {
                $totalSessions = (int) $row['total_sessions'];
                $attendedSessions = (int) $row['attended_sessions'];

                return [
                    'student_id' => (int) $row['student_id'],
                    'student_name' => $row['full_name'],
                    'student_code' => $row['admission_no'],
                    'batch_name' => $row['batch_name'],
                    'total_sessions' => $totalSessions,
                    'attendance_percentage' => $totalSessions > 0
                        ? round(($attendedSessions / $totalSessions) * 100, 1)
                        : 0,
                ];
            },
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );
    }

    private function underfilledBatches(): array
    {
        $stmt = $this->conn->query(
            "SELECT
                b.id,
                b.batch_code,
                b.name AS batch_name,
                c.name AS course_name,
                b.capacity,
                COALESCE(stats.student_count, 0) AS student_count
             FROM batches b
             LEFT JOIN courses c ON c.id = b.course_id
             LEFT JOIN (
                SELECT batch_id, COUNT(DISTINCT student_id) AS student_count
                FROM student_course
                WHERE batch_id IS NOT NULL
                GROUP BY batch_id
             ) stats ON stats.batch_id = b.id
             WHERE b.capacity IS NOT NULL
               AND b.capacity > 0
               AND (COALESCE(stats.student_count, 0) / b.capacity) < 0.5
             ORDER BY (COALESCE(stats.student_count, 0) / b.capacity) ASC, b.capacity DESC
             LIMIT 5"
        );

        return array_map(
            static function (array $row): array {
                $capacity = (int) $row['capacity'];
                $studentCount = (int) $row['student_count'];

                return [
                    'batch_id' => (int) $row['id'],
                    'batch_code' => $row['batch_code'],
                    'batch_name' => $row['batch_name'],
                    'course_name' => $row['course_name'],
                    'capacity' => $capacity,
                    'student_count' => $studentCount,
                    'fill_percentage' => $capacity > 0 ? round(($studentCount / $capacity) * 100, 1) : 0,
                ];
            },
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );
    }

    private function paymentsAggregateSql(): string
    {
        return "
            LEFT JOIN (
                SELECT
                    student_course_id,
                    SUM(amount_paid) AS tuition_paid,
                    SUM(amount_paid + COALESCE(late_fee, 0)) AS total_collected,
                    COUNT(*) AS payment_count
                FROM fees
                GROUP BY student_course_id
            ) payments ON payments.student_course_id = sc.id
        ";
    }
}
