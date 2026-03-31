<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'name' => 'required|max:100',
    'start_date' => 'date',
    'end_date' => 'date',
    'capacity' => 'required|integer|min:0',
    'status' => 'required|in:active,inactive',
]);

$id = (new Batch())->create([
    'name' => $input['name'],
    'course_id' => ApiRequest::input('course_id') ?: null,
    'start_date' => $input['start_date'] ?? null,
    'end_date' => $input['end_date'] ?? null,
    'room_name' => ApiRequest::input('room_name'),
    'capacity' => (int) $input['capacity'],
    'schedule_summary' => ApiRequest::input('schedule_summary'),
    'status' => $input['status'],
]);

$batch = null;

foreach ((new Batch())->all() as $row) {
    if ((int) $row['id'] === $id) {
        $batch = $row;
        break;
    }
}

ApiResponse::success('Batch created successfully.', $batch, 201);
