// @api list an element's Telegram bots or write through one
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

// БОТЫ ЭЛЕМЕНТА ДЛЯ ЯДРА (шаг 552-6; владелец 2026-10-20: «научи ядро при необходимости работать с этими агентами то есть если ядро
// решила написать человеку через Messenger она должна сумме это сделать равную как и все прочее»). POST с ключом узла:
//   `{ service }`                 → боты элемента `{ <ячейка>: { username, name, people } }` (без токенов);
//   `{ service, slot, text }`     → сообщение всем, кто допущен к боту ячейки по ссылке (`h2a` — нынешний бот элемента, `h2h`,
//                                   `orders`, `work` — `_agent-kit/server/telegram-slots.cjs`).
// Зовёт главный агент (`npm run telegram`); вход кладёт общее подключение `lib/agent-kit/mount.cjs` (`globalThis.__web4Telegram`).
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const SLOTS = ["h2a", "h2h", "orders", "work"]

type Telegram = {
  bots: (service: string) => { ok: boolean; bots?: Record<string, unknown>; error?: string }
  send: (service: string, slot: string, text: string) => Promise<{ ok: boolean; sent?: number; error?: string }>
}

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: { service?: unknown; slot?: unknown; text?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const service = typeof body.service === "string" ? body.service.trim() : ""
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) {
    return NextResponse.json({ ok: false, error: "service must be an element id" }, { status: 400, headers: HEADERS })
  }
  const telegram = (globalThis as { __web4Telegram?: Telegram }).__web4Telegram
  if (!telegram) {
    return NextResponse.json({ ok: false, error: "agent kits are not mounted in this process" }, { status: 503, headers: HEADERS })
  }
  const text = typeof body.text === "string" ? body.text : ""
  if (!text.trim()) {
    const out = telegram.bots(service)
    return NextResponse.json(out, { status: out.ok ? 200 : 404, headers: HEADERS })
  }
  const slot = typeof body.slot === "string" ? body.slot : ""
  if (!SLOTS.includes(slot)) {
    return NextResponse.json({ ok: false, error: `slot must be one of ${SLOTS.join(", ")}` }, { status: 400, headers: HEADERS })
  }
  const out = await telegram.send(service, slot, text)
  console.log(`[agents/telegram] ${service} ${slot} → ${out.ok ? `sent ${out.sent}` : out.error}`)
  const status = out.ok ? 200 : out.error === "no-agent-kit" || out.error === "no-bot" ? 404 : 409
  return NextResponse.json(out, { status, headers: HEADERS })
}
