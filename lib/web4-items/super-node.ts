import "server-only"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { readWallet } from "@/lib/web4-items/node-wallet"

// СУПЕР-УЗЕЛ — ТО, ЧТО ХРАНИТ УЗЕЛ ОПЕРАТОРА, И ЕГО КЛИЕНТ API ОПЕРАТОРА (530-3, 531). Владелец 2026-10-18: «Супер узел это отдельный
// компьютер … разработать API … между машиной пользователя … и сервером на котором будет стоять супер узел»; «сервер будет развёрнут из
// установочного пакета после того как ваша заявка будет одобрена у вас будет 48 … можете использовать домашний мощный компьютер».
// Правила — документы Lagrix 05 §5.6, 06, 09, 14, 15 §15.7 (API оператора, версия 1), 17.9, 18.4, записи 32 и 45.
//
// 🔒 МАШИНА УЗЛА НЕ МЕРИТСЯ: супер-узел — своя машина (выделенный сервер или мощный домашний компьютер); её оборудование, предупреждения,
// итоги проверок и выплаты узел читает у неё по API оператора v1 (`/operator/v1/*`, ключ оператора). 🪦 До 531 здесь мерился компьютер
// узла (`machine-facts.ts`) — снято словом владельца: «ты не должен проверять текущий компьютер на котором работает пользователь».
// 🔒 КЛЮЧ ОПЕРАТОРА НЕ УХОДИТ В БРАУЗЕР: страница знает только адрес сервера и есть ли ключ.
// 🔒 СЕТИ ЕЩЁ НЕТ: одобрение придёт из контракта; в прототипе его можно имитировать кнопкой, подписанной «прототип». Таймеров и опроса нет.
// 🔒 ФАЙЛ ВНЕ GIT (`data/*`): решения и ключ владельца машины.

export type SuperNodeStatus = "submitted" | "approved"
export type SuperNodeApplication = { status: SuperNodeStatus; wallet: string; at: string; approvedAt?: string }
export type SuperNodeSettings = { country: string; coverage: string[]; regional: string[]; lists: string[] }
export type Hardware = {
  cpus: number; cpuModel: string; aes: boolean | null; ramGb: number; diskTotalGb: number | null; diskFreeGb: number | null
  nvme: boolean | null; bandwidthMbps: number | null; publicIPv4: string | null; ipv6: string | null; platform?: string; measuredAt: string
}
export type TestRow = { name: "cpus" | "aes" | "ram" | "disk" | "nvme" | "bandwidth" | "ipv4" | "ipv6"; need: string; have: string; verdict: "ok" | "short" | "unknown" }
export type SuperNodeTest = { at: string; verdict: "ok" | "short"; rows: TestRow[]; platform: string }
type Server = { url: string; key: string }
type State = { application: SuperNodeApplication | null; settings: SuperNodeSettings | null; server: Server | null; lastTest: SuperNodeTest | null }

const FILE = join(process.cwd(), "data", "node", "super-node.json")
export const TIER2 = { cpus: 8, ramGb: 16, diskGb: 500, bandwidthMbps: 1000 } as const // документ 14 §14.2
export const APPROVAL_HOURS = 48 // документ 05 §5.6

function read(): State {
  try {
    const s = JSON.parse(readFileSync(FILE, "utf8")) as Partial<State>
    return { application: s.application ?? null, settings: s.settings ?? null, server: s.server ?? null, lastTest: s.lastTest ?? null }
  } catch {
    return { application: null, settings: null, server: null, lastTest: null }
  }
}

