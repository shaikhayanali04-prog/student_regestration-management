<?php

function ensureFeeSchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureFeeColumn(
        $conn,
        'student_course',
        'due_date',
        "ALTER TABLE student_course ADD COLUMN due_date DATE NULL AFTER joined_date"
    );
    ensureFeeColumn(
        $conn,
        'student_course',
        'installment_count',
        "ALTER TABLE student_course ADD COLUMN installment_count INT NULL AFTER due_date"
    );
    ensureFeeColumn(
        $conn,
        'student_course',
        'notes',
        "ALTER TABLE student_course ADD COLUMN notes TEXT NULL AFTER installment_count"
    );

    ensureFeeColumn(
        $conn,
        'fees',
        'late_fee',
        "ALTER TABLE fees ADD COLUMN late_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER amount_paid"
    );
    ensureFeeColumn(
        $conn,
        'fees',
        'transaction_id',
        "ALTER TABLE fees ADD COLUMN transaction_id VARCHAR(100) NULL AFTER payment_method"
    );
    ensureFeeColumn(
        $conn,
        'fees',
        'receipt_number',
        "ALTER TABLE fees ADD COLUMN receipt_number VARCHAR(100) NULL AFTER transaction_id"
    );

    $backfillDueDate = $conn->prepare(
        "UPDATE student_course
         SET due_date = COALESCE(due_date, DATE_ADD(joined_date, INTERVAL 30 DAY))
         WHERE due_date IS NULL"
    );
    $backfillDueDate->execute();

    $rows = $conn->query(
        "SELECT id, payment_date
         FROM fees
         WHERE receipt_number IS NULL OR receipt_number = ''
         ORDER BY id ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $updateStmt = $conn->prepare("UPDATE fees SET receipt_number = :receipt_number WHERE id = :id");

    foreach ($rows as $row) {
        $year = !empty($row['payment_date']) ? date('Y', strtotime((string) $row['payment_date'])) : date('Y');
        $receiptNumber = sprintf('RCPT-%s-%05d', $year, (int) $row['id']);
        $updateStmt->execute([
            'receipt_number' => $receiptNumber,
            'id' => $row['id'],
        ]);
    }
}

function ensureFeeColumn(PDO $conn, string $table, string $column, string $sql): void
{
    if (feeColumnExists($conn, $table, $column)) {
        return;
    }

    $conn->exec($sql);
}

function feeColumnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}
