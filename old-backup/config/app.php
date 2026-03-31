<?php

return [
    'app_name' => 'Coaching ERP Pro',
    'timezone' => 'Asia/Kolkata',
    'base_path' => dirname(__DIR__),
    'base_url' => '/' . trim(basename(dirname(__DIR__)), '/'),
    'session_key' => 'erp_user',
    'session_name' => 'coaching_erp_session',
    'currency_symbol' => 'Rs.',
    'upload_dir' => dirname(__DIR__) . '/uploads/students',
    'max_upload_size' => 2 * 1024 * 1024,
    'allowed_frontend_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
        'http://localhost',
        'http://127.0.0.1',
    ],
    'allowed_image_mime' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
];
