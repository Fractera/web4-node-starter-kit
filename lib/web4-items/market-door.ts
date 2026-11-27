// The gate of the core's marketplace doors (core step 862-2/862-3): the node key, or the own key of the element that `provides:
// market-client` — found by what it provides, never by its id (all elements are equal; the client is one of them). Any other element's key
// → 403; no key → 401. Every door here talks to the store only through the core's signed call (`lib/web4-items/store-call.mjs`).
import { NextResponse } from "next/server"
import { callerElement, callerOf, isNode, refusal } from "@/lib/node/caller"
import { listServices } from "@/lib/microservices/registry"

export const NO_STORE = { "Cache-Control": "no-store" }

/** → { by } (the client's id, or "build" for the node) or a refusal response. */
export function marketCaller(headers: Headers): { by: string } | NextResponse {
  const caller = callerOf(headers)
  if (isNode(caller)) return { by: "build" }
  const id = callerElement(caller)
  const client = id ? (listServices() as unknown as { id: string; provides?: string[] }[]).find((s) => s.id === id && (s.provides ?? []).includes("market-client")) : null
  if (client) return { by: client.id }
  const r = refusal(caller, "the marketplace doors only for the element that provides market-client")
  return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, headers: NO_STORE })
}

export async function bodyOf(req: Request): Promise<Record<string, unknown> | null> {
  try { const b = await req.json(); return b && typeof b === "object" ? (b as Record<string, unknown>) : null } catch { return null }
}
