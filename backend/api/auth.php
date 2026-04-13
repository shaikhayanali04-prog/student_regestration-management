<?php

require_once __DIR__ . '/../controllers/AuthController.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$controller = new AuthController($conn);

if ($method === 'POST' && $action === 'login') {
    $controller->login();
}

if ($method === 'POST' && $action === 'google-login') {
    $controller->googleLogin();
}

if (($method === 'POST' || $method === 'GET') && $action === 'logout') {
    $controller->logout();
}

if ($method === 'GET' && $action === 'me') {
    $controller->me();
}

jsonResponse(false, 'Invalid auth action.', null, 400);
