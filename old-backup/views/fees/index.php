<div class="card-surface form-card mb-4">
    <div class="section-title">
        <h4>Fee Management</h4>
        <div class="d-flex gap-2">
            <a href="<?= e(url('fees/export')) ?>" class="btn btn-outline-success">Export Excel</a>
            <a href="<?= e(url('fees/create')) ?>" class="btn btn-dark">Create Fee Plan</a>
        </div>
    </div>

    <form method="GET" action="<?= e(url('fees')) ?>" class="row g-3">
        <input type="hidden" name="route" value="fees">
        <div class="col-lg-5">
            <input type="text" name="search" class="form-control" placeholder="Search by student or phone" value="<?= e($filters['search']) ?>">
        </div>
        <div class="col-lg-3">
            <select name="status" class="form-select">
                <option value="">All Status</option>
                <option value="Paid" <?= $filters['status'] === 'Paid' ? 'selected' : '' ?>>Paid</option>
                <option value="Pending" <?= $filters['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
            </select>
        </div>
        <div class="col-lg-2">
            <button class="btn btn-outline-dark w-100">Filter</button>
        </div>
    </form>
</div>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Fee Plans</h4>
                <span class="stat-chip"><?= e(count($fees)) ?> records</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Pending</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($fees as $fee): ?>
                            <tr>
                                <td>
                                    <div class="fw-semibold"><?= e($fee['student_name']) ?></div>
                                    <div class="soft-note"><?= e($fee['phone']) ?></div>
                                </td>
                                <td><?= e($fee['course_name']) ?></td>
                                <td><?= e(currency($fee['total_fees'])) ?></td>
                                <td><?= e(currency($fee['paid'])) ?></td>
                                <td><?= e(currency($fee['remaining'])) ?></td>
                                <td><span class="pill <?= $fee['status'] === 'Paid' ? 'pill-success' : 'pill-warning' ?>"><?= e($fee['status']) ?></span></td>
                                <td>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <a href="<?= e(url('fees/' . $fee['id'] . '/pay')) ?>" class="btn btn-sm btn-outline-primary">Pay</a>
                                        <a href="<?= e(url('fees/' . $fee['id'] . '/receipt')) ?>" class="btn btn-sm btn-outline-dark">Receipt</a>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Reminder Suggestions</h4>
            </div>
            <div class="insight-list">
                <?php foreach ($reminders as $reminder): ?>
                    <div class="insight-item">
                        <h6><?= e($reminder['student_name']) ?></h6>
                        <p><?= e($reminder['message']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
