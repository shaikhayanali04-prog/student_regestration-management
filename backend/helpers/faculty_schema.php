<?php

require_once __DIR__ . '/batch_schema.php';

function ensureFacultySchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureBatchSchema($conn);

    $conn->exec(
        "CREATE TABLE IF NOT EXISTS faculty (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            faculty_code VARCHAR(50) NULL UNIQUE,
            full_name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NULL UNIQUE,
            phone VARCHAR(30) NULL,
            subject_specialization TEXT NULL,
            joining_date DATE NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'Active',
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    ensureBatchColumn(
        $conn,
        'batches',
        'faculty_id',
        "ALTER TABLE batches ADD COLUMN faculty_id INT NULL AFTER course_id"
    );

    ensureFacultyCodes($conn);
    ensureLegacyBatchFacultyLinks($conn);
}

function ensureFacultyCodes(PDO $conn): void
{
    $rows = $conn->query(
        "SELECT id, faculty_code, created_at
         FROM faculty
         ORDER BY id ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $updateStmt = $conn->prepare(
        "UPDATE faculty
         SET faculty_code = :faculty_code
         WHERE id = :id"
    );

    $usedNumbers = [];
    foreach ($rows as $row) {
        $year = !empty($row['created_at'])
            ? date('Y', strtotime((string) $row['created_at']))
            : date('Y');
        $prefix = 'FAC-' . $year . '-';
        $code = (string) ($row['faculty_code'] ?? '');

        if ($code !== '' && preg_match('/^FAC-\d{4}-(\d{3})$/', $code, $matches)) {
            $number = (int) $matches[1];
            if ($number > 0 && $number < 900) {
                $usedNumbers[$prefix][] = $number;
            }
        }
    }

    foreach ($rows as $row) {
        $year = !empty($row['created_at'])
            ? date('Y', strtotime((string) $row['created_at']))
            : date('Y');
        $prefix = 'FAC-' . $year . '-';
        $code = (string) ($row['faculty_code'] ?? '');
        $requiresUpdate = $code === '' || preg_match('/^FAC-\d{4}-(9\d{2})$/', $code);

        if (!$requiresUpdate) {
            continue;
        }

        $usedNumbers[$prefix] = $usedNumbers[$prefix] ?? [];
        $nextNumber = 1;
        while (in_array($nextNumber, $usedNumbers[$prefix], true)) {
            $nextNumber++;
        }

        $usedNumbers[$prefix][] = $nextNumber;

        $updateStmt->execute([
            'faculty_code' => sprintf('FAC-%s-%03d', $year, $nextNumber),
            'id' => $row['id'],
        ]);
    }
}

function ensureLegacyBatchFacultyLinks(PDO $conn): void
{
    $rows = $conn->query(
        "SELECT DISTINCT faculty_name
         FROM batches
         WHERE faculty_name IS NOT NULL
           AND TRIM(faculty_name) <> ''
           AND (faculty_id IS NULL OR faculty_id = 0)
         ORDER BY faculty_name ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $findStmt = $conn->prepare(
        "SELECT id
         FROM faculty
         WHERE full_name = :full_name
         LIMIT 1"
    );
    $insertStmt = $conn->prepare(
        "INSERT INTO faculty (
            faculty_code,
            full_name,
            status
         ) VALUES (
            :faculty_code,
            :full_name,
            'Active'
         )"
    );
    $updateBatchesStmt = $conn->prepare(
        "UPDATE batches
         SET faculty_id = :faculty_id
         WHERE faculty_name = :faculty_name
           AND (faculty_id IS NULL OR faculty_id = 0)"
    );

    foreach ($rows as $index => $row) {
        $fullName = trim((string) ($row['faculty_name'] ?? ''));
        if ($fullName === '') {
            continue;
        }

        $findStmt->execute(['full_name' => $fullName]);
        $facultyId = $findStmt->fetchColumn();

        if (!$facultyId) {
            $insertStmt->execute([
                'faculty_code' => null,
                'full_name' => $fullName,
            ]);
            $facultyId = (int) $conn->lastInsertId();
        }

        $updateBatchesStmt->execute([
            'faculty_id' => (int) $facultyId,
            'faculty_name' => $fullName,
        ]);
    }

    ensureFacultyCodes($conn);
}
