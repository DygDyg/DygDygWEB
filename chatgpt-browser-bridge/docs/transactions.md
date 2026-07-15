# Transactions and Rollback

## Purpose

`workspace.transaction` объединяет связанные файловые изменения в одну подтверждаемую операцию и позволяет проверить результат командой сборки или тестирования.

Основная гарантия:

> Если verify завершается с ненулевым кодом, Bridge пытается восстановить все изменённые файлы из резервных копий.

## Lifecycle

```text
Parse request
    ↓
Resolve and validate every path
    ↓
Check every expected SHA-256
    ↓
Apply every unified diff in memory
    ↓
Show combined preview
    ↓
Create backups and write files
    ↓
Run optional verification
    ├── exit 0 → commit and history
    └── non-zero → automatic rollback
```

## Validation phase

До показа подтверждения Bridge:

- проверяет наличие `files`;
- ограничивает число файлов;
- отклоняет дублирующиеся пути;
- проверяет существование файлов;
- проверяет `expected_sha256`;
- применяет каждый diff в памяти;
- прекращает операцию до mutation при любой ошибке.

## Preview phase

Используется общий пакетный диалог:

- список файлов;
- вкладки `Diff`, `До`, `После`;
- статистика изменений;
- цветная подсветка;
- тёмная тема;
- автоподтверждение, если включено пользователем.

## Write phase

Для каждого файла:

1. создаётся backup с `transaction_id`;
2. итоговый текст записывается во временный файл;
3. временный файл атомарно перемещается на целевой путь;
4. вычисляется итоговый SHA-256.

Формат backup:

```text
<file>.cbb-transaction-<transaction-id>-<timestamp>.backup
```

## Verification

Объект `verify` содержит:

- `executable`;
- `args`;
- `cwd`;
- `timeout_seconds`.

Пример:

```json
{
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

Результат успешной проверки включает:

- `exit_code`;
- `stdout`;
- `stderr`;
- `duration_ms`;
- `truncated`.

Вывод ограничивается по размеру.

## Automatic rollback

При ненулевом exit code:

1. файлы восстанавливаются в обратном порядке;
2. формируется сводка числа восстановленных файлов;
3. ошибки rollback не скрываются;
4. операция возвращает `status: error`;
5. в историю записывается `transaction_auto_rollback`.

Автоматически откатившаяся транзакция не считается committed.

## Commit history

Успешная транзакция создаёт:

### transaction_file_change

Одна запись на файл:

- `transaction_id`;
- `path`;
- `backup_path`;
- `before_sha256`;
- `after_sha256`.

### transaction_summary

Одна итоговая запись:

- `transaction_id`;
- `file_count`;
- `verification_exit_code`;
- `status: committed`.

## Manual transaction rollback

Инструмент:

```text
history.rollback.transaction
```

Перед началом Bridge:

- находит все `transaction_file_change`;
- проверяет наличие каждого backup;
- показывает единое подтверждение со списком файлов.

При выполнении:

1. текущее состояние каждого файла сохраняется;
2. исходный transaction backup восстанавливается;
3. создаются записи `transaction_rollback_file`;
4. создаётся `transaction_rollback_summary`.

Backup состояния до rollback:

```text
<file>.cbb-before-transaction-rollback-<rollback-id>-<timestamp>
```

## Undo manual rollback

Инструмент:

```text
history.rollback.transaction.undo
```

Он восстанавливает версии, сохранённые непосредственно перед ручным rollback.

Создаются:

- `transaction_rollback_undo_file`;
- `transaction_rollback_undo_summary`.

## State protection

Bridge блокирует:

- повторный ручной rollback уже откатанной транзакции;
- повторный undo одного rollback.

После undo исходную транзакцию снова разрешено откатить.

Поддерживаемая последовательность:

```text
committed
→ rolled back
→ rollback undone
→ rolled back again
```

## Failure during manual rollback

Если ошибка возникает посередине ручного rollback, Bridge пытается вернуть уже обработанные файлы к состоянию до rollback.

Это best-effort механизм: ошибки восстановления не заменяют исходную ошибку, но должны быть диагностируемы.

## History storage

Файл:

```text
%LOCALAPPDATA%\ChatGPTBrowserBridge\NativeHost\history.jsonl
```

Преимущества JSONL:

- простое добавление;
- независимость записей;
- повреждение одной строки не ломает чтение остальных;
- легко анализировать внешними инструментами.

Ограничения:

- нет встроенной индексации;
- файл будет расти;
- пока отсутствует retention policy;
- состояние вычисляется по последовательности событий.

## Backup retention

В текущей версии backups автоматически не очищаются.

До реализации cleanup рекомендуется:

- исключить `.cbb-*` из Git;
- периодически проверять занимаемое место;
- не удалять backup активной транзакции до завершения rollback/undo тестов.

## Recommended verification commands

### .NET

```json
{
  "executable": "dotnet",
  "args": ["build", "project.csproj", "-c", "Release", "--nologo"]
}
```

### Node.js

```json
{
  "executable": "npm",
  "args": ["test"]
}
```

### Python

```json
{
  "executable": "python",
  "args": ["-m", "pytest"]
}
```

Профили verify для workspace запланированы, но пока команда указывается в каждой транзакции.

## Known limitations

- транзакция изменяет только существующие текстовые файлы;
- создание, удаление и перемещение файлов пока не входят в transaction model;
- backup хранится рядом с целевым файлом;
- history не использует базу данных;
- verify запускается один раз;
- нет автоматического цикла diagnose → patch → verify;
- нет встроенной интеграции с Git.
