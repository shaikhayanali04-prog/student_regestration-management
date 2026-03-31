<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

ApiRequest::requireMethod('POST');
CorsHelper::ensureTrustedOrigin();

if (is_logged_in()) {
    logout_user();
}

ApiResponse::success('Logout successful.', null);
