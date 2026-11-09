// @api wake the Claude Code agent of a node element without a browser
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import supervision from "@/lib/web4-items/supervision.cjs"
import { telegramConnected } from "@/lib/a2a/telegram-relay"
import agentReturn from "@/lib/deploy/agent-return.cjs"
import resume from "@/lib/agent-kit/resume.cjs"

// ПРОБУЖДЕНИЕ АГЕНТА ЭЛЕМЕНТА (шаг 409-1; владелец 2026-10-05: «агент должен уметь запускать собственный терминал»; «примерно
// 300 МБ свободной памяти на один терминал»). POST `{ service, reason?, text? }` с ключом узла (`X-Node-Key`): сессия `claude`
// рождается тем же путём, что кнопкой в окне терминала (`_agent-kit/server/bridge.cjs` → `wake`), `text` вставляется во вход
// агента, когда его экран затих. Свободной памяти меньше нормы — `{ ok:false, reason:"memory", freeMb, perSessionMb }`.
// 409-3: бот элемента подключён — не старт, а вопрос человеку в Telegram (`{ ok:true, pending:true }`); `from`/`about` — кто зовёт
// и о чём (в тексте вопроса), `declineUrl` — дверь задачи вызывающего на этой машине: «Не сейчас» кладёт туда отказ.
// Вход пробуждения кладёт в `globalThis` общее подключение комплектов (`lib/agent-kit/mount.cjs`) при старте сервера.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

type Wake = (service: string, opts: { text?: string; from?: string; about?: string; declineUrl?: string; confirmed?: boolean; continueLast?: boolean }) => Promise<Record<string, unknown> & { ok: boolean }>
// 548-11: `supervised: true` — поручение главного агента элементу, который архитектор отдал ему под надзор
// (`data/node/supervision.json`, `lib/web4-items/supervision.cjs`): включается без вопроса в Telegram — человек этот вопрос уже
// решил, выбрав надзор. Нет записи надзора — флаг ничего не меняет.

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: { service?: unknown; reason?: unknown; text?: unknown; from?: unknown; about?: unknown; declineUrl?: unknown; supervised?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const service = typeof body.service === "string" ? body.service.trim() : ""
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) {
    return NextResponse.json({ ok: false, reason: "service must be an element id" }, { status: 400, headers: HEADERS })
  }
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  if (typeof wake !== "function") {
    return NextResponse.json({ ok: false, reason: "agent kits are not mounted in this process" }, { status: 503, headers: HEADERS })
  }
  const text = typeof body.text === "string" && body.text.trim() ? body.text.slice(0, 8000) : undefined
  const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : undefined)
  // 636 (владелец 2026-11-03: «Нашей архитектуре никто не может взаимодействовать с какими-либо агентами кроме самих агентов»; о вопросе
  // «Запустить агента?» для сработавшего напоминания — «Не спрашивать (Рекомендую)»): `reason: "alarm"` — часы элемента будят СВОЕГО
  // агента (`service` = `from`) или агент элемента говорит оркестратору (`npm run tell-core`, `service` = build). Человек уже сказал
  // «напомни», когда ставил запись, — вопроса в Telegram нет. Будильник для чужого агента — отказ: это обход агентов.
  const alarm = body.reason === "alarm"
  if (alarm && str(body.from, 120) !== service && service !== "build") {
    return NextResponse.json({ ok: false, reason: "an alarm wakes only its own agent (from = service) or the main agent (service build)" }, { status: 403, headers: HEADERS })
  }
  // 548-6 (повторная проверка 2026-10-20): элемент, которого узел только что родил по «да» архитектора (`npm run create` главного
  // агента, reason main-agent-create), включается и с согласием на свою папку: бота у новорождённого нет, и вопрос Claude Code о
  // доверии папке висел бы молча (watchTrust зовёт человека только через бота). На этой машине папки доверены через домашнюю
  // (`~/.claude.json`), на чистой — нет. Элемент с подключённым ботом этим путём не идёт — для него остаётся вопрос в Telegram.
  // 675-1 (владелец 2026-11-07: «в самом идеальным вариантом было бы авто пробуждение после успешного завершения»): `core-back` — сборка
  // ядра остановила работавшего агента и закончилась — 707: удачно, с отказом или оборвалась (`lib/deploy/agent-return.cjs`). Тот же разговор (`claude --continue`), без
  // вопроса — его уже запустили; `from` — только если сессию родил узел, иначе разговор остаётся разговором с человеком.
  // 675-3: и агента элемента — только того, кого записала сборка перед закрытой крышкой (`data/node/agent-return.json`).
  const back = body.reason === "core-back"
  if (back && !agentReturn.listed(process.cwd(), service)) {
    return NextResponse.json({ ok: false, reason: "core-back returns only an agent the core build stopped (data/node/agent-return.json)" }, { status: 403, headers: HEADERS })
  }
  if (back) {
    const out = await wake(service, { text, from: str(body.from, 120), confirmed: true, continueLast: true })
    console.log(`[agents/wake] ${service} reason=core-back → ${out.ok ? (out.already ? "already" : "started") : out.reason}`)
    return NextResponse.json(out, { status: out.ok ? 200 : out.reason === "memory" ? 503 : 409, headers: HEADERS })
  }
  // 708 (владелец 2026-11-09, «b»): `session-lost` — сессия главного агента умерла вместе с ядром, старт ядра пометил её (`lib/agent-kit/
  // resume.cjs` `markLost`); только главный агент и только с такой пометкой — тот же разговор, без вопроса и не как задача узла.
  if (body.reason === "session-lost") {
    if (service !== "build" || resume.readMode(process.cwd(), service)?.why !== "lost") {
      return NextResponse.json({ ok: false, reason: "session-lost returns only the main agent whose session the core's start marked lost" }, { status: 403, headers: HEADERS })
    }
    const out = await wake(service, { text, confirmed: true, continueLast: true })
    console.log(`[agents/wake] ${service} reason=session-lost → ${out.ok ? (out.already ? "already" : "started") : out.reason}`)
    return NextResponse.json(out, { status: out.ok ? 200 : out.reason === "memory" ? 503 : 409, headers: HEADERS })
  }
  const created = body.reason === "main-agent-create" && !telegramConnected(service)
  const confirmed = (body.supervised === true && supervision.byMain(service)) || created || alarm
  const out = await wake(service, { text, from: str(body.from, 120), about: str(body.about, 600), declineUrl: str(body.declineUrl, 300), ...(confirmed ? { confirmed: true } : {}) })
  console.log(`[agents/wake] ${service} reason=${String(body.reason ?? "-").slice(0, 32)} → ${out.ok ? (out.pending ? "asked in Telegram" : out.already ? "already" : "started") : out.reason}`)
  const status = out.ok ? 200 : out.reason === "memory" ? 503 : out.reason === "no-agent-kit" || out.reason === "no-agent-dir" ? 404 : 409
  return NextResponse.json(out, { status, headers: HEADERS })
}
