<?php
// backend/api/courses.php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    $stmt = $conn->query("SELECT * FROM courses ORDER BY id DESC");
    $courses = $stmt->fetchAll();
    jsonResponse(true, "Courses fetched", $courses);
} elseif ($method === 'POST' && $action === 'add') {
    $stmt = $conn->prepare("INSERT INTO courses (name, description, duration_months, default_fee) VALUES (:name, :description, :duration_months, :default_fee)");
    try {
        $stmt->execute([
            'name' => $data['name'] ?? '',
            'description' => $data['description'] ?? '',
            'duration_months' => $data['duration_months'] ?? null,
            'default_fee' => $data['default_fee'] ?? 0
        ]);
        jsonResponse(true, "Course added successfully", ['id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid course action", null, 400);
}
?>
