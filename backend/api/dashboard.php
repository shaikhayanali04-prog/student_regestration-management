<?php
// backend/api/dashboard.php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? 'stats';

if ($action === 'stats') {
    $stmt = $conn->query("SELECT COUNT(*) as total FROM students WHERE status='Active'");
    $total_students = (int) $stmt->fetch()['total'];

    $stmt = $conn->query("SELECT COUNT(*) as total FROM courses WHERE status='Active'");
    $total_courses = (int) $stmt->fetch()['total'];

    $stmt = $conn->query("SELECT SUM(amount_paid) as total FROM fees");
    $fees_collected = (float) ($stmt->fetch()['total'] ?? 0);

    $stmt = $conn->query("SELECT SUM(total_fee - discount) as total FROM student_course");
    $total_fees_expected = (float) ($stmt->fetch()['total'] ?? 0);
    
    $pending_fees = $total_fees_expected - $fees_collected;
    
    $stmt = $conn->query("SELECT SUM(amount) as total FROM expenses");
    $total_expenses = (float) ($stmt->fetch()['total'] ?? 0);

    $net_profit = $fees_collected - $total_expenses;

    jsonResponse(true, "Dashboard stats fetched", [
        "total_students" => $total_students,
        "total_courses" => $total_courses,
        "fees_collected" => $fees_collected,
        "pending_fees" => $pending_fees > 0 ? $pending_fees : 0,
        "expenses" => $total_expenses,
        "net_profit" => $net_profit
    ]);
} else {
    jsonResponse(false, "Invalid dashboard action", null, 400);
}
?>
