<?php

declare(strict_types=1);

// Copy this file to config.local.php and fill your real values there.

const NEWTAB_GOOGLE_CLIENT_ID = 'YOUR_WEB_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const NEWTAB_GOOGLE_CLIENT_SECRET = 'YOUR_WEB_OAUTH_CLIENT_SECRET';

// Long random string used to encrypt refresh tokens in SQLite.
// Example generation:
// php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
const NEWTAB_SERVER_SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';

const NEWTAB_BASE_URL = 'https://server.dygdyg.ru/newtab';
const NEWTAB_DEFAULT_RETURN_URL = 'https://dygdyg.github.io/DygDygWEB/NewTab/index.htm';

const NEWTAB_ALLOWED_ORIGINS = [
    'https://dygdyg.github.io',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5500',
    'http://localhost:5501',
];

// API uses bearer tokens instead of cookies, so wildcard CORS is OK for token/status/logout.
const NEWTAB_CORS_ALLOW_ALL = true;

// config.php is inside /var/www/html/newtab, so this default points to /var/www/newtab_oauth.sqlite.
const NEWTAB_SQLITE_PATH = __DIR__ . '/../../newtab_oauth.sqlite';

const NEWTAB_GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
