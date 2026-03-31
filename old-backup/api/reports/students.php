<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

ApiResponse::success('Students report fetched successfully.', (new Report())->students([
    'search' => trim((string) ApiRequest::input('search', '')),
    'course_id' => ApiRequest::input('course_id', ''),
    'batch_id' => ApiRequest::input('batch_id', ''),
    'status' => ApiRequest::input('status', ''),
]));
