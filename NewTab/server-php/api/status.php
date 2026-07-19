<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

apply_cors();
require_configured();

$session = current_oauth_session();
if (!$session) {
    json_response([
        'ok' => true,
        'authenticated' => false,
    ]);
}

json_response([
    'ok' => true,
    'authenticated' => true,
    'created_at' => (string)$session['created_at'],
    'updated_at' => (string)$session['updated_at'],
    'last_access_at' => (string)($session['last_access_at'] ?? ''),
    'scope' => (string)($session['scope'] ?? NEWTAB_GOOGLE_SCOPE),
    'access_token_cached' => !empty($session['access_token_enc']) && (int)($session['access_token_expires_at'] ?? 0) > time() + 90,
]);

