<?php

declare(strict_types=1);

class Dispatcher
{
    public static function web(?string $forcedRoute = null): void
    {
        $_SERVER['APP_API'] = false;
        $route = trim((string) ($forcedRoute ?? request_route_from_query(self::resolvePath())), '/');
        $_SERVER['APP_ROUTE'] = $route;

        $router = new Router(false);

        foreach (require app_config('base_path') . '/routes/web.php' as $routeConfig) {
            $router->add(
                $routeConfig['method'],
                $routeConfig['path'],
                $routeConfig['action'],
                $routeConfig['options'] ?? []
            );
        }

        $router->dispatch(request_method(), $route);
    }

    public static function api(?string $forcedRoute = null): void
    {
        $_SERVER['APP_API'] = true;
        $route = trim((string) ($forcedRoute ?? request_route_from_query((string) ($_SERVER['PATH_INFO'] ?? ''))), '/');
        $_SERVER['APP_ROUTE'] = $route;

        $router = new Router(true);

        foreach (require app_config('base_path') . '/routes/api.php' as $routeConfig) {
            $router->add(
                $routeConfig['method'],
                $routeConfig['path'],
                $routeConfig['action'],
                $routeConfig['options'] ?? []
            );
        }

        $router->dispatch(request_method(), $route);
    }

    private static function resolvePath(): string
    {
        $uri = parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH);
        $path = trim((string) $uri, '/');
        $base = trim((string) app_config('base_url', ''), '/');

        if ($base !== '' && str_starts_with($path, $base)) {
            $path = trim(substr($path, strlen($base)), '/');
        }

        if ($path === '' || $path === 'index.php') {
            return '';
        }

        if (str_starts_with($path, 'index.php/')) {
            return substr($path, strlen('index.php/'));
        }

        return $path;
    }
}
