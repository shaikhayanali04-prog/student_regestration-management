<?php

require_once __DIR__ . '/../models/AuthModel.php';
require_once __DIR__ . '/../config/auth.php';

class AuthController
{
    private AuthModel $auth;

    public function __construct(PDO $conn)
    {
        startAuthSession();
        $this->auth = new AuthModel($conn);
    }

    public function login(): void
    {
        $payload = $this->requestData();
        $identifier = trim((string) ($payload['identifier'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($identifier === '' || $password === '') {
            jsonResponse(false, 'Email or phone and password are required.', null, 422);
        }

        $user = $this->auth->attemptPasswordLogin($identifier, $password);
        if (!$user) {
            jsonResponse(false, 'Invalid login credentials.', null, 401);
        }

        $this->storeAuthenticatedUser($user);
        jsonResponse(true, 'Login successful.', $user);
    }

    public function googleLogin(): void
    {
        $payload = $this->requestData();
        $credential = trim((string) ($payload['credential'] ?? ''));

        if ($credential === '') {
            jsonResponse(false, 'Google credential is required.', null, 422);
        }

        try {
            $user = $this->auth->loginWithGoogle($credential);
            $this->storeAuthenticatedUser($user);
            jsonResponse(true, 'Google login successful.', $user);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function me(): void
    {
        $userId = (int) ($_SESSION['user_id'] ?? 0);
        if ($userId <= 0) {
            jsonResponse(false, 'Not authenticated.', null, 401);
        }

        $user = $this->auth->currentUser($userId);
        if (!$user) {
            $this->destroySession();
            jsonResponse(false, 'Not authenticated.', null, 401);
        }

        jsonResponse(true, 'User fetched successfully.', $user);
    }

    public function logout(): void
    {
        $this->destroySession();
        jsonResponse(true, 'Logged out successfully.');
    }

    private function requestData(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $decoded = json_decode(file_get_contents('php://input'), true);
            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }

    private function storeAuthenticatedUser(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
    }

    private function destroySession(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'] ?? '',
                $params['secure'] ?? false,
                $params['httponly'] ?? true
            );
        }

        session_destroy();
    }

    private function handleException(Throwable $exception): void
    {
        if ($exception instanceof RuntimeException) {
            $message = $exception->getMessage();
            $status = str_contains(strtolower($message), 'configured')
                ? 503
                : (str_contains(strtolower($message), 'not linked') ? 403 : 422);

            jsonResponse(false, $message, null, $status);
        }

        jsonResponse(false, 'Unable to complete authentication right now.', null, 500);
    }
}
