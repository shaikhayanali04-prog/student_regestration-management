<?php

declare(strict_types=1);

class ApiResponse
{
    public static function success(string $message, $data = null, int $status = 200, array $extra = []): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $payload = array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $extra);

        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $status = 400, array $errors = [], $data = null): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        if ($errors) {
            $payload['errors'] = $errors;
        }

        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
        exit;
    }
}
