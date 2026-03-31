<div class="hero-card mb-4">
    <div class="row g-4 align-items-center">
        <div class="col-lg-8">
            <span class="pill pill-warning mb-3">Smart Dashboard</span>
            <h3 class="fw-bold mb-2">Institute pulse for <?= e(date('d M Y')) ?></h3>
            <p class="mb-0 opacity-75">Revenue, expenses, batch activity, fee prediction, and attendance risk are combined here so you can act faster.</p>
        </div>
        <div class="col-lg-4">
            <div class="card-surface p-3 text-dark">
                <div class="small text-uppercase text-muted mb-1">AI Insight</div>
                <strong><?= e($smartInsights['cards'][0] ?? 'No fee warning right now') ?></strong>
                <div class="soft-note mt-2"><?= e($smartInsights['cards'][1] ?? 'Attendance is stable') ?></div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mb-4">
    <div class="col-md-6 col-xl-3">
        <div class="card-surface metric-card">
            <div class="metric-label">Students</div>
            <p class="metric-value"><?= e($overview['students']) ?></p>
            <div class="metric-meta"><?= e($overview['courses']) ?> courses across <?= e($overview['batches']) ?> batches</div>
        </div>
    </div>
    <div class="col-md-6 col-xl-3">
        <div class="card-surface metric-card">
            <div class="metric-label">Fees Collected</div>
            <p class="metric-value"><?= e(currency($overview['fees_collected'])) ?></p>
            <div class="metric-meta">Pending <?= e(currency($overview['pending_fees'])) ?></div>
        </div>
    </div>
    <div class="col-md-6 col-xl-3">
        <div class="card-surface metric-card">
            <div class="metric-label">Expenses</div>
            <p class="metric-value"><?= e(currency($overview['expenses'])) ?></p>
            <div class="metric-meta">Net profit <?= e(currency($overview['profit'])) ?></div>
        </div>
    </div>
    <div class="col-md-6 col-xl-3">
        <div class="card-surface metric-card">
            <div class="metric-label">Attendance Mix</div>
            <p class="metric-value"><?= e($overview['attendance']['present']) ?></p>
            <div class="metric-meta"><?= e($overview['attendance']['absent']) ?> absences captured</div>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <div class="col-xl-8">
        <div class="card-surface chart-panel">
            <div class="section-title">
                <h4>Revenue vs Expense</h4>
                <span class="stat-chip">Last 6 months</span>
            </div>
            <div class="chart-wrap">
                <canvas id="financialChart"></canvas>
            </div>
        </div>
    </div>
    <div class="col-xl-4">
        <div class="card-surface chart-panel">
            <div class="section-title">
                <h4>Student Growth</h4>
                <span class="stat-chip">Admissions trend</span>
            </div>
            <div class="chart-wrap">
                <canvas id="growthChart"></canvas>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface table-card h-100">
            <div class="section-title">
                <h4>Fee Predictions</h4>
                <span class="pill pill-danger"><?= e(count($feeAlerts)) ?> alerts</span>
            </div>
            <div class="insight-list">
                <?php if ($feeAlerts): ?>
                    <?php foreach ($feeAlerts as $alert): ?>
                        <div class="insight-item">
                            <h6><?= e($alert['student_name']) ?> <span class="pill <?= $alert['risk_band'] === 'high' ? 'pill-danger' : 'pill-warning' ?>"><?= e(strtoupper($alert['risk_band'])) ?></span></h6>
                            <p><?= e(currency($alert['remaining'])) ?> pending. Risk score <?= e($alert['risk_score']) ?>.</p>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">No predicted fee defaults right now.</div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card-surface table-card h-100">
            <div class="section-title">
                <h4>Attendance Alerts</h4>
                <span class="pill pill-warning"><?= e(count($attendanceAlerts)) ?> alerts</span>
            </div>
            <div class="insight-list">
                <?php if ($attendanceAlerts): ?>
                    <?php foreach ($attendanceAlerts as $alert): ?>
                        <div class="insight-item">
                            <h6><?= e($alert['student_name']) ?></h6>
                            <p>Attendance at <?= e($alert['attendance_percent']) ?>%. <?= e($alert['suggestion']) ?></p>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">No attendance risks detected.</div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card-surface table-card h-100">
            <div class="section-title">
                <h4>Auto Suggestions</h4>
                <span class="pill pill-success">Assistant</span>
            </div>
            <div class="insight-list">
                <?php foreach (($smartInsights['suggestions'] ?? []) as $suggestion): ?>
                    <div class="insight-item">
                        <h6><?= e($suggestion) ?></h6>
                    </div>
                <?php endforeach; ?>

                <?php foreach ($pendingReminders as $reminder): ?>
                    <div class="insight-item">
                        <p><?= e($reminder['message']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mt-1">
    <div class="col-lg-6">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Recent Payments</h4>
                <a href="<?= e(url('fees')) ?>" class="btn btn-sm btn-outline-dark">Open Fees</a>
            </div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($recentPayments): ?>
                            <?php foreach ($recentPayments as $payment): ?>
                                <tr>
                                    <td><?= e($payment['student_name']) ?></td>
                                    <td><?= e($payment['payment_date']) ?></td>
                                    <td><?= e(currency($payment['amount'])) ?></td>
                                    <td><?= e($payment['payment_mode']) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="4" class="empty-state">No payments recorded yet.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Today's Timetable Snapshot</h4>
                <a href="<?= e(url('timetables')) ?>" class="btn btn-sm btn-outline-dark">Open Timetable</a>
            </div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Time</th>
                            <th>Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($upcomingClasses): ?>
                            <?php foreach ($upcomingClasses as $class): ?>
                                <tr>
                                    <td><?= e($class['batch_name']) ?></td>
                                    <td><?= e($class['course_name']) ?></td>
                                    <td><?= e(substr($class['start_time'], 0, 5) . ' - ' . substr($class['end_time'], 0, 5)) ?></td>
                                    <td><?= e($class['subject_name']) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="4" class="empty-state">No classes scheduled for today.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php
$pageScript = '<script>
window.addEventListener("load", function () {
    const sharedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        resizeDelay: 150
    };

    const financialCanvas = document.getElementById("financialChart");
    const growthCanvas = document.getElementById("growthChart");

    if (financialCanvas) {
        new Chart(financialCanvas, {
            type: "bar",
            data: {
                labels: ' . json_encode($financials['labels']) . ',
                datasets: [
                    {
                        label: "Revenue",
                        data: ' . json_encode($financials['revenue']) . ',
                        backgroundColor: "#0f766e",
                        borderRadius: 10
                    },
                    {
                        label: "Expense",
                        data: ' . json_encode($financials['expense']) . ',
                        backgroundColor: "#f97316",
                        borderRadius: 10
                    }
                ]
            },
            options: sharedOptions
        });
    }

    if (growthCanvas) {
        new Chart(growthCanvas, {
            type: "line",
            data: {
                labels: ' . json_encode($growth['labels']) . ',
                datasets: [{
                    label: "Students",
                    data: ' . json_encode($growth['totals']) . ',
                    borderColor: "#0f766e",
                    backgroundColor: "rgba(15,118,110,0.12)",
                    fill: true,
                    tension: 0.35
                }]
            },
            options: sharedOptions
        });
    }
});
</script>';
?>
