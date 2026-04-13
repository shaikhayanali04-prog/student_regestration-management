<?php

function ensureStudentSchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureStudentColumn(
        $conn,
        'students',
        'parent_name',
        "ALTER TABLE students ADD COLUMN parent_name VARCHAR(100) NULL AFTER phone"
    );
    ensureStudentColumn(
        $conn,
        'students',
        'parent_phone',
        "ALTER TABLE students ADD COLUMN parent_phone VARCHAR(20) NULL AFTER parent_name"
    );
    ensureStudentColumn(
        $conn,
        'students',
        'admission_date',
        "ALTER TABLE students ADD COLUMN admission_date DATE NULL AFTER parent_phone"
    );
    ensureStudentColumn(
        $conn,
        'students',
        'notes',
        "ALTER TABLE students ADD COLUMN notes TEXT NULL AFTER status"
    );

    $statusType = getStudentColumnType($conn, 'students', 'status');
    if ($statusType !== null && stripos($statusType, 'varchar') === false) {
        $conn->exec("ALTER TABLE students MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'Active'");
    }

    $normalizeStatusStmt = $conn->prepare(
        "UPDATE students
         SET status = 'Completed'
         WHERE status = 'Alumni'"
    );
    $normalizeStatusStmt->execute();

    $backfillStmt = $conn->prepare(
        "UPDATE students
         SET admission_date = COALESCE(admission_date, DATE(created_at))
         WHERE admission_date IS NULL"
    );
    $backfillStmt->execute();
}

function ensureStudentColumn(PDO $conn, string $table, string $column, string $sql): void
{
    if (studentColumnExists($conn, $table, $column)) {
        return;
    }

    $conn->exec($sql);
}

function studentColumnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}

function getStudentColumnType(PDO $conn, string $table, string $column): ?string
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row['Type'] ?? null;
}
