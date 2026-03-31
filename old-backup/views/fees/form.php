<div class="card-surface form-card">
    <div class="section-title">
        <h4>Create Fee Plan</h4>
        <a href="<?= e(url('fees')) ?>" class="btn btn-outline-dark">Back to Fees</a>
    </div>

    <form method="POST" action="<?= e($action) ?>" class="row g-3">
        <?= csrf_field() ?>

        <div class="col-md-6">
            <label class="form-label">Student</label>
            <select name="student_id" class="form-select" required>
                <option value="">Select Student</option>
                <?php foreach ($students as $student): ?>
                    <option value="<?= e($student['id']) ?>" <?= (string) old('student_id') === (string) $student['id'] ? 'selected' : '' ?>>
                        <?= e($student['name']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label">Total Fees</label>
            <input type="number" step="0.01" name="total_fees" class="form-control" value="<?= e(old('total_fees')) ?>" required>
        </div>
        <div class="col-md-6">
            <label class="form-label">Initial Paid Amount</label>
            <input type="number" step="0.01" name="paid" class="form-control" value="<?= e(old('paid', '0')) ?>" required>
        </div>
        <div class="col-md-6">
            <label class="form-label">Installment Amount</label>
            <input type="number" step="0.01" name="installment_amount" class="form-control" value="<?= e(old('installment_amount')) ?>" required>
        </div>
        <div class="col-md-6">
            <label class="form-label">Payment Date</label>
            <input type="date" name="payment_date" class="form-control" value="<?= e(old('payment_date', date('Y-m-d'))) ?>">
        </div>
        <div class="col-md-6">
            <label class="form-label">Payment Mode</label>
            <select name="payment_mode" class="form-select">
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
            </select>
        </div>
        <div class="col-12">
            <label class="form-label">Note</label>
            <textarea name="note" class="form-control" rows="3"><?= e(old('note')) ?></textarea>
        </div>
        <div class="col-12">
            <button class="btn btn-dark px-4">Save Fee Plan</button>
        </div>
    </form>
</div>
