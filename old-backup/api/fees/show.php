<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$id = (int) ($_GET['id'] ?? 0);

if ($id <= 0) {
    ApiResponse::error('Fee id is required.', 422);
}

$feeModel = new Fee();
$fee = $feeModel->find($id);

if (!$fee) {
    ApiResponse::error('Fee record not found.', 404);
}

ApiResponse::success('Fee fetched successfully.', ApiTransformer::fee($fee, $feeModel->installments($id)));
