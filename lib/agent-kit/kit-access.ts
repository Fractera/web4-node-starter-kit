import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/lib/auth/get-session"
import { requireRoles } from "@/lib/auth/require-roles"
import { callerElement, callerOf } from "@/lib/node/caller"

// WHO MAY USE AN ELEMENT'S AGENT DOORS (node step 836-1). The owner, 2026-11-22 (Telegram 711, 719): an element's agent pages live
// inside the element, behind its own sign-in — «они должны были жить внутри элементы». The element's own server checks its person
// (its admin role, or the architect) and then calls these doors of the core on loopback with its OWN key (`X-Node-Key: ELEMENT_KEY`).
// 🔒 The key opens only THIS element's doors — another element's key, the internet (`fromInternet`), a peer mismatch → the person's
//   roles are asked as before (the core's panel: architect, admin, the element's own admin).
// 🔒 An element is never «the panel»: what it gets is what its own admin gets (ownOnly tickets, own-account-only switches, 834-3).
// `who` — the person the element vouches for, for the ticket's journal only (`X-Element-Person`), never a permission.

export type KitAccess = { denied: NextResponse | null; panel: boolean; who: string | null; viaElement: boolean }

const PERSON = /^[^\s@]{1,64}@[^\s@]{1,190}$/

export async function kitAccess(req: NextRequest, service: string | null, roles: readonly string[]): Promise<KitAccess> {
  if (service && callerElement(callerOf(req.headers)) === service) {
    const person = (req.headers.get("x-element-person") ?? "").trim()
    return { denied: null, panel: false, who: PERSON.test(person) ? person : `admin@${service}`, viaElement: true }
  }
  const denied = await requireRoles(req, [...roles])
  if (denied) return { denied, panel: false, who: null, viaElement: false }
  const session = await getSession(req)
  const panel = (session?.roles ?? []).some((r) => r === "architect" || r === "admin")
  return { denied: null, panel, who: session?.email ?? null, viaElement: false }
}
