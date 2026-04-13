<?php

require_once __DIR__ . '/../controllers/DashboardController.php';

$action = $_GET['action'] ?? 'overview';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$controller = new DashboardController($conn);

if ($method === 'GET' && ($action === 'overview' || $action === 'stats')) {
    $controller->overview();
}

jsonResponse(false, 'Invalid dashboard action.', null, 400);
