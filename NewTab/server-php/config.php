<?php

declare(strict_types=1);

$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) {
    require $localConfig;
}

if (!defined('NEWTAB_GOOGLE_CLIENT_ID')) {
    define('NEWTAB_GOOGLE_CLIENT_ID', getenv('NEWTAB_GOOGLE_CLIENT_ID') ?: '');
}

if (!defined('NEWTAB_GOOGLE_CLIENT_SECRET')) {
    define('NEWTAB_GOOGLE_CLIENT_SECRET', getenv('NEWTAB_GOOGLE_CLIENT_SECRET') ?: '');
}

if (!defined('NEWTAB_SERVER_SECRET')) {
    define('NEWTAB_SERVER_SECRET', getenv('NEWTAB_SERVER_SECRET') ?: '');
}

if (!defined('NEWTAB_BASE_URL')) {
    define('NEWTAB_BASE_URL', rtrim((string)(getenv('NEWTAB_BASE_URL') ?: 'https://server.dygdyg.ru/newtab'), '/'));
}

if (!defined('NEWTAB_DEFAULT_RETURN_URL')) {
    define('NEWTAB_DEFAULT_RETURN_URL', getenv('NEWTAB_DEFAULT_RETURN_URL') ?: 'https://dygdyg.github.io/DygDygWEB/NewTab/index.htm');
}

if (!defined('NEWTAB_ALLOWED_ORIGINS')) {
    define('NEWTAB_ALLOWED_ORIGINS', [
        'https://dygdyg.github.io',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        'http://localhost:5500',
        'http://localhost:5501',
    ]);
}

if (!defined('NEWTAB_SQLITE_PATH')) {
    define('NEWTAB_SQLITE_PATH', __DIR__ . '/../../newtab_oauth.sqlite');
}

if (!defined('NEWTAB_GOOGLE_SCOPE')) {
    define('NEWTAB_GOOGLE_SCOPE', 'https://www.googleapis.com/auth/drive.appdata');
}
