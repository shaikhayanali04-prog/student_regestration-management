<?php

function ensureCourseSchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureCourseColumn(
        $conn,
        'courses',
        'course_code',
        "ALTER TABLE courses ADD COLUMN course_code VARCHAR(50) NULL AFTER id"
    );
    ensureCourseColumn(
        $conn,
        'courses',
        'mode',
        "ALTER TABLE courses ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'Offline' AFTER default_fee"
    );
    ensureCourseColumn(
        $conn,
        'courses',
        'subjects',
        "ALTER TABLE courses ADD COLUMN subjects TEXT NULL AFTER mode"
    );

    $rows = $conn->query(
        "SELECT id, created_at
         FROM courses
         WHERE course_code IS NULL OR course_code = ''
         ORDER BY id ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $updateStmt = $conn->prepare("UPDATE courses SET course_code = :course_code WHERE id = :id");

    foreach ($rows as $index => $row) {
        $year = !empty($row['created_at']) ? date('Y', strtotime((string) $row['created_at'])) : date('Y');
        $courseCode = sprintf('CRS-%s-%03d', $year, $index + 1);
        $updateStmt->execute([
            'course_code' => $courseCode,
            'id' => $row['id'],
        ]);
    }
}

function ensureCourseColumn(PDO $conn, string $table, string $column, string $sql): void
{
    if (courseColumnExists($conn, $table, $column)) {
        return;
    }

    $conn->exec($sql);
}

function courseColumnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}
