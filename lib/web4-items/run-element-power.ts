// TURN AN ELEMENT ON OR OFF FROM A DOOR (node step 567; shared since 771-2 by the panel's «Опасная зона» door and the Telegram panel).
// The work is the same command the person and the main agent run (`scripts/element-power.mjs`): the registry flag, pm2, the snapshot.
// Awaited asynchronously — the server's event loop never stands (`ANTI-PATTERNS.md`, «Синхронная тяжёлая операция в двери сервера»);
// turning on waits for the element's health up to a minute.
// 🔒 The child gets a clean environment: its parent is the Next server («Процесс, запущенный из сервера Next…»).
import { execFile } from "node:child_process"
import { join } from "node:path"
import { promisify } from "node:util"

import power from "@/lib/web4-items/element-power.cjs"

const run = promisify(execFile)

function cleanEnv(): NodeJS.ProcessEnv {
  const env = {} as NodeJS.ProcessEnv
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(__NEXT|NEXT_|AGI_|WEB4_)/.test(k) || ["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) continue
    env[k] = v
  }
  return env
}

export type PowerState = { ok: true; id: string; on: boolean; required: boolean; reason: string | null; at: string | null; byDefault: boolean }

/** The element's power as the registry holds it, or null for an unknown id. */
export function powerState(id: string, lang: string): PowerState | null {
  const entry = (power.readRegistry(process.cwd()).services || []).find((s: { id: string }) => s.id === id)
  if (!entry) return null
  const off = power.offOf(entry)
  return { ok: true, id, on: !off, required: Boolean(entry.required), reason: off ? power.reasonIn(off, lang) : null, at: off?.at ?? null, byDefault: Boolean(off?.byDefault) }
}

/** Run the command; `done` — its own line said so. `reason` is required for «off» (1–200 characters). */
export async function runElementPower(id: string, action: "on" | "off", reason = ""): Promise<{ done: boolean; line: string | null }> {
  const args = [join(process.cwd(), "scripts", "element-power.mjs"), id, action, ...(action === "off" ? [reason] : [])]
  let out = ""
  try {
    const r = await run(process.execPath, args, { cwd: process.cwd(), env: cleanEnv(), windowsHide: true, timeout: 120_000 })
    out = `${r.stdout}${r.stderr}`
  } catch (e) {
    out = `${(e as { stdout?: string }).stdout ?? ""}${(e as { stderr?: string }).stderr ?? ""}`
  }
  const done = action === "off" ? /===POWER_OFF===/.test(out) : /===POWER_ON===/.test(out)
  return { done, line: out.trim().split("\n").filter((l) => l.startsWith("===POWER")).pop() ?? null }
}
