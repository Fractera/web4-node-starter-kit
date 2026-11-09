// @api an element agent's permission question, decided by the core's main agent
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

// ВОПРОС РАЗРЕШЕНИЯ ЭЛЕМЕНТА РЕШАЕТ ГЛАВНЫЙ АГЕНТ ЯДРА (шаг 704; владелец 2026-11-09: «агент ядра принимает решение о том что
// делать»). Всё — с ключом узла (`X-Node-Key`), работа — в `lib/agent-kit/permission.cjs` через `globalThis.__web4Permission`
// (его ставит подключение комплектов, `lib/agent-kit/mount.cjs`):
//   POST `{ action:"ask", service, event, tool, input, cwd, reason, hits }` — зовёт сторож границы элемента; ответ
//        `{ state:"allow"|"deny", message }` сразу (закон, тот же вызов) или `{ state:"pending", token, deadline }` — главный агент разбужен;
//   GET  `?token=…&wait=<с>` — длинный опрос до 25 с: `{ state, message }`;
//   POST `{ action:"answer", token, behavior:"allow"|"deny", message }` — главный агент (`npm run permit`); без полного жетона — отказ;
//   GET  без жетона — ждущие вопросы (начало жетона, не весь).
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

type Out = Record<string, unknown> & { ok: boolean }
type Permission = {
  ask: (q: Record<string, unknown>) => Out
  wait: (token: string, ms: number) => Promise<Out>
  answer: (token: string, behavior: string, message: string) => Out
  list: () => unknown[]
}

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function permission(): Permission | null {
  const p = (globalThis as { __web4Permission?: Permission }).__web4Permission
  return p && typeof p.ask === "function" ? p : null
}

const refuse = (reason: string, status: number) => NextResponse.json({ ok: false, reason }, { status, headers: HEADERS })

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) return refuse("node key required (X-Node-Key)", 401)
  const p = permission()
  if (!p) return refuse("agent kits are not mounted in this process", 503)
  const token = req.nextUrl.searchParams.get("token") ?? ""
  if (!token) return NextResponse.json({ ok: true, pending: p.list() }, { headers: HEADERS })
  const wait = Math.max(0, Math.min(25, Number(req.nextUrl.searchParams.get("wait")) || 0)) * 1000
  const out = await p.wait(token, wait)
  return NextResponse.json(out, { status: out.ok ? 200 : 404, headers: HEADERS })
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) return refuse("node key required (X-Node-Key)", 401)
  const p = permission()
  if (!p) return refuse("agent kits are not mounted in this process", 503)
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return refuse("invalid JSON", 400) }
  if (body.action === "answer") {
    const out = p.answer(String(body.token ?? ""), String(body.behavior ?? ""), String(body.message ?? ""))
    console.log(`[agents/permission] answer ${String(body.token ?? "").slice(0, 6)} → ${out.ok ? out.state : out.reason}`)
    return NextResponse.json(out, { status: out.ok ? 200 : 409, headers: HEADERS })
  }
  if (body.action !== "ask") return refuse("action must be ask or answer", 400)
  const out = p.ask(body)
  console.log(`[agents/permission] ask ${String(body.service ?? "")} ${String(body.tool ?? "")} → ${out.ok ? out.state : out.reason}`)
  return NextResponse.json(out, { status: out.ok ? 200 : 400, headers: HEADERS })
}
