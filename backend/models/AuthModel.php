<?php

require_once __DIR__ . '/../helpers/auth_schema.php';

class AuthModel
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        ensureAuthSchema($conn);
    }

    public function attemptPasswordLogin(string $identifier, string $password): ?array
    {
        $user = $this->findByIdentifier($identifier);

        if (!$user || !password_verify($password, (string) ($user['password'] ?? ''))) {
            return null;
        }

        $this->touchLastLogin((int) $user['id']);
        $freshUser = $this->findById((int) $user['id']);

        return $freshUser ? $this->sanitizeUser($freshUser) : null;
    }

    public function loginWithGoogle(string $credential): array
    {
        $googleProfile = $this->verifyGoogleCredential($credential);

        $user = $this->findByGoogleAccount(
            $googleProfile['sub'],
            $googleProfile['email']
        );

        if (!$user) {
            $googleSettings = authConfig()['google'];
            if (!$googleSettings['auto_create_admin']) {
                throw new RuntimeException('This Google account is not linked to an ERP user yet.');
            }

            $this->assertGoogleDomainAllowed($googleProfile['email']);
            $userId = $this->createGoogleUser($googleProfile, $googleSettings['default_role']);
            $user = $this->findById($userId);
        } else {
            $this->linkGoogleAccount((int) $user['id'], $googleProfile);
            $user = $this->findById((int) $user['id']);
        }

        if (!$user) {
            throw new RuntimeException('Unable to finish Google sign-in right now.');
        }

        $this->touchLastLogin((int) $user['id']);
        $freshUser = $this->findById((int) $user['id']);

        return $freshUser ? $this->sanitizeUser($freshUser) : $this->sanitizeUser($user);
    }

    public function currentUser(int $userId): ?array
    {
        $user = $this->findById($userId);

        return $user ? $this->sanitizeUser($user) : null;
    }

    private function findByIdentifier(string $identifier): ?array
    {
        $identifier = trim($identifier);
        $email = filter_var($identifier, FILTER_VALIDATE_EMAIL)
            ? strtolower($identifier)
            : strtolower($identifier);
        $phone = normalizeAuthPhone($identifier);

        $stmt = $this->conn->prepare(
            "SELECT *
             FROM users
             WHERE LOWER(email) = :email
                OR phone_normalized = :phone
             LIMIT 1"
        );
        $stmt->execute([
            'email' => $email,
            'phone' => $phone,
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    private function findByGoogleAccount(string $googleId, string $email): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT *
             FROM users
             WHERE google_id = :google_id
                OR LOWER(email) = :email
             LIMIT 1"
        );
        $stmt->execute([
            'google_id' => $googleId,
            'email' => strtolower($email),
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    private function findById(int $userId): ?array
    {
        $stmt = $this->conn->prepare(
            "SELECT *
             FROM users
             WHERE id = :id
             LIMIT 1"
        );
        $stmt->execute(['id' => $userId]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    private function linkGoogleAccount(int $userId, array $googleProfile): void
    {
        $stmt = $this->conn->prepare(
            "UPDATE users
             SET
                google_id = :google_id,
                avatar_url = :avatar_url,
                google_email_verified = :google_email_verified,
                name = :name,
                email = :email
             WHERE id = :id"
        );
        $stmt->execute([
            'google_id' => $googleProfile['sub'],
            'avatar_url' => $googleProfile['picture'] ?? null,
            'google_email_verified' => !empty($googleProfile['email_verified']) ? 1 : 0,
            'name' => $googleProfile['name'] ?: $googleProfile['email'],
            'email' => strtolower($googleProfile['email']),
            'id' => $userId,
        ]);
    }

    private function createGoogleUser(array $googleProfile, string $role): int
    {
        $randomPassword = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare(
            "INSERT INTO users (
                name,
                email,
                password,
                role,
                google_id,
                avatar_url,
                google_email_verified
             ) VALUES (
                :name,
                :email,
                :password,
                :role,
                :google_id,
                :avatar_url,
                :google_email_verified
             )"
        );
        $stmt->execute([
            'name' => $googleProfile['name'] ?: $googleProfile['email'],
            'email' => strtolower($googleProfile['email']),
            'password' => $randomPassword,
            'role' => $role,
            'google_id' => $googleProfile['sub'],
            'avatar_url' => $googleProfile['picture'] ?? null,
            'google_email_verified' => !empty($googleProfile['email_verified']) ? 1 : 0,
        ]);

        return (int) $this->conn->lastInsertId();
    }

    private function touchLastLogin(int $userId): void
    {
        $stmt = $this->conn->prepare(
            "UPDATE users
             SET last_login_at = NOW()
             WHERE id = :id"
        );
        $stmt->execute(['id' => $userId]);
    }

    private function sanitizeUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? null,
            'role' => $user['role'] ?? 'admin',
            'avatar_url' => $user['avatar_url'] ?? null,
            'google_connected' => !empty($user['google_id']),
            'last_login_at' => $user['last_login_at'] ?? null,
        ];
    }

    private function verifyGoogleCredential(string $credential): array
    {
        $googleConfig = authConfig()['google'];
        if (trim((string) ($googleConfig['client_id'] ?? '')) === '') {
            throw new RuntimeException('Google sign-in is not configured on the backend yet.');
        }

        $profile = $this->fetchJson(
            'https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential)
        );

        if (!$profile || empty($profile['sub']) || empty($profile['email'])) {
            throw new RuntimeException('Google token could not be verified.');
        }

        $audience = (string) ($profile['aud'] ?? '');
        $issuer = (string) ($profile['iss'] ?? '');
        $emailVerified = filter_var($profile['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($audience !== $googleConfig['client_id']) {
            throw new RuntimeException('Google token audience mismatch.');
        }

        if (!in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)) {
            throw new RuntimeException('Google token issuer is invalid.');
        }

        if (!$emailVerified) {
            throw new RuntimeException('Google account email is not verified.');
        }

        return [
            'sub' => (string) $profile['sub'],
            'email' => strtolower((string) $profile['email']),
            'name' => trim((string) ($profile['name'] ?? '')),
            'picture' => $profile['picture'] ?? null,
            'email_verified' => $emailVerified,
        ];
    }

    private function fetchJson(string $url): ?array
    {
        $body = null;
        $statusCode = 0;

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 12,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
            ]);
            $body = curl_exec($ch);
            $statusCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            curl_close($ch);
        } else {
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "Accept: application/json\r\n",
                    'timeout' => 12,
                ],
            ]);
            $body = @file_get_contents($url, false, $context);
            if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', (string) $http_response_header[0], $matches)) {
                $statusCode = (int) $matches[1];
            }
        }

        if ($body === false || $body === null || $statusCode >= 400) {
            return null;
        }

        $decoded = json_decode($body, true);

        return is_array($decoded) ? $decoded : null;
    }

    private function assertGoogleDomainAllowed(string $email): void
    {
        $googleConfig = authConfig()['google'];
        $allowedDomains = $googleConfig['allowed_domains'] ?? [];

        if (!$allowedDomains) {
            return;
        }

        $domain = strtolower(substr(strrchr($email, '@') ?: '', 1));

        if ($domain === '' || !in_array($domain, $allowedDomains, true)) {
            throw new RuntimeException('This Google account domain is not allowed.');
        }
    }
}
