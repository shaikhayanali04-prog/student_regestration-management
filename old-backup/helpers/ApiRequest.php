<?php

declare(strict_types=1);

class ApiRequest
{
    private static ?array $payload = null;

    public static function all(): array
    {
        if (self::$payload !== null) {
            return self::$payload;
        }

        $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? '');
        $payload = [];

        if (str_contains($contentType, 'application/json')) {
            $decoded = json_decode((string) file_get_contents('php://input'), true);
            $payload = is_array($decoded) ? $decoded : [];
        } elseif (request_method() === 'GET') {
            $payload = $_GET;
        } else {
            $payload = $_POST;
        }

        self::$payload = $payload;

        return $payload;
    }

    public static function input(string $key, $default = null)
    {
        $payload = self::all();

        return $payload[$key] ?? $_GET[$key] ?? $default;
    }

    public static function file(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }

    public static function requireMethod(string $method): void
    {
        if (request_method() !== strtoupper($method)) {
            ApiResponse::error('Method not allowed.', 405);
        }
    }

    public static function validate(array $rules): array
    {
        [$validated, $errors] = Validator::validate(self::all(), $rules);

        if ($errors) {
            ApiResponse::error('Validation failed.', 422, $errors);
        }

        return $validated;
    }
}
