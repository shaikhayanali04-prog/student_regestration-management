<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'date' => 'required|date',
]);

$statuses = ApiRequest::input('status', []);

if (!is_array($statuses) || !$statuses) {
    ApiResponse::error('Attendance statuses are required.', 422);
}

$normalized = [];

foreach ($statuses as $studentId => $status) {
    $studentId = (int) $studentId;
    $status = trim((string) $status);

    if ($studentId <= 0 || !in_array($status, ['Present', 'Absent'], true)) {
        ApiResponse::error('Attendance payload is invalid.', 422);
    }

    $normalized[$studentId] = $status;
}

$count = (new Attendance())->markDaily($input['date'], $normalized);

ApiResponse::success('Attendance saved successfully.', [
    'date' => $input['date'],
    'saved_records' => $count,
]);
