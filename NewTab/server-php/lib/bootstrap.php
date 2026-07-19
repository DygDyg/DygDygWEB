<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';

function require_configured(): void
{
    $missing = [];
    foreach (['NEWTAB_GOOGLE_CLIENT_ID', 'NEWTAB_GOOGLE_CLIENT_SECRET', 'NEWTAB_SERVER_SECRET'] as $name) {
        $value = defined($name) ? trim((string)constant($name)) : '';
        if ($value === '' || substr($value, 0, 5) === 'YOUR_' || substr($value, 0, 9) === 'CHANGE_ME') {
            $missing[] = $name;
        }
    }

    if ($missing) {
        json_response([
            'ok' => false,
            'error' => 'server_not_configured',
            'missing' => $missing,
        ], 500);
    }

    if (!extension_loaded('pdo_sqlite')) {
        json_response(['ok' => false, 'error' => 'pdo_sqlite_missing'], 500);
    }

    if (!extension_loaded('openssl')) {
        json_response(['ok' => false, 'error' => 'openssl_missing'], 500);
    }

    if (!extension_loaded('curl')) {
        json_response(['ok' => false, 'error' => 'curl_missing'], 500);
    }
}

function base_url(string $path = ''): string
{
    return rtrim((string)NEWTAB_BASE_URL, '/') . '/' . ltrim($path, '/');
}

function configure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 60 * 60,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);
    session_name('newtab_oauth');
    session_start();
}

function apply_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = defined('NEWTAB_ALLOWED_ORIGINS') ? NEWTAB_ALLOWED_ORIGINS : [];
    $allowAll = defined('NEWTAB_CORS_ALLOW_ALL') && NEWTAB_CORS_ALLOW_ALL;

    if ($allowAll) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-NewTab-Auth');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Max-Age: 86400');
    } elseif ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-NewTab-Auth');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Max-Age: 86400');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function redirect_to(string $url): void
{
    header('Location: ' . $url, true, 302);
    exit;
}

function now_iso(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $path = (string)NEWTAB_SQLITE_PATH;
    $dir = dirname($path);
    if (!is_dir($dir) || !is_writable($dir)) {
        json_response([
            'ok' => false,
            'error' => 'sqlite_directory_not_writable',
            'path' => $dir,
        ], 500);
    }

    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS oauth_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_hash TEXT NOT NULL UNIQUE,
            refresh_token_enc TEXT NOT NULL,
            access_token_enc TEXT,
            access_token_expires_at INTEGER,
            scope TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_access_at TEXT,
            revoked_at TEXT
        )'
    );

    return $pdo;
}

function secret_key(): string
{
    return hash('sha256', (string)NEWTAB_SERVER_SECRET, true);
}

function encrypt_secret(string $plainText): string
{
    $iv = random_bytes(12);
    $tag = '';
    $cipherText = openssl_encrypt($plainText, 'aes-256-gcm', secret_key(), OPENSSL_RAW_DATA, $iv, $tag);
    if ($cipherText === false) {
        json_response(['ok' => false, 'error' => 'encrypt_failed'], 500);
    }

    return base64_encode($iv . $tag . $cipherText);
}

function decrypt_secret(string $encoded): string
{
    $raw = base64_decode($encoded, true);
    if ($raw === false || strlen($raw) < 29) {
        json_response(['ok' => false, 'error' => 'decrypt_failed'], 500);
    }

    $iv = substr($raw, 0, 12);
    $tag = substr($raw, 12, 16);
    $cipherText = substr($raw, 28);
    $plainText = openssl_decrypt($cipherText, 'aes-256-gcm', secret_key(), OPENSSL_RAW_DATA, $iv, $tag);
    if ($plainText === false) {
        json_response(['ok' => false, 'error' => 'decrypt_failed'], 500);
    }

    return $plainText;
}

function create_api_token(): string
{
    return rtrim(strtr(base64_encode(random_bytes(48)), '+/', '-_'), '=');
}

function hash_api_token(string $token): string
{
    return hash_hmac('sha256', $token, (string)NEWTAB_SERVER_SECRET);
}

