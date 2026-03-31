<div class="card-surface form-card mb-4">
    <div class="section-title">
        <h4>Mark Daily Attendance</h4>
        <a href="<?= e(url('attendance/report')) ?>" class="btn btn-outline-dark">View Reports</a>
    </div>

    <form method="POST" action="<?= e(url('attendance')) ?>">
        <?= csrf_field() ?>
        <div class="row g-3 mb-3">
            <div class="col-md-4">
                <label class="form-label">Date</label>
                <input type="date" name="date" value="<?= e($date) ?>" class="form-control" required>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table datatable align-middle">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Batch</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($students as $student): ?>
                        <tr>
                            <td><?= e($student['name']) ?></td>
                            <td><?= e($student['course_name']) ?></td>
                            <td><?= e($student['batch_name'] ?: 'Unassigned') ?></td>
                            <td>
                                <?php $selectedStatus = $existingStatuses[$student['id']] ?? 'Present'; ?>
                                <select name="status[<?= e($student['id']) ?>]" class="form-select">
                                    <option value="Present" <?= $selectedStatus === 'Present' ? 'selected' : '' ?>>Present</option>
                                    <option value="Absent" <?= $selectedStatus === 'Absent' ? 'selected' : '' ?>>Absent</option>
                                </select>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <button class="btn btn-dark px-4">Save Attendance</button>
    </form>
</div>
