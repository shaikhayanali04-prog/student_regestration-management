<?php

require_once __DIR__ . '/../controllers/AttendanceController.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$controller = new AttendanceController($conn);

if ($method === 'GET' && ($action === '' || $action === 'list')) {
    $controller->index();
}

if ($method === 'GET' && $action === 'meta') {
    $controller->meta();
}

if ($method === 'GET' && $action === 'sheet') {
    $controller->sheet();
}

if ($method === 'GET' && $action === 'report') {
    $controller->report();
}

if ($method === 'POST' && $action === 'mark') {
    $controller->mark();
}

jsonResponse(false, 'Invalid attendance action.', null, 400);
