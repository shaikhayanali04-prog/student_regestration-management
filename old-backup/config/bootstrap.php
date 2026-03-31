<?php

declare(strict_types=1);

$GLOBALS['app_config'] = require __DIR__ . '/app.php';
$GLOBALS['db_config'] = require __DIR__ . '/db_settings.php';

$sessionDirectory = dirname(__DIR__) . '/storage/sessions';

if (!is_dir($sessionDirectory)) {
    mkdir($sessionDirectory, 0775, true);
}

session_save_path($sessionDirectory);

if (session_status() === PHP_SESSION_NONE) {
    session_name((string) (($GLOBALS['app_config']['session_name'] ?? 'coaching_erp_session')));
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

spl_autoload_register(static function (string $class): void {
    $directories = [
        __DIR__,
        dirname(__DIR__) . '/controllers',
        dirname(__DIR__) . '/models',
        dirname(__DIR__) . '/helpers',
    ];

    foreach ($directories as $directory) {
        $file = $directory . '/' . $class . '.php';

        if (is_file($file)) {
            require_once $file;
            return;
        }
    }
});

require_once dirname(__DIR__) . '/helpers/app.php';

date_default_timezone_set((string) app_config('timezone', 'Asia/Kolkata'));

SchemaManager::ensure();
