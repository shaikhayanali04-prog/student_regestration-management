<div class="row g-4">
    <div class="col-lg-5">
        <div class="card-surface form-card">
            <div class="section-title">
                <h4>Pay Installment</h4>
                <a href="<?= e(url('fees')) ?>" class="btn btn-outline-dark">Back to Fees</a>
            </div>

            <div class="mb-3">
                <strong><?= e($fee['student_name']) ?></strong>
                <div class="soft-note"><?= e($fee['course_name']) ?></div>
            </div>

            <div class="quick-grid mb-4">
                <div class="card-surface p-3">
                    <div class="metric-label">Total</div>
                    <strong><?= e(currency($fee['total_fees'])) ?></strong>
                </div>
                <div class="card-surface p-3">
                    <div class="metric-label">Paid</div>
                    <strong><?= e(currency($fee['paid'])) ?></strong>
                </div>
                <div class="card-surface p-3">
                    <div class="metric-label">Pending</div>
                    <strong><?= e(currency($fee['remaining'])) ?></strong>
                </div>
            </div>

            <form method="POST" action="<?= e($action) ?>" class="row g-3">
                <?= csrf_field() ?>
                <div class="col-12">
                    <label class="form-label">Amount</label>
                    <input type="number" step="0.01" name="amount" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Payment Date</label>
                    <input type="date" name="payment_date" class="form-control" value="<?= e(date('Y-m-d')) ?>" required>
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
                    <textarea name="note" class="form-control" rows="3"></textarea>
                </div>
                <div class="col-12">
                    <button class="btn btn-dark px-4">Add Installment</button>
                </div>
            </form>
        </div>
    </div>

    <div class="col-lg-7">
        <div class="card-surface table-card">
            <div class="section-title"><h4>Payment History</h4></div>
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
                        <?php foreach ($installments as $installment): ?>
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
    </div>
</div>
