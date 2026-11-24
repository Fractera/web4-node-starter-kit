"use client"
// @local — the one form of «Build → Предложить в маркетплейсе» of an own native element (854); no other page needs it

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { H2 } from "@/components/ui/typography"
import type { MarketOfferUi } from "../_i18n/element-market-offer.i18n"

// «ПРЕДЛОЖИТЬ В МАРКЕТПЛЕЙСЕ» (854; Roma 2026-11-24: «выпадающем списке выбрать веб два Fractera, Web4 (Lagrix) … следующий раздел
// предложить там будет просто форма отправить заявку»): шаг 1 — выпадающий список маркетплейса и «Далее»; шаг 2 — форма заявки.
// Заявка хранится на узле дверью `/api/node/market-offer` и никуда не уходит — страница говорит это прямо. Таймеров и опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Market = "web2" | "web4"
type Offer = { at: string; market: Market }

export function ElementMarketOffer({ item, lang, ui }: { item: string; lang: string; ui: MarketOfferUi }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  const [last, setLast] = useState<Offer | null>(null)
  const [market, setMarket] = useState<Market | "">("")
  const [step, setStep] = useState<"choose" | "form">("choose")
  const [summary, setSummary] = useState("")
  const [price, setPrice] = useState("")
  const [per, setPer] = useState<"once" | "month">("once")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/market-offer?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; offer?: Offer | null }) => {
        if (!live) return
        if (j.ok) { setLast(j.offer ?? null); setState("ready") } else setState("failed")
      })
      .catch(() => live && setState("failed"))
    return () => { live = false }
  }, [item])

  async function send() {
    setBusy(true)
    setSaid(null)
    try {
      const r = await fetch(`${BASE}/api/node/market-offer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ item, market, summary, price, per, note }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; offer?: Offer } | null
      if (j?.ok && j.offer) { setLast(j.offer); setSaid({ ok: true, text: ui.kept[j.offer.market] }) }
      else setSaid({ ok: false, text: `${ui.failed} ${ui.errors[j?.error as keyof MarketOfferUi["errors"]] ?? j?.error ?? r.status}` })
    } catch {
      setSaid({ ok: false, text: ui.failed })
    }
    setBusy(false)
  }

  if (state === "loading") return <Skeleton className="h-32 w-full max-w-3xl" aria-label={ui.loading} data-market-offer="loading" />
  if (state === "failed") return <p className="my-4 text-sm text-destructive" role="alert" data-market-offer="failed">{ui.loadFailed}</p>

  const lastLine = last
    ? ui.last
      .replace("{date}", new Date(last.at).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short" }))
      .replace("{market}", ui.markets[last.market].name)
    : null

  return (
    <div className="flex max-w-3xl flex-col gap-6" data-market-offer={step}>
      {lastLine && <p className="text-sm text-muted-foreground" data-market-offer-last>{lastLine}</p>}

      <section className="flex flex-col gap-4 rounded-lg border border-border p-4" data-block="market-offer-choose">
        <Field>
          <FieldLabel htmlFor="market-offer-market">{ui.marketLabel}</FieldLabel>
          <Select value={market} onValueChange={(v) => { setMarket(v as Market); setSaid(null) }} disabled={step === "form"}>
            <SelectTrigger id="market-offer-market" className="w-full sm:max-w-sm" data-market-offer-select>
              <SelectValue placeholder={ui.marketPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {(["web2", "web4"] as const).map((m) => <SelectItem key={m} value={m} data-market={m}>{ui.markets[m].name}</SelectItem>)}
            </SelectContent>
          </Select>
          {market && <FieldDescription>{ui.markets[market].hint}</FieldDescription>}
        </Field>
        {step === "choose"
          ? <Button type="button" className="self-start" disabled={!market} onClick={() => setStep("form")} data-market-offer-next>{ui.next}</Button>
          : <Button type="button" variant="outline" className="self-start" onClick={() => { setStep("choose"); setSaid(null) }}>{ui.back}</Button>}
      </section>

      {step === "form" && market && (
        <section className="flex flex-col gap-4 rounded-lg border border-border p-4" data-block="market-offer-form">
          <H2 variant="ui">{ui.formTitle}</H2>
          <Field>
            <FieldLabel htmlFor="market-offer-summary">{ui.summaryLabel}</FieldLabel>
            <Textarea id="market-offer-summary" rows={5} maxLength={2000} value={summary} onChange={(e) => setSummary(e.target.value)} data-market-offer-summary />
            <FieldDescription>{ui.summaryHint}</FieldDescription>
          </Field>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-end gap-3">
              <Field className="w-40">
                <FieldLabel htmlFor="market-offer-price">{ui.priceLabel}</FieldLabel>
                <Input id="market-offer-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} data-market-offer-price />
              </Field>
              <Select value={per} onValueChange={(v) => setPer(v as "once" | "month")}>
                <SelectTrigger className="w-36" aria-label={ui.priceLabel}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["once", "month"] as const).map((p) => <SelectItem key={p} value={p}>{ui.per[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[length:var(--fs-small)] text-muted-foreground">{ui.priceHint}</p>
          </div>
          <Field>
            <FieldLabel htmlFor="market-offer-note">{ui.noteLabel}</FieldLabel>
            <Textarea id="market-offer-note" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} data-market-offer-note />
            <FieldDescription>{ui.noteHint}</FieldDescription>
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={send} disabled={busy} data-market-offer-send>{busy ? ui.sending : ui.send}</Button>
            {said && <p className={said.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={said.ok ? "status" : "alert"} data-market-offer-said={said.ok ? "ok" : "no"}>{said.text}</p>}
          </div>
        </section>
      )}
    </div>
  )
}
