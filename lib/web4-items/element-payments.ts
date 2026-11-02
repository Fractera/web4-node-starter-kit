import "server-only"
import { readPassport, writePassportField } from "@/lib/web4-items/passport-file"

// ПЛАТЕЖИ ЭЛЕМЕНТА В ЕГО ПАСПОРТЕ (551-4). Владелец 2026-10-20: «все эти свойства должны [в] own-service-props, и его объект
// payments/web4/a2a-card/name/…. И аналогично образом нужно писать наличие или отсутствие payments/web2/tool( stripe, или
// другой)/a2a-card/name/….»; поправка того же дня: «must use web3 , web4 is another technology».
//
// Поле паспорта `payments`:
//   web3["a2a-card"][<имя карточки>] = { description, consultation, usage, commission } — карточка возможностей, оплата в USDC через сеть;
//   web2[<инструмент>] = { element, "a2a-card": { [<имя карточки>]: {} } } — подключённый платёжный элемент (551-5) и карточки, которые
//   можно оплатить через него картой (наличие ключа = да).
// 🔒 Суммы — USDC, не меньше 0 (0 — бесплатно), не больше 10 000, не точнее цента. `commission` — получать ли долю разработчика
//   (запись 51 журнала Lagrix), по умолчанию да.
// 🔒 НАРУЖУ НЕ ИДЁТ (как `messengerSettings`): публичная дверь паспорта отдаёт поля поимённо; сеть Lagrix цены пока не применяет.
// 🔒 Описание карточки пишет агент элемента по кнопке «Описать с помощью ИИ» (навык `passport-description`); дверь его не меняет.

export type CardPrices = { description: string; consultation: number; usage: number; commission: boolean }
export type ElementPayments = {
  web3?: { "a2a-card"?: Record<string, Partial<CardPrices>> }
  web2?: Record<string, { element?: string; "a2a-card"?: Record<string, Record<string, never>> }>
}

/** Владелец: «оставим только одну единственную карточку … кнопку образец» — карточка-образец. */
export const SAMPLE_CARD = "sample"
export const CARD_DEFAULTS: CardPrices = { description: "", consultation: 0, usage: 0, commission: true }

const MAX_USDC = 10000
const CARD_NAME = /^[a-z][a-z0-9-]{0,39}$/

const amount = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_USDC && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6
    ? Math.round(v * 100) / 100
    : null

/** `web2` — инструменты подключённых платёжных элементов, через которые карточку можно оплатить картой (551-5); нет — не меняется. */
export type CardInput = { name: string; consultation: number; usage: number; commission: boolean; web2?: string[] }
const TOOL = /^[a-z][a-z0-9-]{0,39}$/

/** Проверка карточки из тела двери; отказ называет род — `bad-card`, `bad-amount`, `bad-switch`. */
export function parseCard(body: unknown): { ok: true; value: CardInput } | { ok: false; error: "bad-card" | "bad-amount" | "bad-switch" } {
  const c = (body as { card?: Record<string, unknown> } | null)?.card
  if (!c || typeof c !== "object" || typeof c.name !== "string" || !CARD_NAME.test(c.name)) return { ok: false, error: "bad-card" }
  const consultation = amount(c.consultation)
  const usage = amount(c.usage)
  if (consultation === null || usage === null) return { ok: false, error: "bad-amount" }
  if (typeof c.commission !== "boolean") return { ok: false, error: "bad-switch" }
  if (c.web2 !== undefined && !(Array.isArray(c.web2) && c.web2.every((t) => typeof t === "string" && TOOL.test(t)))) return { ok: false, error: "bad-card" }
  return { ok: true, value: { name: c.name, consultation, usage, commission: c.commission, ...(Array.isArray(c.web2) ? { web2: [...new Set(c.web2 as string[])] } : {}) } }
}

const asObject = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

/** Поле `payments` паспорта как есть (нет — пустой объект). */
export function paymentsOf(raw: Record<string, unknown>): ElementPayments {
  return asObject(raw.payments) as ElementPayments
}

