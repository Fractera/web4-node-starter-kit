import "server-only"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { placeKind } from "@/lib/hosting/place.mjs"

// THE LOCK OF «CORE → SETTINGS → DANGER ZONE» (node step 746-2): the doors `/api/architect/node-remove` and `/archive`.
// 🔒 THREE CONDITIONS, ALL AT ONCE: the architect · at this computer's keyboard (`isOwnerAtMachine`: no Cloudflare headers, no server
// edge mark, a loopback host) · a person's computer (`placeKind === "home"`). The owner, 2026-11-15: «только с локальной машины». An
// architect signed in on the own domain does not empty the computer from the internet, and a server never empties itself by its panel.
// The cross-site wall (744-2, `proxy/common.ts`) already stands before every POST.
export async function nodeRemoveDenied(req: NextRequest): Promise<NextResponse | null> {
  const denied = await requireRoles(req, ["architect"])
  if (denied) return denied
  if (!isOwnerAtMachine(req)) return NextResponse.json({ ok: false, error: "not-at-machine" }, { status: 403 })
  if (placeKind(process.cwd()) !== "home") return NextResponse.json({ ok: false, error: "server" }, { status: 403 })
  return null
}

/** The environment of a child of the core's server without Next's own variables (ANTI-PATTERNS: a child would read them as its own). */
export function childEnv(): NodeJS.ProcessEnv {
  const env: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) env[k] = v
  return env as NodeJS.ProcessEnv
}
