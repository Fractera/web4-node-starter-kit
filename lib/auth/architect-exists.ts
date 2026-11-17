import "server-only"
import { serviceUrl } from "@/lib/microservices/registry"

// DOES THE NODE HAVE ITS ARCHITECT (step 775). Measured 2026-11-17: throughsongs.com became the node's main domain while the node had
// no account at all — sign-up on auth.throughsongs.com answered 200 to the whole internet, and the first stranger to register would
// have become the architect for good. The domain page and the activation door ask this before a domain may become the main one.
// 🔒 People live in the sign-in element's base, never in the core: the question goes to its door `/api/node-users` over loopback with the
// architect key (`ARCHITECT_TOKEN`, shared by the core and the sign-in element only) — the same door the Users tab uses.
// 🔒 `null` — the sign-in element did not answer: the caller refuses (closed, not open), and says why.

export async function architectExists(): Promise<boolean | null> {
  const base = serviceUrl("auth")
  const token = process.env.ARCHITECT_TOKEN?.trim()
  if (!base || !token) return null
  try {
    const r = await fetch(`${base.replace(/\/+$/, "")}/api/node-users?perPage=1`, {
      headers: { "x-architect-token": token, "x-node-actor": "core", "x-node-actor-roles": "architect" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    if (!r.ok) return null
    const j = (await r.json()) as { total?: unknown }
    return typeof j.total === "number" ? j.total > 0 : null
  } catch {
    return null
  }
}
