<?php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    $stmt = $conn->query("SELECT * FROM expenses ORDER BY date DESC");
    $expenses = $stmt->fetchAll();
    jsonResponse(true, "Expenses fetched", $expenses);
} elseif ($method === 'POST' && $action === 'add') {
    $stmt = $conn->prepare("INSERT INTO expenses (title, amount, date, category, description) VALUES (:title, :amount, :date, :category, :description)");
    try {
        $stmt->execute([
            'title' => $data['title'] ?? '',
            'amount' => $data['amount'] ?? 0,
            'date' => $data['date'] ?? date('Y-m-d'),
            'category' => $data['category'] ?? '',
            'description' => $data['description'] ?? ''
        ]);
        jsonResponse(true, "Expense logged successfully", ['id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid expenses action", null, 400);
}
?>
