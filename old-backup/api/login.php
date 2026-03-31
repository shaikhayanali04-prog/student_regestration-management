<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

$input = ApiRequest::validate([
    'username' => 'required|max:50',
    'password' => 'required|max:100',
]);

$userModel = new User();
$user = $userModel->findByUsername((string) $input['username']);

if (!$user || !(bool) $user['is_active']) {
    ApiResponse::error('Invalid username or password.', 401);
}

$storedPassword = (string) $user['password'];
$isHashed = !empty(password_get_info($storedPassword)['algo']);
$valid = $isHashed
    ? password_verify((string) $input['password'], $storedPassword)
    : hash_equals($storedPassword, (string) $input['password']);

if (!$valid) {
    ApiResponse::error('Invalid username or password.', 401);
}

if (!$isHashed) {
    $userModel->updatePassword((int) $user['id'], password_hash((string) $input['password'], PASSWORD_DEFAULT));
}

session_regenerate_id(false);

$sessionUser = [
    'id' => (int) $user['id'],
    'name' => $user['name'],
    'username' => $user['username'],
    'role' => $user['role'],
];

store_user_session($sessionUser);
$userModel->touchLogin((int) $user['id']);

ApiResponse::success('Login successful.', [
    'user' => $sessionUser,
    'csrf_token' => csrf_token(),
]);
