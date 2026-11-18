// @api list the main agent action requests and confirm one done
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import asks from "@/lib/node/person-asks.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import { closeAsk, knownElement as known, saveSecret, type Ask, type Saved } from "@/lib/node/person-secret-save"
import mainChannel from "@/lib/node/main-channel.cjs"

// ДЕЙСТВИЕ ЧЕЛОВЕКА (узел, шаг 761-16). GET — открытые запросы (главного агента — `npm run ask-person` ядра; агента элемента — его
// `npm run ask-person`, 761-16d), их показывает окно внизу каждой страницы пульта с именем элемента; POST `{ id }` — человек нажал
// «Готово»: запрос закрывается один раз, просыпается ТОТ, кто просил (главный агент или агент элемента), строкой узла `person-done`.
// Ворота человека — architect/admin; на временном адресе — пусто и отказ. Агент элемента приходит с ключом узла (`X-Node-Key`, как
// `tell-core`): POST `{ from, text, href?, why?, hint? }` ставит запрос, `{ from, drop }` снимает свой, `{ from, list: true }` — свои.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
const str = (v: unknown): string | null => (typeof v === "string" ? v : null)
const lang2 = (req: NextRequest): "en" | "ru" => (req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en")

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: true, asks: [] }, noStore)
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const lang = lang2(req)
  const list = (asks.open(ROOT) as (Ask & { action?: string })[]).map(({ id, text, href, why, hint, copy, by, secret, signin, action, at }) => ({
    // 761-16e: a request without a page opens the asking element's page («Открыть» in the beacon), the main agent's — none
    id, text, href: href ?? (by && by !== "build" ? `/${lang}/${by}` : null), why, hint: hint ?? null, copy: copy ?? null, at, by: by ?? "build", byName: by && by !== "build" ? elementName(by, lang) : null,
    secret: secret ?? null,
    // 777: a sign-in request — the window builds its link with the node's one builder
    signin: signin === "architect" ? "architect" : null,
    // 781-5: a request whose button does the act (the autostart)
    action: action === "autostart" ? "autostart" : null,
  }))
  // 781-4: the main agent's channel rides the same poll — the panel's red band shows it only in trouble (deaf, healing, failed).
  const h = mainChannel.health(ROOT, "build")
  return NextResponse.json({ ok: true, asks: list, channel: mainChannel.trouble(h) ? h : null }, noStore)
}

/** An element agent's own requests: put, drop or list — with the node key and its id (761-16d). */
async function fromElement(req: NextRequest) {
  let body: { from?: unknown; text?: unknown; href?: unknown; why?: unknown; hint?: unknown; copy?: unknown; secret?: unknown; drop?: unknown; done?: unknown; list?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, ...noStore }) }
  const from = typeof body.from === "string" ? body.from.trim() : ""
  if (from === "build" || !known(from)) return NextResponse.json({ ok: false, reason: "from must be an element of this node" }, { status: 400, ...noStore })
  if (body.list === true) return NextResponse.json({ ok: true, asks: (asks.open(ROOT) as Ask[]).filter((a) => a.by === from) }, noStore)
  // 761-16b: the person answered «Готово · <id>» in Telegram and the element's running agent got it — it closes its own request, no wake
  if (typeof body.done === "string") {
    const mine = (asks.open(ROOT) as Ask[]).some((a) => a.id === body.done && a.by === from && a.secret?.kind !== "env" && a.secret?.kind !== "openai")
    const out = mine ? (asks.done(ROOT, body.done) as Ask | null) : null
    return NextResponse.json({ ok: true, done: !!out, ...(out ? {} : { already: true }) }, noStore)
  }
  if (typeof body.drop === "string") {
    const mine = (asks.open(ROOT) as Ask[]).some((a) => a.id === body.drop && a.by === from)
    const out = mine ? asks.drop(ROOT, body.drop) : null
    return NextResponse.json({ ok: !!out, ...(out ? {} : { reason: "no open request of yours with this id" }) }, { status: out ? 200 : 404, ...noStore })
  }
  try {
    // 768: `secret: { name, where? }` — a key of this element's own account, typed by the person in the window; refused names say why
    const secret = body.secret && typeof body.secret === "object" ? { ...(body.secret as Record<string, unknown>), kind: "env" } : null
    const a = asks.add(ROOT, { text: body.text, href: str(body.href), why: str(body.why), hint: str(body.hint), copy: str(body.copy), by: from, secret }) as Ask
    const t = await asksTg.announce(ROOT, a, elementName(from, "ru"))
    if (t.sent) asks.setTg(ROOT, a.id, { via: t.via, sent: t.sent })
    console.log(`[node/person-asks] ${from} put ${a.id}; telegram: ${t.detail}`)
    return NextResponse.json({ ok: true, id: a.id, telegram: t.sent > 0 }, noStore)
  } catch (e) {
    return NextResponse.json({ ok: false, reason: e instanceof Error ? e.message : String(e) }, { status: 400, ...noStore })
  }
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-node-key")
  if (key) {
    if (!nodeKeyOk(key)) return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, ...noStore })
    return fromElement(req)
  }
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary address" }, { status: 403, ...noStore })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  let body: { id?: unknown; secret?: unknown; admin?: unknown; skip?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, ...noStore }) }
  const id = typeof body.id === "string" && /^[a-f0-9]{8}$/.test(body.id) ? body.id : null
  if (!id) return NextResponse.json({ ok: false, reason: "id required" }, { status: 400, ...noStore })
  // 768: an element's key typed in the window — written into ITS key file, its process restarted, then the request closes as «Готово»
  // (the same road as the Telegram form, `lib/node/person-secret-save.ts`).
  let saved: Saved | null = null
  const pending = (asks.open(ROOT) as Ask[]).find((x) => x.id === id) ?? null
  if (pending?.secret?.kind === "env" || pending?.secret?.kind === "openai") {
    const r = await saveSecret(pending, body.secret)
    if (!r.ok) return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, ...noStore })
    saved = r.saved
  }
  // 778-3: a newborn element's admin — only the architect names one (the sign-in's own counterweight, 778-2: a project admin may not
  // give an element-admin role); `admin: { email, password? }` goes straight to the sign-in, `skip: true` sends nothing.
  if (pending?.secret?.kind === "element-admin") {
    const onlyArchitect = await requireRoles(req, ["architect"])
    if (onlyArchitect) return onlyArchitect
    const r = await saveSecret(pending, body.admin, { skip: body.skip === true })
    if (!r.ok) return NextResponse.json({ ok: false, reason: r.reason }, { status: r.status, ...noStore })
    saved = r.saved
  }
  const out = await closeAsk(id, { saved, via: "window" })
  if (!out) return NextResponse.json({ ok: true, already: true }, noStore)
  const { woke, who } = out
  return NextResponse.json({ ok: true, woke, who, ...(saved ? { saved: true, restarted: saved.restarted, ...(saved.admin ? { admin: saved.admin } : {}) } : {}) }, noStore)
}
