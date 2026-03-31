<?php

declare(strict_types=1);

$_SERVER['APP_API'] = true;

require dirname(__DIR__) . '/config/bootstrap.php';

CorsHelper::handle();
