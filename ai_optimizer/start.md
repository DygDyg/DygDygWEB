# AI Context Bootstrap — переносимый старт для Cursor

Этот файл можно **скопировать в корень любого проекта** или **отдать агенту одним сообщением** в новом репозитории.

**Как применять (новый vs существующий проект):** [start-usage.md](./start-usage.md)

**Цель:** экономия токенов, диспетчер мультизадачных запросов, правила и документация для AI — по образцу [Track Anime](E:/GitHub/ta_new).

Совместим с идеями из `cursr_guide.md` (ChatGPT): две части — **правила** и **документация** — плюс Cursor-специфика (dispatcher, `.cursorignore`, rules/skills).

---

## Быстрый старт (скопируй агенту)

```text
Прочитай start.md и выполни обе части (A + B). Не изменяй код приложения — только AI rules, документацию и .cursor/*.

Порядок анализа:
1. структура проекта (README, package.json, корень)
2. core modules (src/, lib/, api/)
3. business logic (domain flows, integrations)

PART A — AI rules: .cursorrules и/или AI_RULES.md (merge, не перезаписывать существующее).
PART B — документация + Cursor infra: см. чеклист.

Используй только реальные файлы проекта. Не выдумывай paths.
В конце: таблица создано/обновлено, summary findings, рекомендации.
```

---

## Важные ограничения (из cursr_guide)

- Сначала **изучи** — потом **пиши** docs/rules.
- **Не модифицируй** application code (только rules, docs, `.cursor/*`).
- Только **реальные** файлы; если нет — `ФАЙЛ НЕ НАЙДЕН` / `NOT FOUND`.
- Недостаточно данных — `НЕДОСТАТОЧНО ДАННЫХ`; нет уверенности — `НЕ ПОДТВЕРЖДЕНО`.
- Документация: **создаётся один раз**, дальше обновляются только затронутые секции.
- **Не дублируй** содержимое между файлами (см. матрицу ниже).

---

## Зачем это нужно

| Проблема | Решение |
|----------|---------|
| Агент читает весь репо | `AI_CONTEXT.md` + Critical Paths + Request routing |
| «UI + deploy + API» в одном сообщении | Rule/skill **dispatcher** — план до кода |
| Индексируется `.next/`, `node_modules/` | `.cursorignore` |
| Архитектура «в голове» | `ARCHITECTURE.md`, `BUSINESS_LOGIC.md`, `DECISIONS.md` |
| Правила не подхватываются | `.cursorrules` → ссылки на `AI_RULES.md`, rule, skill |

**Hooks** для инъекции контекста в промпт — ненадёжны. Rule с `alwaysApply: true` стабильнее.

---

## Чеклист внедрения

### PART A — AI rules

- [ ] **A1.** Найти существующие instruction-файлы (см. приоритет ниже).
- [ ] **A2.** Создать/обновить **`.cursorrules`** — короткий указатель + dev rules (merge, не затирать).
- [ ] **A3.** Создать/обновить **`AI_RULES.md`** — полные правила (Role, debugging, critical rules).

### PART B — документация

- [ ] **B1.** `PROJECT_OVERVIEW.md` — purpose, stack, features.
- [ ] **B2.** `ARCHITECTURE.md` — layers, flows, integrations.
- [ ] **B3.** `CODEBASE_MAP.md` — folders, modules (если репо > ~100–200 файлов).
- [ ] **B4.** `BUSINESS_LOGIC.md` — core flows, domain rules.
- [ ] **B5.** `CONVENTIONS.md` — naming, patterns.
- [ ] **B6.** `AI_CONTEXT.md` — quick reference для AI (critical paths, routing, pitfalls).
- [ ] **B7.** `DECISIONS.md` — неочевидные архитектурные решения.

### PART C — Cursor infra (token + dispatcher)

- [ ] **C1.** `.cursorignore`
- [ ] **C2.** `.cursor/rules/multi-task-dispatcher.mdc`
- [ ] **C3.** `.cursor/skills/<project-slug>-dispatcher/SKILL.md`
- [ ] **C4.** Ссылки в `.cursorrules` на rule + skill.

### Финал

- [ ] **D1.** Матрица «кто за что отвечает» — без дублей.
- [ ] **D2.** Валидация путей; `AI_CONTEXT.md` ≈ 150–250 строк.
- [ ] **D3.** Отчёт: files created/updated, summary, recommendations.

