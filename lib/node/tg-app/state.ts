// WHAT «ПУЛЬТ УЗЛА» IN TELEGRAM SHOWS (node step 771-2). The owner, 2026-11-16: «раз уже я больше большую часть времени собираюсь
// проводить в Telegram …» — the node's own Mini App, opened by the main agent's bot. Read here, by code, no model: the requests waiting
// for the person (the action window's, 761-16), every element with its power and where its development stands (the same records
// `npm run where` reads), the subscription's limits. Never a value of a secret, never a full address of a tab, never the node's keys.
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"

import asks from "@/lib/node/person-asks.cjs"
import mainChannel from "@/lib/node/main-channel.cjs"
import autostart from "@/lib/node/autostart.cjs"
import power from "@/lib/web4-items/element-power.cjs"
import paths from "@/lib/web4-items/paths.cjs"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { list as sessions } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/session.cjs"
import contextWindow from "@/lib/agent-kit/context-window.cjs"
import { primaryConnected, primaryDomain, zoneRootElement } from "@/lib/domain/node-domains"
import { serviceUrl } from "@/lib/microservices/registry"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { diskPassport } from "@/lib/web4-items/dashboard-rows"
import { registryDescription } from "@/lib/web4-items/element-describe"

const ROOT = process.cwd()

type Lang = "en" | "ru"
type Entry = { id: string; kind?: string; required?: boolean; born?: boolean }
type Pulse = { event?: string; at?: string; last?: string; error?: string }
export type TgAsk = { id: string; text: string; why: string | null; hint: string | null; copy: string | null; by: string; byName: string | null; at: string; secret: { kind: string; name?: string; host?: string; label?: string } | null; action: string | null }
/**
 * The agent of an element or of the core (the owner, 2026-11-17: «на какой модели и с каким усилием работает главный агент … внутри каждого
 * элемента … аккаунт, модель, усилия … агент программирует, агент ожидает, агент спит … кнопка серая или активная собственный Telegram бот»).
 * Read from the node's records: the model and effort from the session's settings, the account from the agent's pulse, the bot from its
 * channel. `null` — not known yet (the default model, an agent that never ran).
 */
export type TgAgent = { mode: "coding" | "waiting" | "sleeping"; model: string | null; effort: string | null; ultracode: boolean; account: "node" | "own" | null; email: string | null; bot: string | null }
export type TgElement = { build: "building" | "queued" | null; id: string; name: string; native: boolean; required: boolean; on: boolean; offReason: string | null; live: boolean; step: string | null; turn: { event: string; at: string; last: string | null } | null; agent: TgAgent ; description: string | null; site: string | null; botLink: string | null }
/**
 * 2026-11-17 (the owner: «пульт как будто бы заморожен на определённом аккаунте»): a limit is measured only by an agent's turn (Claude Code
 * hands it to the status line); the account is read now, by code. `account` — the e-mail it was measured on; `stale` — measured on another
 * account than the one logged in now, or its reset time has passed: the gauge says so instead of showing an old number.
 */
export type TgLimit = { who: string; account: string | null; current: string | null; stale: boolean; fiveHour: { used: number; resetsAt: string | null } | null; sevenDay: { used: number; resetsAt: string | null } | null; at: string | null }
/** 2026-11-17 (the owner: «показать что … находится на сборке, и элементы в том числе»): the node's queue of element builds. */
export type TgBuilds = { running: boolean; current: string | null; queue: string[]; done: string[] }
export type TgChannel = { bot: boolean; state: string; why: string | null; since: string | null }
/** 788-1: how full the main agent's context window is — the same reading as `npm run session -- context`; `null` — no journal yet. */
export type TgContext = { used: number; window: number | null; percent: number | null; model: string; at: string | null }
export type TgState = { context: TgContext | null; builds: TgBuilds; asks: TgAsk[]; main: TgAgent & { channel: TgChannel; autostart: boolean | null }; elements: TgElement[]; limits: TgLimit[]; at: string }

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

function agentOf(id: string, live: boolean): TgAgent {
  const dir = join(ROOT, "data", "services", id)
  const mode = readJson<{ running?: boolean; model?: string; effort?: string; ultracode?: boolean }>(join(dir, "session-mode.json"), {})
  const pulse = readJson<{ last?: Pulse & { login?: string } }>(join(dir, "pulse.json"), {}).last
  const running = live || mode.running === true
  const login = pulse?.login
  const bot = readJson<{ username?: string } | null>(join(dir, "channel", "telegram", "bot.json"), null)?.username
  return {
    mode: !running ? "sleeping" : pulse?.event === "turn-start" ? "coding" : "waiting",
    model: typeof mode.model === "string" && mode.model ? mode.model : null,
    effort: typeof mode.effort === "string" && mode.effort ? mode.effort : null,
    // 779: the Pult's card shows Ultracode as the model when the running session was born with it
    ultracode: running && mode.ultracode === true,
    account: login === "node" ? "node" : typeof login === "string" && login.startsWith("own-") ? "own" : null,
    // 2026-11-17 (the owner: «указать … главный агент на каком аккаунте он работает то есть имейл»): the node's subscription — the e-mail of
    // the account logged in now; an element's own subscription is its person's, not shown here.
    email: login === "node" ? accountNow() : null,
    bot: typeof bot === "string" && /^[A-Za-z0-9_]{3,64}$/.test(bot) ? bot : null,
  }
}

