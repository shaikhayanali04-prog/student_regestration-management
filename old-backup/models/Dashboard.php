<?php

declare(strict_types=1);

class Dashboard extends BaseModel
{
    public function overview(): array
    {
        $feeModel = new Fee();
        $expenseModel = new Expense();
        $attendanceModel = new Attendance();

        $studentCount = (int) ($this->db->scalar('SELECT COUNT(*) FROM students') ?? 0);
        $courseCount = (int) ($this->db->scalar('SELECT COUNT(*) FROM courses') ?? 0);
        $batchCount = (int) ($this->db->scalar('SELECT COUNT(*) FROM batches') ?? 0);
        $feesCollected = $feeModel->totalCollected();
        $pendingFees = $feeModel->totalPending();
        $expenses = $expenseModel->totalSpent();
        $attendance = $attendanceModel->distribution();

        return [
            'students' => $studentCount,
            'courses' => $courseCount,
            'batches' => $batchCount,
            'fees_collected' => $feesCollected,
            'pending_fees' => $pendingFees,
            'expenses' => $expenses,
            'profit' => $feesCollected - $expenses,
            'attendance' => $attendance,
        ];
    }

    public function studentGrowth(int $months = 6): array
    {
        $rows = $this->db->select(
            'SELECT DATE_FORMAT(created_at, "%Y-%m") AS month_key, COUNT(*) AS total
             FROM students
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ' . (int) $months . ' MONTH)
             GROUP BY DATE_FORMAT(created_at, "%Y-%m")
             ORDER BY month_key ASC'
        );

        return $this->formatMonthlySeries($rows, $months);
    }

    public function monthlyFinancials(int $months = 6): array
    {
        $feeRows = (new Fee())->monthlyCollections($months);
        $expenseRows = (new Expense())->monthlyTotals($months);
        $base = $this->emptyMonthlyMap($months);

        foreach ($feeRows as $row) {
            $base[$row['month_key']]['revenue'] = (float) $row['total'];
        }

        foreach ($expenseRows as $row) {
            $base[$row['month_key']]['expense'] = (float) $row['total'];
        }

        $labels = [];
        $revenue = [];
        $expense = [];
        $profit = [];

        foreach ($base as $monthKey => $item) {
            $labels[] = date('M Y', strtotime($monthKey . '-01'));
            $revenue[] = $item['revenue'];
            $expense[] = $item['expense'];
            $profit[] = $item['revenue'] - $item['expense'];
        }

        return [
            'labels' => $labels,
            'revenue' => $revenue,
            'expense' => $expense,
            'profit' => $profit,
        ];
    }

    public function recentPayments(): array
    {
        return $this->db->select(
            'SELECT fi.payment_date,
                    fi.amount,
                    fi.payment_mode,
                    s.name AS student_name
             FROM fee_installments fi
             INNER JOIN students s ON s.id = fi.student_id
             ORDER BY fi.payment_date DESC, fi.id DESC
             LIMIT 6'
        );
    }

    public function upcomingClasses(): array
    {
        return (new Timetable())->upcomingForDay(date('l'));
    }

    private function emptyMonthlyMap(int $months): array
    {
        $map = [];

        for ($offset = $months - 1; $offset >= 0; $offset--) {
            $key = date('Y-m', strtotime('-' . $offset . ' month'));
            $map[$key] = [
                'revenue' => 0,
                'expense' => 0,
                'total' => 0,
            ];
        }

        return $map;
    }

    private function formatMonthlySeries(array $rows, int $months): array
    {
        $map = [];

        for ($offset = $months - 1; $offset >= 0; $offset--) {
            $key = date('Y-m', strtotime('-' . $offset . ' month'));
            $map[$key] = 0;
        }

        foreach ($rows as $row) {
            $map[$row['month_key']] = (int) $row['total'];
        }

        return [
            'labels' => array_map(static fn (string $monthKey): string => date('M Y', strtotime($monthKey . '-01')), array_keys($map)),
            'totals' => array_values($map),
        ];
    }
}
