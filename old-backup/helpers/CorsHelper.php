<?php

declare(strict_types=1);

class CorsHelper
{
    public static function handle(): void
    {
        $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

        if ($origin !== '' && self::isAllowedOrigin($origin)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        if (request_method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public static function ensureTrustedOrigin(): void
    {
        $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

        if ($origin === '') {
            return;
        }

        if (!self::isAllowedOrigin($origin)) {
            ApiResponse::error('Origin is not allowed.', 403);
        }
    }

    private static function isAllowedOrigin(string $origin): bool
    {
        return in_array($origin, app_config('allowed_frontend_origins', []), true);
    }
}
