<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$fees = (new Fee())->all([
    'search' => trim((string) ApiRequest::input('search', '')),
    'status' => ApiRequest::input('status', ''),
]);

ApiResponse::success('Fees fetched successfully.', array_map(static function (array $fee): array {
    return ApiTransformer::fee($fee);
}, $fees));
