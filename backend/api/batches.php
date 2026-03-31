<?php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    // Get batches with course name
    $stmt = $conn->query("SELECT b.*, c.name as course_name FROM batches b LEFT JOIN courses c ON b.course_id = c.id ORDER BY b.id DESC");
    $batches = $stmt->fetchAll();
    jsonResponse(true, "Batches fetched", $batches);
} elseif ($method === 'POST' && $action === 'add') {
    $stmt = $conn->prepare("INSERT INTO batches (course_id, name, schedule_days, start_time, end_time) VALUES (:course_id, :name, :schedule_days, :start_time, :end_time)");
    try {
        $stmt->execute([
            'course_id' => $data['course_id'] ?? null,
            'name' => $data['name'] ?? '',
            'schedule_days' => $data['schedule_days'] ?? '',
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null
        ]);
        jsonResponse(true, "Batch added successfully", ['id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid batch action", null, 400);
}
?>