function write(s: State): void {
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify(s, null, 2)}\n`)
}

/** Состояние для страницы: без ключа оператора. */
export function readSuperNode() {
  const s = read()
  return { application: s.application, settings: s.settings, lastTest: s.lastTest, server: s.server ? { url: s.server.url } : null, wallet: readWallet()?.address ?? null }
}

/** Подать заявку: от кошелька узла (док. 05 §5.6 — одна заявка на кошелёк); без кошелька — `no-wallet`. Сервер для заявки не нужен. */
export function applySuperNode(): "ok" | "no-wallet" {
  const wallet = readWallet()
  if (!wallet) return "no-wallet"
  const s = read()
  if (!s.application) s.application = { status: "submitted", wallet: wallet.address, at: new Date().toISOString() }
  write(s)
  return "ok"
}

export function withdrawSuperNode(): void {
  const s = read()
  s.application = null
  s.lastTest = null
  write(s)
}

/** Прототип: в сети одобрение (приглашение) придёт из контракта; здесь его можно имитировать, чтобы увидеть состояние «одобрена». */
export function simulateApproval(): "ok" | "no-application" {
  const s = read()
  if (!s.application) return "no-application"
  s.application = { ...s.application, status: "approved", approvedAt: new Date().toISOString() }
  write(s)
  return "ok"
}

const trim = (u: string) => u.trim().replace(/\/+$/, "")

/** Запрос к API оператора v1 на машине супер-узла. */
async function call(server: Server, path: string, init?: RequestInit): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${server.url}/operator/v1/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${server.key}`, "content-type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/** Подключить машину супер-узла: адрес и ключ оператора проверяются запросом `status` до записи. */
export async function connectServer(rawUrl: unknown, rawKey: unknown): Promise<"ok" | "bad-url" | "bad-key" | "unreachable"> {
  if (typeof rawUrl !== "string" || typeof rawKey !== "string") return "bad-url"
  let u: URL
  try { u = new URL(trim(rawUrl)) } catch { return "bad-url" }
  if (u.protocol !== "https:" && u.protocol !== "http:") return "bad-url"
  const key = rawKey.trim()
  if (key.length < 16 || key.length > 256 || /\s/.test(key)) return "bad-key"
  const server = { url: trim(rawUrl), key }
  try {
    const r = await call(server, "status")
    if (r.status === 401) return "bad-key"
    if (r.status !== 200) return "unreachable"
  } catch {
    return "unreachable"
  }
  const s = read()
  s.server = server
  write(s)
  return "ok"
}

export function disconnectServer(): void {
  const s = read()
  s.server = null
  write(s)
}

export type RemotePart = "status" | "hardware" | "notices" | "payouts" | "declaration"

/** Прочитать часть API оператора; нет подключения — `not-connected`, отказ сервера — его код. */
export async function remote(part: RemotePart): Promise<{ ok: true; data: unknown } | { ok: false; error: string; status: number }> {
  const s = read()
  if (!s.server) return { ok: false, error: "not-connected", status: 409 }
  try {
    const r = await call(s.server, part)
    if (r.status === 200) return { ok: true, data: r.body }
    return { ok: false, error: r.status === 401 ? "bad-key" : "server-error", status: 502 }
  } catch {
    return { ok: false, error: "unreachable", status: 502 }
  }
}

/** Оборудование против профиля Tier-2 — строки «нужно / есть». Одна функция на два места: тест сервера супер-узла и Dashboard → «Этот
 *  компьютер» (572). Что не измерено (`null`) — «—» и «не измерено», не догадка. */
