import "server-only"
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { randomBytes } from "node:crypto"
import { join } from "node:path"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { addressOf } from "@/lib/web4-items/element-address"
import factory from "@/lib/node/bot-factory.cjs"

// ONE TAP, TWO DOORS (node step 798-2/798-4). The panel's bot page (`/api/node/bot-factory`) and the Pult in Telegram
// (`/api/node/tg-app`, action `botCreate`) start a bot's creation the same way: a suggested name and address, Telegram's own link, and a
// detached waiter (`scripts/bot-factory-wait.mjs`) that connects the new bot to the service's channel. Each door keeps its own lock.

const ROOT = process.cwd()
const WAIT = join(ROOT, "data", "node", "bot-factory-wait.json")
const SERVICE = /^[a-z0-9][a-z0-9-]{0,40}$/

export type FactoryWait = { service?: string; username?: string; state?: string; error?: string; bot?: { username?: string; tail?: string } }

const alive = (pid: unknown) => { try { process.kill(Number(pid), 0); return true } catch { return false } }
const zone = (): string => { try { return String((JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")) as { zone?: unknown }).zone ?? "") } catch { return "" } }
const hasKit = (s: string) => existsSync(join(ROOT, "app", "[lang]", "(architectLayer)", "architect", s, "_agent-kit")) || existsSync(join(ROOT, "data", "services", s))

/** The last creation as a page may see it (never a token); a waiter that died reads «stopped». */
export function factoryWait(): FactoryWait | null {
  let w: (FactoryWait & { pid?: unknown }) | null = null
  try { w = JSON.parse(readFileSync(WAIT, "utf8")) } catch { return null }
  if (!w) return null
  const { pid, ...rest } = w
  return { ...rest, state: rest.state === "waiting" && !alive(pid) ? "stopped" : rest.state }
}

/** The node has a factory: a kept token, not found dead. */
export const factoryReady = (): boolean => {
  // a kept factory token no page found dead since; its mode flag is not trusted (it lags — 2026-11-18 21:27), Telegram's window decides
  try { const f = JSON.parse(readFileSync(join(ROOT, "data", "node", "bot-factory.json"), "utf8")) as { dead?: boolean }; return f.dead !== true } catch { return false }
}

/** Start a creation for a service: `{ ok, url, username, name }` or `{ ok:false, error }`. */
export function startCreate(service: string, lang: "en" | "ru"): { ok: true; url: string; username: string; name: string } | { ok: false; error: string; status: number } {
  if (!SERVICE.test(service) || !hasKit(service)) return { ok: false, error: "unknown-service", status: 400 }
  if (factoryWait()?.state === "waiting") return { ok: false, error: "already-waiting", status: 409 }
  const z = zone()
  const base = service === "build" ? (z ? `${z.split(".")[0]}_fractera` : "fractera_node") : `${addressOf(service)}`
  const name = service === "build" ? (z ? `Fractera · ${z}` : "Fractera") : elementName(service, lang)
  const username = factory.suggestUsername(base, randomBytes(3).toString("hex").slice(0, 4))
  const link = factory.createLink(ROOT, { username, name })
  if (!link.ok) return { ok: false, error: link.error ?? "no-factory", status: 409 }
  factory.remember(ROOT, username, service)
  spawn(process.execPath, [join(ROOT, "scripts", "bot-factory-wait.mjs"), service, username], { cwd: ROOT, detached: true, windowsHide: true, stdio: "ignore" }).unref()
  return { ok: true, url: link.url as string, username, name }
}
