<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$students = (new Student())->all([
    'search' => trim((string) ApiRequest::input('search', '')),
    'course_id' => ApiRequest::input('course_id', ''),
    'batch_id' => ApiRequest::input('batch_id', ''),
    'status' => ApiRequest::input('status', ''),
]);

ApiResponse::success('Students fetched successfully.', array_map([ApiTransformer::class, 'student'], $students));
