// @api turn an element of the node on or off
import { execFile } from "node:child_process"
import { join } from "node:path"
import { promisify } from "node:util"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import power from "@/lib/web4-items/element-power.cjs"

// 567: ВКЛЮЧИТЬ И ВЫКЛЮЧИТЬ ЭЛЕМЕНТ — кнопка «Опасной зоны» (выбор владельца 2026-10-22: «Кнопка в «Опасной зоне»»). Работу делает та же
// команда, что у человека в терминале и у главного агента (`scripts/element-power.mjs`): признак в реестре, pm2, снимок. Дверь ждёт её
// асинхронно — цикл событий сервера не стоит (`ANTI-PATTERNS.md`, «Синхронная тяжёлая операция в двери сервера»); включение ждёт ответа
// здоровья элемента до минуты.
// 🔒 Дочерний процесс — с чистым окружением: родитель — сервер Next («Процесс, запущенный из сервера Next…»).
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const run = promisify(execFile)

function cleanEnv(): NodeJS.ProcessEnv {
  const env = {} as NodeJS.ProcessEnv
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(__NEXT|NEXT_|AGI_|WEB4_)/.test(k) || ["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) continue
    env[k] = v
  }
  return env
}

function stateOf(id: string, lang: string) {
  const entry = (power.readRegistry(process.cwd()).services || []).find((s: { id: string }) => s.id === id)
  if (!entry) return null
  const off = power.offOf(entry)
  return { ok: true, id, on: !off, reason: off ? power.reasonIn(off, lang) : null, at: off?.at ?? null, byDefault: Boolean(off?.byDefault) }
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const s = stateOf(id, req.nextUrl.searchParams.get("lang") ?? "en")
  return s ? NextResponse.json(s, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { id?: unknown; action?: unknown; reason?: unknown; lang?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  const action = body?.action
  const lang = typeof body?.lang === "string" ? body.lang : "en"
  if (!stateOf(id, lang)) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  if (action !== "on" && action !== "off") return NextResponse.json({ ok: false, reason: "action must be on or off" }, { status: 400 })
  const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
  if (action === "off" && (!reason || reason.length > 200)) return NextResponse.json({ ok: false, reason: "reason-1-200" }, { status: 400 })
  const args = [join(process.cwd(), "scripts", "element-power.mjs"), id, action, ...(action === "off" ? [reason] : [])]
  let out = ""
  try {
    const r = await run(process.execPath, args, { cwd: process.cwd(), env: cleanEnv(), windowsHide: true, timeout: 120_000 })
    out = `${r.stdout}${r.stderr}`
  } catch (e) {
    out = `${(e as { stdout?: string }).stdout ?? ""}${(e as { stderr?: string }).stderr ?? ""}`
  }
  const done = action === "off" ? /===POWER_OFF===/.test(out) : /===POWER_ON===/.test(out)
  // Меню, «Проекты» и страница элемента рисуются на сервере — перерисовать, чтобы новое состояние было видно сразу.
  revalidatePath("/[lang]", "layout")
  const s = stateOf(id, lang)
  return NextResponse.json({ ...s, ok: done, line: out.trim().split("\n").filter((l) => l.startsWith("===POWER")).pop() ?? null }, { status: done ? 200 : 500, headers: { "Cache-Control": "no-store" } })
}
