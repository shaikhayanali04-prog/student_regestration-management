<?php $student = $profile['student']; ?>

<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface form-card text-center">
            <?php if (!empty($student['photo'])): ?>
                <img src="<?= e(asset('uploads/students/' . $student['photo'])) ?>" alt="<?= e($student['name']) ?>" class="photo-preview mx-auto d-block mb-3">
            <?php else: ?>
                <div class="avatar-sm mx-auto mb-3" style="width: 96px; height: 96px; font-size: 2rem;"><?= e(strtoupper(substr($student['name'], 0, 1))) ?></div>
            <?php endif; ?>
            <h4 class="fw-bold"><?= e($student['name']) ?></h4>
            <p class="soft-note mb-1"><?= e($student['email']) ?></p>
            <p class="soft-note mb-1"><?= e($student['phone']) ?></p>
            <p class="soft-note mb-3"><?= e($student['course_name']) ?> / <?= e($student['batch_name'] ?: 'Unassigned batch') ?></p>
            <span class="pill <?= $profile['attendance_percent'] < 75 ? 'pill-danger' : 'pill-success' ?>">
                Attendance <?= e($profile['attendance_percent']) ?>%
            </span>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="row g-3 mb-3">
            <div class="col-md-4">
                <div class="card-surface metric-card">
                    <div class="metric-label">Fee Plans</div>
                    <p class="metric-value"><?= e(count($profile['fees'])) ?></p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card-surface metric-card">
                    <div class="metric-label">Installments</div>
                    <p class="metric-value"><?= e(count($profile['installments'])) ?></p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card-surface metric-card">
                    <div class="metric-label">Attendance History</div>
                    <p class="metric-value"><?= e(count($profile['attendance'])) ?></p>
                </div>
            </div>
        </div>

        <div class="card-surface table-card mb-3">
            <div class="section-title"><h4>Fee Plans</h4></div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Pending</th>
                            <th>Status</th>
                            <th>Installments</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($profile['fees'] as $fee): ?>
                            <tr>
                                <td><?= e(currency($fee['total_fees'])) ?></td>
                                <td><?= e(currency($fee['paid'])) ?></td>
                                <td><?= e(currency($fee['remaining'])) ?></td>
                                <td><span class="pill <?= ($fee['STATUS'] ?? '') === 'Paid' ? 'pill-success' : 'pill-warning' ?>"><?= e($fee['STATUS']) ?></span></td>
                                <td><?= e($fee['installment_count']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card-surface table-card mb-3">
            <div class="section-title"><h4>Installment History</h4></div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Mode</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($profile['installments'] as $installment): ?>
                            <tr>
                                <td><?= e($installment['payment_date']) ?></td>
                                <td><?= e(currency($installment['amount'])) ?></td>
                                <td><?= e($installment['payment_mode']) ?></td>
                                <td><?= e($installment['note']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card-surface table-card">
            <div class="section-title"><h4>Recent Attendance</h4></div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($profile['attendance'] as $entry): ?>
                            <tr>
                                <td><?= e($entry['date']) ?></td>
                                <td><span class="pill <?= $entry['status'] === 'Present' ? 'pill-success' : 'pill-danger' ?>"><?= e($entry['status']) ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
