<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

apply_cors();
require_configured();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$session = require_oauth_session();
$refreshToken = decrypt_secret((string)$session['refresh_token_enc']);

// Best effort revoke. Even if Google is unreachable, the local API token is disabled.
revoke_google_token($refreshToken);

db()->prepare('UPDATE oauth_sessions SET revoked_at = :revoked_at, updated_at = :updated_at WHERE id = :id')
    ->execute([
        ':revoked_at' => now_iso(),
        ':updated_at' => now_iso(),
        ':id' => $session['id'],
    ]);

json_response(['ok' => true]);
