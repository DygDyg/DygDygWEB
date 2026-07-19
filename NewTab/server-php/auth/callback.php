<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

require_configured();
configure_session();

$returnUrl = (string)($_SESSION['newtab_oauth_return_to'] ?? NEWTAB_DEFAULT_RETURN_URL);
if (!allowed_return_url($returnUrl)) {
    $returnUrl = NEWTAB_DEFAULT_RETURN_URL;
}

if (isset($_GET['error'])) {
    redirect_to(return_url_with_fragment($returnUrl, [
        'newtab_auth_status' => 'error',
        'newtab_auth_error' => (string)$_GET['error'],
    ]));
}

$state = (string)($_GET['state'] ?? '');
$expectedState = (string)($_SESSION['newtab_oauth_state'] ?? '');
$codeVerifier = (string)($_SESSION['newtab_oauth_code_verifier'] ?? '');
$code = (string)($_GET['code'] ?? '');

unset($_SESSION['newtab_oauth_state'], $_SESSION['newtab_oauth_code_verifier'], $_SESSION['newtab_oauth_return_to']);

if ($state === '' || !hash_equals($expectedState, $state) || $code === '' || $codeVerifier === '') {
    redirect_to(return_url_with_fragment($returnUrl, [
        'newtab_auth_status' => 'error',
        'newtab_auth_error' => 'invalid_oauth_state',
    ]));
}

$tokens = exchange_code_for_tokens($code, $codeVerifier);
$refreshToken = (string)($tokens['refresh_token'] ?? '');

if ($refreshToken === '') {
    redirect_to(return_url_with_fragment($returnUrl, [
        'newtab_auth_status' => 'error',
        'newtab_auth_error' => 'refresh_token_missing',
    ]));
}

$apiToken = create_api_token();
$now = now_iso();
$expiresIn = max(0, (int)($tokens['expires_in'] ?? 0));
$expiresAt = $expiresIn > 0 ? time() + $expiresIn : null;

$statement = db()->prepare(
    'INSERT INTO oauth_sessions
        (token_hash, refresh_token_enc, access_token_enc, access_token_expires_at, scope, created_at, updated_at, last_access_at)
     VALUES
        (:token_hash, :refresh_token_enc, :access_token_enc, :access_token_expires_at, :scope, :created_at, :updated_at, :last_access_at)'
);

$statement->execute([
    ':token_hash' => hash_api_token($apiToken),
    ':refresh_token_enc' => encrypt_secret($refreshToken),
    ':access_token_enc' => isset($tokens['access_token']) ? encrypt_secret((string)$tokens['access_token']) : null,
    ':access_token_expires_at' => $expiresAt,
    ':scope' => (string)($tokens['scope'] ?? NEWTAB_GOOGLE_SCOPE),
    ':created_at' => $now,
    ':updated_at' => $now,
    ':last_access_at' => $now,
]);

redirect_to(return_url_with_fragment($returnUrl, [
    'newtab_auth_status' => 'ok',
    'newtab_auth' => $apiToken,
]));