function buildsOf(): TgBuilds {
  const d = readJson<{ running?: boolean; current?: string | null; queue?: string[]; results?: { id: string }[] }>(join(ROOT, "logs", "deploy-state.json"), {})
  const running = d.running === true
  return { running, current: running ? d.current ?? null : null, queue: running ? d.queue ?? [] : [], done: running ? (d.results ?? []).map((r) => r.id) : [] }
}

/**
 * 787-2: the element's public site — the rule of the domain ladder (`app/api/domain/subdomains`): with the node's main domain connected,
 * the element on its root answers on the zone itself, every other element with a server on `<address>.<zone>`; none — `null` (the
 * button says why). Never a loopback or a port: the Pult is read from the phone.
 */
function siteOf(id: string): string | null {
  const zone = primaryDomain()
  if (!zone || !primaryConnected() || !serviceUrl(id)) return null
  return id === zoneRootElement(serviceUrl) ? `https://${zone.name}` : `https://${addressOf(id) ?? id}.${zone.name}`
}

/** 787-2: one sentence of what the element is — its description taken into the core, else its passport's short line. */
function descriptionOf(e: Entry): string | null {
  try {
    return sentence(registryDescription(e.id)?.summary ?? diskPassport(e as Parameters<typeof diskPassport>[0]).short, 160)
  } catch { return null }
}

function elementsOf(lang: Lang, builds: TgBuilds): TgElement[] {
  const entries = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE, {}).services ?? []
  const live = new Set(((sessions() as { service: string; running?: boolean }[]) ?? []).filter((s) => s.running).map((s) => s.service))
  return entries.map((e): TgElement => {
    const off = power.offOf(e)
    let dir: string | null = null
    try { dir = (paths.entryDir(e) as string | null) ?? null; if (dir && !existsSync(dir)) dir = null } catch { dir = null }
    return {
      build: builds.current === e.id ? "building" : builds.queue.includes(e.id) && !builds.done.includes(e.id) ? "queued" : null,
      id: e.id,
      name: elementName(e.id, lang),
      native: e.kind !== "user",
      required: Boolean(e.required),
      on: !off,
      offReason: off ? (power.reasonIn(off, lang) as string) : null,
      live: live.has(e.id),
      step: e.kind === "user" ? stepOf(dir) : null,
      turn: turnOf(e.id),
      agent: agentOf(e.id, live.has(e.id)),
      description: descriptionOf(e),
      site: e.kind === "user" ? siteOf(e.id) : null,
      botLink: null,
    }
  }).map((x) => ({ ...x, botLink: x.agent.bot ? `https://t.me/${x.agent.bot}` : null }))
}

/** The e-mail of the Claude Code account logged in now (the node's own; an element's own subscription lives in its folder). */
function accountNow(): string | null {
  try {
    const e = readJson<{ oauthAccount?: { emailAddress?: string } }>(join(process.env.CLAUDE_CONFIG_DIR || homedir(), ".claude.json"), {}).oauthAccount?.emailAddress
    return typeof e === "string" && e.includes("@") ? e : null
  } catch { return null }
}

function limitsOf(): TgLimit[] {
  const dir = join(ROOT, "data", "node", "limits")
  if (!existsSync(dir)) return []
  const pick = (x: { used?: number; resetsAt?: string } | undefined) => (x && typeof x.used === "number" ? { used: x.used, resetsAt: x.resetsAt ?? null } : null)
  const now = accountNow()
  const past = (x: { resetsAt?: string } | undefined) => Boolean(x?.resetsAt && Date.parse(x.resetsAt) < Date.now())
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson<{ login?: string; element?: string; account?: string; fiveHour?: { used: number; resetsAt?: string }; sevenDay?: { used: number; resetsAt?: string }; at?: string } | null>(join(dir, f), null))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => {
      const node = l.login === "node"
      const account = l.account ?? null
      const current = node ? now : account
      return {
        who: node ? "node" : l.element ?? "?", account, current,
        stale: (node && Boolean(account && now && account !== now)) || past(l.fiveHour),
        fiveHour: pick(l.fiveHour), sevenDay: pick(l.sevenDay), at: l.at ?? null,
      }
    })
}

/** The whole picture for the Mini App, in the person's language. */
export function tgState(lang: Lang): TgState {
  const waiting = (asks.open(ROOT) as { id: string; text: string; why?: string | null; hint?: string | null; copy?: string | null; by?: string; at: string; secret?: TgAsk["secret"]; action?: string | null }[])
    .map((a) => ({
      id: a.id, text: a.text, why: a.why ?? null, hint: a.hint ?? null, copy: a.copy ?? null, by: a.by ?? "build", at: a.at,
      byName: a.by && a.by !== "build" ? elementName(a.by, lang) : null,
      secret: a.secret ? { kind: a.secret.kind, ...(a.secret.name ? { name: a.secret.name } : {}), ...(a.secret.host ? { host: a.secret.host } : {}), ...(a.secret.label ? { label: a.secret.label } : {}) } : null,
      // 781-5: the request's button does the act (the autostart)
      action: a.action === "autostart" ? "autostart" : null,
    }))
  const builds = buildsOf()
  // 781-4: the main agent's card carries its channel — «спит — Разбудить», «не слышит — Переподключить» (`lib/node/main-channel.cjs`).
  const c = contextWindow.read(ROOT) as (TgContext & { session: string }) | null
  const context: TgContext | null = c ? { used: c.used, window: c.window, percent: c.percent, model: c.model, at: c.at } : null
  return { context, builds, asks: waiting, main: { ...agentOf("build", false), channel: mainChannel.health(ROOT, "build") as TgChannel, autostart: autostart.state().on as boolean | null }, elements: elementsOf(lang, builds), limits: limitsOf(), at: new Date().toISOString() }
}
