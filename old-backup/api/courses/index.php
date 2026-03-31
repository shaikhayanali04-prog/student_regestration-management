<?php

declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

ApiAuth::requireUser(['admin', 'staff']);

ApiResponse::success('Courses fetched successfully.', (new Course())->all());
