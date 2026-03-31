<?php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    $stmt = $conn->query("
        SELECT f.*, s.first_name, s.last_name, c.name as course_name 
        FROM fees f
        JOIN student_course sc ON f.student_course_id = sc.id
        JOIN students s ON sc.student_id = s.id
        JOIN courses c ON sc.course_id = c.id
        ORDER BY f.id DESC
    ");
    $fees = $stmt->fetchAll();
    jsonResponse(true, "Fees fetched", $fees);
} elseif ($method === 'POST' && $action === 'pay') {
    $stmt = $conn->prepare("INSERT INTO fees (student_course_id, amount_paid, payment_date, payment_method, remarks) VALUES (:student_course_id, :amount_paid, :payment_date, :payment_method, :remarks)");
    try {
        $stmt->execute([
            'student_course_id' => $data['student_course_id'] ?? null,
            'amount_paid' => $data['amount_paid'] ?? 0,
            'payment_date' => $data['payment_date'] ?? date('Y-m-d'),
            'payment_method' => $data['payment_method'] ?? 'Cash',
            'remarks' => $data['remarks'] ?? ''
        ]);
        jsonResponse(true, "Fee payment recorded successfully", ['id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid fee action", null, 400);
}
?>
