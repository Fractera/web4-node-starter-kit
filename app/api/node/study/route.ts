// @api list test accounts for analysis, open a login window, end one
import { spawn, spawnSync } from "node:child_process"
import { timingSafeEqual } from "node:crypto"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { endStudy, listStudy, siteOf, stateOf } from "@/lib/study/study.mjs"

// ТЕСТОВЫЕ УЧЁТНЫЕ ЗАПИСИ ДЛЯ РАЗБОРА (шаг 556-6). Владелец 2026-10-22: агент сам смотрит внутренние страницы, но только в учётной
// записи, которую «не страшно потерять», и это «пользователь должен подтвердить лично».
// GET — список сайтов: согласие, признак входа, открыто ли окно (элементу с ключом узла — тоже: квиз решает, можно ли обход агентом).
// POST {action:"open", site, lang} — окно входа на экране ЭТОГО компьютера (запускатель `scripts/study-login.mjs` отвязан от дерева
// процессов ядра через `scripts/spawn-free.mjs`, закон 337-1); POST {action:"end", site} — окно гасится, профиль стирается.
// POST — только человеку (архитектор/админ), не ключу узла: открывать окна и стирать профили агент не просит дверью.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function killTree(pid: number) {
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" })
  else { try { process.kill(-pid, "SIGTERM") } catch { try { process.kill(pid, "SIGTERM") } catch { /* gone */ } } }
}

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  const site = req.nextUrl.searchParams.get("site")
  if (site) {
    const t = siteOf(site)
    if (t.error) return NextResponse.json({ ok: false, error: t.error }, { status: 400, headers: HEADERS })
    return NextResponse.json({ ok: true, account: stateOf(t.site) }, { headers: HEADERS })
  }
  return NextResponse.json({ ok: true, accounts: listStudy() }, { headers: HEADERS })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  let body: { action?: unknown; site?: unknown; lang?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400, headers: HEADERS }) }
  const t = siteOf(typeof body.site === "string" ? body.site : "")
  if (t.error) return NextResponse.json({ ok: false, error: t.error }, { status: 400, headers: HEADERS })
  const site = String(t.site)
  if (body.action === "end") return NextResponse.json(endStudy(site, killTree), { headers: HEADERS })
  if (body.action !== "open") return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400, headers: HEADERS })
  if (stateOf(site)?.window?.open) return NextResponse.json({ ok: true, already: true }, { headers: HEADERS })
  // Окружение собирается, а не наследуется (закон 280-6): без меток Next и ядра. Тип — ProcessEnv: у Next в нём объявлен NODE_ENV.
  const env = {} as NodeJS.ProcessEnv
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(__NEXT|NEXT_|AGI_|PORT$|HOSTNAME$|NODE_ENV$)/.test(k)) env[k] = v
  const lang = body.lang === "ru" ? "ru" : "en"
  const child = spawn(process.execPath, [join(process.cwd(), "scripts", "spawn-free.mjs"), join(process.cwd(), "scripts", "study-login.mjs"), site, "--lang", lang],
    { cwd: process.cwd(), detached: true, windowsHide: true, stdio: "ignore", env })
  child.unref()
  return NextResponse.json({ ok: true, opened: true, site }, { headers: HEADERS })
}
