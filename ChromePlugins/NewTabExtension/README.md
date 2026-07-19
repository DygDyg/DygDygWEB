# DygDyg NewTab Chrome Extension

Минимальное расширение для Chrome:

- заменяет только `chrome://newtab` на локальную копию NewTab из `app/`;
- даёт странице доступ к Google Drive token через `chrome.identity`;
- в версии расширения отправляет весь поиск через `chrome.search`, то есть через
  поисковик, выбранный пользователем в настройках Chrome;
- содержит только нужную локальную копию `NewTab`, без старых `.crx/.zip`,
  скриншотов и лишних ассетов.

## Установка для себя

1. Открой `chrome://extensions/`.
2. Включи `Developer mode`.
3. Нажми `Load unpacked`.
4. Выбери папку `ChromePlugins/NewTabExtension`.
5. Скопируй `ID` загруженного расширения.

## Google OAuth

Для постоянной авторизации нужен OAuth Client ID типа `Chrome extension`.

1. Открой Google Cloud Console в проекте NewTab.
2. Перейди в `APIs & Services` -> `Credentials`.
3. Создай `OAuth client ID`.
4. Тип приложения: `Chrome extension`.
5. В `Item ID` вставь ID расширения из `chrome://extensions/`.
6. Скопируй полученный Client ID.
7. Вставь его в `manifest.json` вместо:

```text
PASTE_CHROME_EXTENSION_OAUTH_CLIENT_ID.apps.googleusercontent.com
```

Scope уже указан:

```text
https://www.googleapis.com/auth/drive.appdata
```

После этого перезагрузи расширение на `chrome://extensions/`.

Если Chrome показывает `bad client id`, проверь OAuth client через иконку карандаша:

- тип клиента должен быть `Chrome extension`;
- `Item ID` должен быть только ID расширения, без `chrome://extensions/?id=`;
- для текущей локальной установки это `nookckfjmffkgdbjoiafiponhdmalkdn`;
- после правки в Google Cloud нужно нажать `Reload` у расширения.

## Как это работает

Страница NewTab лежит внутри расширения в `app/`. Background service worker вызывает
`chrome.identity.getAuthToken()` для Google Drive и `chrome.search.query()` для
обычного web-поиска.

Chrome сам кеширует access token и обновляет его, поэтому после первого входа
автосинхронизация должна работать без постоянного выбора аккаунта.

## Публикация в Chrome Web Store

Прошлое расширение было отклонено из-за `Red Argon`: New Tab Page меняла быстрый
доступ и поиск как несколько смешанных функций. Для этого расширения важно сохранить
узкое описание: `персональная новая вкладка с синхронизацией настроек`.

Не добавляй в манифест:

- `chrome_settings_overrides.homepage`;
- `chrome_settings_overrides.startup_pages`;
- `chrome_settings_overrides.search_provider`.

В extension-версии нельзя показывать выбор Google/Yandex/YouTube/AnimeGO как
поисковых провайдеров: ревью может считать это изменением поисковой системы.
Поэтому `chrome-extension://` режим оставляет только поиск через Chrome Search API.
