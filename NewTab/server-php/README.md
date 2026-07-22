# NewTab PHP token server

Минимальная серверная прослойка для Google Drive OAuth.

Она не хранит настройки NewTab и не проксирует файлы Drive. Сервер хранит только
Google `refresh_token` в SQLite и выдает странице короткоживущий `access_token`.

## Куда копировать

Содержимое этой папки можно положить в:

```text
https://server.dygdyg.ru/newtab/
```

Структура на сервере:

```text
/www/
  html/
    newtab/
      api/
      auth/
      lib/
      config.php
      config.example.php
      index.php
```

По умолчанию база создается на два шага выше папки сайта:

```text
/www/newtab_oauth.sqlite
```

Путь можно поменять в `config.local.php`.

## Настройка

1. В Google Cloud создай OAuth Client типа `Web application`.
2. В `Authorized redirect URIs` добавь:

```text
https://server.dygdyg.ru/newtab/auth/callback.php
```

3. Скопируй `config.example.php` в `config.local.php`.
4. Заполни:

```php
NEWTAB_GOOGLE_CLIENT_ID
NEWTAB_GOOGLE_CLIENT_SECRET
NEWTAB_SERVER_SECRET
```

`NEWTAB_SERVER_SECRET` должен быть длинной случайной строкой. Он нужен для
шифрования refresh token в SQLite.

## API

### Вход

Открыть в браузере:

```text
https://server.dygdyg.ru/newtab/auth/start.php?return_to=https%3A%2F%2Fdygdyg.github.io%2FDygDygWEB%2FNewTab%2Findex.htm
```

После входа сервер вернет пользователя на `return_to` с fragment:

```text
#newtab_auth=...&newtab_auth_status=ok
```

Этот `newtab_auth` нужно сохранить в `localStorage` на стороне NewTab и передавать
в API через заголовок:

```text
Authorization: Bearer <newtab_auth>
```

### Получить свежий Google Drive access token

```http
GET /newtab/api/token.php
Authorization: Bearer <newtab_auth>
```

Если хостинг плохо пропускает CORS preflight `OPTIONS`, можно использовать
simple request без custom headers:

```http
POST /newtab/api/token.php
Content-Type: text/plain

<newtab_auth>
```

Ответ:

```json
{
  "ok": true,
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/drive.appdata"
}
```

### Проверить сессию

```http
GET /newtab/api/status.php
Authorization: Bearer <newtab_auth>
```

### Выйти

```http
POST /newtab/api/logout.php
Authorization: Bearer <newtab_auth>
```

## CORS

Разрешенные origins задаются в `NEWTAB_ALLOWED_ORIGINS`.
По умолчанию для API включен `NEWTAB_CORS_ALLOW_ALL = true`, потому что API
авторизуется bearer-токеном, а не cookies. Это снимает зависимость от точного
origin GitHub Pages, localhost или будущего домена.

Если nginx отвечает на preflight сам или перебивает PHP-заголовки, используй
готовый пример `nginx-newtab.conf`. Его блок `location ^~ /newtab/api/` нужно
поставить внутри HTTPS `server { ... }` для `server.dygdyg.ru` выше общего
`location ~ \.php$`.

Если `token.php` отвечает `200 OK`, но Chrome всё равно показывает CORS, проверь
дублирование `Access-Control-Allow-Origin`. Нельзя, чтобы этот заголовок приходил
два раза. В таком случае убери CORS `add_header` из nginx и используй
`nginx-minimal.conf`: CORS-заголовки отдаст сам PHP.

Для диагностики можно открыть:

```text
https://server.dygdyg.ru/newtab/api/cors-debug.php
```

А из консоли NewTab проверить:

```js
fetch('https://server.dygdyg.ru/newtab/api/cors-debug.php').then(r => r.json()).then(console.log)
```

По умолчанию:

```text
https://dygdyg.github.io
http://127.0.0.1:5500
http://127.0.0.1:5501
```

## Важно

- На сервере должен быть HTTPS.
- OAuth consent screen лучше перевести в Production, иначе refresh token у External
  app в Testing может истекать через 7 дней.
- Scope используется минимальный: `https://www.googleapis.com/auth/drive.appdata`.
- `client_secret`, `config.local.php` и SQLite-базу не добавлять в Git.
