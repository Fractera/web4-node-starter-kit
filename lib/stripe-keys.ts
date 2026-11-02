import "server-only"
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { readVar, setNames, STRIPE_NAMES, targetDir, type StripeName, writeVar } from "@/lib/env-file"

// КЛЮЧИ STRIPE ЦЕЛИ — ЯДРА ИЛИ ЭЛЕМЕНТА (530-1). Владелец 2026-10-18: «На вкладке настройки создать вкладку платежи … веб два и web3 в
// одной у нас будет настраиваться страйп». Web2 — приём карт сайтом: ключи аккаунта Stripe человека в `.env.local` цели.
//
// 🔒 ЗНАЧЕНИЯ НАРУЖУ НЕ УХОДЯТ НИКОГДА — ни на страницу, ни в ответ двери: только имена заданных и режим (test/live) по приставке.
// 🔒 СЕКРЕТНЫЙ КЛЮЧ И КЛЮЧ АГЕНТА ПРОВЕРЯЮТСЯ НАСТОЯЩИМ ВЫЗОВОМ STRIPE ДО ЗАПИСИ (`GET /v1/balance`): формат не доказывает, что ключ
// живой (тот же закон, что у ключа OpenAI, 336-1). Отказ — файл не тронут. Публикуемый ключ и секрет вебхука проверяются форматом.
// 🔒 КОД ПРИЁМА ПЛАТЕЖЕЙ ЗДЕСЬ НЕ ЖИВЁТ: его двери — в элементе Stripe (573-3), он читает эти переменные при старте — новый ключ
// действует после перезапуска элемента.
// 573-4 (владелец 2026-10-22: «Скорее всего у него есть специальный mcp … сделай так чтобы подключать использовать его было элементарно»):
// ключ агента — ограниченный ключ `rk_test_…`/`rk_live_…`, созданный с меткой агента (docs.stripe.com/keys, «API keys for autonomous
// agents»); сервер MCP Stripe с декабря 2026 принимает только такие ключи или OAuth (docs.stripe.com/mcp). После записи ядро зовёт
// `scripts/stripe-mcp.mjs` элемента: мост ядра запускает агента со своим окружением, поэтому `${VAR}` в `.mcp.json` не подставился бы —
// файл пишет сам элемент, со значением, вне git.

export type StripeInput = { secretKey?: string; publishableKey?: string; webhookSecret?: string; agentKey?: string }
export type StripeMode = "test" | "live" | null
export type McpState = "on" | "off" | "failed" | "no-script"

const SECRET = /^(sk|rk)_(test|live)_[A-Za-z0-9]{10,250}$/
const PUBLISHABLE = /^pk_(test|live)_[A-Za-z0-9]{10,250}$/
const WEBHOOK = /^whsec_[A-Za-z0-9+/=]{10,250}$/
const AGENT = /^rk_(test|live)_[A-Za-z0-9]{10,250}$/

export const modeOf = (key: string): StripeMode => (key.includes("_live_") ? "live" : key.includes("_test_") ? "test" : null)

/** Что задано у цели: имена и режим секретного ключа. Значений нет. */
export function stripeState(target: string): { set: StripeName[]; mode: StripeMode } {
  const set = setNames(target).filter((n): n is StripeName => (STRIPE_NAMES as readonly string[]).includes(n))
  return { set, mode: modeOf(readVar(target, "STRIPE_SECRET_KEY")) }
}

/** Проверка тела: формат каждого поданного ключа и один режим у секретного, публикуемого и ключа агента. Отказ называет род. */
export function parseStripe(body: unknown): { ok: true; value: StripeInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>
  const pick = (k: string) => (typeof b[k] === "string" && (b[k] as string).trim() !== "" ? (b[k] as string).trim() : undefined)
  const secretKey = pick("secretKey")
  const publishableKey = pick("publishableKey")
  const webhookSecret = pick("webhookSecret")
  const agentKey = pick("agentKey")
  if (!secretKey && !publishableKey && !webhookSecret && !agentKey) return { ok: false, error: "empty" }
  if (secretKey && !SECRET.test(secretKey)) return { ok: false, error: "bad-secret" }
  if (publishableKey && !PUBLISHABLE.test(publishableKey)) return { ok: false, error: "bad-publishable" }
  if (webhookSecret && !WEBHOOK.test(webhookSecret)) return { ok: false, error: "bad-webhook" }
  if (agentKey && !AGENT.test(agentKey)) return { ok: false, error: "bad-agent" }
  if (secretKey && publishableKey && modeOf(secretKey) !== modeOf(publishableKey)) return { ok: false, error: "mode-mismatch" }
  if (secretKey && agentKey && modeOf(secretKey) !== modeOf(agentKey)) return { ok: false, error: "agent-mode-mismatch" }
  return { ok: true, value: { secretKey, publishableKey, webhookSecret, agentKey } }
}

/** Живой ли ключ: 200 — да; 403 — ключ настоящий, но без права на баланс (ограниченный); 401 — отвергнут. */
export async function probeStripe(key: string): Promise<"ok" | "key-rejected" | "probe-failed"> {
  try {
    const r = await fetch("https://api.stripe.com/v1/balance", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) })
    if (r.ok || r.status === 403) return "ok"
    return r.status === 401 ? "key-rejected" : "probe-failed"
  } catch {
    return "probe-failed"
  }
}

/** Записать поданные ключи в `.env.local` цели (только после проверки). */
export function saveStripe(target: string, v: StripeInput): boolean {
  const pairs: [StripeName, string | undefined][] = [
    ["STRIPE_SECRET_KEY", v.secretKey],
    ["STRIPE_PUBLISHABLE_KEY", v.publishableKey],
    ["STRIPE_WEBHOOK_SECRET", v.webhookSecret],
    ["STRIPE_AGENT_API_KEY", v.agentKey],
  ]
  for (const [name, value] of pairs) if (value && !writeVar(target, name, value)) return false
  return true
}

/**
 * Сервер MCP Stripe агента элемента — по его ключу агента: элемент сам пишет свой `.mcp.json` (`npm run mcp:stripe`, 573-4).
 * 🛑 Окружение чистое (351): родитель — сервер Next ядра. Скрипта нет (элемент старше v1.2.0) — `no-script`, ключ всё равно сохранён.
 */
export function syncStripeMcp(target: string): McpState {
  const dir = targetDir(target)
  const script = dir ? join(dir, "scripts", "stripe-mcp.mjs") : ""
  if (!dir || !existsSync(script)) return "no-script"
  const env: NodeJS.ProcessEnv = { ...process.env, ELEMENT_DIR: dir }
  for (const k of Object.keys(env)) if (k.startsWith("__NEXT") || k.startsWith("NEXT_") || k.startsWith("WEB4_") || k === "PORT" || k === "HOSTNAME" || k === "NODE_ENV") delete env[k]
  const r = spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8", windowsHide: true, timeout: 15_000, env })
  const out = r.stdout ?? ""
  return out.includes("===MCP_STRIPE_ON===") ? "on" : out.includes("===MCP_STRIPE_OFF===") ? "off" : "failed"
}
