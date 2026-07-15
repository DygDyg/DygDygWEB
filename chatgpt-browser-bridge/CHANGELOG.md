# Changelog

Все заметные изменения проекта фиксируются в этом файле. История ранних версий восстановлена по текущему коду и журналу разработки, поэтому отдельные детали до 0.15 могут быть неполными.

## Unreleased

### Planned

- persistent Dashboard window;
- ChatGPT response completion sound;
- workspace-scoped TODO subsystem;
- repository cleanup tools.

## 0.18.1 — 2026-07-14

### Added

- `file.read.batch.tree`;
- recursive file discovery inside a workspace;
- filename pattern and extension filtering;
- exclusion patterns;
- automatic skipping of build, dependency and Bridge backup files;
- toolbar action and result summary for recursive batch reading;
- Smart Patch support for context-only `@@` hunk headers.

## 0.18.0 — 2026-07-14

### Added

- GitHub-oriented documentation baseline;
- `PROJECT.md` with project principles and current focus;
- formal roadmap for Dashboard, batch reading, notifications and TODO;
- initial architecture, tools and transaction documentation.
- `.gitignore` for build output, local state and Bridge backup files;
- `file.read.batch`;
- per-file and total response size limits;
- optional continuation after individual read errors;
- SHA-256 and truncation metadata for every returned file.

## 0.17.2 — 2026-07-14

### Added

- `history.rollback.transaction.undo`;
- undo records for a manual transaction rollback;
- protection against repeating the same undo;
- ability to roll back the original transaction again after undo.

## 0.17.1 — 2026-07-14

### Added

- transaction file and summary records in operation history;
- `history.rollback.transaction`;
- manual rollback of every file in a committed transaction;
- backup of the current state before manual transaction rollback;
- history records for transaction rollback.

## 0.17.0 — 2026-07-14

### Added

- `workspace.transaction`;
- multi-file patch transaction;
- optional verification command;
- automatic rollback after a non-zero verification exit code;
- stdout, stderr, duration and exit code in verification result.

## 0.16.x — 2026-07-14

### Added

- unified dark theme for preview dialogs;
- owner-drawn dark tabs;
- persistent auto-confirm checkbox;
- five-second auto-apply countdown;
- saved preview settings under LocalAppData.

### Fixed

- diff colouring being reset after dialog display;
- light editor borders;
- partial application of the dark theme;
- WinForms pattern matching order in the theme helper.

## 0.15.0 — 2026-07-14

### Added

- `file.patch.batch`;
- combined multi-file preview;
- per-file backups and SHA-256 validation;
- batch history records;
- toolbar action for applying all patches from one response.

### Fixed

- batch preview SplitContainer sizing;
- stale toolbar command selection;
- empty batch toolbar state.

## 0.14.0 — 2026-07-14

### Added

- tabs `Diff`, `До`, `После` in patch preview;
- full source and resulting file views.

## 0.13.x — 2026-07-14

### Added

- patch preview dialog;
- diff statistics;
- colour highlighting;
- warning for large patches;
- delayed activation of the apply button.

## 0.12.0 — 2026-07-14

### Added

- persistent operation history;
- `history.list`;
- `history.rollback`;
- backup-based rollback for individual file changes.

## Earlier development

- Chrome Manifest V3 extension;
- Native Messaging Host on .NET 8;
- workspace registration and path restrictions;
- `file.read`, `file.write`, `file.patch`;
- Everything CLI search;
- process execution with confirmation;
- Google and Avito browser workflows;
- fixed extension ID through the manifest key.
