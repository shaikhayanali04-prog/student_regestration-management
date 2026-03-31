<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'title' => 'required|max:150',
    'category' => 'required|max:60',
    'amount' => 'required|numeric|min:0',
    'expense_date' => 'required|date',
]);

$id = (new Expense())->create([
    'title' => $input['title'],
    'category' => $input['category'],
    'amount' => (float) $input['amount'],
    'expense_date' => $input['expense_date'],
    'note' => ApiRequest::input('note'),
]);

$created = null;

foreach ((new Expense())->all() as $row) {
    if ((int) $row['id'] === $id) {
        $created = $row;
        break;
    }
}

ApiResponse::success('Expense created successfully.', $created, 201);
