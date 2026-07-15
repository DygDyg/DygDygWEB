# Dashboard Design

## Goal

Dashboard — отдельное постоянное окно Bridge, которое можно разместить на втором мониторе как виджет.

Оно должно показывать состояние ChatGPT, Native Host, инструментов, workspace, истории и задач, а также предоставлять безопасные кнопки действий.

## Primary use case

Пользователь работает в ChatGPT на основном мониторе, а Dashboard остаётся открытым на втором:

```text
┌──────────────────────────────────────────────┐
│ ChatGPT Browser Bridge              ONLINE   │
├──────────────────────────────────────────────┤
│ Assistant: generating response...            │
│ Duration: 00:01:24                            │
│ Last completed: 19:42:10                      │
├──────────────────────────────────────────────┤
│ Workspace: Bridge                             │
│ Host: 0.17.2                                  │
│ Last tool: workspace.transaction              │
│ Result: committed, build exit 0               │
├──────────────────────────────────────────────┤
│ TODO                                           │
│  [Doing] Implement Dashboard                  │
│  Progress: 3 / 8                              │
├──────────────────────────────────────────────┤
│ [History] [Build] [Rollback] [Undo] [Docs]    │
└──────────────────────────────────────────────┘
```

## Functional requirements

### Window behavior

- отдельное окно Windows;
- resizable;
- Always on Top option;
- сохранение монитора, позиции и размера;
- компактный режим;
- возможность запуска вместе с Native Host или отдельно;
- тёмная тема, согласованная с preview UI.

### Host status

- online/offline;
- версия;
- найденный `es.exe`;
- число workspace;
- время последнего heartbeat;
- последняя ошибка.

### Assistant lifecycle

Желаемые состояния:

```text
idle
user_message_sent
generating
waiting_for_tool
tool_running
waiting_for_confirmation
finished
error
```

Важно: ChatGPT не предоставляет стабильный публичный API статуса генерации в DOM. Реализация должна использовать наблюдаемые признаки интерфейса и быть устойчивой к изменениям страницы.

### Tool status

- имя команды;
- request ID;
- время запуска;
- длительность;
- pending/success/error;
- краткая сводка;
- ссылка или действие для просмотра полного результата.

### Workspace panel

- активный workspace;
- путь;
- количество файлов при доступности;
- статус последней проверки;
- быстрые действия Build, Open Folder, Refresh Tree.

### History panel

- последние операции;
- transaction commit;
- automatic rollback;
- manual rollback;
- undo rollback;
- кнопки доступных переходов состояния.

### TODO panel

- текущая задача;
- подзадачи;
- статус;
- прогресс;
- блокировки;
- связанная транзакция.

## Action buttons

Кнопки должны вызывать только заранее определённые безопасные операции.

Кандидаты:

- Open workspace folder;
- Build workspace;
- Run configured tests;
- Show history;
- Rollback selected transaction;
- Undo selected rollback;
- Open documentation;
- Show TODO;
- Toggle sound;
- Toggle Always on Top.

Dashboard не должен превращаться в произвольный shell launcher.

## Proposed architecture

### State store

Единый локальный store состояния:

```text
BridgeStateStore
├── host status
├── assistant status
├── active tool
├── last result
├── active workspace
├── recent history
└── notification state
```

### Event producers

- `chatgpt-content.js` — assistant lifecycle;
- `background.js` — browser and native messaging lifecycle;
- `Dispatcher` — tool lifecycle;
- transaction/history services — domain events.

### Event consumers

- Dashboard window;
- sound notification service;
- toolbar inside ChatGPT;
- future session log.

### Communication options

#### Native Messaging state commands

Расширение периодически отправляет status events Native Host.

Плюсы:

- используется существующий канал;
- нет нового сетевого сервиса.

Минусы:

- Native Messaging connection lifecycle может быть коротким;
- Dashboard должен жить независимо от отдельного запроса.

#### Named pipes

Dashboard и BridgeHost используют локальный named pipe.

Плюсы:

- постоянный двусторонний канал;
- подходит для отдельного процесса.

Минусы:

- больше инфраструктуры;
- нужны reconnect и access controls.

#### Shared state file

Компоненты атомарно обновляют JSON state file.

Плюсы:

- простота;
- легко диагностировать.

Минусы:

- polling;
- риск гонок;
- не подходит для частых событий без дополнительной синхронизации.

### Recommended first implementation

Для 0.18 рекомендуется:

1. Dashboard как отдельная WinForms-форма внутри Native Host process;
2. thread-safe in-memory `BridgeStateStore`;
3. новые внутренние события Dispatcher;
4. команда `dashboard.open`;
5. status updates от расширения через отдельную native command;
6. сохранение layout в `settings.json`.

После стабилизации можно выделить Dashboard в отдельный процесс.

## Answer completion detection

На стороне расширения следует отслеживать:

- появление нового assistant message;
- наличие кнопки остановки генерации;
- изменение streaming DOM;
- стабилизацию текста;
- появление action controls завершённого сообщения.

Необходимо использовать debounce и fingerprint, чтобы не подавать звук несколько раз при React-перерисовках.

Предлагаемый алгоритм:

```text
new assistant message detected
→ state = generating
→ mutations continue
→ no mutations for grace interval
→ stop control absent
→ message controls present
→ state = finished
→ emit one completion event
```

## Notifications

События со звуком:

- assistant finished;
- confirmation required;
- tool failed;
- transaction committed;
- transaction rolled back.

Настройки:

- enabled;
- per-event switches;
- sound selection;
- volume where technically practical;
- quiet hours later.

Для первого релиза допустимы системные звуки Windows без пользовательских аудиофайлов.

## Persistence

Планируемые параметры в `settings.json`:

```json
{
  "Dashboard": {
    "Enabled": true,
    "AlwaysOnTop": true,
    "X": 1920,
    "Y": 40,
    "Width": 480,
    "Height": 900,
    "Compact": false
  },
  "Notifications": {
    "Enabled": true,
    "AssistantFinished": true,
    "ConfirmationRequired": true,
    "ToolFailed": true
  }
}
```

Точный формат ещё не стабилен.

## Security considerations

- Dashboard не принимает команды от произвольных процессов;
- destructive actions требуют подтверждения;
- чувствительные пути не должны отправляться во внешние сервисы;
- кнопки строятся из capabilities, а не из произвольного текста;
- assistant lifecycle events не должны содержать полный текст чата без явной необходимости;
- состояние должно очищаться при закрытии сессии, где это уместно.

## Implementation phases

### Phase 1

- окно;
- host status;
- last tool;
- recent result;
- Always on Top;
- layout persistence.

### Phase 2

- assistant generating/finished;
- completion sound;
- confirmation required status;
- recent history.

### Phase 3

- TODO;
- workspace actions;
- transaction state graph;
- compact widget mode.

## Acceptance criteria for 0.18

- окно стабильно остаётся открытым на втором мониторе;
- позиция сохраняется после перезапуска;
- отображается версия и online status;
- отображается последняя локальная команда и результат;
- статус ответа меняется с generating на finished;
- звук подаётся ровно один раз на завершённый ответ;
- Dashboard не ломает Native Messaging обработку команд;
- кнопки rollback/undo недоступны, когда операция неприменима.
