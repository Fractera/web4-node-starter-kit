// @api keep the first task from the root home for the main agent
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { readFirstTask, takeFirstTask, writeFirstTask } from "@/lib/web4-items/first-task"

// ПЕРВОЕ ЗАДАНИЕ УЗЛА (шаг 587-4). POST — пишет сайт root своей дверью `/api/first-task` после проверки роли архитектора, с ключом узла
// (`X-Node-Key`). GET — показать, DELETE — забрать и удалить: архитектор (страницы ядра) или узел (ключ: терминал, бот, главный агент).

export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function allowed(req: NextRequest): Promise<NextResponse | null> {
  if (nodeKeyOk(req.headers.get("x-node-key"))) return null
  return requireRoles(req, ["architect"])
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const body = (await req.json().catch(() => null)) as { text?: unknown; from?: unknown } | null
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
