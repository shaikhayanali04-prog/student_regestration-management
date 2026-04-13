<?php

function ensureBatchSchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureBatchColumn(
        $conn,
        'batches',
        'batch_code',
        "ALTER TABLE batches ADD COLUMN batch_code VARCHAR(50) NULL AFTER id"
    );
    ensureBatchColumn(
        $conn,
        'batches',
        'faculty_name',
        "ALTER TABLE batches ADD COLUMN faculty_name VARCHAR(100) NULL AFTER name"
    );
    ensureBatchColumn(
        $conn,
        'batches',
        'start_date',
        "ALTER TABLE batches ADD COLUMN start_date DATE NULL AFTER faculty_name"
    );
    ensureBatchColumn(
        $conn,
        'batches',
        'end_date',
        "ALTER TABLE batches ADD COLUMN end_date DATE NULL AFTER start_date"
    );
    ensureBatchColumn(
        $conn,
        'batches',
        'room',
        "ALTER TABLE batches ADD COLUMN room VARCHAR(100) NULL AFTER end_time"
    );
    ensureBatchColumn(
        $conn,
        'batches',
        'capacity',
        "ALTER TABLE batches ADD COLUMN capacity INT NULL AFTER room"
    );

    $conn->exec("ALTER TABLE batches MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'Planned'");

    $rows = $conn->query(
        "SELECT id, created_at
         FROM batches
         WHERE batch_code IS NULL OR batch_code = ''
         ORDER BY id ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $updateStmt = $conn->prepare("UPDATE batches SET batch_code = :batch_code WHERE id = :id");

    foreach ($rows as $index => $row) {
        $year = !empty($row['created_at']) ? date('Y', strtotime((string) $row['created_at'])) : date('Y');
        $batchCode = sprintf('BAT-%s-%03d', $year, $index + 1);
        $updateStmt->execute([
            'batch_code' => $batchCode,
            'id' => $row['id'],
        ]);
    }
}

function ensureBatchColumn(PDO $conn, string $table, string $column, string $sql): void
{
    if (batchColumnExists($conn, $table, $column)) {
        return;
    }

    $conn->exec($sql);
}

function batchColumnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}
