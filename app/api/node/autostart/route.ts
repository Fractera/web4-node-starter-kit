// @api turn on the node autostart at computer power-on
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import autostart from "@/lib/node/autostart.cjs"

// АВТОЗАПУСК УЗЛА ПРИ ВКЛЮЧЕНИИ КОМПЬЮТЕРА (узел, шаг 781-5). GET — включён ли (macOS: агент launchd узла или pm2 startup); POST — кнопка
// человека в окне действия (`npm run ask-person -- … --action autostart`): ядро сохраняет полный список pm2 и пишет агента launchd узла,
// без sudo (`lib/node/autostart.cjs`). Агент сам этого не делает: его права справедливо отказывают в системной постоянности — нажатие
// человека и есть согласие. Ворота — architect и admin; на временном адресе — отказ.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  return NextResponse.json({ ok: true, autostart: autostart.state(), loaded: autostart.loaded() }, noStore)
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "read-only address" }, { status: 403, ...noStore })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const out = autostart.enable(ROOT)
  console.log(`[node/autostart] from the panel → ${out.ok ? `on (${out.file})` : `${out.reason}${out.missing ? `: ${out.missing.join(", ")}` : ""}`}`)
  return NextResponse.json(out, { status: out.ok ? 200 : 409, ...noStore })
}
