// @api read the super node application and settings and change them
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import {
  applySuperNode, connectServer, disconnectServer, parseSettings, readSuperNode, runTest, saveSettings, simulateApproval, withdrawSuperNode,
} from "@/lib/web4-items/super-node"

// СУПЕР-УЗЕЛ (530-3, 531): GET — заявка (нет · подана · одобрена), подключённый сервер (только адрес), последний тест, настройки, кошелёк.
// POST `action`: `apply` (от кошелька узла, без него 409) · `withdraw` · `approve` (прототип: имитация одобрения сети) · `connect`
// `{ url, key }` (проверка запросом к API оператора до записи) · `disconnect` · `test` (оборудование сервера против Tier-2) · `settings`
// (запись на узле и декларация серверу). Отказ — 400/409/502 с родом. В сеть Lagrix ничего не уходит. Только архитектор; на временном
// адресе запись запрещена.
export const dynamic = "force-dynamic"

const ROLES = ["architect"] as const
const NO_STORE = { "Cache-Control": "no-store" }
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: NO_STORE })

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, ...readSuperNode() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return fail("temporary-address", 403)
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { action?: unknown; url?: unknown; key?: unknown } | null
  let extra: Record<string, unknown> = {}
  switch (body?.action) {
    case "apply":
      if (applySuperNode() === "no-wallet") return fail("no-wallet", 409)
      break
    case "withdraw":
      withdrawSuperNode()
      break
    case "approve":
      if (simulateApproval() === "no-application") return fail("no-application", 409)
      break
    case "connect": {
      const r = await connectServer(body.url, body.key)
      if (r !== "ok") return fail(r, r === "unreachable" ? 502 : 400)
      break
    }
    case "disconnect":
      disconnectServer()
      break
    case "test": {
      const r = await runTest()
      if (!r.ok) return fail(r.error, r.status)
      break
    }
    case "settings": {
      const parsed = parseSettings(body)
      if (!parsed.ok) return fail(parsed.error, 400)
      extra = await saveSettings(parsed.value)
      break
    }
    default:
      return fail("bad-action", 400)
  }
  return NextResponse.json({ ok: true, ...readSuperNode(), ...extra }, { headers: NO_STORE })
}
