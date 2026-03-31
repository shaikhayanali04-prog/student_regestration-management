<?php
// backend/api/auth.php
require_once __DIR__ . '/../config/db.php';
session_start();

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->email) || !isset($data->password)) {
        jsonResponse(false, "Email and password are required", null, 400);
    }

    $email = $data->email;
    $password = $data->password;

    $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        
        unset($user['password']);
        jsonResponse(true, "Login successful", $user);
    } else {
        jsonResponse(false, "Invalid credentials", null, 401);
    }
} elseif ($action === 'logout') {
    session_destroy();
    jsonResponse(true, "Logged out successfully");
} elseif ($action === 'me') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = :id");
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();
        if ($user) {
            jsonResponse(true, "User fetched", $user);
        }
    }
    jsonResponse(false, "Not authenticated", null, 401);
} else {
    jsonResponse(false, "Invalid auth action", null, 400);
}
?>
