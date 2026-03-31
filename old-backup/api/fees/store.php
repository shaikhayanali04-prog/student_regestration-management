<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'student_id' => 'required|integer',
    'total_fees' => 'required|numeric|min:0',
    'paid' => 'required|numeric|min:0',
    'installment_amount' => 'required|numeric|min:0',
    'payment_date' => 'date',
]);

if ((float) $input['paid'] > (float) $input['total_fees']) {
    ApiResponse::error('Initial paid amount cannot exceed total fees.', 422);
}

$id = (new Fee())->createPlan([
    'student_id' => (int) $input['student_id'],
    'total_fees' => (float) $input['total_fees'],
    'paid' => (float) $input['paid'],
    'installment_amount' => (float) $input['installment_amount'],
    'payment_date' => $input['payment_date'] ?? date('Y-m-d'),
    'payment_mode' => ApiRequest::input('payment_mode', 'Cash'),
    'note' => ApiRequest::input('note'),
]);

$fee = new Fee();

ApiResponse::success('Fee plan created successfully.', ApiTransformer::fee($fee->find($id), $fee->installments($id)), 201);
