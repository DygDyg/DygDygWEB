# Session State

Обновлено: 2026-07-15

## Последнее стабильное состояние

- Native Host установлен и отвечает.
- Фактическая версия Native Host: `0.18.5`.
- Dashboard выделен из Native Messaging Host в отдельный процесс `BridgeDashboard.exe`.
- `dashboard.open` успешно запускает Dashboard.
- Dashboard отображается и читает `dashboard-state.json`.
- В popup расширения добавлена кнопка открытия Dashboard.
- В `chatgpt-content.js` уже распознаются `dashboard.open`, `dashboard.status`, workspace, history, batch read и transaction tools.
- Инструкция `BRIDGE_PROMPT` обновлена и перечисляет актуальные локальные инструменты.
- Созданы `CHAT_CONTEXT.md` и `SESSION_STATE.md` для переноса работы в новый чат.
- Архитектура Dashboard зафиксирована как отдельный процесс.

## Текущая задача

Завершить синхронизацию всей проектной документации с фактической реализацией
`0.18.5`:

- обновить версии в README и PROJECT;
- убрать реализованные команды из раздела Planned;
- обновить `docs/dashboard.md` под архитектуру отдельного процесса;
- проверить `docs/tools.md` и добавить `dashboard.open` / `dashboard.status`;
- добавить запись в CHANGELOG;
- проверить документацию установки и обновления.

## Известные несоответствия

- `README.md` указывает Native Host 0.18.1.
- `PROJECT.md` указывает Native Host 0.17.2 и сообщает, что batch read и Dashboard отсутствуют.
- `docs/dashboard.md` рекомендует старую архитектуру Dashboard внутри процесса Native Host.
- `docs/tools.md` одновременно документирует `file.read.batch`, но также относит его к planned tools.
- `docs/tools.md` не содержит полноценного описания команд Dashboard.
- `CHANGELOG.md` ещё не фиксирует выделение Dashboard в отдельный процесс.

## Следующий технический этап

После синхронизации документации:

1. добавить browser-side события состояния ассистента;
2. добавить Native-команду для записи browser lifecycle state;
3. расширить `dashboard-state.json` состоянием assistant lifecycle;
4. показать generating/finished/error в Dashboard;
5. добавить дедуплицированное звуковое уведомление.

## Требования после изменений

### Только документация

- Пересборка Native Host: ❌
- Перезагрузка расширения: ❌
- Перезагрузка вкладки ChatGPT: ❌

### Изменение `extension/chatgpt-content.js`

- Пересборка Native Host: ❌
- Перезагрузка расширения: ✅
- Перезагрузка вкладки ChatGPT: ✅

### Изменение `bridge-host` или `dashboard-host`

- Запуск `installer\\install.bat`: ✅
- Перезагрузка расширения: обычно ❌
- Полный перезапуск Chrome: только если Native Messaging остаётся на старой сборке
