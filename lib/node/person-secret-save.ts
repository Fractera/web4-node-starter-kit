// THE PERSON'S SECRET SAVED AND THE REQUEST CLOSED (node steps 768-3, 768-4) — one road for the panel's window
// (`/api/node/person-asks`) and the Telegram form (`/api/node/secret-entry`). The value is checked, written into the asking element's own
// key file and dropped here: never logged, never answered back, never in the request's file; the asker wakes with its name and a tail.
import { listServices } from "@/lib/microservices/registry"
import asks from "@/lib/node/person-asks.cjs"
import nodeLine from "@/lib/agent-kit/node-line.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import secrets from "@/lib/node/person-secrets.cjs"
import { writeElementSecret, writeVar } from "@/lib/env-file"
import { restartService } from "@/lib/domain/resident"
import { OPENAI_KEY, probeOpenAiKey } from "@/lib/openai-probe"

const ROOT = process.cwd()

export type Secret = { kind: "env" | "openai" | "server-root"; name?: string; where?: string | null; host?: string; port?: number }
export type Ask = { id: string; text: string; href: string | null; why: string | null; hint?: string | null; copy?: string | null; by?: string; secret?: Secret; signin?: "architect" | null; at: string; tg?: { via: string; sent: number } | null; tgEntry?: { hash: string; until: string } }
export type Saved = { tail: string | null; restarted: boolean }
type Wake = (service: string, opts: { text?: string; from?: string; confirmed?: boolean }) => Promise<Record<string, unknown> & { ok: boolean }>

export const knownElement = (id: string) => /^[a-z][a-z0-9-]{0,39}$/.test(id) && (listServices() as unknown as { id: string }[]).some((s) => s.id === id)

/** An element's key typed by the person: written into ITS key file, its process restarted. `{ ok: false, reason }` — nothing written. */
export function saveEnvSecret(ask: Ask, raw: unknown): { ok: true; saved: Saved } | { ok: false; reason: string; status: number } {
  if (typeof raw !== "string") return { ok: false, reason: "secret required", status: 400 }
  const value = raw.trim()
  const bad = secrets.valueRefusal(value) as string | null
  if (bad) return { ok: false, reason: bad, status: 400 }
  const owner = ask.by && ask.by !== "build" && knownElement(ask.by) ? ask.by : null
  if (!owner || !writeElementSecret(owner, ask.secret?.name ?? "", value)) {
    console.log(`[node/person-asks] ${ask.id} secret ${ask.secret?.name} → ${owner ?? "?"}: not written`)
    return { ok: false, reason: "not-written", status: 500 }
  }
  const saved = { tail: secrets.tail(value) as string | null, restarted: restartService(`fractera-svc-${owner}`) }
  console.log(`[node/person-asks] ${ask.id} secret ${ask.secret?.name} → ${owner}: written, restarted ${saved.restarted}`)
  return { ok: true, saved }
}

/** 768-6: the node's OpenAI key typed by the person — tried live with OpenAI first (the «Окружение» screen's check), then written into the
 * core's key file; refused — nothing written, the reason goes back to the form. */
export async function saveOpenAiSecret(raw: unknown): Promise<{ ok: true; saved: Saved } | { ok: false; reason: string; status: number }> {
  if (typeof raw !== "string") return { ok: false, reason: "secret required", status: 400 }
  const value = raw.trim()
  if (!OPENAI_KEY.test(value)) return { ok: false, reason: "bad-format", status: 400 }
  const checked = await probeOpenAiKey(value)
  if (checked !== "ok") return { ok: false, reason: checked, status: 400 }
  if (!writeVar("core", "OPENAI_API_KEY", value)) return { ok: false, reason: "not-written", status: 500 }
  console.log("[node/person-asks] the node's OpenAI key: checked live, written into the core")
  return { ok: true, saved: { tail: secrets.tail(value) as string | null, restarted: true } }
}

/** The person's secret by its kind: an element's key or the node's OpenAI key. */
export async function saveSecret(ask: Ask, raw: unknown) {
  return ask.secret?.kind === "openai" ? saveOpenAiSecret(raw) : saveEnvSecret(ask, raw)
}

/** Close the request once and wake the one who asked; Telegram learns it. `null` — it was already closed. */
export async function closeAsk(id: string, { saved = null, via = "window" }: { saved?: Saved | null; via?: "window" | "telegram" } = {}) {
  const a = asks.done(ROOT, id) as Ask | null
  if (!a) return null
  // the one who asked wakes: the main agent (`build`) or the element whose agent put the request
  const who = a.by && a.by !== "build" && knownElement(a.by) ? a.by : "build"
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  let woke: string = "no-agent-kit"
  if (typeof wake === "function") {
    // an element's bridge routes by the first word: «Working process:» — its work session, never a new build session (✗ 15:23 live:
    // the bare line opened root's build session); the main agent is woken in its own conversation as it is
    const lead = who === "build" ? "" : "Working process: "
    const words = a.secret ? asks.secretDoneText(a, { ...(saved ?? {}), via }) : asks.doneText(a)
    const out = await wake(who, { text: `${lead}${nodeLine.head("person-done", who)}${words}`, from: "node", confirmed: true })
    woke = out.ok ? "ok" : String(out.reason ?? "refused")
  }
  const kind = (a.secret?.kind === "env" || a.secret?.kind === "openai") && saved ? "saved" : "closed"
  const tg = await asksTg.closed(ROOT, a, kind, { tail: saved?.tail ?? null }).catch((e: unknown) => String(e))
  console.log(`[node/person-asks] ${id} done (${via}) → ${who}: ${woke} · telegram: ${tg}`)
  return { woke, who, tg }
}
