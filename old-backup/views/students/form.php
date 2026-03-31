<?php
$editing = !empty($student);
$selectedCourseId = old('course_id', $student['course_id'] ?? '');
$selectedBatchId = old('batch_id', $student['batch_id'] ?? '');
?>

<div class="card-surface form-card">
    <div class="section-title">
        <h4><?= $editing ? 'Edit Student' : 'Add Student' ?></h4>
        <a href="<?= e(url('students')) ?>" class="btn btn-outline-dark">Back to Students</a>
    </div>

    <form method="POST" action="<?= e($action) ?>" enctype="multipart/form-data" class="row g-3">
        <?= csrf_field() ?>

        <div class="col-md-6">
            <label class="form-label">Student Name</label>
            <input type="text" name="name" class="form-control" value="<?= e(old('name', $student['name'] ?? '')) ?>" required>
        </div>
        <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-control" value="<?= e(old('email', $student['email'] ?? '')) ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">Phone</label>
            <input type="text" name="phone" class="form-control" value="<?= e(old('phone', $student['phone'] ?? '')) ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">Guardian Name</label>
            <input type="text" name="guardian_name" class="form-control" value="<?= e(old('guardian_name', $student['guardian_name'] ?? '')) ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">Course</label>
            <select name="course_id" class="form-select">
                <option value="">Select Course</option>
                <?php foreach ($courses as $course): ?>
                    <option value="<?= e($course['id']) ?>" <?= (string) $selectedCourseId === (string) $course['id'] ? 'selected' : '' ?>>
                        <?= e($course['course_name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label">Batch</label>
            <select name="batch_id" class="form-select">
                <option value="">Select Batch</option>
                <?php foreach ($batches as $batch): ?>
                    <option value="<?= e($batch['id']) ?>" <?= (string) $selectedBatchId === (string) $batch['id'] ? 'selected' : '' ?>>
                        <?= e($batch['name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label">Join Date</label>
            <input type="date" name="join_date" class="form-control" value="<?= e(old('join_date', $student['join_date'] ?? date('Y-m-d'))) ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">Status</label>
            <select name="status" class="form-select">
                <option value="active" <?= old('status', $student['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active</option>
                <option value="inactive" <?= old('status', $student['status'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive</option>
            </select>
        </div>
        <div class="col-12">
            <label class="form-label">Address</label>
            <textarea name="address" class="form-control" rows="3"><?= e(old('address', $student['address'] ?? '')) ?></textarea>
        </div>
        <div class="col-md-8">
            <label class="form-label">Photo</label>
            <input type="file" name="photo" class="form-control" accept=".jpg,.jpeg,.png,.webp">
        </div>
        <div class="col-md-4 d-flex align-items-end">
            <?php if (!empty($student['photo'])): ?>
                <img src="<?= e(asset('uploads/students/' . $student['photo'])) ?>" alt="<?= e($student['name']) ?>" class="photo-preview">
            <?php endif; ?>
        </div>
        <div class="col-12">
            <button class="btn btn-dark px-4"><?= $editing ? 'Update Student' : 'Create Student' ?></button>
        </div>
    </form>
</div>
