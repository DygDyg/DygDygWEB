<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

apply_cors();
require_configured();

$session = require_oauth_session();
$expiresAt = isset($session['access_token_expires_at']) ? (int)$session['access_token_expires_at'] : 0;
$cachedAccessToken = (string)($session['access_token_enc'] ?? '');

if ($cachedAccessToken !== '' && $expiresAt > time() + 90) {
    json_response([
        'ok' => true,
        'access_token' => decrypt_secret($cachedAccessToken),
        'token_type' => 'Bearer',
        'expires_in' => $expiresAt - time(),
        'scope' => (string)($session['scope'] ?? NEWTAB_GOOGLE_SCOPE),
        'cached' => true,
    ]);
}

$refreshToken = decrypt_secret((string)$session['refresh_token_enc']);
$tokens = refresh_google_access_token($refreshToken);

$accessToken = (string)($tokens['access_token'] ?? '');
if ($accessToken === '') {
    json_response(['ok' => false, 'error' => 'access_token_missing'], 502);
}

$expiresIn = max(0, (int)($tokens['expires_in'] ?? 3600));
$newExpiresAt = time() + $expiresIn;
$scope = (string)($tokens['scope'] ?? ($session['scope'] ?? NEWTAB_GOOGLE_SCOPE));

db()->prepare(
    'UPDATE oauth_sessions
     SET access_token_enc = :access_token_enc,
         access_token_expires_at = :access_token_expires_at,
         scope = :scope,
         updated_at = :updated_at,
         last_access_at = :last_access_at
     WHERE id = :id'
)->execute([
    ':access_token_enc' => encrypt_secret($accessToken),
    ':access_token_expires_at' => $newExpiresAt,
    ':scope' => $scope,
    ':updated_at' => now_iso(),
    ':last_access_at' => now_iso(),
    ':id' => $session['id'],
]);

json_response([
    'ok' => true,
    'access_token' => $accessToken,
    'token_type' => (string)($tokens['token_type'] ?? 'Bearer'),
    'expires_in' => $expiresIn,
    'scope' => $scope,
    'cached' => false,
]);

