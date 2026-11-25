// WHAT «ПУЛЬТ УЗЛА» IN TELEGRAM SHOWS (node step 771-2). The owner, 2026-11-16: «раз уже я больше большую часть времени собираюсь
// проводить в Telegram …» — the node's own Mini App, opened by the main agent's bot. Read here, by code, no model: the requests waiting
// for the person (the action window's, 761-16), every element with its power and where its development stands (the same records
// `npm run where` reads), the subscription's limits. Never a value of a secret, never a full address of a tab, never the node's keys.
import { quizGlance, type QuizGlance } from "@/lib/web4-items/product-quiz"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"

import asks from "@/lib/node/person-asks.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import mainChannel from "@/lib/node/main-channel.cjs"
import autostart from "@/lib/node/autostart.cjs"
import power from "@/lib/web4-items/element-power.cjs"
import paths from "@/lib/web4-items/paths.cjs"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { isNativeElement } from "@/lib/a2a/element-passport"
import { list as sessions } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/session.cjs"
import contextWindow from "@/lib/agent-kit/context-window.cjs"
import { primaryConnected, primaryDomain, zoneRootElement } from "@/lib/domain/node-domains"
import { serviceUrl } from "@/lib/microservices/registry"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { diskPassport } from "@/lib/web4-items/dashboard-rows"
import { registryDescription } from "@/lib/web4-items/element-describe"
import { metaForLang } from "@/config/app-config"
import { readPlace } from "@/lib/node-state/place"
import bases from "@/lib/auth/sign-in-bases.cjs"
import { elementMemory } from "@/lib/web4-items/machine"
import claudeAccount from "@/lib/agent-kit/claude-account.cjs"

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
export type TgAgent = { mode: "coding" | "waiting" | "sleeping"; model: string | null; effort: string | null; ultracode: boolean; account: "node" | "own" | null; email: string | null; bot: string | null; botReady: boolean }
export type TgElement = { build: "building" | "queued" | null; serve: TgServe; claude: "own" | "node" | "none"; subscription: string | null; id: string; name: string; native: boolean; required: boolean; on: boolean; offReason: string | null; live: boolean; step: string | null; turn: { event: string; at: string; last: string | null } | null; agent: TgAgent ; description: string | null; site: string | null; botLink: string | null; glance: TgGlance; quiz: QuizGlance | null }
/** 840-2 (the owner, Telegram 942: «на каждом элементе сразу видно его учетную запись … контекстного окна … расход подписки»). */
export type TgGlance = { account: string | null; context: number | null; fiveHour: number | null }
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
/** 816 (the owner, 2026-11-20, Telegram 249: «Верхняя строка … должна содержать в себе название этого узла берётся из CONFIG проекта.
 *  Ниже покажи является ли это локальная или vps»): the site name from CONFIG (the same as the pages' titles) and where the node lives —
 *  the detected place (`lib/hosting/place.mjs`), never a guess; on a server, its panel's own address. */
export type TgNode = { name: string | null; place: "home" | "server" | "unknown"; web: string | null }
/** 818 (the owner, Telegram 374–378: the server's panel said «идёт сборка ядра», its Pult «узел в сети · агент спит · Разбудить»): the
 *  node's update — the same record the terminal's watcher reads (`data/node/node-update.json`, a dead pid is no update). */
export type TgUpdate = { running: boolean; stage: string | null; since: string | null }
export type TgState = { update: TgUpdate | null; node: TgNode; context: TgContext | null; builds: TgBuilds; asks: TgAsk[]; main: TgAgent & { channel: TgChannel; autostart: boolean | null }; elements: TgElement[]; limits: TgLimit[]; at: string }

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

function ownBeforeTurn(id: string): "own" | null {
  if (id === "build") return null
  try { return claudeAccount.accountOf(ROOT, id) === "own" ? "own" : null } catch { return null }
}

