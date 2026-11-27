// @api read the node's own ID, the fingerprint of its signing key
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import channel from "@/lib/node/creator-channel.cjs"

// 862-11 (Roma 2026-11-27, Telegram 1662: «на вкладке паспорт уже имеет смысл показать идентификатор узла»): the Passport shows the node ID
// on the architect's click — never printed into the prebuilt page (CLAUDE.md §6). GET → { ok, id }. The ID is the short hash of the node's
// Ed25519 public key (`lib/node/creator-channel.cjs`, step 855); the private key never leaves `data/node/identity/`. Only the architect.
export const dynamic = "force-dynamic"

const ROLES = ["architect"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, id: channel.identity(process.cwd()).id }, { headers: NO_STORE })
}
