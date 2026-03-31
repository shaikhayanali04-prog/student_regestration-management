<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface form-card">
            <div class="section-title">
                <h4>Add Timetable Entry</h4>
            </div>
            <?php if (has_role('admin')): ?>
                <form method="POST" action="<?= e(url('timetables/store')) ?>" class="row g-3">
                    <?= csrf_field() ?>
                    <div class="col-12">
                        <label class="form-label">Batch</label>
                        <select name="batch_id" class="form-select" required>
                            <option value="">Select Batch</option>
                            <?php foreach ($batches as $batch): ?>
                                <option value="<?= e($batch['id']) ?>"><?= e($batch['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Day</label>
                        <select name="day_name" class="form-select">
                            <?php foreach (['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as $day): ?>
                                <option value="<?= e($day) ?>"><?= e($day) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Subject</label>
                        <input type="text" name="subject_name" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Start</label>
                        <input type="time" name="start_time" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">End</label>
                        <input type="time" name="end_time" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Faculty</label>
                        <input type="text" name="faculty_name" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Room</label>
                        <input type="text" name="room_name" class="form-control">
                    </div>
                    <div class="col-12">
                        <button class="btn btn-dark px-4">Save Entry</button>
                    </div>
                </form>
            <?php else: ?>
                <div class="empty-state">Only admin can update timetable entries.</div>
            <?php endif; ?>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Weekly Timetable</h4>
                <span class="stat-chip"><?= e(count($rows)) ?> entries</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Time</th>
                            <th>Subject</th>
                            <th>Faculty</th>
                            <?php if (has_role('admin')): ?><th>Action</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($rows as $row): ?>
                            <tr>
                                <td><?= e($row['day_name']) ?></td>
                                <td><?= e($row['batch_name']) ?></td>
                                <td><?= e($row['course_name']) ?></td>
                                <td><?= e(substr($row['start_time'], 0, 5) . ' - ' . substr($row['end_time'], 0, 5)) ?></td>
                                <td><?= e($row['subject_name']) ?></td>
                                <td><?= e($row['faculty_name']) ?></td>
                                <?php if (has_role('admin')): ?>
                                    <td>
                                        <form method="POST" action="<?= e(url('timetables/' . $row['id'] . '/delete')) ?>" onsubmit="return confirm('Delete this entry?');">
                                            <?= csrf_field() ?>
                                            <button class="btn btn-sm btn-outline-danger">Delete</button>
                                        </form>
                                    </td>
                                <?php endif; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
