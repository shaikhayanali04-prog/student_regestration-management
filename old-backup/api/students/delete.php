<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin']);
ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$id = (int) ($_GET['id'] ?? 0);

if ($id <= 0) {
    ApiResponse::error('Student id is required.', 422);
}

$student = (new Student())->find($id);

if (!$student) {
    ApiResponse::error('Student not found.', 404);
}

(new Student())->delete($id);

ApiResponse::success('Student deleted successfully.', [
    'id' => $id,
]);
