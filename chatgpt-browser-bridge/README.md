# ChatGPT Browser Bridge

ChatGPT Browser Bridge — локальный мост между ChatGPT, браузером и Windows. Расширение распознаёт структурированные команды в ответах ChatGPT, передаёт их Native Messaging Host и возвращает результат обратно в чат.

Текущая версия Native Host: **0.18.1**.  
Текущая версия Chrome Extension: **0.7.0**.

> Проект находится в активной разработке. Перед публикацией репозитория рекомендуется проверить политику лицензирования, очистить тестовые backup-файлы и исключить локальные артефакты через `.gitignore`.

## Возможности

- регистрация нескольких рабочих пространств;
- просмотр дерева проекта и поиск по файлам;
- чтение, запись и точечное изменение файлов;
- пакетное чтение явно перечисленных файлов;
- рекурсивное чтение дерева по шаблону и расширениям;
- проверка SHA-256 перед изменением;
- пакетное применение нескольких патчей;
- цветной предпросмотр `Diff / До / После`;
- тёмная тема окна предпросмотра;
- сохраняемое автоподтверждение с обратным отсчётом;
- транзакции с проверочной командой;
- автоматический откат при неуспешной проверке;
- история операций;
- ручной откат транзакции и возврат отката;
- запуск локальных процессов после подтверждения;
- поиск через Everything CLI (`es.exe`);
- Google- и Avito-интеграция на стороне расширения.

## Архитектура

```text
ChatGPT
   │
   │  chatgpt-tool / chatgpt-result
   ▼
Chrome Extension (Manifest V3)
   │
   │  Chrome Native Messaging
   ▼
BridgeHost (.NET 8 / WinForms)
   ├── Dispatcher
   ├── WorkspaceStore
   ├── File tools
   ├── BatchPatchTool
   ├── WorkspaceTransactionTool
   ├── OperationHistory
   ├── ProcessRunner
   └── Preview dialogs
          │
          ▼
   Windows filesystem and local processes
```

Подробное описание: [`docs/architecture.md`](docs/architecture.md).

## Структура репозитория

```text
bridge-host/   Native Messaging Host на C#/.NET 8
extension/     Chrome Extension Manifest V3
installer/     сборка, установка и удаление Native Host
protocol/      примеры JSON-команд
scripts/       служебные сценарии разработки и обслуживания
test/          тестовые данные и миграционные сценарии
docs/          документация проекта
```

## Требования

- Windows x64;
- Google Chrome или Chromium-совместимый браузер;
- .NET 8 SDK для сборки;
- Everything CLI `es.exe` — только для `everything.search`.

`BridgeHost` ищет `es.exe` рядом с исполняемым файлом и затем в системном `PATH`.

## Установка для разработки

1. Клонируйте или распакуйте репозиторий.
2. Откройте `chrome://extensions/`.
3. Включите режим разработчика.
4. Загрузите распакованное расширение из каталога `extension/`.
5. Запустите `installer/install.bat`.
6. Полностью перезапустите Chrome.
7. Нажмите кнопку Bridge в интерфейсе ChatGPT и вставьте инструкцию подключения.

Фиксированный ключ в `extension/manifest.json` сохраняет постоянный ID расширения:

```text
nookckfjmffkgdbjoiafiponhdmalkdn
```

## Обновление

После изменения Native Host:

```text
1. Полностью закрыть Chrome.
2. Запустить installer/install.bat.
3. Снова открыть Chrome.
```

После изменения файлов в `extension/`:

```text
1. Открыть chrome://extensions/.
2. Нажать «Обновить» или «Перезагрузить» у расширения.
3. Перезагрузить вкладку ChatGPT.
```

## Поддерживаемые локальные инструменты

### Bridge и workspace

- `bridge.describe`
- `workspace.list`
- `workspace.add`
- `workspace.remove`
- `workspace.tree`
- `workspace.find`
- `workspace.transaction`

### Файлы

- `file.read`
- `file.read.batch`
- `file.read.batch.tree`
- `file.write`
- `file.patch`
- `file.patch.batch`
- `file.exists`
- `file.list`
- `directory.create`

### История

- `history.list`
- `history.rollback`
- `history.rollback.transaction`
- `history.rollback.transaction.undo`

### Поиск и процессы

- `everything.search`
- `process.run`

Полный справочник команд: [`docs/tools.md`](docs/tools.md).

## Безопасность

Проект построен вокруг принципа явного контроля пользователя:

- операции записи требуют подтверждения;
- патчи проверяют SHA-256 исходного файла;
- перед изменением создаются резервные копии;
- пакетные операции предварительно валидируются;
- транзакции могут запускать проверочную команду;
- неуспешная проверка инициирует автоматический откат;
- опасные shell-обёртки не являются частью основного протокола.

Native Host получает доступ только к зарегистрированным workspace либо к явно разрешённым абсолютным путям согласно текущей реализации.

## Транзакции

`workspace.transaction` объединяет несколько файловых патчей и необязательную проверочную команду:

```json
{
  "version": 1,
  "id": "update-feature",
  "tool": "workspace.transaction",
  "workspace": "Bridge",
  "files": [
    {
      "path": "bridge-host\\Program.cs",
      "expected_sha256": "...",
      "patch": "--- a/Program.cs\n+++ b/Program.cs\n..."
    }
  ],
  "verify": {
    "executable": "dotnet",
    "args": ["build", "bridge-host\\BridgeHost.csproj", "-c", "Release"],
    "cwd": ".",
    "timeout_seconds": 180
  }
}
```

При ненулевом коде проверки изменённые файлы автоматически восстанавливаются. Подробнее: [`docs/transactions.md`](docs/transactions.md).

## Документация

- [`PROJECT.md`](PROJECT.md) — машинно-читаемый контекст проекта;
- [`ROADMAP.md`](ROADMAP.md) — план развития;
- [`CHANGELOG.md`](CHANGELOG.md) — история версий;
- [`docs/architecture.md`](docs/architecture.md) — архитектура;
- [`docs/tools.md`](docs/tools.md) — справочник инструментов;
- [`docs/transactions.md`](docs/transactions.md) — транзакции и откаты;
- [`docs/dashboard.md`](docs/dashboard.md) — проект будущего Dashboard.

## Ближайшие планы

Линия релизов **0.18.x** сфокусирована на удобстве разработки:

- отдельный Dashboard для второго монитора;
- статус ответа ChatGPT и уведомления;
- пакетное чтение файлов — реализовано;
- рекурсивный поиск и чтение файлов по шаблону — реализовано;
- встроенный TODO и декомпозиция задач;
- систематизация GitHub-документации;
- очистка и управление резервными копиями.

См. [`ROADMAP.md`](ROADMAP.md).

## Лицензия

Лицензия пока не выбрана. До добавления файла `LICENSE` код не следует считать открытым для свободного использования или распространения.
