<?php

declare(strict_types=1);

class DashboardController extends BaseController
{
    public function index(): void
    {
        $dashboard = new Dashboard();
        $insightEngine = new InsightEngine();

        $overview = $dashboard->overview();
        $financials = $dashboard->monthlyFinancials();
        $growth = $dashboard->studentGrowth();
        $recentPayments = $dashboard->recentPayments();
        $upcomingClasses = $dashboard->upcomingClasses();
        $feeAlerts = $insightEngine->feeDefaultPredictions();
        $attendanceAlerts = $insightEngine->attendanceRiskAlerts();
        $smartInsights = $insightEngine->smartDashboardInsights();
        $pendingReminders = (new Fee())->pendingReminders();

        $this->render('dashboard/index', [
            'title' => 'Dashboard',
            'overview' => $overview,
            'financials' => $financials,
            'growth' => $growth,
            'recentPayments' => $recentPayments,
            'upcomingClasses' => $upcomingClasses,
            'feeAlerts' => $feeAlerts,
            'attendanceAlerts' => $attendanceAlerts,
            'smartInsights' => $smartInsights,
            'pendingReminders' => $pendingReminders,
        ]);
    }
}
