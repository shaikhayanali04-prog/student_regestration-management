<?php
echo "Loading db.php...\n";
require_once __DIR__ . '/backend/config/db.php';
require_once __DIR__ . '/backend/controllers/AuthController.php';

try {
    echo "Starting session...\n";
    startAuthSession();
    echo "Session started.\n";
    echo "Creating AuthController...\n";
    $controller = new AuthController($conn);
    echo "AuthController created successfully.\n";
} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
