<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

ApiResponse::success('Fees report fetched successfully.', (new Report())->fees());
