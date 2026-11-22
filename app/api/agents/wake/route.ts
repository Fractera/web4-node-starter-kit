// @api wake the Claude Code agent of a node element without a browser
import { NextRequest, NextResponse } from "next/server"
import { callerOf, isNode, markedFrom, refusal, wakeAllowed } from "@/lib/node/caller"
import { keyForUrl } from "@/lib/node/element-call-key.cjs"

import supervision from "@/lib/web4-items/supervision.cjs"
import { telegramConnected } from "@/lib/a2a/telegram-relay"
import agentReturn from "@/lib/deploy/agent-return.cjs"
import resume from "@/lib/agent-kit/resume.cjs"
import claudeAccount from "@/lib/agent-kit/claude-account.cjs"
import signInBases from "@/lib/auth/sign-in-bases.cjs"
import { noticeLang, sendNotice } from "@/lib/main-agent-cron/notice"
import { elementName } from "@/lib/web4-items/dashboard-rows"

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

export async function POST(req: NextRequest) {
  const caller = callerOf(req.headers)
  if (!caller) {
    return NextResponse.json({ ok: false, reason: refusal(null).reason }, { status: 401, headers: HEADERS })
  }
  let body: { service?: unknown; reason?: unknown; text?: unknown; from?: unknown; about?: unknown; declineUrl?: unknown; supervised?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const service = typeof body.service === "string" ? body.service.trim() : ""
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) {
    return NextResponse.json({ ok: false, reason: "service must be an element id" }, { status: 400, headers: HEADERS })
  }
  // 818-7a (817 H6): an element's own key wakes only its own agent, or the main agent in its own name — never a neighbour's agent, never
  // with a reason of the node; its words for the main agent carry the name its KEY gave, and no mark of the node it could forge.
  const me = isNode(caller) ? null : (caller as { element: string }).element
  if (me) {
    if (!wakeAllowed(caller, { ...body, service })) {
      const r = refusal(caller, "only its own agent, or the main agent in its own name")
      return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, headers: HEADERS })
    }
    if (service === "build") {
      body.from = me
      body.declineUrl = undefined
      if (typeof body.text === "string") body.text = markedFrom(me, body.text)
      if (typeof body.about === "string") body.about = body.about.replace(/⟦/g, "[").replace(/⟧/g, "]")
    } else if (typeof body.declineUrl === "string" && keyForUrl(body.declineUrl)?.id !== me) {
      // 818-7b: the task door a woken agent's states go to is the waking element's own (its port) — never a neighbour's.
      body.declineUrl = undefined
    }
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
  // 833-4 (the server's main agent, handoff 2026-11-21: «Человек узнал о проблеме только после того, как упала задача»): on a server an
  // element's agent runs only on its own Claude account — without one nothing is asked in its bot (a «Включить» that can never work): the
  // person hears it at once in the main chat (834-10: an app of its own too, on any node — `claude-account.cjs`), with the page where the account is signed in on a computer, and the caller gets no-account.
  if (service !== "build" && claudeAccount.accountOf(process.cwd(), service) === "none") {
    const root = process.cwd()
    const lang = noticeLang(root)
    let web = ""
    try { web = String((signInBases.signInBases(root) as { web?: string | null }).web ?? "").replace(/\/+$/, "") } catch { /* no domain */ }
    const link = web ? `${web}${claudeAccount.subscriptionPath(root, service, lang)}` : claudeAccount.subscriptionPath(root, service, lang)
    const name = elementName(service, lang)
    const text = lang === "ru"
      ? `Задача для «${name}» не запустилась: его агент работает только на своём аккаунте Claude, а входа нет. Откройте на компьютере ${link} и войдите — можно тем же аккаунтом.`
      : `A task for «${name}» did not start: its agent works only on its own Claude account, and none is signed in. Open ${link} on a computer and sign in — the same account will do.`
    const sent = await sendNotice(root, { kind: "account", from: service, who: name, text }).catch(() => ({ ok: false }))
    console.log(`[agents/wake] ${service} → no-account (the person ${sent.ok ? "told" : "NOT told"} in the main chat)`)
    return NextResponse.json({ ok: false, reason: "no-account", told: sent.ok, link }, { status: 409, headers: HEADERS })
  }
  const created = body.reason === "main-agent-create" && !telegramConnected(service)
  // 736 (the owner, 2026-11-12: «it is your work, it is rule! you must confirm the current folder automaticly»): every wake by the main
  // agent — its task, its «turn on» (`npm run wake`, the person's own /on), its review — carries the consent to the element's folder,
  // the same as a birth (548-6). ✗ 2026-11-12 23:42: `npm run wake` (main-agent-on) left the trust question to a Telegram bot the node
  // did not have; the agent stood on it and its task was dropped. An element with its own bot keeps the question to its person.
  const byMainAgent = /^main-agent-/.test(String(body.reason ?? "")) && !telegramConnected(service)
  // 841 (the owner, Telegram 963): the person pressed «Найти» in the element's own Mini App — their press is the consent; only the element's
  // own key, only for its own agent.
  const pressed = body.reason === "mini-app-search" && me === service
  const confirmed = (body.supervised === true && supervision.byMain(service)) || created || alarm || byMainAgent || pressed
  const out = await wake(service, { text, from: str(body.from, 120), about: str(body.about, 600), declineUrl: str(body.declineUrl, 300), ...(confirmed ? { confirmed: true } : {}) })
  console.log(`[agents/wake] ${service} reason=${String(body.reason ?? "-").slice(0, 32)} → ${out.ok ? (out.pending ? "asked in Telegram" : out.already ? "already" : "started") : out.reason}`)
  const status = out.ok ? 200 : out.reason === "memory" ? 503 : out.reason === "no-agent-kit" || out.reason === "no-agent-dir" ? 404 : 409
  return NextResponse.json(out, { status, headers: HEADERS })
}
