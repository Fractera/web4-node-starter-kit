import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { addRun, readDesign } from "./element-design-store"
import { elementPrototypes } from "./element-prototypes"

// СБОРКА ЭЛЕМЕНТА ПОСЛЕ ГЕНЕРАЦИИ ТЕСТОВОЙ СТРАНИЦЫ (узел, шаг 715-1). Владелец 2026-11-10: «Ссылка с текстом когда генерация будет
// закончена вы сможете увидеть всю страницу по этой ссылке» — и про кнопку «Собрать элемент»: «я не понимаю что на этой странице
// означают кнопки». Секции тестовой страницы — код, и работающий сервер элемента показывает их только после сборки (711-8), поэтому
// сборку делает ядро само: когда агент элемента сообщает «закончил» (`/api/agents/done`), а у элемента есть готовая тестовая страница
// из генерации, которую ядро ещё не собирало, — одна сборка без модели (`services:install --only`), отвязанная от процесса ядра.
// Это не таймер и не опрос: шаг — ответ на «закончил» самого агента, по слову владельца о ссылке.
export async function buildAfterGeneration(element: string, root = process.cwd()): Promise<string[]> {
  const { supported, list } = elementPrototypes(element)
  if (!supported) return []
  const design = await readDesign(element)
  const built = new Set(design.runs.filter((r) => r.kind === "build").map((r) => r.prototype))
  const fresh = design.runs
    .filter((r) => r.kind === "generate" && !built.has(r.prototype))
    .map((r) => list.find((p) => p.id === r.prototype && !p.archived && p.status === "ready"))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  if (!fresh.length) return []
  for (const p of fresh) await addRun(element, p.id, p.skill, "build")
  spawnSync(process.execPath, [join(root, "scripts", "spawn-free.mjs"), join("scripts", "services-install.mjs"), "--only", element], { cwd: root, timeout: 15_000 })
  return fresh.map((p) => p.id)
}
