import Link from "next/link"
import { StripeKeys } from "@/components/payments/stripe-keys.client"
import { paymentsUi } from "@/components/payments/payments.i18n"
import { connectedTo } from "@/lib/web4-items/payment-elements"
import type { PaymentElementsUi } from "../_i18n/payment-elements.i18n"

// «ПЛАТЕЖИ → WEB2» САМОГО ПЛАТЁЖНОГО ЭЛЕМЕНТА (551-5): кто он для узла, его ключи и кто к нему подключён. Ключи Stripe живут в элементе
// Stripe — тот же островок и та же дверь `/api/node/stripe`, что прежде у каждого элемента (530-1); у других платёжных элементов ключ
// называет их агент, когда построит приём оплаты. Серверный компонент: подключения читаются из паспортов элементов при отрисовке.
export function PaymentSelf({ item, tool, lang, ui }: { item: string; tool: string; lang: string; ui: PaymentElementsUi }) {
  const users = connectedTo(item)
  return (
    <div className="my-4 flex max-w-3xl flex-col gap-3" data-payment-self={tool}>
      <p className="text-sm text-muted-foreground">{ui.selfLead}</p>
      {tool === "stripe"
        ? <><p className="text-sm text-foreground">{ui.selfStripe}</p><StripeKeys target={item} words={paymentsUi(lang).stripe} /></>
        : <p className="text-sm text-foreground">{ui.selfOther}</p>}
      {users.length
        ? (
          <p className="text-sm text-muted-foreground" data-payment-users={users.length}>
            {ui.selfConnected}{" "}
            {users.map((u, i) => (
              <span key={u.id}>{i > 0 ? ", " : ""}<Link className="text-primary underline-offset-4 hover:underline" href={`/${lang}/architect/${u.address}/settings/payments/web2`}>{u.address}</Link></span>
            ))}
          </p>
        )
        : <p className="text-sm text-muted-foreground" data-payment-users="0">{ui.selfNobody}</p>}
    </div>
  )
}