**Эталон:** `E:\GitHub\ta_new`

---

## Приоритет AI instruction-файлов

| Приоритет | Файл | Действие |
|-----------|------|----------|
| 1 | `.cursorrules` | Создать или **дополнить** (Cursor читает по умолчанию) |
| 2 | `AI_RULES.md` | Полные правила (как в ta_new) |
| 3 | `AGENTS.md` / `CLAUDE.md` | Если уже есть — **merge**, не дублировать `.cursorrules` |
| 4 | `.cursor/rules/*.mdc` | Domain-specific + dispatcher |

**Merge policy:** сохранить стиль; не перезаписывать чужие инструкции; append/merge; убрать дубликаты.

---

## Матрица документов (что куда, без дублей)

| Файл | Содержит | Не дублировать |
|------|----------|----------------|
| `PROJECT_OVERVIEW.md` | Зачем проект, stack, user-facing features | детали API, file map |
| `ARCHITECTURE.md` | Слои, data flow, integrations, диаграммы | список pitfall'ов |
| `CODEBASE_MAP.md` | Папки, модули, responsibilities | business rules |
| `BUSINESS_LOGIC.md` | Domain flows, edge cases, critical logic | env vars |
| `CONVENTIONS.md` | Naming, patterns, style | architecture |
| `AI_CONTEXT.md` | **Entry points**, routing, assumptions, pitfalls, debug cmds | длинные prose |
| `DECISIONS.md` | Решения «почему так» (sync, IDs, deploy) | общий overview |
| `AI_RULES.md` | Как AI должен **работать** с кодом | domain facts |

**Правило для AI:** при задаче читать `AI_CONTEXT.md` первым; углубляться в другие docs только по необходимости.

---

## Артефакты (полное дерево)

```
<project-root>/
├── .cursorignore
├── .cursorrules
├── AI_RULES.md
├── AI_CONTEXT.md
├── PROJECT_OVERVIEW.md
├── ARCHITECTURE.md
├── CODEBASE_MAP.md          # опционально для маленьких репо
├── BUSINESS_LOGIC.md
├── CONVENTIONS.md
├── DECISIONS.md
└── .cursor/
    ├── rules/
    │   └── multi-task-dispatcher.mdc
    └── skills/
        └── <project-slug>-dispatcher/
            └── SKILL.md
```

**MVP (минимум):** PART A + `AI_CONTEXT.md` + `DECISIONS.md` + PART C.  
**Полный bootstrap (как cursr_guide):** все файлы PART B.

---

## PART A — шаблон `AI_RULES.md`

Создай, если нет. Если есть — дополни недостающие секции.

```markdown
# Role

Ты работаешь как Senior Software Architect и Senior Software Engineer для этого проекта.

Твоя задача:

* глубоко понимать архитектуру проекта
* находить root cause проблем
* предлагать точечные и безопасные изменения
* сохранять consistency codebase

Твои приоритеты:

1. Correctness
2. Stability
3. Maintainability
4. Minimal changes

---

# AI Project Rules

## General Development Rules

Всегда:

* сначала изучай существующую реализацию
* переиспользуй существующие паттерны
* следуй архитектуре и conventions проекта
* предпочитай минимальные точечные изменения

Перед изменением кода:

1. Найди похожую реализацию в проекте
2. Изучи зависимости
3. Проверь возможные side effects

Никогда:

* не ломай backward compatibility
* не дублируй существующую логику
* не создавай новые abstractions без явной необходимости
* не рефактори несвязанный код во время bugfix

## Debugging Workflow

1. Воспроизведи проблему
2. Построй call chain
3. Проследи data flow
4. Найди root cause
5. Предложи минимальный fix
6. Покажи точный diff

## Critical Rules

* Никогда не выдумывай файлы, функции или code paths
* Используй только реальные файлы проекта
* Если файл не найден — пиши: ФАЙЛ НЕ НАЙДЕН
* Если недостаточно данных — пиши: НЕДОСТАТОЧНО ДАННЫХ
* Если нет уверенности — пиши: НЕ ПОДТВЕРЖДЕНО

## Local Model Behavior Rules

* избегай общих объяснений
* отвечай кратко и технически
* предпочитай raw code вместо пересказа
* не переходи в generic assistant mode

## Documentation Rules

Документация создаётся один раз.
После этого обновляются только затронутые секции.
Не пересоздавай документацию полностью без необходимости.

## Project context files

При работе читай (по необходимости):

* `AI_CONTEXT.md` — quick reference (читать первым)
* `PROJECT_OVERVIEW.md` — назначение и user flows
* `ARCHITECTURE.md` — модули, data flow
* `CODEBASE_MAP.md` — карта файлов
* `BUSINESS_LOGIC.md` — critical paths, edge cases
* `CONVENTIONS.md` — naming, patterns
* `DECISIONS.md` — архитектурные решения
```

