<?php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    $stmt = $conn->query("
        SELECT a.*, s.first_name, s.last_name, b.name as batch_name 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN batches b ON a.batch_id = b.id
        ORDER BY a.date DESC
    ");
    $attendance = $stmt->fetchAll();
    jsonResponse(true, "Attendance fetched", $attendance);
} elseif ($method === 'POST' && $action === 'mark') {
    $stmt = $conn->prepare("INSERT INTO attendance (batch_id, student_id, date, status, remarks) VALUES (:batch_id, :student_id, :date, :status, :remarks) ON DUPLICATE KEY UPDATE status=:status, remarks=:remarks");
    try {
        $stmt->execute([
            'batch_id' => $data['batch_id'] ?? null,
            'student_id' => $data['student_id'] ?? null,
            'date' => $data['date'] ?? date('Y-m-d'),
            'status' => $data['status'] ?? 'Present',
            'remarks' => $data['remarks'] ?? ''
        ]);
        jsonResponse(true, "Attendance marked successfully");
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid attendance action", null, 400);
}
?>
