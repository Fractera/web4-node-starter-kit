// WHAT «ПУЛЬТ УЗЛА» IN TELEGRAM SHOWS (node step 771-2). The owner, 2026-11-16: «раз уже я больше большую часть времени собираюсь
// проводить в Telegram …» — the node's own Mini App, opened by the main agent's bot. Read here, by code, no model: the requests waiting
// for the person (the action window's, 761-16), every element with its power and where its development stands (the same records
// `npm run where` reads), the subscription's limits. Never a value of a secret, never a full address of a tab, never the node's keys.
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import asks from "@/lib/node/person-asks.cjs"
import power from "@/lib/web4-items/element-power.cjs"
import paths from "@/lib/web4-items/paths.cjs"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { list as sessions } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/session.cjs"

const ROOT = process.cwd()

type Lang = "en" | "ru"
type Entry = { id: string; kind?: string; required?: boolean; born?: boolean }
type Pulse = { event?: string; at?: string; last?: string; error?: string }
export type TgAsk = { id: string; text: string; why: string | null; hint: string | null; copy: string | null; by: string; byName: string | null; at: string; secret: { kind: string; name?: string; host?: string } | null }
export type TgElement = { id: string; name: string; native: boolean; required: boolean; on: boolean; offReason: string | null; live: boolean; step: string | null; turn: { event: string; at: string; last: string | null } | null }
export type TgLimit = { who: string; fiveHour: { used: number; resetsAt: string | null } | null; sevenDay: { used: number; resetsAt: string | null } | null; at: string | null }
export type TgState = { asks: TgAsk[]; elements: TgElement[]; limits: TgLimit[]; at: string }

const readJson = <T>(file: string, fallback: T): T => {
  try { return JSON.parse(readFileSync(file, "utf8")) as T } catch { return fallback }
}
const sentence = (s: unknown, n = 90): string | null => {
  if (typeof s !== "string" || !s.trim()) return null
  const one = s.replace(/\s+/g, " ").trim()
  const cut = /^(.+?[.!?])(\s|$)/.exec(one)?.[1] ?? one
  return cut.length > n ? `${cut.slice(0, n - 1)}…` : cut
}

/** Where an element's development stands: its passport's `development` (686-3), else the «Active step» line of its current-step.md. */
function stepOf(dir: string | null): string | null {
  if (!dir) return null
  const dev = readJson<{ development?: { current?: string; state?: string; next?: string } } | null>(join(dir, "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"), null)?.development
  if (dev?.current && !/^none\.?$/i.test(dev.current.trim())) return sentence(`${dev.current}${dev.state ? ` (${dev.state})` : ""}${dev.next ? ` → ${dev.next}` : ""}`, 120)
  try {
    const head = readFileSync(join(dir, "development-docs", "current-step.md"), "utf8")
    const line = /\*\*Active step:\*\*\s*([^\n]+)/.exec(head)?.[1] ?? null
    return line && !/^none\.?$/i.test(line.trim()) ? sentence(line, 120) : null
  } catch { return null }
}

/** The last event of a TURN — a closed session never hides a finished or a cut turn (686-8). */
function turnOf(id: string): TgElement["turn"] {
  const hist = readJson<{ history?: Pulse[] }>(join(ROOT, "data", "services", id, "pulse.json"), {}).history ?? []
  const p = hist.find((h) => h.event && h.event !== "session-end")
  return p?.event && p.at ? { event: p.event, at: p.at, last: sentence(p.last ?? p.error ?? null, 100) } : null
}

function elementsOf(lang: Lang): TgElement[] {
  const entries = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE, {}).services ?? []
  const live = new Set(((sessions() as { service: string; running?: boolean }[]) ?? []).filter((s) => s.running).map((s) => s.service))
  return entries.map((e) => {
    const off = power.offOf(e)
    let dir: string | null = null
    try { dir = (paths.entryDir(e) as string | null) ?? null; if (dir && !existsSync(dir)) dir = null } catch { dir = null }
    return {
      id: e.id,
      name: elementName(e.id, lang),
      native: e.kind !== "user",
      required: Boolean(e.required),
      on: !off,
      offReason: off ? (power.reasonIn(off, lang) as string) : null,
      live: live.has(e.id),
      step: e.kind === "user" ? stepOf(dir) : null,
      turn: turnOf(e.id),
    }
  })
}

function limitsOf(): TgLimit[] {
  const dir = join(ROOT, "data", "node", "limits")
  if (!existsSync(dir)) return []
  const pick = (x: { used?: number; resetsAt?: string } | undefined) => (x && typeof x.used === "number" ? { used: x.used, resetsAt: x.resetsAt ?? null } : null)
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson<{ login?: string; element?: string; fiveHour?: { used: number; resetsAt?: string }; sevenDay?: { used: number; resetsAt?: string }; at?: string } | null>(join(dir, f), null))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ who: l.login === "node" ? "node" : l.element ?? "?", fiveHour: pick(l.fiveHour), sevenDay: pick(l.sevenDay), at: l.at ?? null }))
}

/** The whole picture for the Mini App, in the person's language. */
export function tgState(lang: Lang): TgState {
  const waiting = (asks.open(ROOT) as { id: string; text: string; why?: string | null; hint?: string | null; copy?: string | null; by?: string; at: string; secret?: TgAsk["secret"] }[])
    .map((a) => ({
      id: a.id, text: a.text, why: a.why ?? null, hint: a.hint ?? null, copy: a.copy ?? null, by: a.by ?? "build", at: a.at,
      byName: a.by && a.by !== "build" ? elementName(a.by, lang) : null,
      secret: a.secret ? { kind: a.secret.kind, ...(a.secret.name ? { name: a.secret.name } : {}), ...(a.secret.host ? { host: a.secret.host } : {}) } : null,
    }))
  return { asks: waiting, elements: elementsOf(lang), limits: limitsOf(), at: new Date().toISOString() }
}
