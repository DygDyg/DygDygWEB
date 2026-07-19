<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

apply_cors();

json_response([
    'ok' => true,
    'method' => $_SERVER['REQUEST_METHOD'] ?? '',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
    'referer' => $_SERVER['HTTP_REFERER'] ?? '',
    'allow_all' => defined('NEWTAB_CORS_ALLOW_ALL') && NEWTAB_CORS_ALLOW_ALL,
    'allowed_origins' => defined('NEWTAB_ALLOWED_ORIGINS') ? NEWTAB_ALLOWED_ORIGINS : [],
]);
