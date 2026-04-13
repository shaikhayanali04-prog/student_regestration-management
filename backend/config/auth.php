<?php

function authConfig(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $allowedDomains = array_filter(
        array_map(
            static fn (string $domain): string => strtolower(trim($domain)),
            explode(',', getenv('SMARTERP_GOOGLE_ALLOWED_DOMAINS') ?: '')
        ),
        static fn (string $domain): bool => $domain !== ''
    );

    $config = [
        'session' => [
            'cookie_name' => getenv('SMARTERP_SESSION_NAME') ?: 'smarterp_session',
            'cookie_lifetime' => 60 * 60 * 8,
            'same_site' => getenv('SMARTERP_SESSION_SAMESITE') ?: 'Lax',
            'secure' => filter_var(getenv('SMARTERP_SESSION_SECURE') ?: false, FILTER_VALIDATE_BOOLEAN),
        ],
        'google' => [
            'client_id' => getenv('SMARTERP_GOOGLE_CLIENT_ID') ?: '',
            'allowed_domains' => $allowedDomains,
            'auto_create_admin' => filter_var(getenv('SMARTERP_GOOGLE_AUTO_CREATE_ADMIN') ?: false, FILTER_VALIDATE_BOOLEAN),
            'default_role' => getenv('SMARTERP_GOOGLE_DEFAULT_ROLE') ?: 'admin',
        ],
        'seed' => [
            'demo_phone' => getenv('SMARTERP_DEMO_PHONE') ?: '9876543210',
        ],
    ];

    $localConfigPath = __DIR__ . '/auth.local.php';
    if (file_exists($localConfigPath)) {
        $localConfig = require $localConfigPath;
        if (is_array($localConfig)) {
            $config = array_replace_recursive($config, $localConfig);
        }
    }

    return $config;
}

function startAuthSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sessionConfig = authConfig()['session'];
    session_name($sessionConfig['cookie_name']);
    session_set_cookie_params([
        'lifetime' => $sessionConfig['cookie_lifetime'],
        'path' => '/',
        'httponly' => true,
        'secure' => $sessionConfig['secure'],
        'samesite' => $sessionConfig['same_site'],
    ]);

    session_start();
}
