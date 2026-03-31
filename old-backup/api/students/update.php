<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$id = (int) ($_GET['id'] ?? 0);

if ($id <= 0) {
    ApiResponse::error('Student id is required.', 422);
}

$studentModel = new Student();
$existing = $studentModel->find($id);

if (!$existing) {
    ApiResponse::error('Student not found.', 404);
}

$input = ApiRequest::validate([
    'name' => 'required|max:100',
    'email' => 'max:100',
    'phone' => 'max:20',
    'guardian_name' => 'max:100',
    'join_date' => 'date',
    'status' => 'required|in:active,inactive',
]);

$courseName = null;
$courseId = ApiRequest::input('course_id');

if (!empty($courseId)) {
    $course = (new Course())->find((int) $courseId);
    $courseName = $course['course_name'] ?? null;
}

try {
    $photo = UploadHelper::storeStudentPhoto(ApiRequest::file('photo') ?? [], $existing['photo'] ?? null);
} catch (RuntimeException $exception) {
    ApiResponse::error($exception->getMessage(), 422);
}

$studentModel->update($id, [
    'name' => $input['name'],
    'email' => $input['email'] ?? null,
    'phone' => $input['phone'] ?? null,
    'guardian_name' => $input['guardian_name'] ?? null,
    'address' => ApiRequest::input('address'),
    'course' => $courseName,
    'course_id' => $courseId ?: null,
    'batch_id' => ApiRequest::input('batch_id') ?: null,
    'join_date' => $input['join_date'] ?? null,
    'status' => $input['status'],
    'photo' => $photo,
]);

ApiResponse::success('Student updated successfully.', ApiTransformer::student($studentModel->find($id)));
