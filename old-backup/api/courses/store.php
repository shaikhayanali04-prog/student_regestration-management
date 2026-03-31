<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'course_name' => 'required|max:100',
    'fees' => 'required|numeric|min:0',
    'duration_months' => 'required|integer|min:0',
    'status' => 'required|in:active,inactive',
]);

$id = (new Course())->create([
    'course_name' => $input['course_name'],
    'code' => ApiRequest::input('code'),
    'fees' => (float) $input['fees'],
    'description' => ApiRequest::input('description'),
    'duration_months' => (int) $input['duration_months'],
    'status' => $input['status'],
]);

ApiResponse::success('Course created successfully.', (new Course())->find($id), 201);
