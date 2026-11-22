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
// 837-1 (✗ measured on the server 2026-11-22, its agent's report): root «ждут изменения · правок кода: 1» — the node's own
// `.claude/settings.local.json` (`scripts/element-isolate.mjs`), outside git by design, was counted as an edit.
export const NODE_WRITES = [/^DESIGN-CONFIG\//, /^APP-CONFIG\//, /^PLATFORM-CONFIG\//, /(^|\/)tsconfig\.json$/, /(^|\/)next-env\.d\.ts$/, /^\.install-stamp\.json$/, /^\.claude\/settings\.local\.json$/]

/** 837-1: fields of the element's passport the NODE writes as working-process data, without a commit and without a build (the Telegram
 *  bots page, the Web4 switch, the calendar switch, payments, messenger settings — `writePassportField`, `element-web4.cjs`). A passport
 *  whose only difference from its last commit is in these fields waits for no deployment. ✗ measured on the server 2026-11-22: the
 *  Telegram bots page wrote `telegramBots` into Marketplace's passport, and the deployments board asked to rebuild the element. */
export const NODE_PASSPORT_FIELDS = new Set(["telegramBots", "visibility", "automation", "payments", "messengerSettings"])
const PASSPORT_PATHS = new Set(["OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json", "OWN-SERVICE-PROPS.json"])

/** Does the passport differ from its last commit ONLY in the node's own fields? `committed`/`now` — the two texts. */
export function onlyNodePassportFields(committed: string | null, now: string | null): boolean {
  if (committed === null || now === null) return false
  let a: Record<string, unknown>
  let b: Record<string, unknown>
  try { a = JSON.parse(committed) as Record<string, unknown>; b = JSON.parse(now) as Record<string, unknown> } catch { return false }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if (NODE_PASSPORT_FIELDS.has(k)) continue
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false
  }
  return true
}

function readText(file: string): string | null {
  try { return readFileSync(file, "utf8") } catch { return null }
}

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

function codeState(dir: string, head: string | null, status: string | null, nodeOnlyPassport: Set<string> = new Set()): ElementCodeState | null {
  if (!head) return null
  let running: string | null = null
  try {
    const v = String((JSON.parse(readFileSync(join(dir, ".install-stamp.json"), "utf8")) as { version?: string }).version ?? "")
    running = v.includes("+") ? v.split("+").pop()?.slice(0, 7) ?? null : null
  } catch { /* не установлен */ }
  const all = (status ?? "").split(/\r?\n/).filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop() ?? "")
  const changes = all.filter((p) => p && !NODE_WRITES.some((re) => re.test(p)) && !nodeOnlyPassport.has(p))
  return {
    head,
    running,
    changes: changes.slice(0, 20),
    changed: changes.length,
    pending: changes.length > 0 || (running !== null && !head.startsWith(running) && !running.startsWith(head)),
  }
}

/** The passport paths among the edits that differ from their commit only in the node's own fields (837-1). */
const changedPassports = (status: string | null): string[] =>
  (status ?? "").split(/\r?\n/).filter((l) => l.startsWith(" M ") || l.startsWith("M ") || l.startsWith("MM")).map((l) => l.slice(3).replace(/^"|"$/g, "")).filter((p) => PASSPORT_PATHS.has(p))

export function elementCodeState(dir: string): ElementCodeState | null {
  const head = git(dir, ["rev-parse", "--short=7", "HEAD"])?.trim() || null
  if (!head) return null
  const status = git(dir, ["status", "--porcelain", "--untracked-files=all"])
  const nodeOnly = new Set(changedPassports(status).filter((p) => onlyNodePassportFields(git(dir, ["show", `HEAD:${p}`]), readText(join(dir, p)))))
  return codeState(dir, head, status, nodeOnly)
}

export async function elementCodeStateAsync(dir: string): Promise<ElementCodeState | null> {
  const [head, status] = await Promise.all([gitAsync(dir, ["rev-parse", "--short=7", "HEAD"]), gitAsync(dir, ["status", "--porcelain", "--untracked-files=all"])])
  const nodeOnly = new Set<string>()
  for (const p of changedPassports(status)) if (onlyNodePassportFields(await gitAsync(dir, ["show", `HEAD:${p}`]), readText(join(dir, p)))) nodeOnly.add(p)
  return codeState(dir, head?.trim() || null, status, nodeOnly)
}
