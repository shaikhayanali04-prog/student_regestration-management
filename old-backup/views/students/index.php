<div class="card-surface form-card mb-4">
    <div class="section-title">
        <h4>Student Directory</h4>
        <a href="<?= e(url('students/create')) ?>" class="btn btn-dark">Add Student</a>
    </div>

    <form method="GET" action="<?= e(url('students')) ?>" class="row g-3">
        <input type="hidden" name="route" value="students">
        <div class="col-lg-4">
            <input type="text" name="search" class="form-control" placeholder="Search by name, email, phone" value="<?= e($filters['search']) ?>">
        </div>
        <div class="col-lg-3">
            <select name="course_id" class="form-select">
                <option value="">All Courses</option>
                <?php foreach ($courses as $course): ?>
                    <option value="<?= e($course['id']) ?>" <?= (string) $filters['course_id'] === (string) $course['id'] ? 'selected' : '' ?>>
                        <?= e($course['course_name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-lg-3">
            <select name="batch_id" class="form-select">
                <option value="">All Batches</option>
                <?php foreach ($batches as $batch): ?>
                    <option value="<?= e($batch['id']) ?>" <?= (string) $filters['batch_id'] === (string) $batch['id'] ? 'selected' : '' ?>>
                        <?= e($batch['name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-lg-2">
            <button class="btn btn-outline-dark w-100">Filter</button>
        </div>
    </form>
</div>

<div class="card-surface table-card">
    <div class="section-title">
        <h4>All Students</h4>
        <span class="stat-chip"><?= e(count($students)) ?> records</span>
    </div>

    <div class="table-responsive">
        <table class="table datatable align-middle mb-0">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Contact</th>
                    <th>Course / Batch</th>
                    <th>Fees</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($students as $student): ?>
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-3">
                                <?php if (!empty($student['photo'])): ?>
                                    <img src="<?= e(asset('uploads/students/' . $student['photo'])) ?>" alt="<?= e($student['name']) ?>" class="avatar-sm">
                                <?php else: ?>
                                    <span class="avatar-sm"><?= e(strtoupper(substr($student['name'], 0, 1))) ?></span>
                                <?php endif; ?>
                                <div>
                                    <div class="fw-semibold"><?= e($student['name']) ?></div>
                                    <div class="soft-note">Joined <?= e($student['join_date'] ?: substr((string) $student['created_at'], 0, 10)) ?></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div><?= e($student['phone']) ?></div>
                            <div class="soft-note"><?= e($student['email']) ?></div>
                        </td>
                        <td>
                            <div><?= e($student['course_name']) ?></div>
                            <div class="soft-note"><?= e($student['batch_name'] ?: 'Unassigned batch') ?></div>
                        </td>
                        <td>
                            <div><?= e(currency($student['paid_amount'])) ?> paid</div>
                            <div class="soft-note"><?= e(currency($student['remaining_amount'])) ?> pending</div>
                        </td>
                        <td><?= e((int) $student['attendance_percent']) ?>%</td>
                        <td>
                            <span class="pill <?= $student['status'] === 'active' ? 'pill-success' : 'pill-warning' ?>">
                                <?= e(strtoupper($student['status'])) ?>
                            </span>
                        </td>
                        <td>
                            <div class="d-flex gap-2 flex-wrap">
                                <a href="<?= e(url('students/' . $student['id'])) ?>" class="btn btn-sm btn-outline-dark">Profile</a>
                                <a href="<?= e(url('students/' . $student['id'] . '/edit')) ?>" class="btn btn-sm btn-outline-primary">Edit</a>
                                <?php if (has_role('admin')): ?>
                                    <form method="POST" action="<?= e(url('students/' . $student['id'] . '/delete')) ?>" onsubmit="return confirm('Delete this student?');">
                                        <?= csrf_field() ?>
                                        <button class="btn btn-sm btn-outline-danger">Delete</button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
