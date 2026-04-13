<?php

require_once __DIR__ . '/../config/auth.php';

function ensureAuthSchema(PDO $conn): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $initialized = true;

    ensureAuthColumn(
        $conn,
        'users',
        'phone',
        "ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL AFTER email"
    );
    ensureAuthColumn(
        $conn,
        'users',
        'phone_normalized',
        "ALTER TABLE users ADD COLUMN phone_normalized VARCHAR(20) NULL AFTER phone"
    );
    ensureAuthColumn(
        $conn,
        'users',
        'google_id',
        "ALTER TABLE users ADD COLUMN google_id VARCHAR(191) NULL AFTER phone_normalized"
    );
    ensureAuthColumn(
        $conn,
        'users',
        'avatar_url',
        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER google_id"
    );
    ensureAuthColumn(
        $conn,
        'users',
        'google_email_verified',
        "ALTER TABLE users ADD COLUMN google_email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER avatar_url"
    );
    ensureAuthColumn(
        $conn,
        'users',
        'last_login_at',
        "ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL AFTER created_at"
    );

    ensureAuthIndex(
        $conn,
        'users',
        'uniq_users_phone_normalized',
        "ALTER TABLE users ADD UNIQUE KEY uniq_users_phone_normalized (phone_normalized)"
    );
    ensureAuthIndex(
        $conn,
        'users',
        'uniq_users_google_id',
        "ALTER TABLE users ADD UNIQUE KEY uniq_users_google_id (google_id)"
    );

    syncUserPhoneNumbers($conn);
    seedDemoAdminPhone($conn);
}

function ensureAuthColumn(PDO $conn, string $table, string $column, string $sql): void
{
    if (authColumnExists($conn, $table, $column)) {
        return;
    }

    $conn->exec($sql);
}

function authColumnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
    $stmt->execute(['column' => $column]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}

function ensureAuthIndex(PDO $conn, string $table, string $indexName, string $sql): void
{
    if (authIndexExists($conn, $table, $indexName)) {
        return;
    }

    $conn->exec($sql);
}

function authIndexExists(PDO $conn, string $table, string $indexName): bool
{
    $stmt = $conn->prepare("SHOW INDEX FROM `{$table}` WHERE Key_name = :index_name");
    $stmt->execute(['index_name' => $indexName]);

    return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
}

function normalizeAuthPhone(?string $phone): ?string
{
    if ($phone === null) {
        return null;
    }

    $normalized = preg_replace('/\D+/', '', $phone) ?: '';
    $normalized = trim($normalized);

    if ($normalized === '') {
        return null;
    }

    return $normalized;
}

function syncUserPhoneNumbers(PDO $conn): void
{
    $rows = $conn->query(
        "SELECT id, phone
         FROM users
         WHERE phone IS NOT NULL
           AND TRIM(phone) <> ''
           AND (phone_normalized IS NULL OR phone_normalized = '')"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        return;
    }

    $updateStmt = $conn->prepare(
        "UPDATE users
         SET phone_normalized = :phone_normalized
         WHERE id = :id"
    );

    foreach ($rows as $row) {
        $normalized = normalizeAuthPhone($row['phone'] ?? null);

        $updateStmt->execute([
            'phone_normalized' => $normalized,
            'id' => (int) $row['id'],
        ]);
    }
}

function seedDemoAdminPhone(PDO $conn): void
{
    $demoPhone = authConfig()['seed']['demo_phone'] ?? '';
    $normalizedPhone = normalizeAuthPhone($demoPhone);

    if ($normalizedPhone === null) {
        return;
    }

    $ownerStmt = $conn->prepare(
        "SELECT id
         FROM users
         WHERE phone_normalized = :phone_normalized
         LIMIT 1"
    );
    $ownerStmt->execute(['phone_normalized' => $normalizedPhone]);

    if ($ownerStmt->fetchColumn()) {
        return;
    }

    $adminStmt = $conn->prepare(
        "SELECT id
         FROM users
         WHERE email = 'admin@example.com'
           AND (phone_normalized IS NULL OR phone_normalized = '')
         LIMIT 1"
    );
    $adminStmt->execute();
    $adminId = $adminStmt->fetchColumn();

    if (!$adminId) {
        return;
    }

    $updateStmt = $conn->prepare(
        "UPDATE users
         SET phone = :phone, phone_normalized = :phone_normalized
         WHERE id = :id"
    );
    $updateStmt->execute([
        'phone' => $demoPhone,
        'phone_normalized' => $normalizedPhone,
        'id' => (int) $adminId,
    ]);
}
