<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$user = ApiAuth::requireUser(['admin', 'staff']);

ApiResponse::success('Authenticated user fetched successfully.', [
    'user' => $user,
    'csrf_token' => csrf_token(),
]);
