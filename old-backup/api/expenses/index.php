<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$expenseModel = new Expense();

ApiResponse::success('Expenses fetched successfully.', [
    'summary' => [
        'total_spent' => $expenseModel->totalSpent(),
        'records' => count($expenseModel->all()),
    ],
    'rows' => $expenseModel->all(),
]);
