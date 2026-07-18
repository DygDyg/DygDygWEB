# Карта проекта

Эта карта нужна, чтобы быстро ориентироваться в DygDygWEB. Репозиторий живёт как
личный GitHub Pages-архив: часть файлов публично открывается как статические
страницы, часть лежит как история, ассеты, сборки или локальные утилиты.

## Публичная поверхность

- `README.md` - краткое описание и ссылка на Pages.
- `index.htm` - текущая главная страница, CRT-оболочка с iframe.
- `404.html` - кастомная страница ошибки.
- Корневые `.htm/.html` файлы - отдельные демо, тесты и утилиты.
- `scripts/` - общие vendored-библиотеки: jQuery, Bootstrap, video.js, hls.js,
  QRCode, JSZip, JSONEditor, moment и другие.
- `BlackStyle.css`, `StarrySky.js`, `fav.png`, `favicon.ico` - общие или повторно
  используемые стили/ассеты.

## Основные папки

| Путь | Что лежит |
| --- | --- |
| `3D_paralax/` | Небольшой HTML/CSS эксперимент с 3D/parallax. |
| `ai_optimizer/` | Небольшая отдельная заготовка/эксперимент. |
| `anime_get/` | Node.js скрипт с `axios`; используется GitHub Actions workflow. |
| `ascii_test/`, `ascii.live/`, `BadApple/`, `Phao/` | ASCII/анимационные и аудио-визуальные эксперименты. |
| `astronear/` | Статическая страница/калькулятор с локальными стилями и JS. |
| `bg/`, `bg2/` | Коллекции фоновых изображений; `bg2/covert.py` похож на локальный helper. |
| `CartTest/` | Мини-приложение из `index.htm`, `script.js`, `style.css`. |
| `chatgpt-browser-bridge/` | Самостоятельный проект: C#/.NET 8 host, Chrome extension, installer, docs. |
| `ChromePlugins/` | Chrome extension заготовки и старые версии. |
| `CurseForge/` | Патчер/фикс CurseForge с бинарниками и bat-скриптами. |
| `Discord-RPC/` | Локальный Discord RPC сервер/скрипты для TrackAnime. |
| `GoogleSheets/` | Node.js/http-server эксперимент; внутри есть `node_modules/`. |
| `hls-master/` | HLS/video.js тестовые страницы и локальные JS-библиотеки. |
| `html2canvas/` | Тест html2canvas. |
| `kino/` | Небольшая статическая страница с `README.md`. |
| `LoadBundle/`, `unity/`, `vulpera/` | Unity/WebGL сборки и прототипы. |
| `MySandboxGamePrototype/`, `NyGameSandbox/` | Игровые прототипы, концепты, сборки и конфиги. |
| `MySoft/` | Личные утилиты: ftp, ip info, Imgur upload, yt-dlp/ffmpeg wrapper и т.п. |
| `NewTab/`, `NewTab2.0/`, `StartHome/` | Стартовые страницы/new tab эксперименты. |
| `openspeedtest/` | Локальная копия OpenSpeedTest. |
| `PoE/` | Path of Exile инструменты, trade/cache данные, AutoRoll scripts/binaries. |
| `rust_plus_plus/` | Статический Rust+ эксперимент/страница. |
| `SpaceStation13/` | SS13 цветовые/JSColor тесты. |
| `System128/` | CRT/retro assets: звуки, курсоры, шрифты, страницы. |
| `TrackAnime/` | Крупная зона anime tracking/player/shikimori/kodik экспериментов и данных. |
| `user.js/` | Userscripts, Tampermonkey helpers, локальная страница-индекс. |
| `webhook/` | Минимальная webhook HTML-страница. |
| `winamp/` | Web Winamp experiment с playlist и mp3. |
| `wow/` | World of Warcraft related page/addon snippet. |

## Точки входа

Папки, где найден `index.htm` или `index.html`:

- `3D_paralax/`
- `ascii_test/`
- `BadApple/`
- `CartTest/`
- `CurseForge/`
- `GoogleSheets/`
- `hls-master/`
- `html2canvas/`
- `kino/`
- `LoadBundle/`
- `NewTab/`
- `NewTab2.0/`
- `openspeedtest/`
- `Phao/`
- `PoE/`
- `rust_plus_plus/`
- `SpaceStation13/`
- `StartHome/`
- `TrackAnime/`
- `unity/`
- `user.js/`
- `vulpera/`
- `webhook/`
- `winamp/`
- `wow/`

## Автоматизация

`.github/workflows/run-js-script.yml` запускается вручную через `workflow_dispatch`.
Он:

1. ставит Node.js 14;
2. делает `npm install` в `anime_get/`;
3. восстанавливает cache для `anime_get/id.txt`;
4. запускает `node script.js`;
5. сохраняет cache обратно.

## Локальные технологии

- Статика: HTML/CSS/JS, часто без сборки.
- Vendored browser libs: `scripts/`, `hls-master/js/`, локальные копии библиотек.
- Node.js: `anime_get/`, `GoogleSheets/`, `node.js/hello-world-apps-master/`.
- C#/.NET: `chatgpt-browser-bridge/`.
- Chrome extensions/userscripts: `ChromePlugins/`, `user.js/`, `Discord-RPC/`.
- AutoHotkey: `PoE/AutoRoll/`.
- Python helpers: корневой `gen.py`, `unity/gen.py`, `MySoft/*/*.py`, `bg2/covert.py`.
- Unity WebGL: `unity/`, `LoadBundle/`, `vulpera/`.

## Что не считать мусором автоматически

- Архивы и `.exe`: многие папки хранят готовые личные сборки.
- Большие `.gif`, `.mp4`, `.webm`, `.jpg`, `.png`: это ассеты публичных страниц или
  история экспериментов.
- `node_modules/`: уже закоммичены в некоторых подпроектах.
- `.htm`: исторически основной формат страниц в этом репозитории.

## Риски

- В репозитории есть бинарники и архивы, поэтому любые массовые операции должны быть
  предельно точечными.
- Есть файлы, похожие на локальные OAuth/client secret артефакты. Не добавлять новые
  секреты и не переносить значения в документацию.
- Много относительных ссылок. Перед переездом файла искать его имя через `rg`.
- Unity/WebGL build-файлы лучше пересобирать из исходного проекта, а не редактировать
  вручную.

## Рекомендуемый порядок исследования

1. `git status --short`
2. `rg --files -g '!**/node_modules/**'`
3. Для нужной зоны: локальный `README.md` / `PROJECT.md` / `package.json`.
4. Поиск ссылок на изменяемый файл: `rg "filename-or-path"`.
5. Минимальная проверка через GitHub Pages-style относительные пути или локальный сервер,
   если страница использует fetch/module/CORS-sensitive поведение.
