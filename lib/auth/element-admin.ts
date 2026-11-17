import "server-only"
import { serviceUrl } from "@/lib/microservices/registry"
import elementAdmin from "@/lib/web4-items/element-admin-role.cjs"

// THE ADMIN OF AN ELEMENT IN THE SIGN-IN (node step 778). People live in the sign-in element's base, never in the core: the core asks its
// doors `/api/node-users/element-admin` and `/api/node-users/strip-role` over loopback with the architect key (`ARCHITECT_TOKEN`, shared
// by the core and the sign-in element only), as the core acting for the architect (`x-node-actor-roles: architect`) — the sign-in lets
// only an architect grant or strip an element-admin role (the counterweight of 778-2).
// 🔒 A password passes through here once, in the body of one loopback request, and nowhere else: not a log, not an answer, not an error.

export type AuthCall = { ok: true; body: Record<string, unknown> } | { ok: false; reason: string }

async function callAuth(path: string, body: Record<string, unknown>): Promise<AuthCall> {
  const base = serviceUrl("auth")
  const token = process.env.ARCHITECT_TOKEN?.trim()
  if (!base) return { ok: false, reason: "no-auth-element" }
  if (!token) return { ok: false, reason: "no-architect-token" }
  try {
    const r = await fetch(`${base.replace(/\/+$/, "")}/api/node-users/${path}`, {
      method: "POST",
      headers: { "x-architect-token": token, "x-node-actor": "core", "x-node-actor-roles": "architect", "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    const j = (await r.json().catch(() => ({}))) as Record<string, unknown>
    if (!r.ok || j.ok === false) return { ok: false, reason: typeof j.error === "string" ? j.error : `auth-${r.status}` }
    return { ok: true, body: j }
  } catch {
    return { ok: false, reason: "auth-unreachable" }
  }
}

/** Take one element-admin role from every account. `count` — how many held it. */
export async function stripElementAdminRole(role: string): Promise<{ ok: true; count: number } | { ok: false; reason: string }> {
  if (!elementAdmin.isRole(role)) return { ok: false, reason: "not-an-element-admin-role" }
  const r = await callAuth("strip-role", { role })
  if (!r.ok) return r
  return { ok: true, count: typeof r.body.count === "number" ? r.body.count : 0 }
}

/**
 * Give an element's admin role to the account of this e-mail; no account — the sign-in creates one with this password. An existing
 * account keeps its password (the owner, 2026-11-17: the role is added, nothing else changes).
 */
export async function grantElementAdmin(input: { email: string; password?: string; role: string }): Promise<{ ok: true; created: boolean } | { ok: false; reason: string }> {
  if (!elementAdmin.isRole(input.role)) return { ok: false, reason: "not-an-element-admin-role" }
  const r = await callAuth("element-admin", { email: input.email, role: input.role, ...(input.password ? { password: input.password } : {}) })
  if (!r.ok) return r
  return { ok: true, created: r.body.created === true }
}
