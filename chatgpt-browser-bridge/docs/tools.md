# Tool Reference

## Common request fields

Большинство локальных команд используют общий envelope:

```json
{
  "version": 1,
  "id": "unique-request-id",
  "tool": "tool.name"
}
```

`id` используется как `request_id` в результате и должен быть уникальным для отдельного запуска.

Для относительных путей обычно указывается:

```json
{
  "workspace": "Bridge",
  "path": "bridge-host\\Program.cs"
}
```

## bridge.describe

Возвращает версию Native Host, capabilities, найденные внешние инструменты и workspace.

```json
{
  "version": 1,
  "id": "describe",
  "tool": "bridge.describe"
}
```

## workspace.list

Возвращает зарегистрированные рабочие пространства.

```json
{
  "version": 1,
  "id": "workspace-list",
  "tool": "workspace.list"
}
```

## workspace.add

Добавляет workspace. Операция требует подтверждения.

Основные поля:

- `name` — уникальное имя;
- `path` — абсолютный путь.

## workspace.remove

Удаляет регистрацию workspace, но не удаляет каталог с диска.

## workspace.tree

Строит дерево файлов.

Пример:

```json
{
  "version": 1,
  "id": "tree",
  "tool": "workspace.tree",
  "workspace": "Bridge",
  "path": ".",
  "max_depth": 4,
  "limit": 1000
}
```

## workspace.find

Ищет текст или имена файлов внутри workspace. Конкретные дополнительные параметры зависят от текущей реализации `WorkspaceStore`.

## file.read

Читает UTF-8 файл и возвращает его SHA-256.

```json
{
  "version": 1,
  "id": "read-program",
  "tool": "file.read",
  "workspace": "Bridge",
  "path": "bridge-host\\Program.cs",
  "max_chars": 200000
}
```

Результат:

```json
{
  "path": "...",
  "sha256": "...",
  "content": "...",
  "truncated": false
}
```

## file.read.batch

Читает несколько явно перечисленных файлов за один запрос.

```json
{
  "version": 1,
  "id": "read-core-files",
  "tool": "file.read.batch",
  "workspace": "Bridge",
  "continue_on_error": true,
  "max_chars": 200000,
  "max_total_chars": 1000000,
  "files": [
    { "path": "bridge-host\\Program.cs" },
    {
      "path": "bridge-host\\OperationHistory.cs",
      "max_chars": 300000
    },
    { "path": "README.md" }
  ]
}
```

Ограничения:

- не более 100 файлов;
- не более 500 000 символов одного файла;
- не более 1 500 000 символов суммарно;
- повторяющиеся разрешённые пути отклоняются.

Сводка содержит `requested_count`, `read_count`, `error_count`,
`truncated_count`, `returned_chars`, `total_limit_reached` и массив `files`.

При `continue_on_error: false` первая ошибка завершает команду. При `true`
ошибка записывается в элемент результата, а чтение продолжается.

## file.read.batch.tree

Находит файлы внутри каталога workspace и передаёт найденный список в
`file.read.batch`.

```json
{
  "version": 1,
  "id": "read-all-host-sources",
  "tool": "file.read.batch.tree",
  "workspace": "Bridge",
  "path": "bridge-host",
  "pattern": "*.cs",
  "recursive": true,
  "extensions": [".cs"],
  "exclude": ["*Generated*", "*AssemblyInfo.cs"],
  "max_files": 100,
  "max_chars_per_file": 200000,
  "max_total_chars": 1500000,
  "continue_on_error": true
}
```

Параметры:

- `path` — начальный каталог, по умолчанию `.`;
- `pattern` — простой шаблон имени файла, по умолчанию `*`;
- `recursive` — обход вложенных каталогов, по умолчанию `true`;
- `extensions` — необязательный белый список расширений;
- `exclude` — шаблоны исключения имени или относительного пути;
- `max_files` — максимум 100 найденных файлов;
- `max_chars_per_file` — индивидуальный лимит найденных файлов.

Автоматически пропускаются `.git`, `.idea`, `.vs`, `.vscode`, `bin`, `obj`,
`node_modules`, `packages` и резервные копии Bridge.

Результат дополнительно содержит `root`, `pattern`, `recursive`,
`discovered_count` и `max_files`.

## file.write

Создаёт или полностью заменяет файл.

```json
{
  "version": 1,
  "id": "write-doc",
  "tool": "file.write",
  "workspace": "Bridge",
  "path": "docs\\example.md",
  "expected_sha256": "optional-current-hash",
  "content": "# Example\n"
}
```

Поведение:

- показывает подтверждение;
- проверяет `expected_sha256`, если файл существует;
- создаёт backup существующего файла;
- пишет через временный файл;
- фиксирует операцию в истории.

