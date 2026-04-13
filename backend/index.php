<?php
// backend/index.php
require_once __DIR__ . '/config/db.php';

function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit();
}

$request = $_SERVER['REQUEST_URI'];
// We're serving from localhost/coaching-project/backend/...
$base_path = '/coaching-project/backend/api/';

if (strpos($request, $base_path) === 0) {
    $route = substr($request, strlen($base_path));
} else {
    $route = '';
}

$route_parts = explode('/', explode('?', $route)[0]);
$module = $route_parts[0] ?? '';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch($module) {
    case 'auth':
        require_once __DIR__ . '/api/auth.php';
        break;
    case 'dashboard':
        require_once __DIR__ . '/api/dashboard.php';
        break;
    case 'students':
        require_once __DIR__ . '/api/students.php';
        break;
    case 'courses':
        require_once __DIR__ . '/api/courses.php';
        break;
    case 'batches':
        require_once __DIR__ . '/api/batches.php';
        break;
    case 'fees':
        require_once __DIR__ . '/api/fees.php';
        break;
    case 'attendance':
        require_once __DIR__ . '/api/attendance.php';
        break;
    case 'faculty':
        require_once __DIR__ . '/api/faculty.php';
        break;
    case 'expenses':
        require_once __DIR__ . '/api/expenses.php';
        break;
    case 'reports':
        require_once __DIR__ . '/api/reports.php';
        break;
    default:
        jsonResponse(false, "API endpoint not found: /api/".$route, null, 404);
        break;
}
?>
