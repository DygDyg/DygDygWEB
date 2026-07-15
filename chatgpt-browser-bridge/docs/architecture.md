# Architecture

## Overview

ChatGPT Browser Bridge состоит из двух основных компонентов:

1. Chrome Extension, работающего внутри браузера и интерфейса ChatGPT.
2. Native Messaging Host, выполняющего локальные операции Windows.
3. Отдельного Dashboard-процесса, отображающего состояние Bridge.

```text
ChatGPT page
    │
    │ structured code block
    ▼
chatgpt-content.js
    │
    │ chrome.runtime.sendMessage
    ▼
background.js
    │
    │ Chrome Native Messaging
    ▼
BridgeHost.exe
    │
    ▼
Dispatcher → tool implementation

BridgeHost.exe
    │ dashboard-state.json
    ▼
BridgeDashboard.exe
```

## Chrome Extension

Каталог: `extension/`.

### Responsibilities

- обнаружение блоков `chatgpt-tool` в ответах ассистента;
- создание кнопок выполнения рядом с командами;
- передача локальных команд background service worker;
- вставка `chatgpt-result` обратно в поле ввода;
- отображение состояния последней операции в toolbar;
- интеграции с Google и Avito;
- установка обновлений из ZIP;
- управление жизненным циклом интерфейса на странице ChatGPT.

### Main files

- `manifest.json` — Manifest V3, permissions и content scripts;
- `background.js` — Native Messaging, браузерные команды и установка обновлений;
- `chatgpt-content.js` — DOM-интеграция ChatGPT и кнопки инструментов;
- `chatgpt-content.css` — стили элементов Bridge;
- `popup.*` — интерфейс popup расширения.

## Native Host

Каталог: `bridge-host/`.

Native Host — self-contained приложение .NET 8 для `win-x64`. Оно обслуживает
Chrome Native Messaging, выполняет локальные инструменты и записывает состояние
для отдельного Dashboard-процесса.

### Startup

`Program.cs`:

1. читает сообщения Native Messaging из stdin;
2. передаёт JSON-запрос в `Dispatcher.HandleAsync`;
3. сериализует результат в stdout;
4. преобразует исключения в `Result.Error`.

### Dispatcher

Dispatcher сопоставляет поле `tool` с реализацией:

```text
bridge.describe
workspace.*
file.*
history.*
everything.search
process.run
dashboard.open
dashboard.status
```

Неизвестный инструмент возвращает структурированную ошибку.

## Infrastructure

### Native Messaging

Chrome Native Messaging использует бинарный префикс длины сообщения и UTF-8 JSON. Реализация чтения и записи находится в инфраструктурных классах Native Host.

### Result envelope

Успешный ответ:

```json
{
  "version": 1,
  "request_id": "example",
  "tool": "file.read",
  "status": "ok",
  "captured_at": "...",
  "data": {}
}
```

Ошибка:

```json
{
  "version": 1,
  "request_id": "example",
  "tool": "file.read",
  "status": "error",
  "captured_at": "...",
  "error": "Описание ошибки"
}
```

## Workspace subsystem

Основная задача workspace — ограничить и упростить работу с относительными путями.

Подсистема предоставляет:

- список зарегистрированных workspace;
- добавление и удаление workspace;
- разрешение относительных путей;
- построение дерева;
- поиск по проекту.

Команды могут принимать имя workspace и относительный путь:

```json
{
  "workspace": "Bridge",
  "path": "bridge-host\\Program.cs"
}
```

## File mutation model

### Single file

`file.write` и `file.patch` используют следующую модель:

1. разрешение пути;
2. подтверждение пользователя;
3. проверка `expected_sha256`;
4. создание backup;
5. запись через временный файл;
6. расчёт нового SHA-256;
7. запись в историю.

### Batch patch

`file.patch.batch`:

