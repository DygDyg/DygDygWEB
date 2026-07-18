# DygDygWEB

Личный GitHub Pages-архив с разными веб-экспериментами, утилитами, userscripts,
игровыми прототипами, медиа и старыми заготовками.

Сайт: https://dygdyg.github.io/DygDygWEB

## Что это

Это не монолитное приложение. Репозиторий больше похож на публичную папку с
личными проектами:

- корневые `.htm/.html` файлы - отдельные статические страницы и тесты;
- `scripts/` - общие JS/CSS-библиотеки, которые могут использоваться разными страницами;
- `bg/`, `bg2/`, `TrackAnime/bg/` - наборы фоновых изображений;
- `user.js/` - Tampermonkey/Greasemonkey userscripts и связанные файлы;
- `TrackAnime/`, `anime_get/`, `Discord-RPC/` - эксперименты вокруг аниме-трекинга;
- `PoE/` - инструменты и данные для Path of Exile;
- `unity/`, `LoadBundle/`, `vulpera/` - Unity/WebGL-сборки и прототипы;
- `chatgpt-browser-bridge/` - отдельный более оформленный C#/.NET + Chrome extension проект;
- `GoogleSheets/`, `node.js/hello-world-apps-master/` - Node.js эксперименты;
- `MySoft/`, `CurseForge/`, `NyGameSandbox/` и другие папки - локальные утилиты,
  бинарники, архивы и старые сборки.

Более подробная карта лежит в [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md).

## Как запускать

Для большинства страниц достаточно открыть файл через GitHub Pages:

```text
https://dygdyg.github.io/DygDygWEB/<path>
```

Примеры:

- `index.htm` - главная CRT-страница;
- `TrackAnime/index.htm` - один из входов TrackAnime;
- `user.js/index.htm` - страница со userscripts;
- `hls-master/index.html` - HLS/video.js тесты;
- `openspeedtest/index.html` - локальная копия OpenSpeedTest;
- `vulpera/index.html` - Unity WebGL сборка.

Некоторые папки требуют локального окружения:

- `anime_get/` - Node.js + `axios`, GitHub Actions workflow запускает `node script.js`;
- `GoogleSheets/` - Node.js/http-server эксперимент;
- `chatgpt-browser-bridge/` - отдельный .NET 8/Chrome Native Messaging проект.

## Правила для будущих правок

- Считать репозиторий статическим GitHub Pages-сайтом, пока не доказано обратное.
- Не переименовывать файлы и папки без проверки ссылок: многие страницы могут ссылаться
  друг на друга строковыми путями.
- Не чистить бинарники, архивы, медиа и старые сборки "для красоты": это личный архив.
- Перед изменением общей библиотеки в `scripts/` искать все её использования через `rg`.
- Не добавлять новые секреты, токены и приватные client secret файлы.
- Для навигации будущему Codex сначала читать `AGENTS.md` и `docs/PROJECT_MAP.md`.
