<div class="row g-4">
    <div class="col-lg-4">
        <div class="card-surface form-card">
            <div class="section-title">
                <h4>Add Expense</h4>
            </div>
            <?php if (has_role('admin')): ?>
                <form method="POST" action="<?= e(url('expenses/store')) ?>" class="row g-3">
                    <?= csrf_field() ?>
                    <div class="col-12">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-control" value="<?= e(old('title')) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Category</label>
                        <input type="text" name="category" class="form-control" value="<?= e(old('category')) ?>" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Amount</label>
                        <input type="number" step="0.01" name="amount" class="form-control" value="<?= e(old('amount', '0')) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Expense Date</label>
                        <input type="date" name="expense_date" class="form-control" value="<?= e(old('expense_date', date('Y-m-d'))) ?>" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Note</label>
                        <textarea name="note" class="form-control" rows="3"><?= e(old('note')) ?></textarea>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-dark px-4">Save Expense</button>
                    </div>
                </form>
            <?php else: ?>
                <div class="empty-state">Only admin can add or remove expenses.</div>
            <?php endif; ?>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <div class="card-surface metric-card">
                    <div class="metric-label">Total Expenses</div>
                    <p class="metric-value"><?= e(currency($totalSpent)) ?></p>
                </div>
            </div>
        </div>

        <div class="card-surface table-card">
            <div class="section-title">
                <h4>Expense Register</h4>
                <span class="stat-chip"><?= e(count($expenses)) ?> rows</span>
            </div>
            <div class="table-responsive">
                <table class="table datatable align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Note</th>
                            <?php if (has_role('admin')): ?><th>Action</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($expenses as $expense): ?>
                            <tr>
                                <td><?= e($expense['expense_date']) ?></td>
                                <td><?= e($expense['title']) ?></td>
                                <td><?= e($expense['category']) ?></td>
                                <td><?= e(currency($expense['amount'])) ?></td>
                                <td><?= e($expense['note']) ?></td>
                                <?php if (has_role('admin')): ?>
                                    <td>
                                        <form method="POST" action="<?= e(url('expenses/' . $expense['id'] . '/delete')) ?>" onsubmit="return confirm('Delete this expense?');">
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
