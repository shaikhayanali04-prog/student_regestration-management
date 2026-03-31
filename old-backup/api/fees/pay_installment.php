<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$id = (int) ($_GET['id'] ?? 0);

if ($id <= 0) {
    ApiResponse::error('Fee id is required.', 422);
}

$input = ApiRequest::validate([
    'amount' => 'required|numeric|min:1',
    'payment_date' => 'required|date',
]);

$feeModel = new Fee();

try {
    $feeModel->addInstallment(
        $id,
        (float) $input['amount'],
        $input['payment_date'],
        (string) ApiRequest::input('payment_mode', 'Cash'),
        ApiRequest::input('note')
    );
} catch (RuntimeException $exception) {
    ApiResponse::error($exception->getMessage(), 422);
}

ApiResponse::success('Installment paid successfully.', ApiTransformer::fee($feeModel->find($id), $feeModel->installments($id)));
