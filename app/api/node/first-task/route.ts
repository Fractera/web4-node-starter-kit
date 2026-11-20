// @api keep the first task from the root home for the main agent
import { NextRequest, NextResponse } from "next/server"
import { actsFor, callerElement, callerOf, isNode, refusal } from "@/lib/node/caller"
import { requireRoles } from "@/lib/auth/require-roles"
import { readFirstTask, takeFirstTask, writeFirstTask } from "@/lib/web4-items/first-task"

// ПЕРВОЕ ЗАДАНИЕ УЗЛА (шаг 587-4). POST — пишет сайт root своей дверью `/api/first-task` после проверки роли архитектора, с ключом узла
// (`X-Node-Key`). GET — показать, DELETE — забрать и удалить: архитектор (страницы ядра) или узел (ключ: терминал, бот, главный агент).

export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

// 818-7a (817 H6): reading or taking the task is the node's or the architect's; an element only offers one, in its own name.
async function allowed(req: NextRequest): Promise<NextResponse | null> {
  if (isNode(callerOf(req.headers))) return null
  return requireRoles(req, ["architect"])
}

export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    return NextResponse.json({ ok: false, error: refusal(null).reason }, { status: 401, headers: HEADERS })
  }
  const body = (await req.json().catch(() => null)) as { text?: unknown; from?: unknown } | null
  if (!isNode(caller) && body && body.from === undefined) body.from = callerElement(caller)
  if (!actsFor(caller, body?.from)) {
    const r = refusal(caller)
    return NextResponse.json({ ok: false, error: r.reason }, { status: r.status, headers: HEADERS })
  }
  const text = typeof body?.text === "string" ? body.text.trim() : ""
  if (!text) return NextResponse.json({ ok: false, error: "empty task" }, { status: 400, headers: HEADERS })
  const task = writeFirstTask(text, typeof body?.from === "string" ? body.from : null)
  return NextResponse.json({ ok: true, at: task.at }, { headers: HEADERS })
}

export async function GET(req: NextRequest) {
  const denied = await allowed(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, task: readFirstTask() }, { headers: HEADERS })
}

export async function DELETE(req: NextRequest) {
  const denied = await allowed(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, task: takeFirstTask() }, { headers: HEADERS })
}