---

## PART A — шаблон `.cursorrules`

Короткий указатель; **полные** правила — в `AI_RULES.md`.

```markdown
# <Project Name> — Cursor Rules

See `AI_RULES.md` for full AI development rules.
See `AI_CONTEXT.md` for project quick reference.
Multi-topic requests: rule `.cursor/rules/multi-task-dispatcher.mdc` + skill `<project-slug>-dispatcher`.

## Project Development Rules

Always:

* first study existing implementation
* reuse existing patterns
* follow project conventions
* prefer minimal targeted changes

Before changing code:

1. Find similar implementation in project
2. Study dependencies
3. Check side effects

Never:

* break backward compatibility
* duplicate existing logic
* introduce new abstractions without clear need
* refactor unrelated code during bug fixes

Critical rules:

* Never invent files, functions, or code paths
* If file is missing, say NOT FOUND / ФАЙЛ НЕ НАЙДЕН
* If uncertain, say NOT VERIFIED / НЕ ПОДТВЕРЖДЕНО
* Use only real project files as evidence
```

---

## PART B — outlines документации (из cursr_guide)

### `PROJECT_OVERVIEW.md`

- Project purpose (1–2 абзаца)
- Tech stack (runtime, framework, DB, hosting)
- Major features (bullet list)
- High-level architecture (1 diagram or список компонентов)

### `ARCHITECTURE.md`

- Architecture layers (UI / API / domain / data)
- App flow (typical request / user journey)
- External integrations (APIs, OAuth, queues…)
- Important services / modules

### `CODEBASE_MAP.md`

- Folder structure (дерево верхнего уровня)
- Important modules with **one-line** responsibility
- Entry points (main, routes, CLI scripts)

### `BUSINESS_LOGIC.md`

- Core business flows (numbered steps)
- Critical logic (auth, payments, sync… — что есть в проекте)
- Domain rules and edge cases

### `CONVENTIONS.md`

- Naming (files, components, DB tables)
- Coding patterns (error handling, API shape)
- Architectural patterns (layers, where logic lives)

### `AI_CONTEXT.md`

См. полный шаблон ниже — **главный файл для экономии токенов**.

### `DECISIONS.md`

Архитектурные решения, которые легко забыть (IDs, sync direction, middleware scope, deploy).

---

## Шаблон: `AI_CONTEXT.md`

≈150–250 строк. Заполняй **реальными путями** после discovery.

```markdown
# <Project Name> — AI Context

Quick reference for AI assistants.

## What This Project Is

<1–3 предложения>

## Critical Paths

| Task | Start here |
|------|------------|
| Fix auth | `...` |
| Fix API | `...` |
| Fix UI | `...` |
| Fix DB | `...` |
| Fix deploy | `scripts/...`, `docs/...` |

## Request routing (multi-task / dispatcher)

При широком запросе — rule `multi-task-dispatcher` или skill `<project-slug>-dispatcher`. **Deploy последним.**

| Тема | Ключевые слова | Стартовые файлы |
|------|----------------|-----------------|
| … | … | … |

## Domain policies

<Таблицы sync / auth / IDs — только факты из кода. Details: DECISIONS.md>

## Hidden Assumptions

1. …

## Environment Variables (must-know)

| Var | Purpose |
|-----|---------|
| … | … |

## Frequent Pitfalls

| Problem | Likely cause |
|---------|--------------|
| … | … |

## Debugging Notes

```bash
# из package.json / Makefile / README
```

## Extended docs

- `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `BUSINESS_LOGIC.md`, `CONVENTIONS.md`
- `DECISIONS.md` — architecture decisions
```

### Как заполнить Critical Paths и Request routing

1. 8–15 типов задач (auth, API, UI, DB, cron, deploy…).
2. 2–5 **entry-point** файлов на задачу.
3. Keywords — RU + EN, как формулируешь запросы сам.
4. Проверь пути через glob/grep.

---

## PART C — `.cursorignore`

```gitignore
# Build & deps
node_modules/
dist/
build/
.next/
out/
coverage/
__pycache__/
.venv/
venv/
target/

