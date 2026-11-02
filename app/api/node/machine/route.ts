// @api describe this computer: machine, memory per element, comparison with the super-node profile
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { machineReport } from "@/lib/web4-items/machine"

// «ЭТОТ КОМПЬЮТЕР» (572). Страница Dashboard предрендерена, поэтому машина меряется здесь, на запрос (закон 264).
// 🔒 ДВЕРЬ ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ (как `/api/node/projects`): параметры машины и состав узла — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const report = await machineReport()
  return NextResponse.json({ ok: true, ...report }, { headers: { "Cache-Control": "no-store" } })
}