function agentOf(id: string, live: boolean): TgAgent {
  const dir = join(ROOT, "data", "services", id)
  const mode = readJson<{ running?: boolean; model?: string; effort?: string; ultracode?: boolean }>(join(dir, "session-mode.json"), {})
  const pulse = readJson<{ last?: Pulse & { login?: string } }>(join(dir, "pulse.json"), {}).last
  const running = live || mode.running === true
  const login = pulse?.login
  const bot = readJson<{ username?: string } | null>(join(dir, "channel", "telegram", "bot.json"), null)?.username
  // 839: a bot nobody pressed Start in yet admits nobody — the Pult keeps its window open on «Нажмите Start» instead of a dead link
  const admitted = readJson<{ allowFrom?: unknown[] } | null>(join(dir, "channel", "telegram", "access.json"), null)?.allowFrom
  return {
    mode: !running ? "sleeping" : pulse?.event === "turn-start" ? "coding" : "waiting",
    model: typeof mode.model === "string" && mode.model ? mode.model : null,
    effort: typeof mode.effort === "string" && mode.effort ? mode.effort : null,
    // 779: the Pult's card shows Ultracode as the model when the running session was born with it
    ultracode: running && mode.ultracode === true,
    // 839-2: before its first turn an element's pulse names no login — its own account is read from its files (existence), never «unknown»
    account: login === "node" ? "node" : typeof login === "string" && login.startsWith("own-") ? "own" : ownBeforeTurn(id),
    // 2026-11-17 (the owner: «указать … главный агент на каком аккаунте он работает то есть имейл»): the node's subscription — the e-mail of
    // the account logged in now; an element's own subscription is its person's, not shown here.
    email: login === "node" ? accountNow() : null,
    bot: typeof bot === "string" && /^[A-Za-z0-9_]{3,64}$/.test(bot) ? bot : null,
    botReady: Array.isArray(admitted) && admitted.length > 0,
  }
}

/** 821: one element's own agent card and the fill of its context window, for that element's own Mini App (the core's door
 *  GET /api/node/my-agent) — what the Pult shows of it, never another element's. The e-mail of the node's subscription is the architect's:
 *  it never goes to an element (an app of its own has another owner). The context — the record its status line writes (limits.cjs). */
export type TgOwnLimits = { fiveHour: { used: number; resetsAt: string | null } | null; sevenDay: { used: number; resetsAt: string | null } | null; at: string | null }
export type TgNative = { name: string; description: string | null; on: boolean }
export type TgOwnAgent = { agent: TgAgent; live: boolean; context: { percent: number; size: number | null; used: number | null } | null; limits: TgOwnLimits | null; asks: { text: string; at: string }[]; natives: TgNative[] }
export function ownAgentOf(id: string, lang: Lang = "en"): TgOwnAgent {
  const live = ((sessions() as { service: string; running?: boolean }[]) ?? []).some((s) => s.service === id && s.running)
  const agent = agentOf(id, live)
  // 840-1 (the owner, Telegram 954: «не хватало раздела лимит текущей сессии и недельный лимит»): the limits of the account this element
  // runs on — its own (own-<id>.json) or the node's; only the numbers, never the node's e-mail.
  // 840-4 (the owner's mock A, Telegram 969/971: the element's home «как у пульта»): its OWN account's e-mail, masked — never the node's (the
  // architect's); and «Ждёт вас» — the person's acts THIS element asked for (its windows), only their words and time.
  let email: string | null = null
  if (agent.account === "own") { try { email = masked(claudeAccount.ownEmail(ROOT, id) as string | null) } catch { email = null } }
  const mine = (asks.open(ROOT) as { text: string; by?: string; at: string }[]).filter((a) => a.by === id).map((a) => ({ text: a.text, at: a.at }))
  return { agent: { ...agent, email }, live, context: contextOf(id), limits: limitsFor(id, agent.account), asks: mine, natives: nativesOf(lang) }
}

/** 853 (Roma 2026-11-24 via the fractera.ai server's agent, approved 1296): a NATIVE element's Mini App is the core's three parts — its
 *  agent's token use (context window and the account's limits), its site and the way back to its chat. Null for a custom element (its
 *  Mini App is its own `/tg`) and for an id the registry does not know. */
