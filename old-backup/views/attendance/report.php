<div class="card-surface form-card mb-4">
    <div class="section-title">
        <h4>Attendance Reports</h4>
        <a href="<?= e(url('attendance')) ?>" class="btn btn-outline-dark">Mark Attendance</a>
    </div>

    <form method="GET" action="<?= e(url('attendance/report')) ?>" class="row g-3">
        <input type="hidden" name="route" value="attendance/report">
        <div class="col-lg-3">
            <input type="date" name="date_from" class="form-control" value="<?= e($filters['date_from']) ?>">
        </div>
        <div class="col-lg-3">
            <input type="date" name="date_to" class="form-control" value="<?= e($filters['date_to']) ?>">
        </div>
        <div class="col-lg-2">
            <select name="status" class="form-select">
                <option value="">All Status</option>
                <option value="Present" <?= $filters['status'] === 'Present' ? 'selected' : '' ?>>Present</option>
                <option value="Absent" <?= $filters['status'] === 'Absent' ? 'selected' : '' ?>>Absent</option>
            </select>
        </div>
        <div class="col-lg-2">
            <input type="text" name="search" class="form-control" placeholder="Student name" value="<?= e($filters['search']) ?>">
        </div>
        <div class="col-lg-2">
            <button class="btn btn-outline-dark w-100">Apply</button>
        </div>
    </form>
</div>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Attendance Log</h4>
                <span class="stat-chip"><?= e(count($rows)) ?> rows</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Course / Batch</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($rows as $row): ?>
                            <tr>
                                <td><?= e($row['date']) ?></td>
                                <td><?= e($row['student_name']) ?></td>
                                <td><?= e($row['course_name']) ?> / <?= e($row['batch_name'] ?: 'Unassigned') ?></td>
                                <td><span class="pill <?= $row['status'] === 'Present' ? 'pill-success' : 'pill-danger' ?>"><?= e($row['status']) ?></span></td>
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
                <h4>Low Attendance</h4>
                <span class="pill pill-warning"><?= e(count($lowAttendance)) ?> risks</span>
            </div>
            <div class="insight-list">
                <?php foreach ($lowAttendance as $student): ?>
                    <div class="insight-item">
                        <h6><?= e($student['name']) ?></h6>
                        <p><?= e($student['attendance_percent']) ?>% attendance across <?= e($student['attendance_days']) ?> sessions.</p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
