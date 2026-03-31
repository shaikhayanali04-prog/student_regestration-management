<?php

declare(strict_types=1);

function app_config(?string $key = null, $default = null)
{
    $config = $GLOBALS['app_config'] ?? [];

    if ($key === null) {
        return $config;
    }

    return $config[$key] ?? $default;
}

function db(): Database
{
    return Database::getInstance();
}

function base_url(string $path = ''): string
{
    $base = rtrim((string) app_config('base_url', ''), '/');
    $path = ltrim($path, '/');

    if ($path === '') {
        return $base;
    }

    return $base . '/' . $path;
}

function url(string $route = '', array $query = []): string
{
    $route = trim($route, '/');

    if ($route !== '') {
        $query = array_merge(['route' => $route], $query);
    }

    $target = base_url('index.php');

    return $query ? $target . '?' . http_build_query($query) : $target;
}

function api_url(string $route = '', array $query = []): string
{
    $route = trim($route, '/');

    if ($route !== '') {
        $query = array_merge(['route' => $route], $query);
    }

    $target = base_url('api.php');

    return $query ? $target . '?' . http_build_query($query) : $target;
}

function asset(string $path): string
{
    return base_url(ltrim($path, '/'));
}

function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function current_route(): string
{
    return trim((string) ($_SERVER['APP_ROUTE'] ?? ''), '/');
}

function route_is(string $routePrefix): bool
{
    $routePrefix = trim($routePrefix, '/');
    $route = current_route();

    return $route === $routePrefix || str_starts_with($route, $routePrefix . '/');
}

function request_method(): string
{
    return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
}

function request_data(): array
{
    return request_method() === 'POST' ? $_POST : $_GET;
}

function input(string $key, $default = null)
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

function is_api_request(): bool
{
    return (bool) ($_SERVER['APP_API'] ?? false);
}

function redirect_to(string $location): void
{
    header('Location: ' . $location);
    exit;
}

function flash(string $key, ?string $message = null, string $type = 'info')
{
    if (!isset($_SESSION['_flash'])) {
        $_SESSION['_flash'] = [];
    }

    if ($message === null) {
        $value = $_SESSION['_flash'][$key] ?? null;
        unset($_SESSION['_flash'][$key]);

        return $value;
    }

    $_SESSION['_flash'][$key] = [
        'message' => $message,
        'type' => $type,
    ];

    return null;
}

function remember_old(array $data): void
{
    $_SESSION['_old'] = $data;
}

function old(string $key, $default = '')
{
    return $_SESSION['_old'][$key] ?? $default;
}

function clear_old(): void
{
    unset($_SESSION['_old']);
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['_csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = $_POST['_token'] ?? '';

    if (!$token || !hash_equals((string) ($_SESSION['_csrf_token'] ?? ''), $token)) {
        if (is_api_request()) {
            Response::json(['status' => 'error', 'message' => 'Invalid CSRF token.'], 419);
        }

        flash('global', 'The session token expired. Please try again.', 'danger');
        redirect_to($_SERVER['HTTP_REFERER'] ?? url('login'));
    }
}

function current_user(): ?array
{
    return $_SESSION[app_config('session_key')] ?? null;
}

function is_logged_in(): bool
{
    return current_user() !== null;
}

function has_role($roles): bool
{
    $user = current_user();

    if (!$user) {
        return false;
    }

    $roles = is_array($roles) ? $roles : [$roles];

    return in_array($user['role'], $roles, true);
}

function store_user_session(array $user): void
{
    $_SESSION[app_config('session_key')] = $user;
}

function logout_user(): void
{
    unset($_SESSION[app_config('session_key')]);
    session_regenerate_id(false);
}

function currency($amount): string
{
    return app_config('currency_symbol', 'Rs.') . ' ' . number_format((float) $amount, 2);
}

function request_route_from_query(string $default = ''): string
{
    return trim((string) ($_GET['route'] ?? $default), '/');
}