export type TgElementApp = { id: string; name: string; site: string | null; live: boolean; agent: TgAgent; context: TgOwnAgent["context"]; limits: TgOwnLimits | null; quiz: (QuizGlance & { href: string | null }) | null }
export function elementAppOf(id: string, lang: Lang = "en"): TgElementApp | null {
  const e = (readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE, {}).services ?? []).find((x) => x.id === id)
  // ✗ 2026-11-25 (Roma: the marketplace has no button): a native BORN on the node is kind `user` — the passport decides, as everywhere
  if (!e || !(e.kind === "core" || isNativeElement(id))) return null
  const own = ownAgentOf(id, lang)
  // ✗ 2026-11-25 fractera.ai («for-mac-quiz-visibility» §3): a native's bot had no way to its product quiz — one line when its tree exists,
  // leading to the quiz page on the node's HTTPS address (the Mini App law 848: navigation to the project's real pages)
  const glance = quizGlance(id)
  const base = (asksTg as { httpsBase: (root: string) => string | null }).httpsBase(ROOT)
  const quiz = glance ? { ...glance, href: base ? `${base}/${lang}/${addressOf(id) ?? id}/product-design/quiz` : null } : null
  return { id, name: elementName(id, lang), site: siteOf(id), live: own.live, agent: own.agent, context: own.context, limits: own.limits, quiz }
}

/** 841 (the owner, Telegram 963: «вкладку нативной элементы внутри кастомного элемента … показываем например два и пишем ещё»): the node's
 *  native elements — standard on every node, so nothing of this node's own composition leaks: the name, what it does, on or off. */
function nativesOf(lang: Lang): TgNative[] {
  const entries = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE, {}).services ?? []
  return entries.filter((e) => e.kind !== "user").map((e) => ({ name: elementName(e.id, lang), description: descriptionOf(e), on: !power.offOf(e) }))
}

/** The fill of an element's context window — the record its status line writes (limits.cjs). */
function contextOf(id: string): { percent: number; size: number | null; used: number | null } | null {
  const rec = readJson<{ used?: number; size?: number; tokens?: number } | null>(join(ROOT, "data", "services", id, "context.json"), null)
  return rec && typeof rec.used === "number" ? { percent: rec.used, size: typeof rec.size === "number" ? rec.size : null, used: typeof rec.tokens === "number" ? rec.tokens : null } : null
}

/** 840: the limits of the account an element runs on — its own record, or the node's when it runs on the node's subscription. */
function limitsFor(id: string, account: TgAgent["account"]): TgOwnLimits | null {
  const file = account === "own" ? `own-${id}.json` : account === "node" ? "node.json" : null
  if (!file) return null
  const l = readJson<{ fiveHour?: { used?: number; resetsAt?: string }; sevenDay?: { used?: number; resetsAt?: string }; at?: string } | null>(join(ROOT, "data", "node", "limits", file), null)
  if (!l) return null
  const pick = (x: { used?: number; resetsAt?: string } | undefined) => (x && typeof x.used === "number" ? { used: x.used, resetsAt: x.resetsAt ?? null } : null)
  return { fiveHour: pick(l.fiveHour), sevenDay: pick(l.sevenDay), at: l.at ?? null }
}

/** 840-2: «r6…@gmail.com» — an account shown in a list without spelling out the whole address. */
function masked(email: string | null): string | null {
  if (!email) return null
  const [user, host] = email.split("@")
  return host ? `${user.slice(0, 2)}…@${host}` : null
}