1. проверяет весь список файлов;
2. отклоняет дубликаты;
3. проверяет все SHA-256;
4. строит все итоговые версии в памяти;
5. показывает единый предпросмотр;
6. применяет изменения;
7. восстанавливает уже записанные файлы при ошибке;
8. записывает batch history.

### Transaction

`workspace.transaction` расширяет пакетный патч:

- поддерживает необязательную проверочную команду;
- фиксирует commit только после успешного verify;
- при ненулевом exit code автоматически восстанавливает файлы;
- сохраняет stdout, stderr, duration и exit code;
- интегрирован с transaction history.

## Preview UI

WinForms-диалоги:

- `PatchPreviewDialog` — один файл;
- `BatchPatchPreviewDialog` — несколько файлов;
- `BridgeTheme` — общая тёмная палитра;
- `PreviewAutoConfirmSettings` — сохранение автоподтверждения.

Диалоги показывают:

- статистику diff;
- вкладки `Diff`, `До`, `После`;
- построчную подсветку;
- предупреждения для крупных изменений;
- задержку перед активацией кнопки;
- необязательный таймер автоприменения.

## History model

История хранится в JSON Lines:

```text
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\history.jsonl
```

Каждая строка — независимая JSON-запись. Повреждённые строки пропускаются без отказа чтения всей истории.

Поддерживаются:

- изменение одного файла;
- пакетные изменения;
- transaction commit;
- automatic rollback;
- manual transaction rollback;
- undo manual rollback.

## Process execution

`process.run` запускает исполняемый файл через `ProcessStartInfo.ArgumentList`, без формирования shell-строки. Перед запуском показывается подтверждение.

`workspace.transaction` выполняет verify без отдельного второго подтверждения, поскольку команда является частью уже подтверждённой транзакции и отображается в её спецификации.

## Everything integration

`everything.search` использует `es.exe`.

Поиск исполняемого файла:

1. рядом с `BridgeHost.exe`;
2. через системный `PATH`.

## State and persistence

Используются следующие локальные данные:

```text
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\history.jsonl
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\settings.json
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\dashboard-state.json
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\dashboard.json
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\workspaces.json
```

Также рядом с изменяемыми файлами создаются `.cbb-*` backup-файлы.

## Dashboard

Dashboard реализован как отдельное WinForms-приложение из каталога
`dashboard-host/`. При установке оно публикуется рядом с `BridgeHost.exe` под
именем `BridgeDashboard.exe`.

Команда `dashboard.open`:

1. проверяет наличие уже запущенного процесса;
2. запускает `BridgeDashboard.exe`, если процесс отсутствует;
3. возвращает PID, путь к executable и путь к state-файлу.

Команда `dashboard.status` возвращает состояние процесса Dashboard и последний
снимок Native Host.

Обмен состоянием выполняется через атомарно обновляемый файл:

```text
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\dashboard-state.json
```

Dashboard периодически читает этот файл, историю операций и список workspace.
Он живёт независимо от короткого жизненного цикла отдельного Native Messaging
запроса.

## Trust boundaries

### Untrusted input

Следует считать недоверенными:

- JSON-команды из DOM страницы;
- текст поисковой выдачи;
- содержимое веб-страниц;
- пути и аргументы команды до проверки.

### Trusted enforcement points

Native Host обязан обеспечивать:

- разрешение путей;
- workspace restrictions;
- SHA-256 validation;
- пользовательское подтверждение;
- лимиты размеров и числа файлов;
- отказ от неявного shell execution;
- создание backup до mutation.

## Planned architecture additions

### TODO subsystem

Задачи следует хранить отдельно от operation history, но связывать через `workspace`, `task_id`, `transaction_id` и timestamps.

### Assistant lifecycle integration

Следующий этап — передача browser-side событий генерации ответа в Native Host и
Dashboard с дедупликацией уведомлений.

### Event channel

Для Dashboard и уведомлений понадобится единая модель событий:

```text
assistant_started
assistant_finished
tool_pending
tool_started
tool_finished
tool_failed
confirmation_required
transaction_committed
transaction_rolled_back
```
