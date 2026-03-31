<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface form-card">
            <div class="section-title">
                <h4>Add Course</h4>
            </div>
            <?php if (has_role('admin')): ?>
                <form method="POST" action="<?= e(url('courses/store')) ?>" class="row g-3">
                    <?= csrf_field() ?>
                    <div class="col-12">
                        <label class="form-label">Course Name</label>
                        <input type="text" name="course_name" class="form-control" value="<?= e(old('course_name')) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Course Code</label>
                        <input type="text" name="code" class="form-control" value="<?= e(old('code')) ?>">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fees</label>
                        <input type="number" step="0.01" name="fees" class="form-control" value="<?= e(old('fees', '0')) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Duration (Months)</label>
                        <input type="number" name="duration_months" class="form-control" value="<?= e(old('duration_months', '0')) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-control" rows="3"><?= e(old('description')) ?></textarea>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-dark px-4">Save Course</button>
                    </div>
                </form>
            <?php else: ?>
                <div class="empty-state">Only admin can add or delete courses.</div>
            <?php endif; ?>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Course Catalog</h4>
                <span class="stat-chip"><?= e(count($courses)) ?> courses</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Fees</th>
                            <th>Duration</th>
                            <th>Students</th>
                            <th>Batches</th>
                            <th>Status</th>
                            <?php if (has_role('admin')): ?><th>Action</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($courses as $course): ?>
                            <tr>
                                <td>
                                    <div class="fw-semibold"><?= e($course['course_name']) ?></div>
                                    <div class="soft-note"><?= e($course['code']) ?></div>
                                </td>
                                <td><?= e(currency($course['fees'])) ?></td>
                                <td><?= e($course['duration_months']) ?> months</td>
                                <td><?= e($course['student_count']) ?></td>
                                <td><?= e($course['batch_count']) ?></td>
                                <td><span class="pill <?= $course['status'] === 'active' ? 'pill-success' : 'pill-warning' ?>"><?= e($course['status']) ?></span></td>
                                <?php if (has_role('admin')): ?>
                                    <td>
                                        <form method="POST" action="<?= e(url('courses/' . $course['id'] . '/delete')) ?>" onsubmit="return confirm('Delete this course?');">
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
