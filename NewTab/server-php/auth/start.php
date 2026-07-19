<?php

declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';

require_configured();
configure_session();

$returnUrl = (string)($_GET['return_to'] ?? NEWTAB_DEFAULT_RETURN_URL);
if (!allowed_return_url($returnUrl)) {
    json_response(['ok' => false, 'error' => 'return_url_not_allowed'], 400);
}

$state = create_api_token();
$codeVerifier = create_api_token();
$codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

$_SESSION['newtab_oauth_state'] = $state;
$_SESSION['newtab_oauth_code_verifier'] = $codeVerifier;
$_SESSION['newtab_oauth_return_to'] = $returnUrl;

$params = [
    'client_id' => NEWTAB_GOOGLE_CLIENT_ID,
    'redirect_uri' => base_url('/auth/callback.php'),
    'response_type' => 'code',
    'scope' => NEWTAB_GOOGLE_SCOPE,
    'access_type' => 'offline',
    'include_granted_scopes' => 'true',
    'prompt' => 'consent',
    'state' => $state,
    'code_challenge' => $codeChallenge,
    'code_challenge_method' => 'S256',
];

redirect_to('https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986));

