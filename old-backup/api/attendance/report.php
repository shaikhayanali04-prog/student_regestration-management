<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$reportModel = new Report();

ApiResponse::success('Attendance report fetched successfully.', $reportModel->attendance([
    'date_from' => ApiRequest::input('date_from', ''),
    'date_to' => ApiRequest::input('date_to', ''),
    'status' => ApiRequest::input('status', ''),
    'search' => trim((string) ApiRequest::input('search', '')),
]));
