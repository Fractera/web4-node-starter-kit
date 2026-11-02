// @api read REA status in the core and start its one-time install
import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import reaTool from "@/lib/web4-items/rea-tool.cjs"

// REA В ЯДРЕ (539-2). Одна копия инструмента обратной разработки на узел, в `data/tools/rea/`, ставится этой дверью по
// кнопке на странице «Реверс-инжиниринг» элемента.
//   GET  — установлен ли, версия, как звать программу (`node <entry> …`), годится ли Node, ход последней установки.
//   POST — запуск установки (`scripts/rea-install.mjs` вне дерева процессов ядра): Node стар → 409 `node-too-old`; уже идёт →
//          409 `running`; уже стоит → 200 без повторной установки; иначе 202 `started`. Ход спрашивает страница по кнопке —
//          таймеров и опроса нет.
// Ворота architect/admin; на временном публичном адресе — отказ: путь к программам узла наружу не отдаём.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const ROOT = process.cwd()

async function gate(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, headers: NO_STORE })
  return requireRoles(req, ["architect", "admin"])
}

export async function GET(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, ...reaTool.status() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  const s = reaTool.status()
  if (!s.node.ok) return NextResponse.json({ ok: false, error: "node-too-old", ...s }, { status: 409, headers: NO_STORE })
  if (s.install?.running) return NextResponse.json({ ok: false, error: "running", ...s }, { status: 409, headers: NO_STORE })
  if (s.installed && s.version === s.wanted) return NextResponse.json({ ok: true, ...s }, { headers: NO_STORE })
  // 337-1: двойной запуск — у установщика не остаётся живого родителя, перезапуск ядра его не убивает.
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "rea-install.mjs")], {
    cwd: ROOT,
    windowsHide: true,
    stdio: "ignore",
    timeout: 10_000,
  })
  return NextResponse.json({ ok: true, started: true, ...reaTool.status() }, { status: 202, headers: NO_STORE })
}
