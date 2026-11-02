import Link from "next/link"
import { listPaymentElements } from "@/lib/web4-items/payment-elements"
import type { PaymentElementsUi } from "../_i18n/payment-elements.i18n"

// «ГЛАВНЫЙ АГЕНТ → НАСТРОЙКИ → ПЛАТЕЖИ → WEB2» (551-5): платёжные элементы узла со ссылками. 🪦 Здесь стояла форма ключей Stripe для
// ядра (530-1): этих ключей никто не читал, теперь они живут в самом элементе Stripe. Серверный компонент: список — из реестра и
// паспортов при отрисовке.
export function NodePaymentElements({ lang, ui }: { lang: string; ui: PaymentElementsUi }) {
  const list = listPaymentElements()
  return (
    <div className="my-4 flex max-w-3xl flex-col gap-2" data-node-payment-elements={list.length}>
      <p className="text-sm text-muted-foreground">{ui.lead}</p>
      {list.length
        ? (
          <ul className="ml-5 list-disc text-sm">
            {list.map((e) => (
              <li key={e.id}>
                <Link className="text-primary underline-offset-4 hover:underline" href={`/${lang}/architect/${e.address}/settings/payments/web2`}>{e.name}</Link>
                <span className="text-muted-foreground"> — {e.address}</span>
              </li>
            ))}
          </ul>
        )
        : <p className="text-sm text-muted-foreground">{ui.none}</p>}
    </div>
  )
}