function updateOf(): TgUpdate | null {
  const u = readJson<{ state?: string; stage?: string; pid?: number; startedAt?: string } | null>(join(ROOT, "data", "node", "node-update.json"), null)
  if (u?.state !== "running") return null
  if (u.pid) { try { process.kill(u.pid, 0) } catch { return null } }
  return { running: true, stage: typeof u.stage === "string" && u.stage ? u.stage : null, since: typeof u.startedAt === "string" ? u.startedAt : null }
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

/**
 * 832 (the owner, Telegram 619, 2026-11-21 19:12: «вижу такую надпись [Сайт обновляется] но при этом если я открываю пульт то в нём нет
 * информации что например идёт сборка или ещё что-то такое»): why a turned-on element's site shows the node's «updating» page while no
 * build holds it — its folder is moving to a new address (`data/services/<id>/move.json`, `scripts/element-move.mjs`), or its server is
 * not running (pm2: errored, stopped, waiting restart) or still starting. `null` — it serves, or the node does not know (pm2 silent).
 */
export type TgServe = "moving" | "starting" | "down" | null
const MOVE_FRESH_MS = 15 * 60_000
function serveOf(e: Entry, on: boolean, build: TgElement["build"], procs: Map<string, string> | null): TgServe {
  if (!on || build) return null
  const m = readJson<{ state?: string; at?: string } | null>(join(ROOT, "data", "services", e.id, "move.json"), null)
  if (m?.state === "moving" && m.at && Date.now() - Date.parse(m.at) < MOVE_FRESH_MS) return "moving"
  const status = procs?.get(e.id)
  if (!status || status === "online" || status === "off") return null
  return status === "launching" ? "starting" : "down"
}

/** 833-1: whose Claude account the element's agent runs on (`lib/agent-kit/claude-account.cjs`); the core and natives never «none». */
function claudeOf(e: Entry): TgElement["claude"] {
  if (e.kind !== "user") return "node"
  try { return claudeAccount.accountOf(ROOT, e.id) as TgElement["claude"] } catch { return "node" }
}

/** 833-2: the element's «Подписка Claude Code» on the node's own address (the person opens it on the computer). */
function subscriptionUrl(id: string, lang: Lang): string | null {
  let web: string | null = null
  try { web = (bases.signInBases(ROOT) as { web?: string | null }).web ?? null } catch { /* no domain */ }
  return web ? `${web.replace(/\/+$/, "")}${claudeAccount.subscriptionPath(ROOT, id, lang)}` : null
}

function elementsOf(lang: Lang, builds: TgBuilds, procs: Map<string, string> | null): TgElement[] {
  const entries = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE, {}).services ?? []
  const live = new Set(((sessions() as { service: string; running?: boolean }[]) ?? []).filter((s) => s.running).map((s) => s.service))
  return entries.map((e): TgElement => {
    const off = power.offOf(e)
    let dir: string | null = null
    try { dir = (paths.entryDir(e) as string | null) ?? null; if (dir && !existsSync(dir)) dir = null } catch { dir = null }
    const build: TgElement["build"] = builds.current === e.id ? "building" : builds.queue.includes(e.id) && !builds.done.includes(e.id) ? "queued" : null
    return {
      build,
      serve: serveOf(e, !off, build, procs),
      // 833-2: on a server an element's agent runs only on its own Claude account — «none» is a red mark and a line in «Ждёт вас»
      claude: claudeOf(e),
      subscription: claudeOf(e) === "none" ? subscriptionUrl(e.id, lang) : null,
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
      glance: glanceOf(e),
      // 852-8: the Pult lists only the elements whose quiz tree has started, with a link to each one's bot.
      quiz: quizGlance(e.id),
    }
  }).map((x) => ({ ...x, botLink: x.agent.bot ? `https://t.me/${x.agent.bot}` : null }))
}

/** 840-2: the second line of an element in the Pult — the account it runs on (masked), its context fill, the 5-hour use of that account. */
function glanceOf(e: Entry): TgGlance {
  const account = claudeOf(e)
  let email: string | null = null
  if (account === "own") { try { email = claudeAccount.ownEmail(ROOT, e.id) as string | null } catch { email = null } }
  else if (account === "node") email = accountNow()
  const limits = account === "none" ? null : limitsFor(e.id, account)
  return { account: masked(email), context: contextOf(e.id)?.percent ?? null, fiveHour: limits?.fiveHour?.used ?? null }
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

/** 832: every element's pm2 status by id (`off` for a turned-off one); `null` — pm2 did not answer, the Pult then says nothing of it. */
async function processes(): Promise<Map<string, string> | null> {
  const rows = await elementMemory().catch(() => null)
  return rows ? new Map(rows.filter((r) => r.kind === "element").map((r) => [r.id, r.status])) : null
}

/** The whole picture for the Mini App, in the person's language. */
function nodeOf(lang: Lang): TgNode {
  let name: string | null = null
  try { name = metaForLang(lang).siteName.trim() || null } catch { /* no config — the title alone */ }
  let web: string | null = null
  try { web = (bases.signInBases(ROOT) as { web?: string | null }).web ?? null } catch { /* no domain */ }
  return { name, place: readPlace().kind, web }
}

export async function tgState(lang: Lang): Promise<TgState> {
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
  // 818 (the owner, Telegram 352: «почему пульт врёт?»): the main agent's card counts its live session too, never the record alone.
  const mainLive = ((sessions() as { service: string; running?: boolean }[]) ?? []).some((s) => s.service === "build" && s.running)
  return { update: updateOf(), node: nodeOf(lang), context, builds, asks: waiting, main: { ...agentOf("build", mainLive), channel: mainChannel.health(ROOT, "build") as TgChannel, autostart: autostart.state().on as boolean | null }, elements: elementsOf(lang, builds, await processes()), limits: limitsOf(), at: new Date().toISOString() }
}
