<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

json_response([
    'ok' => true,
    'service' => 'DygDyg NewTab token server',
    'endpoints' => [
        'login' => base_url('/auth/start.php'),
        'callback' => base_url('/auth/callback.php'),
        'token' => base_url('/api/token.php'),
        'status' => base_url('/api/status.php'),
        'logout' => base_url('/api/logout.php'),
    ],
]);

