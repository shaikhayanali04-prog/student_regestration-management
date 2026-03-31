<?php

declare(strict_types=1);

class BaseController
{
    protected function render(string $view, array $data = [], string $layout = 'app'): void
    {
        View::render($view, $data, $layout);
        clear_old();
        unset($_SESSION['_errors']);
    }

    protected function redirect(string $route, array $query = []): void
    {
        redirect_to(url($route, $query));
    }

    protected function json(array $payload, int $status = 200): void
    {
        Response::json($payload, $status);
    }

    protected function requestPayload(): array
    {
        $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? '');

        if (str_contains($contentType, 'application/json')) {
            $decoded = json_decode((string) file_get_contents('php://input'), true);
            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }

    protected function validate(array $input, array $rules): array
    {
        [$validated, $errors] = Validator::validate($input, $rules);

        if (!$errors) {
            return $validated;
        }

        if (is_api_request()) {
            $this->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'errors' => $errors,
            ], 422);
        }

        remember_old($input);
        $_SESSION['_errors'] = $errors;
        flash('global', reset($errors), 'danger');
        redirect_to($_SERVER['HTTP_REFERER'] ?? url('dashboard'));
    }
}