export function tier2Rows(h: Hardware): TestRow[] {
  const v = (cond: boolean | null): TestRow["verdict"] => (cond === null ? "unknown" : cond ? "ok" : "short")
  const num = (n: number | null | undefined, unit: string) => (typeof n === "number" ? `${n} ${unit}` : "—")
  return [
    { name: "cpus", need: `${TIER2.cpus} vCPU`, have: `${h.cpus}${h.cpuModel ? ` · ${h.cpuModel}` : ""}`, verdict: v(typeof h.cpus === "number" ? h.cpus >= TIER2.cpus : null) },
    { name: "aes", need: "AES-NI", have: h.aes === null ? "—" : h.aes ? "AES-NI" : "—", verdict: v(h.aes) },
    { name: "ram", need: `${TIER2.ramGb} GB`, have: num(h.ramGb, "GB"), verdict: v(typeof h.ramGb === "number" ? h.ramGb >= TIER2.ramGb : null) },
    { name: "disk", need: `${TIER2.diskGb} GB`, have: num(h.diskTotalGb, "GB"), verdict: v(typeof h.diskTotalGb === "number" ? h.diskTotalGb >= TIER2.diskGb : null) },
    { name: "nvme", need: "NVMe", have: h.nvme === null ? "—" : h.nvme ? "NVMe" : "—", verdict: v(h.nvme) },
    { name: "bandwidth", need: "1 Gbit/s", have: num(h.bandwidthMbps, "Mbit/s"), verdict: v(typeof h.bandwidthMbps === "number" ? h.bandwidthMbps >= TIER2.bandwidthMbps : null) },
    { name: "ipv4", need: "IPv4", have: h.publicIPv4 ?? "—", verdict: v(h.publicIPv4 ? true : null) },
    { name: "ipv6", need: "/64", have: h.ipv6 ?? "—", verdict: v(h.ipv6 ? true : null) },
  ]
}

/** «Пройти тест»: оборудование машины супер-узла против профиля Tier-2; итог сохраняется. Канал и адреса — только если сервер их измерил. */
export async function runTest(): Promise<{ ok: true; test: SuperNodeTest } | { ok: false; error: string; status: number }> {
  const got = await remote("hardware")
  if (!got.ok) return got
  const h = got.data as Hardware
  const rows = tier2Rows(h)
  const test: SuperNodeTest = { at: new Date().toISOString(), verdict: rows.some((r) => r.verdict === "short") ? "short" : "ok", rows, platform: h.platform ?? "" }
  const s = read()
  s.lastTest = test
  write(s)
  return { ok: true, test }
}

const COUNTRY = /^[A-Z]{2}$/
const TAG = /^[a-z0-9][a-z0-9-]{0,62}$/

/** Проверка настроек; отказ называет род: `bad-country`, `bad-tag`, `overlap`, `bad-list`. */
export function parseSettings(body: unknown): { ok: true; value: SuperNodeSettings } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>
  const country = typeof b.country === "string" ? b.country.trim().toUpperCase() : ""
  if (!COUNTRY.test(country)) return { ok: false, error: "bad-country" }
  const tags = (v: unknown): string[] | null => {
    if (!Array.isArray(v)) return null
    const out = [...new Set(v.map((x) => (typeof x === "string" ? x.trim().toLowerCase() : "")).filter(Boolean))]
    return out.length <= 200 && out.every((t) => TAG.test(t)) ? out : null
  }
  const coverage = tags(b.coverage)
  const regional = tags(b.regional)
  if (!coverage || !regional) return { ok: false, error: "bad-tag" }
  if (coverage.some((t) => regional.includes(t))) return { ok: false, error: "overlap" }
  if (!Array.isArray(b.lists) || b.lists.length > 20) return { ok: false, error: "bad-list" }
  const lists: string[] = []
  for (const x of b.lists) {
    if (typeof x !== "string" || !x.trim()) continue
    try { if (new URL(x.trim()).protocol !== "https:") return { ok: false, error: "bad-list" } } catch { return { ok: false, error: "bad-list" } }
    lists.push(x.trim())
  }
  return { ok: true, value: { country, coverage, regional, lists } }
}

/** Сохранить настройки на узле и, если машина супер-узла подключена, отдать ей декларацию (`PUT declaration`). */
export async function saveSettings(v: SuperNodeSettings): Promise<{ pushed: boolean | null }> {
  const s = read()
  s.settings = v
  write(s)
  if (!s.server) return { pushed: null }
  try {
    const r = await call(s.server, "declaration", { method: "PUT", body: JSON.stringify(v) })
    return { pushed: r.status === 200 }
  } catch {
    return { pushed: false }
  }
}