function bearer_token(): string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return trim($matches[1]);
    }

    $fallback = $_SERVER['HTTP_X_NEWTAB_AUTH'] ?? '';
    if (trim($fallback) !== '') {
        return trim($fallback);
    }

    $queryToken = $_GET['auth'] ?? '';
    if (is_string($queryToken) && trim($queryToken) !== '') {
        return trim($queryToken);
    }

    $body = file_get_contents('php://input');
    if (is_string($body)) {
        $body = trim($body);
        if ($body !== '' && preg_match('/^[A-Za-z0-9_-]{40,}$/', $body)) {
            return $body;
        }
    }

    return '';
}

function current_oauth_session(): ?array
{
    $token = bearer_token();
    if ($token === '') {
        return null;
    }

    $statement = db()->prepare('SELECT * FROM oauth_sessions WHERE token_hash = :token_hash AND revoked_at IS NULL LIMIT 1');
    $statement->execute([':token_hash' => hash_api_token($token)]);
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function require_oauth_session(): array
{
    $session = current_oauth_session();
    if (!$session) {
        json_response(['ok' => false, 'error' => 'not_authenticated'], 401);
    }

    db()->prepare('UPDATE oauth_sessions SET last_access_at = :last_access_at WHERE id = :id')
        ->execute([':last_access_at' => now_iso(), ':id' => $session['id']]);

    return $session;
}

function allowed_return_url(string $url): bool
{
    if ($url === '') {
        return false;
    }

    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return false;
    }

    $origin = $parts['scheme'] . '://' . $parts['host'];
    if (isset($parts['port'])) {
        $origin .= ':' . $parts['port'];
    }

    return in_array($origin, NEWTAB_ALLOWED_ORIGINS, true);
}

function return_url_with_fragment(string $returnUrl, array $fragmentParams): string
{
    $base = strtok($returnUrl, '#');
    $existingFragment = parse_url($returnUrl, PHP_URL_FRAGMENT);
    $fragment = http_build_query($fragmentParams, '', '&', PHP_QUERY_RFC3986);

    if ($existingFragment) {
        $fragment = $existingFragment . '&' . $fragment;
    }

    return $base . '#' . $fragment;
}

function post_form(string $url, array $fields): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        json_response(['ok' => false, 'error' => 'curl_init_failed'], 500);
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($fields, '', '&', PHP_QUERY_RFC3986),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT => 20,
    ]);

    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        json_response(['ok' => false, 'error' => 'curl_failed', 'details' => $curlError], 502);
    }

    $json = json_decode((string)$body, true);
    if (!is_array($json)) {
        json_response(['ok' => false, 'error' => 'google_invalid_json', 'status' => $status], 502);
    }

    if ($status < 200 || $status >= 300) {
        json_response(['ok' => false, 'error' => 'google_error', 'status' => $status, 'details' => $json], 502);
    }

    return $json;
}

function exchange_code_for_tokens(string $code, string $codeVerifier): array
{
    return post_form('https://oauth2.googleapis.com/token', [
        'code' => $code,
        'client_id' => NEWTAB_GOOGLE_CLIENT_ID,
        'client_secret' => NEWTAB_GOOGLE_CLIENT_SECRET,
        'redirect_uri' => base_url('/auth/callback.php'),
        'grant_type' => 'authorization_code',
        'code_verifier' => $codeVerifier,
    ]);
}

function refresh_google_access_token(string $refreshToken): array
{
    return post_form('https://oauth2.googleapis.com/token', [
        'client_id' => NEWTAB_GOOGLE_CLIENT_ID,
        'client_secret' => NEWTAB_GOOGLE_CLIENT_SECRET,
        'refresh_token' => $refreshToken,
        'grant_type' => 'refresh_token',
    ]);
}

function revoke_google_token(string $token): void
{
    $ch = curl_init('https://oauth2.googleapis.com/revoke');
    if ($ch === false) {
        return;
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['token' => $token], '', '&', PHP_QUERY_RFC3986),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT => 10,
    ]);

    curl_exec($ch);
    curl_close($ch);
}
