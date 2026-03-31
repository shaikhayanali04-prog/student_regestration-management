<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface form-card">
            <div class="section-title">
                <h4>Create Batch</h4>
            </div>
            <?php if (has_role('admin')): ?>
                <form method="POST" action="<?= e(url('batches/store')) ?>" class="row g-3">
                    <?= csrf_field() ?>
                    <div class="col-12">
                        <label class="form-label">Batch Name</label>
                        <input type="text" name="name" class="form-control" value="<?= e(old('name')) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Course</label>
                        <select name="course_id" class="form-select">
                            <option value="">Select Course</option>
                            <?php foreach ($courses as $course): ?>
                                <option value="<?= e($course['id']) ?>"><?= e($course['course_name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Start Date</label>
                        <input type="date" name="start_date" class="form-control" value="<?= e(old('start_date')) ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">End Date</label>
                        <input type="date" name="end_date" class="form-control" value="<?= e(old('end_date')) ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Room</label>
                        <input type="text" name="room_name" class="form-control" value="<?= e(old('room_name')) ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Capacity</label>
                        <input type="number" name="capacity" class="form-control" value="<?= e(old('capacity', '0')) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Schedule Summary</label>
                        <input type="text" name="schedule_summary" class="form-control" value="<?= e(old('schedule_summary')) ?>">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-dark px-4">Save Batch</button>
                    </div>
                </form>
            <?php else: ?>
                <div class="empty-state">Only admin can add or delete batches.</div>
            <?php endif; ?>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Batch List</h4>
                <span class="stat-chip"><?= e(count($batches)) ?> batches</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Schedule</th>
                            <th>Students</th>
                            <th>Status</th>
                            <?php if (has_role('admin')): ?><th>Action</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($batches as $batch): ?>
                            <tr>
                                <td>
                                    <div class="fw-semibold"><?= e($batch['name']) ?></div>
                                    <div class="soft-note"><?= e($batch['room_name']) ?></div>
                                </td>
                                <td><?= e($batch['course_name']) ?></td>
                                <td><?= e($batch['schedule_summary']) ?></td>
                                <td><?= e($batch['student_count']) ?> / <?= e($batch['capacity']) ?></td>
                                <td><span class="pill <?= $batch['status'] === 'active' ? 'pill-success' : 'pill-warning' ?>"><?= e($batch['status']) ?></span></td>
                                <?php if (has_role('admin')): ?>
                                    <td>
                                        <form method="POST" action="<?= e(url('batches/' . $batch['id'] . '/delete')) ?>" onsubmit="return confirm('Delete this batch?');">
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
