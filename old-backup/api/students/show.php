<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

$id = (int) ($_GET['id'] ?? 0);

if ($id <= 0) {
    ApiResponse::error('Student id is required.', 422);
}

$profile = (new Student())->profile($id);

if (empty($profile['student'])) {
    ApiResponse::error('Student not found.', 404);
}

ApiResponse::success('Student fetched successfully.', [
    'student' => ApiTransformer::student($profile['student']),
    'fees' => array_map(static function (array $fee): array {
        return ApiTransformer::fee($fee);
    }, $profile['fees']),
    'installments' => array_map([ApiTransformer::class, 'installment'], $profile['installments']),
    'attendance' => array_map(static function (array $row): array {
        return [
            'date' => $row['date'],
            'status' => $row['status'],
        ];
    }, $profile['attendance']),
    'attendance_percent' => (float) $profile['attendance_percent'],
]);
