// @api raise a new temporary internet address after the old one died
import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"

// НОВЫЙ ВРЕМЕННЫЙ АДРЕС ПО КНОПКЕ (узел, шаг 632-5). Владелец 2026-11-03 о мёртвом адресе: «Похоже для этого нужно делать баннер,
// который будет предупреждать об этой проблеме и кнопка которую этой проблемы будет решать?»
// 🔒 ТОЛЬКО КОГДА АДРЕС МЁРТВ: дозорный (`scripts/tunnel.mjs`) записал `dead` в `logs/tunnel.json`. Живой адрес кнопка не меняет —
// по нему могли уже прийти люди (закон раздела 2 инструкции: смена адреса — только по слову человека, и только названная вслух).
// Работа — `serve.mjs publish --new` в отдельном процессе с очищенным окружением (ANTI-PATTERNS: дочерний процесс сервера Next иначе не
// читает свой `.env.local`), без синхронного ожидания — сайт не замирает; ответ — новый адрес из той же отметки дозорного.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const TUNNEL = join(ROOT, "logs", "tunnel.json")

function tunnel(): { url?: string; dead?: boolean } {
  try { return JSON.parse(readFileSync(TUNNEL, "utf8")) } catch { return {} }
}

function publishNew(): Promise<{ code: number | null; tail: string }> {
  const env: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) env[k] = v
  return new Promise((resolve) => {
    let out = ""
    const child = spawn(process.execPath, [join(ROOT, "scripts", "serve.mjs"), "publish", "--new"], { cwd: ROOT, env: env as NodeJS.ProcessEnv, windowsHide: true })
    const take = (b: Buffer) => { out = (out + b.toString()).slice(-4000) }
    child.stdout.on("data", take)
    child.stderr.on("data", take)
    const timer = setTimeout(() => child.kill(), 120_000)
    child.on("exit", (code) => { clearTimeout(timer); resolve({ code, tail: out.split("\n").filter(Boolean).slice(-6).join("\n") }) })
    child.on("error", (e) => { clearTimeout(timer); resolve({ code: null, tail: String(e) }) })
  })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  if (tunnel().dead !== true) {
    return NextResponse.json({ ok: false, error: "address-alive", reason: "the temporary address answers — it is not changed by a button" }, { status: 409 })
  }
  const r = await publishNew()
  const now = tunnel()
  if (r.code === 0 && typeof now.url === "string" && now.dead !== true) return NextResponse.json({ ok: true, url: now.url })
  return NextResponse.json({ ok: false, error: "publish-failed", detail: r.tail.slice(-600) }, { status: 502 })
}
