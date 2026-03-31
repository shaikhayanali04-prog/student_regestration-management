<?php

declare(strict_types=1);

class InsightEngine
{
    public function feeDefaultPredictions(int $limit = 5): array
    {
        $feeModel = new Fee();
        $records = $feeModel->pendingRiskCandidates();
        $predictions = [];

        foreach ($records as $record) {
            $remaining = (float) $record['remaining'];
            $totalFees = max((float) $record['total_fees'], 1);
            $daysSincePayment = $record['last_payment_date']
                ? (int) floor((time() - strtotime($record['last_payment_date'])) / 86400)
                : 45;
            $expectedInstallments = max(1, (int) floor(max($daysSincePayment, 0) / 30) + 1);
            $actualInstallments = (int) $record['installment_count'];

            $remainingRatioScore = ($remaining / $totalFees) * 55;
            $delayScore = min($daysSincePayment, 90) / 90 * 30;
            $installmentGapScore = max(0, $expectedInstallments - $actualInstallments) * 7;

            $score = min(100, round($remainingRatioScore + $delayScore + $installmentGapScore, 1));

            if ($score < 35) {
                continue;
            }

            $predictions[] = [
                'student_id' => (int) $record['student_id'],
                'student_name' => $record['student_name'],
                'remaining' => $remaining,
                'last_payment_date' => $record['last_payment_date'],
                'risk_score' => $score,
                'risk_band' => $score >= 75 ? 'high' : ($score >= 50 ? 'medium' : 'low'),
                'suggestion' => 'Send a fee reminder and review the payment plan.',
            ];
        }

        usort($predictions, static fn ($a, $b) => $b['risk_score'] <=> $a['risk_score']);

        return array_slice($predictions, 0, $limit);
    }

    public function attendanceRiskAlerts(int $limit = 5): array
    {
        $attendanceModel = new Attendance();
        $students = $attendanceModel->lowAttendanceStudents(75, $limit);

        return array_map(static function (array $student): array {
            $percentage = (float) $student['attendance_percent'];

            return [
                'student_id' => (int) $student['id'],
                'student_name' => $student['name'],
                'attendance_percent' => $percentage,
                'risk_band' => $percentage < 50 ? 'high' : 'medium',
                'suggestion' => 'Reach out to the student and batch mentor for attendance follow-up.',
            ];
        }, $students);
    }

    public function smartDashboardInsights(): array
    {
        $feeAlerts = $this->feeDefaultPredictions();
        $attendanceAlerts = $this->attendanceRiskAlerts();

        return [
            'cards' => [
                count($feeAlerts) . ' students may not complete payment',
                count($attendanceAlerts) . ' students have low attendance',
            ],
            'suggestions' => array_merge(
                array_map(
                    static fn (array $item): string => $item['student_name'] . ' needs a pending fee reminder.',
                    array_slice($feeAlerts, 0, 3)
                ),
                array_map(
                    static fn (array $item): string => $item['student_name'] . ' needs an attendance intervention.',
                    array_slice($attendanceAlerts, 0, 3)
                )
            ),
        ];
    }
}
