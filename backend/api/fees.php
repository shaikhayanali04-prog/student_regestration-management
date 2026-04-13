<?php

require_once __DIR__ . '/../controllers/FeeController.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$controller = new FeeController($conn);

if ($method === 'GET' && ($action === '' || $action === 'list')) {
    $controller->index();
}

if ($method === 'GET' && $action === 'meta') {
    $controller->meta();
}

if ($method === 'GET' && $action === 'view') {
    $controller->show();
}

if ($method === 'GET' && $action === 'receipt') {
    $controller->receipt();
}

if ($method === 'POST' && $action === 'configure') {
    $controller->configure();
}

if ($method === 'POST' && $action === 'pay') {
    $controller->pay();
}

jsonResponse(false, 'Invalid fee action.', null, 400);
