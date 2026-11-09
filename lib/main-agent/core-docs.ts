import "server-only"
import type { DocSource } from "@/lib/web4-items/element-docs"

// ДОКУМЕНТЫ ГЛАВНОГО АГЕНТА (узел, шаг 710). Владелец 2026-11-09: «у кастомных элементов … на вкладке документы есть все необходимые
// записи. А вот у главного агента почему-то надпись что эти страницы ещё не построены». Страницы «Документов» главного агента читают файлы
// ядра так же, как страницы элемента — файлы элемента (`lib/web4-items/element-docs.ts`, дверь `/api/node/element-docs?item=build`).
// 🔒 Путь берётся только отсюда, по имени страницы, — никогда из запроса (иначе дверь открыла бы `.env.local`).
// Ключ — имя папки страницы в `architect/build/`; путь — от корня ядра.
export const CORE_DOCS: Record<string, DocSource> = {
  instruction: { file: "CLAUDE.md" },
  skills: { file: ".claude/skills", folder: true, deep: true },
  "docs-registry": { file: "development-docs/README.md" },
  "step-current": { file: "development-docs/development-steps/current-steps.md" },
  "steps-new": { file: "development-docs/development-steps/new-steps", folder: true, nested: true },
  "steps-done": { file: "development-docs/development-steps/completed-steps", folder: true, nested: true },
  glossary: { file: "development-docs/GLOSSARY.md" },
  backlog: { file: "development-docs/BACKLOG.md" },
  cancelled: { file: "development-docs/CANCELLED.md" },
  "anti-patterns": { file: "development-docs/ANTI-PATTERNS.md" },
  "translation-debt": { file: "development-docs/TRANSLATION-DEBT.md" },
}
