<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$dashboard = new Dashboard();
$insightEngine = new InsightEngine();
$feeModel = new Fee();

ApiResponse::success('Dashboard fetched successfully.', [
    'overview' => $dashboard->overview(),
    'financials' => $dashboard->monthlyFinancials(),
    'student_growth' => $dashboard->studentGrowth(),
    'recent_payments' => array_map(
        static fn (array $row): array => [
            'payment_date' => $row['payment_date'],
            'amount' => (float) $row['amount'],
            'payment_mode' => $row['payment_mode'],
            'student_name' => $row['student_name'],
        ],
        $dashboard->recentPayments()
    ),
    'upcoming_classes' => $dashboard->upcomingClasses(),
    'fee_predictions' => $insightEngine->feeDefaultPredictions(),
    'attendance_alerts' => $insightEngine->attendanceRiskAlerts(),
    'smart_insights' => $insightEngine->smartDashboardInsights(),
    'pending_reminders' => $feeModel->pendingReminders(),
]);
