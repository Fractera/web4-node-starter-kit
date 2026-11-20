import "server-only"
import { spawn, spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// ЧТО В ЭЛЕМЕНТЕ ЕЩЁ НЕ РАЗВЁРНУТО — ПО ФАКТАМ GIT (узел, шаг 337-2). ✗ 2026-09-29: агент roman переписал лендинг и не
// закоммитил, а «Развёртывания» ядра писали «актуален» — ожидание мерилось только временем файлов настроек.
//
// 🔒 ТРИ ФАКТА, ВСЕ ИЗМЕРЯЮТСЯ ПРИ ЗАПРОСЕ: последний коммит (`HEAD`), работающий коммит (хвост `+<hash>` версии в
// `.install-stamp.json`, его пишет установщик после сборки) и правки рабочего дерева, которые сделал человек или агент.
// 🔒 ФАЙЛЫ, КОТОРЫЕ ПИШЕТ САМ УЗЕЛ, — НЕ ПРАВКИ: конфиги, приходящие из CONFIG, `tsconfig.json` и `next-env.d.ts`
// (их переписывает `next build`), отпечаток установки. Иначе каждый элемент вечно «ждал бы развёртывания».

export type ElementCodeState = {
  head: string | null
  running: string | null
  /** Пути правок рабочего дерева (до 20), без файлов, которые пишет сам узел. */
  changes: string[]
  changed: number
  /** Есть что развернуть: правки или последний коммит не тот, что работает. */
  pending: boolean
}

/** Файлы, которые пишет сам узел (377: тот же список читает выгрузка в GitHub — они не правки и не коммитятся). */
export const NODE_WRITES = [/^DESIGN-CONFIG\//, /^APP-CONFIG\//, /^PLATFORM-CONFIG\//, /(^|\/)tsconfig\.json$/, /(^|\/)next-env\.d\.ts$/, /^\.install-stamp\.json$/]

function git(dir: string, args: string[]): string | null {
  const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", windowsHide: true, timeout: 10_000 })
  return r.status === 0 ? r.stdout : null
}

/** 815-8 (the owner, 2026-11-20, Telegram 239: «Первые три раза кнопка не нажалась спустя 1 минуту»): measured on the server — the
 *  deployments door read 11 elements with two SYNCHRONOUS git calls each, 9–11 s with the core process frozen: every click of every page
 *  waited behind it. The door reads them with this one, all at once and without blocking. */
function gitAsync(dir: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    let out = ""
    const child = spawn("git", ["-C", dir, ...args], { windowsHide: true })
    const timer = setTimeout(() => child.kill(), 10_000)
    child.stdout.on("data", (b: Buffer) => { out += b.toString("utf8") })
    child.on("error", () => { clearTimeout(timer); resolve(null) })
    child.on("close", (code) => { clearTimeout(timer); resolve(code === 0 ? out : null) })
  })
}

function codeState(dir: string, head: string | null, status: string | null): ElementCodeState | null {
  if (!head) return null
  let running: string | null = null
  try {
    const v = String((JSON.parse(readFileSync(join(dir, ".install-stamp.json"), "utf8")) as { version?: string }).version ?? "")
    running = v.includes("+") ? v.split("+").pop()?.slice(0, 7) ?? null : null
  } catch { /* не установлен */ }
  const all = (status ?? "").split(/\r?\n/).filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop() ?? "")
  const changes = all.filter((p) => p && !NODE_WRITES.some((re) => re.test(p)))
  return {
    head,
    running,
    changes: changes.slice(0, 20),
    changed: changes.length,
    pending: changes.length > 0 || (running !== null && !head.startsWith(running) && !running.startsWith(head)),
  }
}

export function elementCodeState(dir: string): ElementCodeState | null {
  const head = git(dir, ["rev-parse", "--short=7", "HEAD"])?.trim() || null
  if (!head) return null
  return codeState(dir, head, git(dir, ["status", "--porcelain", "--untracked-files=all"]))
}

export async function elementCodeStateAsync(dir: string): Promise<ElementCodeState | null> {
  const [head, status] = await Promise.all([gitAsync(dir, ["rev-parse", "--short=7", "HEAD"]), gitAsync(dir, ["status", "--porcelain", "--untracked-files=all"])])
  return codeState(dir, head?.trim() || null, status)
}
