import "server-only"
import { readFileSync } from "node:fs"
import { passportFile } from "@/lib/web4-items/passport-file"
import elementProps from "@/lib/web4-items/element-props.cjs"
import { elementDir } from "@/lib/web4-items/element-github"
import { addressOf } from "@/lib/web4-items/element-address"
import { listServices } from "@/lib/microservices/registry"
import { elementPassport } from "@/lib/a2a/element-passport"

// ПЛАТЁЖНЫЕ ЭЛЕМЕНТЫ УЗЛА (551-5). Владелец 2026-10-20: «Web два … должен а внутри показывать с какими платёжными элементами он
// интегрирован. Платёжные элементы которые мы будем создавать это элементы которые будут создаваться как кастомные элементы которые могут
// подключаться по выбору пользователя».
// 🔒 ПЛАТЁЖНЫЙ ЭЛЕМЕНТ — ТОТ, ЧЕЙ ПАСПОРТ НЕСЁТ `payment: { tool, name }` (его несёт паспорт нативного элемента Stripe, шаг 573; 🪦 рождение платёжных элементов при первом запуске снято). Список
// не держится вторым файлом: узнаётся из реестра и паспортов на каждый запрос — элемент, удалённый человеком, исчезает из списка сам.
// 🔒 «ЧТО ПОСТРОЕНО ДЛЯ СВЯЗИ» — только связи двух элементов: что этот элемент берёт у платёжного (`consumes` его паспорта, API) и что
// платёжный берёт у него (`consumes` платёжного, обратные вызовы — Hook). Двери, которые шаблон даёт каждому элементу, сюда не идут.

export type PaymentElement = { id: string; address: string; name: string; tool: string }
export type PaymentLink = { skill: string; why: string; protocol?: string; via?: string }

/** Платёжная запись паспорта элемента или `null`. */
export function paymentOf(id: string): { tool: string; name: string } | null {
  const dir = elementDir(id)
  const p = dir ? (elementProps.readElementProps(dir) as { payment?: { tool: string; name: string } } | null)?.payment : null
  return p ?? null
}

/** Платёжные элементы узла: реестр + паспорт, в порядке реестра. */
export function listPaymentElements(): PaymentElement[] {
  return listServices().flatMap((s) => {
    const p = paymentOf(s.id)
    return p ? [{ id: s.id, address: addressOf(s.id), name: p.name, tool: p.tool }] : []
  })
}

type Consume = { skill: string; from?: string; why: string; protocol?: string; via?: string }
const consumesOf = (id: string): Consume[] => (elementPassport(id)?.ext?.consumes ?? []) as Consume[]
const link = (c: Consume): PaymentLink => ({ skill: c.skill, why: c.why, ...(c.protocol ? { protocol: c.protocol } : {}), ...(c.via ? { via: c.via } : {}) })

/** Элементы узла, подключившие этот платёжный элемент (`payments.web2.<инструмент>.element` их паспортов). */
export function connectedTo(payment: string): { id: string; address: string }[] {
  const tool = paymentOf(payment)?.tool
  if (!tool) return []
  return listServices().flatMap((s) => {
    if (s.id === payment) return []
    const file = passportFile(s.id)
    if (!file) return []
    try {
      const p = JSON.parse(readFileSync(file, "utf8")) as { payments?: { web2?: Record<string, { element?: string }> } }
      return p.payments?.web2?.[tool]?.element === payment ? [{ id: s.id, address: addressOf(s.id) }] : []
    } catch {
      return []
    }
  })
}

/** Что связывает элемент с платёжным: API — его вызовы платёжного, Hook — вызовы платёжного к нему. */
export function paymentLinks(item: string, payment: string): { api: PaymentLink[]; hooks: PaymentLink[] } {
  return {
    api: consumesOf(item).filter((c) => c.from === payment).map(link),
    hooks: consumesOf(payment).filter((c) => c.from === item).map(link),
  }
}