# Generated / cache
*.log
.cache/
.turbo/

# Env & secrets
.env
.env.*
```

---

## PART C — dispatcher rule + skill

### `.cursor/rules/multi-task-dispatcher.mdc`

```markdown
---
description: Диспетчер мультизадачных запросов — triage перед кодом, deploy последним
alwaysApply: true
---

# Multi-task dispatcher

Если **2+ темы** или «заодно», «и ещё», «+ деплой», «[multi]»:

## Фаза 0

1. Прочитать **только** `AI_CONTEXT.md` (Critical Paths + Request routing).
2. Короткий **план** без чтения кода: задачи, 2–5 файлов, что не трогать.
3. Не Task/explore на весь репо до плана.
4. Не править код в том же ответе, что план — unless «делай всё».

## Порядок: UI → data/API → assets → **deploy последним**

Deploy: скрипт из `AI_CONTEXT` / `DECISIONS`. Skill: `.cursor/skills/<project-slug>-dispatcher/SKILL.md`.
```

### `.cursor/skills/<project-slug>-dispatcher/SKILL.md`

```markdown
---
name: <project-slug>-dispatcher
description: >-
  Разложить мультитемный запрос на фазы. «заодно», [multi], несколько тем.
---

# Dispatcher

1. Только `AI_CONTEXT.md` до плана.
2. План: | # | Задача | Файлы | Риск |
3. Выполнение по одной задаче; deploy — отдельно.

## Keyword → файлы

<из AI_CONTEXT Request routing>

## Антипаттерны

Subagents на весь репо; deploy + массовый UI в одном turn; build/cache dirs.
```

---

## Инструкция агенту: discovery

1. **Structure** — README, manifest (`package.json` / `pyproject.toml` / `go.mod`), root dirs.
2. **Core modules** — `src/`, routes, services, models.
3. **Business logic** — auth, main domain, integrations, sync, deploy scripts.
4. **Write docs** — outlines выше; только проверенные факты.
5. **Cursor infra** — ignore, rule, skill.
6. **Cross-check** — нет hallucinated paths; routing synced между AI_CONTEXT и skill.

---

## Формат отчёта (обязательный output)

```markdown
## 1. Files created/updated

| File | Status | Notes |
|------|--------|-------|
| AI_RULES.md | created | … |
| … | … | … |

## 2. Summary of findings

- Stack: …
- Architecture: …
- Key integrations: …
- Deploy: …

## 3. Documentation recommendations

- Что дописать позже (если MVP)
- Риски / пробелы в docs
- Предложенные domain rules для `.cursor/rules/`

## 4. Request routing (N themes)

| Theme | Entry files |
| … |

## 5. Example prompts

- [multi] …
- narrow: …
```

---

## Как пользоваться после внедрения

```text
Настрой мобильный UI, заодно проверь API и деплой.
→ план → UI → API → deploy отдельно

[multi] Фильтр на главной + миграции
→ явный triage

Почини 401 в src/.../auth.ts
→ без лишнего triage
```

---

## Два режима bootstrap

| Режим | Когда | Что создавать |
|-------|-------|---------------|
| **MVP** | Малый проект, быстрый старт | A + `AI_CONTEXT` + `DECISIONS` + C |
| **Full** | Как `cursr_guide.md`, большой репо | A + весь PART B + C |

---

## Эталон (Track Anime)

```
E:\GitHub\ta_new\
├── .cursorignore, .cursorrules
├── AI_RULES.md, AI_CONTEXT.md
├── PROJECT_OVERVIEW.md, ARCHITECTURE.md, CODEBASE_MAP.md
├── BUSINESS_LOGIC.md, CONVENTIONS.md, DECISIONS.md
└── .cursor/rules/multi-task-dispatcher.mdc
    .cursor/skills/ta-dispatcher/SKILL.md
```

---

## Источники

- **Track Anime** — dispatcher, `.cursorignore`, `DECISIONS.md`, routing tables.
- **cursr_guide.md** — двухчастная структура, `AI_RULES` content, полный набор docs, merge policy, discovery order, output format.

---

## Версия

Bootstrap **v2** — merge Track Anime + cursr_guide (2026-06).
