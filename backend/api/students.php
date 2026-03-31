<?php
// backend/api/students.php
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET' && empty($action)) {
    $stmt = $conn->query("SELECT * FROM students ORDER BY id DESC");
    $students = $stmt->fetchAll();
    jsonResponse(true, "Students fetched", $students);
} elseif ($method === 'GET' && $action === 'view' && isset($_GET['id'])) {
    $stmt = $conn->prepare("SELECT * FROM students WHERE id = :id");
    $stmt->execute(['id' => $_GET['id']]);
    $student = $stmt->fetch();
    if($student) jsonResponse(true, "Student fetched", $student);
    else jsonResponse(false, "Student not found", null, 404);
} elseif ($method === 'POST' && $action === 'add') {
    $stmt = $conn->prepare("INSERT INTO students (admission_no, first_name, last_name, email, phone, dob, address) VALUES (:admission_no, :first_name, :last_name, :email, :phone, :dob, :address)");
    try {
        $stmt->execute([
            'admission_no' => $data['admission_no'] ?? ('ADM-' . time()),
            'first_name' => $data['first_name'] ?? '',
            'last_name' => $data['last_name'] ?? '',
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'dob' => $data['dob'] ?? null,
            'address' => $data['address'] ?? null
        ]);
        jsonResponse(true, "Student added successfully", ['id' => $conn->lastInsertId()]);
    } catch(Exception $e) {
        jsonResponse(false, "Error: " . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, "Invalid student action", null, 400);
}
?>
