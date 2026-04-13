<?php

require_once __DIR__ . '/../controllers/FacultyController.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$controller = new FacultyController($conn);

if ($method === 'GET' && ($action === '' || $action === 'list')) {
    $controller->index();
}

if ($method === 'GET' && $action === 'meta') {
    $controller->meta();
}

if ($method === 'GET' && $action === 'view') {
    $controller->show();
}

if ($method === 'POST' && $action === 'add') {
    $controller->store();
}

if ($method === 'POST' && $action === 'update') {
    $controller->update();
}

if ($method === 'POST' && $action === 'delete') {
    $controller->destroy();
}

jsonResponse(false, 'Invalid faculty action.', null, 400);
