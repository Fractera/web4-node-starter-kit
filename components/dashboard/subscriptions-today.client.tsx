"use client"

import { useState } from "react"
import { Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import type { Balance, BoardRow } from "@/lib/web4-items/subscriptions-board"

// «ВСЕ ПОДПИСКИ» → «хватит ли на сегодня» (726-4). Владелец 2026-11-11: «текущая состояние то есть активно или неактивно – хватит на
// сегодня оплаченных ресурсов». Строка дня — из журнала платных вызовов, в ВЫЗОВАХ (цен узел не знает); бюджет дня задаёт человек здесь
// же; баланс — только по кнопке «Проверить балансы» и только там, где поставщик его сообщает (замер у первоисточника, lib/money-day.cjs).

type Today = BoardRow["today"]

export type SubscriptionsTodayWords = {
  /** `{n}` calls today, `{b}` budget */
  today: Record<Today["state"], string>
  budget: string
  budgetTitle: string
  budgetLead: string
  budgetSave: string
  budgetUnit: string
  /** balance answers; `{usd}`, `{key}`, `{status}` */
  balance: Record<Balance["state"], string>
  billing: string
}

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""))
const TONE: Record<Today["state"], string> = {
  "no-spend": "text-muted-foreground", "no-budget": "text-muted-foreground", within: "text-foreground",
  "will-cross": "text-destructive", crossed: "text-destructive", refusing: "text-destructive",
}

export function TodayLine({ row, words, lang, onSaved }: { row: BoardRow; words: SubscriptionsTodayWords; lang: string; onSaved: () => void }) {
  const [value, setValue] = useState(String(row.today.budget ?? ""))
  const [busy, setBusy] = useState(false)
  const t = row.today
  const time = t.at ? new Date(t.at).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) : ""

  const save = () => {
    setBusy(true)
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/node/subscriptions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service: row.service, calls: Number(value) || 0 }),
    }).then(() => onSaved()).finally(() => setBusy(false))
  }

  return (
    <span className="mt-1 flex flex-wrap items-center gap-1 text-xs" data-subscription-today={t.state}>
      <span className={TONE[t.state]}>{fill(words.today[t.state], { n: t.calls, b: t.budget ?? "", p: t.projected, t: time })}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" data-subscription-budget={row.service}>
            <Gauge aria-hidden /> {words.budget}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <PopoverHeader>
            <PopoverTitle>{fill(words.budgetTitle, { name: row.name })}</PopoverTitle>
            <PopoverDescription>{words.budgetLead}</PopoverDescription>
          </PopoverHeader>
          <InputGroup className="mt-3">
            <InputGroupInput type="number" min={0} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} aria-label={words.budgetUnit} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={save} disabled={busy} data-subscription-budget-save>{words.budgetSave}</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </PopoverContent>
      </Popover>
    </span>
  )
}

export function BalanceLine({ row, balance, words }: { row: BoardRow; balance: Balance | undefined; words: SubscriptionsTodayWords }) {
  if (!balance) return null
  const text = fill(words.balance[balance.state], {
    usd: "usd" in balance ? balance.usd.toFixed(2) : "", key: "key" in balance ? balance.key ?? "" : "", status: "status" in balance ? balance.status ?? "" : "",
  })
  return (
    <span className="mt-1 block text-xs text-muted-foreground" data-subscription-balance={balance.state}>
      {text}
      {row.money.billing ? <> · <a className="text-primary underline-offset-4 hover:underline" href={row.money.billing} target="_blank" rel="noopener noreferrer">{words.billing}</a></> : null}
    </span>
  )
}
