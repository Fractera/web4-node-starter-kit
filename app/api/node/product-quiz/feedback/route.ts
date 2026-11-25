// @api keep a team's quiz results and wake the main agent
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { elementDir } from "@/lib/web4-items/element-github"
import { checkUpload, mainAgentText, stampOf } from "@/lib/web4-items/quiz-feedback.mjs"

// «ЗАГРУЗИТЬ РЕЗУЛЬТАТЫ КОМАНДЫ» (шаг 852-4; Рома 2026-11-24). POST multipart { item, file, comment? } с роли архитектора или админа:
// файл ложится в СОБСТВЕННУЮ папку данных элемента `data/services/<id>/quiz-feedback/<UTC>/` (не в его код и не в git — ядро в элемент
// не пишет), рядом `comment.md`; затем будится главный агент ядра (закон 636: агента элемента дверь не будит — задачу даёт главный
// агент), и он ставит агенту элемента задачу разобрать правки по номерам дерева. Отказ — 400 с родом: bad-kind · empty · too-big ·
// bad-comment; неизвестный элемент или без квиза — 404.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
type Wake = (service: string, opts: { text?: string; from?: string; about?: string; confirmed?: boolean }) => Promise<{ ok: boolean; reason?: string }>

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ ok: false, error: "bad-form" }, { status: 400, headers: NO_STORE })
  const id = idOfAddress(String(form.get("item") ?? ""))
  if (!id || !elementDir(id)) return NextResponse.json({ ok: false, error: "unknown-element" }, { status: 404, headers: NO_STORE })
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "empty" }, { status: 400, headers: NO_STORE })
  const checked = checkUpload({ name: file.name, size: file.size, comment: form.get("comment") })
  if (!checked.ok || !checked.value) return NextResponse.json({ ok: false, error: checked.error }, { status: 400, headers: NO_STORE })
  const upload = checked.value

  const rel = join("data", "services", id, "quiz-feedback", stampOf())
  const dir = join(process.cwd(), rel)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, upload.file), Buffer.from(await file.arrayBuffer()))
  if (upload.comment) await writeFile(join(dir, "comment.md"), upload.comment + "\n", "utf8")
  const saved = join(rel, upload.file)

  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  const woke = typeof wake === "function"
    ? await wake("build", { text: mainAgentText({ id, rel: saved, comment: upload.comment }), from: "quiz page", about: `team results for the quiz of ${id}`, confirmed: true }).catch(() => ({ ok: false }))
    : { ok: false }
  return NextResponse.json({ ok: true, saved, woke: woke.ok }, { headers: NO_STORE })
}
