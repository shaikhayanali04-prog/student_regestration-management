<?php

function ensureAttendanceSchema(PDO $conn): void
{
    $tableExistsStmt = $conn->query("SHOW TABLES LIKE 'attendance'");
    $tableExists = (bool) $tableExistsStmt->fetchColumn();

    if (!$tableExists) {
        $conn->exec(
            "CREATE TABLE attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                batch_id INT NOT NULL,
                student_id INT NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'Present',
                remarks VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_attendance_batch_date (batch_id, date),
                INDEX idx_attendance_student_date (student_id, date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );

        return;
    }

    $columnsStmt = $conn->query("SHOW COLUMNS FROM attendance");
    $columns = [];
    foreach ($columnsStmt->fetchAll(PDO::FETCH_ASSOC) as $column) {
        $columns[$column['Field']] = $column;
    }

    if (!isset($columns['remarks'])) {
        $conn->exec("ALTER TABLE attendance ADD COLUMN remarks VARCHAR(255) NULL AFTER status");
    }

    if (!isset($columns['created_at'])) {
        $conn->exec(
            "ALTER TABLE attendance
             ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER remarks"
        );
    }

    if (isset($columns['status']) && stripos((string) $columns['status']['Type'], 'varchar') === false) {
        $conn->exec(
            "ALTER TABLE attendance
             MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Present'"
        );
    }

    $indexesStmt = $conn->query("SHOW INDEX FROM attendance");
    $indexes = [];
    foreach ($indexesStmt->fetchAll(PDO::FETCH_ASSOC) as $index) {
        $indexes[$index['Key_name']][] = $index['Column_name'];
    }

    if (!isset($indexes['idx_attendance_batch_date'])) {
        $conn->exec(
            "ALTER TABLE attendance
             ADD INDEX idx_attendance_batch_date (batch_id, date)"
        );
    }

    if (!isset($indexes['idx_attendance_student_date'])) {
        $conn->exec(
            "ALTER TABLE attendance
             ADD INDEX idx_attendance_student_date (student_id, date)"
        );
    }
}