/** Карточка из паспорта поверх умолчаний; сохранённая ли она — `saved`. */
export function cardOf(p: ElementPayments, name: string): { card: CardPrices; saved: boolean } {
  const got = p.web3?.["a2a-card"]?.[name]
  if (!got) return { card: { ...CARD_DEFAULTS }, saved: false }
  return {
    card: {
      description: typeof got.description === "string" ? got.description : "",
      consultation: amount(got.consultation) ?? 0,
      usage: amount(got.usage) ?? 0,
      commission: typeof got.commission === "boolean" ? got.commission : true,
    },
    saved: true,
  }
}

/** Платежи элемента и карточка-образец. Паспорта нет — `null`. */
export async function readPayments(id: string): Promise<{ payments: ElementPayments; sample: { card: CardPrices; saved: boolean } } | null> {
  const raw = await readPassport(id)
  if (!raw) return null
  const payments = paymentsOf(raw)
  return { payments, sample: cardOf(payments, SAMPLE_CARD) }
}

/** Сохранить цены карточки; описание (его пишет агент) и остальные части `payments` не трогаются. `web2` (551-5) — отметки «оплата
 *  картой» у подключённых инструментов: отмеченный получает `web2[<инструмент>]["a2a-card"][<имя>] = {}`, снятый теряет эту запись;
 *  неподключённый инструмент — отказ `not-connected`, файл не меняется. */
export async function saveCard(id: string, v: CardInput): Promise<"ok" | "no-passport" | "not-connected"> {
  const raw = await readPassport(id)
  if (!raw) return "no-passport"
  const p = paymentsOf(raw)
  const cards = { ...(p.web3?.["a2a-card"] ?? {}) }
  const prev = cards[v.name] ?? {}
  cards[v.name] = { description: typeof prev.description === "string" ? prev.description : "", consultation: v.consultation, usage: v.usage, commission: v.commission }
  let web2 = p.web2
  if (v.web2) {
    const connected = Object.keys(p.web2 ?? {})
    if (v.web2.some((t) => !connected.includes(t))) return "not-connected"
    web2 = Object.fromEntries(connected.map((t) => {
      const tool = { ...(p.web2?.[t] ?? {}) }
      const byCard = { ...(tool["a2a-card"] ?? {}) }
      if (v.web2!.includes(t)) byCard[v.name] = {}
      else delete byCard[v.name]
      return [t, { ...tool, "a2a-card": byCard }]
    }))
  }
  const ok = await writePassportField(id, "payments", { ...p, web3: { ...(p.web3 ?? {}), "a2a-card": cards }, ...(web2 ? { web2 } : {}) })
  return ok ? "ok" : "no-passport"
}

export type ConnectInput = { tool: string; on: boolean }

/** Проверка подключения из тела двери: `{ connect: { tool, on } }`, иначе `bad-connect`. */
export function parseConnect(body: unknown): { ok: true; value: ConnectInput } | { ok: false; error: "bad-connect" } {
  const c = (body as { connect?: Record<string, unknown> } | null)?.connect
  return c && typeof c.tool === "string" && TOOL.test(c.tool) && typeof c.on === "boolean"
    ? { ok: true, value: { tool: c.tool, on: c.on } }
    : { ok: false, error: "bad-connect" }
}

/** Подключить платёжный элемент (`web2[<инструмент>].element`) или снять подключение вместе с отметками карточек. */
export async function saveConnect(id: string, v: ConnectInput, element: string): Promise<boolean> {
  const raw = await readPassport(id)
  if (!raw) return false
  const p = paymentsOf(raw)
  const web2 = { ...(p.web2 ?? {}) }
  if (v.on) web2[v.tool] = { ...(web2[v.tool] ?? {}), element }
  else delete web2[v.tool]
  return writePassportField(id, "payments", { ...p, web2 })
}
