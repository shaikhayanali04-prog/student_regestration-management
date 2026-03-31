<?php

declare(strict_types=1);

class Response
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function abort(int $status, string $message): void
    {
        http_response_code($status);

        if (is_api_request()) {
            self::json([
                'status' => 'error',
                'message' => $message,
            ], $status);
        }

        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title>';
        echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">';
        echo '</head><body class="bg-light"><div class="container py-5">';
        echo '<div class="alert alert-danger shadow-sm"><h4 class="mb-2">Request failed</h4><p class="mb-0">' . e($message) . '</p></div>';
        echo '</div></body></html>';
        exit;
    }
}
