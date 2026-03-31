<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e(($title ?? app_config('app_name')) . ' | ' . app_config('app_name')) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="<?= e(asset('assets/css/app.css')) ?>">
</head>
<body>
    <div class="app-shell">
        <?php View::partial('partials/sidebar'); ?>

        <main class="content-shell">
            <div class="topbar">
                <div class="page-title">
                    <h2><?= e($title ?? 'ERP') ?></h2>
                    <p>Run admissions, collections, attendance, and operations from one dashboard.</p>
                </div>
                <div class="user-pill">
                    <strong><?= e(current_user()['name'] ?? 'User') ?></strong><br>
                    <span class="text-muted small text-uppercase"><?= e(current_user()['role'] ?? '') ?></span>
                </div>
            </div>

            <?php View::partial('partials/flash'); ?>

            <?= $content ?>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
    <script>
        document.querySelectorAll('.datatable').forEach(function (table) {
            new DataTable(table, {
                pageLength: 10,
                responsive: true,
                order: [],
            });
        });
    </script>
    <?php if (!empty($pageScript)): ?>
        <?= $pageScript ?>
    <?php endif; ?>
</body>
</html>
