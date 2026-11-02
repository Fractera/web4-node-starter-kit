# `/architect/build/automation/tools` — main agent

Step 558-3 (owner 2026-10-21: «в Аргенти это будет автоматизированное управление агентами или приложениями позволяет запускать агентов по
определённому расписанию»): the main agent's section «Automated management» — the same three tabs as «Backup» of the memory elements.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: `_lib/main-agent-page.tsx` draws the title, the purpose line and the items under this page; `own` — `_components/main-agent-automation.tsx` |
| `_data/` | `slug` = folder name, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the shared view |

Data: `data/main-agent/OWN-SERVICE-PROPS/{CRON,SUBSCRIPTIONS}.json` (from `lib/main-agent/`), the schedule `data/main-agent/data/cron.json`
(outside git), the clock `lib/main-agent-cron/` in the core server.
