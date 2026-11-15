// @api preview and start removing the whole node from this computer
import { execFile } from "node:child_process"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { childEnv, nodeRemoveDenied } from "@/lib/node-remove"

// «ЯДРО → НАСТРОЙКИ → ОПАСНАЯ ЗОНА» (шаг 746-2). Владелец 2026-11-15: «полное удаление … только с локальной машины всего проекта …
// с подтверждением что пользователь понимает … данных которые потеряет безвозвратно».
// GET — что уйдёт и что останется (`scripts/node-remove.mjs`, без изменений). POST `{ confirm, understood: true }` — имя папки буква в
// букву и галочка; скрипт сверяет имя ещё раз сам и запускает удаление вне ядра (`node-remove-stage.mjs`): ответ 202 приходит сразу,
// через несколько секунд узел снимает свои процессы, и эта страница перестаёт отвечать.
// 🛑 НИЧЕГО БЛОКИРУЮЩЕГО (325-6: синхронное стирание папки останавливало весь сайт) — только асинхронный запуск скрипта.
export const dynamic = "force-dynamic"
const NO_STORE = { "Cache-Control": "no-store" }

function script(args: string[]): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    execFile(process.execPath, [join(process.cwd(), "scripts", "node-remove.mjs"), ...args], { cwd: process.cwd(), env: childEnv(), timeout: 45_000, maxBuffer: 1 << 20, windowsHide: true }, (err, out) => {
      resolve({ code: err ? (typeof err.code === "number" ? err.code : 1) : 0, out: String(out ?? "") })
    })
  })
}
const parse = (out: string): Record<string, unknown> | null => { try { return JSON.parse(out) as Record<string, unknown> } catch { return null } }

export async function GET(req: NextRequest) {
  const denied = await nodeRemoveDenied(req)
  if (denied) return denied
  const r = parse((await script([])).out)
  if (!r) return NextResponse.json({ ok: false, error: "preview" }, { status: 500, headers: NO_STORE })
  return NextResponse.json(r, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await nodeRemoveDenied(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { confirm?: unknown; understood?: unknown } | null
  if (body?.understood !== true) return NextResponse.json({ ok: false, error: "understood" }, { status: 400, headers: NO_STORE })
  const confirm = typeof body.confirm === "string" ? body.confirm.trim() : ""
  if (!confirm) return NextResponse.json({ ok: false, error: "name" }, { status: 409, headers: NO_STORE })
  const r = await script(["--yes", "--confirm", confirm])
  const d = parse(r.out) ?? { ok: false, error: "start" }
  const status = typeof d.status === "number" ? d.status : r.code === 0 ? 202 : 500
  return NextResponse.json(d, { status, headers: NO_STORE })
}
