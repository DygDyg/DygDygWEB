# Project Manifest

## Identity

- **Name:** ChatGPT Browser Bridge
- **Repository root:** `chatgpt-browser-bridge`
- **Native Host version:** `0.17.2`
- **Chrome Extension version:** `0.7.0`
- **Primary platform:** Windows x64
- **Primary language:** C# / .NET 8
- **Browser component:** Chrome Manifest V3, JavaScript, CSS

## Goal

Создать контролируемый локальный мост между ChatGPT и рабочей станцией пользователя. Bridge должен позволять ИИ читать проект, предлагать изменения, выполнять подтверждённые операции, запускать проверки и безопасно отменять изменения.

## Product direction

Проект развивается от набора локальных инструментов к локальной AI IDE-надстройке:

1. безопасные файловые операции;
2. пакетные изменения и предпросмотр;
3. транзакции, verify и rollback;
4. Dashboard и пакетное чтение;
5. управление задачами и проектным контекстом;
6. автоматизированные инженерные сценарии.

## Architecture

```text
ChatGPT
→ Chrome Extension
→ Native Messaging
→ BridgeHost Dispatcher
→ Tool implementation
→ Workspace / filesystem / processes
```

### Components

- `extension/` — извлечение команд из ChatGPT, кнопки запуска, Google/Avito и toolbar UI;
- `bridge-host/` — диспетчер и реализация локальных инструментов;
- `installer/` — публикация и регистрация Native Messaging Host;
- `protocol/` — примеры команд;
- `docs/` — документация;
- `test/` — тестовые и исторические миграционные сценарии.

## Core principles

1. **Explicit user control.** Опасные операции требуют подтверждения.
2. **Optimistic concurrency.** Изменения проверяют SHA-256 прочитанной версии.
3. **Preview before mutation.** Патчи показываются до применения.
4. **Backups by default.** Перед изменением сохраняется исходная версия.
5. **Atomic intent.** Связанные изменения объединяются в пакет или транзакцию.
6. **Automatic verification.** Транзакция может запускать build/test-команду.
7. **Reversibility.** Commit, rollback и undo rollback фиксируются в истории.
8. **Minimal privilege.** Не добавлять общий произвольный shell без явной необходимости и ограничений.
9. **Documentation is part of the change.** Новые инструменты должны обновлять README, tools, changelog и roadmap.
10. **No unsupported claims.** Документация описывает только реализованное и проверенное поведение.

## Current capabilities

- workspace registration, listing, tree and search;
- single file read/write/patch;
- batch patch;
- dark preview UI with Diff/Before/After;
- persistent auto-confirm countdown;
- operation history;
- single-operation rollback;
- transactional patch with optional verification;
- automatic transaction rollback;
- manual transaction rollback;
- undo of manual transaction rollback;
- Everything search;
- confirmed process execution;
- Google and Avito browser-side extraction workflows.

## Current limitations

- no `file.read.batch` yet;
- no persistent Dashboard window;
- no reliable answer lifecycle telemetry exposed by ChatGPT itself;
- no built-in TODO/project planner;
- no backup retention or cleanup policy;
- repository currently contains generated `.cbb-*` backup files;
- extension and host versions are versioned independently;
- documentation may lag until the 0.18 documentation baseline is completed;
- no selected open-source license.

## Current focus: 0.18.0

- GitHub-ready documentation baseline;
- Dashboard suitable for a second monitor;
- answer/tool/host status indicators;
- completion sound notifications;
- `file.read.batch`;
- persistent task/TODO subsystem;
- repository hygiene and backup exclusions.

## Planned tools

### 0.18

- `file.read.batch`
- `dashboard.status`
- `dashboard.open`
- `todo.create`
- `todo.list`
- `todo.update`
- `todo.complete`

Exact names are provisional until implementation.

## Documentation maintenance rules

For each functional release:

1. update the version and capability list in `README.md`;
2. add an entry to `CHANGELOG.md`;
3. update completed and planned items in `ROADMAP.md`;
4. update `docs/tools.md` for protocol changes;
5. update architecture documentation when components or data flows change;
6. avoid documenting planned tools as already available;
7. keep examples free of user-specific absolute paths and personal data.

## Release readiness checklist

- build succeeds with zero errors;
- core happy path manually tested;
- rollback path tested for mutation features;
- capability exposed by `bridge.describe`;
- extension recognises the tool where needed;
- README and tool reference updated;
- changelog entry added;
- backup/temp files excluded from Git;
- no secrets or personal paths included in committed documentation.