## file.patch

Применяет unified diff к одному файлу.

```json
{
  "version": 1,
  "id": "patch-readme",
  "tool": "file.patch",
  "workspace": "Bridge",
  "path": "README.md",
  "expected_sha256": "...",
  "patch": "--- a/README.md\n+++ b/README.md\n@@ ..."
}
```

До записи показывается окно предпросмотра.

## file.patch.batch

Применяет несколько патчей после одного общего предпросмотра.

```json
{
  "version": 1,
  "id": "batch-update",
  "tool": "file.patch.batch",
  "workspace": "Bridge",
  "files": [
    {
      "path": "README.md",
      "expected_sha256": "...",
      "patch": "..."
    },
    {
      "path": "docs\\tools.md",
      "expected_sha256": "...",
      "patch": "..."
    }
  ]
}
```

Ограничение текущей реализации: не более 100 файлов.

## workspace.transaction

Применяет несколько патчей и необязательно запускает проверочную команду.

```json
{
  "version": 1,
  "id": "transaction-build",
  "tool": "workspace.transaction",
  "workspace": "Bridge",
  "files": [
    {
      "path": "bridge-host\\Program.cs",
      "expected_sha256": "...",
      "patch": "..."
    }
  ],
  "verify": {
    "executable": "dotnet",
    "args": [
      "build",
      "bridge-host\\BridgeHost.csproj",
      "-c",
      "Release",
      "--nologo"
    ],
    "cwd": ".",
    "timeout_seconds": 180
  }
}
```

При ненулевом exit code все уже изменённые файлы восстанавливаются.

## file.exists

Проверяет, существует ли файл или каталог.

```json
{
  "version": 1,
  "id": "exists",
  "tool": "file.exists",
  "workspace": "Bridge",
  "path": "README.md"
}
```

## file.list

Возвращает содержимое каталога.

```json
{
  "version": 1,
  "id": "list-docs",
  "tool": "file.list",
  "workspace": "Bridge",
  "path": "docs",
  "limit": 200
}
```

## directory.create

Создаёт каталог после подтверждения.

## history.list

Возвращает последние записи истории.

```json
{
  "version": 1,
  "id": "history",
  "tool": "history.list",
  "limit": 50,
  "tool_filter": "workspace.transaction",
  "path_filter": "Program.cs"
}
```

Фильтры необязательны.

## history.rollback

Откатывает одну файловую операцию по `history_id`.

```json
{
  "version": 1,
  "id": "rollback-file",
  "tool": "history.rollback",
  "history_id": "..."
}
```

Перед восстановлением сохраняется текущая версия файла.

## history.rollback.transaction

Откатывает все файлы зафиксированной транзакции.

```json
{
  "version": 1,
  "id": "rollback-transaction",
  "tool": "history.rollback.transaction",
  "transaction_id": "..."
}
```

Повторный откат блокируется, пока предыдущий rollback не был возвращён.

## history.rollback.transaction.undo

Возвращает состояние файлов до ручного transaction rollback.

```json
{
  "version": 1,
  "id": "undo-rollback",
  "tool": "history.rollback.transaction.undo",
  "rollback_id": "..."
}
```

Повторный undo того же rollback блокируется.

## everything.search

Ищет файлы через Everything CLI.

Команда требует установленный и доступный `es.exe`.

## process.run

Запускает локальную программу после подтверждения.

```json
{
  "version": 1,
  "id": "build",
  "tool": "process.run",
  "executable": "dotnet",
  "args": [
    "build",
    "bridge-host\\BridgeHost.csproj",
    "-c",
    "Release"
  ],
  "workspace": "Bridge",
  "cwd": ".",
  "timeout_seconds": 180
}
```

Аргументы передаются через `ProcessStartInfo.ArgumentList`, а не через shell-команду.

## Browser-side tools

Эти команды обрабатываются расширением, а не Native Host:

- `google.search`;
- `google.results.current`;
- `avito.search`;
- `avito.results.current`;
- `page.extract.current`;
- `page.extract.selection`.

Содержимое веб-страниц необходимо считать недоверенными данными.

## Error handling

Типичные ошибки:

- неизвестный инструмент;
- отсутствующее обязательное поле;
- путь не входит в workspace;
- файл не найден;
- SHA-256 не совпал;
- контекст unified diff не найден;
- операция отменена пользователем;
- process timeout;
- verification failed and transaction rolled back.

## Planned tools

Следующие названия пока не являются частью стабильного протокола:

- `file.read.batch`;
- `dashboard.open`;
- `dashboard.status`;
- `todo.create`;
- `todo.list`;
- `todo.update`;
- `todo.complete`.
