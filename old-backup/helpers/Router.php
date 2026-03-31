<?php

declare(strict_types=1);

class Router
{
    private array $routes = [];
    private bool $apiMode;

    public function __construct(bool $apiMode = false)
    {
        $this->apiMode = $apiMode;
    }

    public function add(string $method, string $path, $action, array $options = []): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => trim($path, '/'),
            'action' => $action,
            'options' => $options,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = trim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = $this->compile($route['path']);

            if (!preg_match($pattern, $path, $matches)) {
                continue;
            }

            $params = [];

            foreach ($matches as $key => $value) {
                if (!is_int($key)) {
                    $params[$key] = $value;
                }
            }

            $this->authorize($route['options']);
            $this->invoke($route['action'], $params);

            return;
        }

        Response::abort(404, 'The requested route was not found.');
    }

    private function compile(string $path): string
    {
        if ($path === '') {
            return '#^$#';
        }

        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);

        return '#^' . $pattern . '$#';
    }

    private function authorize(array $options): void
    {
        if (($options['auth'] ?? false) && !is_logged_in()) {
            if ($this->apiMode) {
                Response::json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
            }

            flash('global', 'Please login to continue.', 'warning');
            redirect_to(url('login'));
        }

        if (isset($options['roles']) && !has_role($options['roles'])) {
            if ($this->apiMode) {
                Response::json(['status' => 'error', 'message' => 'Forbidden.'], 403);
            }

            Response::abort(403, 'You do not have permission to access this area.');
        }
    }

    private function invoke($action, array $params): void
    {
        if (is_callable($action)) {
            call_user_func_array($action, array_values($params));
            return;
        }

        if (is_array($action) && count($action) === 2) {
            [$class, $method] = $action;
            $controller = new $class();
            call_user_func_array([$controller, $method], array_values($params));
            return;
        }

        Response::abort(500, 'Invalid route action.');
    }
}
