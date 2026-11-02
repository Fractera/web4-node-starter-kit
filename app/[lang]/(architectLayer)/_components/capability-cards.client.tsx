"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { IndicatorHint } from "@/components/element-docs/indicator-hint.client"
import { DocLinks } from "@/components/lagrix/doc-items"
import type { CapabilityCardUi } from "../_i18n/capability-card.i18n"

// «РАБОЧИЙ ПРОЦЕСС → A2A: ВАША РАБОТА → КАРТОЧКИ ВОЗМОЖНОСТЕЙ» (551-4). Владелец 2026-10-20: «оставим только одну единственную карточку
// покрасим её в оранжевый цвет и поставим кнопку образец. Нажатие на кнопку откроет вниз настройку карточки то есть она раскроется вниз
// станет шире как элемент аккордеона и там пользователь должен будет с помощью искусственного интеллекта настроить писание карточки, и
// настроить … стоимость обнаружения · стоимость использования · комиссия. Для каждой из этих вкладок сделать?»; первая цена — «Стоимость
// консультации (Рекомендую)».
// Цвет — токен `--warning` темы ядра. Значения спрашиваются при открытии у двери `/api/node/payments` (страница предрендерена),
// «Сохранить» пишет их в паспорт элемента (`payments.web3["a2a-card"].sample`). Описание пишет агент элемента по кнопке ИИ — задача
// кладётся в окно вставки его терминала, отправляет человек. Таймеров и опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Card = { description: string; consultation: number; usage: number; commission: boolean }
type Web2 = { tool: string; name: string; on: boolean }
type PaymentsReply = {
  ok?: boolean
  sample?: { card: Card }
  payments?: { web2?: Record<string, { "a2a-card"?: Record<string, unknown> }> }
  paymentElements?: { tool: string; name: string; connected: boolean }[]
}

export function CapabilityCards({ item, ui, describeHref, web2Href }: { item: string; ui: CapabilityCardUi; describeHref: string; web2Href: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  const [description, setDescription] = useState("")
  const [consultation, setConsultation] = useState("0")
  const [usage, setUsage] = useState("0")
  const [commission, setCommission] = useState(true)
  const [web2, setWeb2] = useState<Web2[]>([])
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/payments?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: PaymentsReply) => {
        if (!live) return
        if (!j.ok || !j.sample) { setState("failed"); return }
        setDescription(j.sample.card.description)
        setConsultation(String(j.sample.card.consultation))
        setUsage(String(j.sample.card.usage))
        setCommission(j.sample.card.commission)
        setWeb2((j.paymentElements ?? []).filter((e) => e.connected).map((e) => ({ tool: e.tool, name: e.name, on: Boolean(j.payments?.web2?.[e.tool]?.["a2a-card"]?.sample) })))
        setState("ready")
      })
      .catch(() => live && setState("failed"))
    return () => { live = false }
  }, [item])

  async function save() {
    setBusy(true)
    setNote(null)
    const num = (s: string) => Number(s.replace(",", ".").trim())
    try {
      const r = await fetch(`${BASE}/api/node/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, card: { name: "sample", consultation: num(consultation), usage: num(usage), commission, web2: web2.filter((w) => w.on).map((w) => w.tool) } }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      setNote(r.ok && j?.ok ? { ok: true, text: ui.saved } : { ok: false, text: ui.errors[j?.error ?? ""] ?? ui.failed })
    } catch {
      setNote({ ok: false, text: ui.failed })
    } finally {
      setBusy(false)
    }
  }

  const label = (text: string, hint: string[], htmlFor?: string) => (
    <span className="flex items-center gap-1">
      {htmlFor ? <FieldLabel htmlFor={htmlFor}>{text}</FieldLabel> : <span className="text-sm font-medium">{text}</span>}
      <IndicatorHint label={`${text}: ${ui.hint}`} text={hint} />
    </span>
  )

  return (
    <div className="my-4 flex flex-col gap-3" data-capability-cards>
      <p className="max-w-3xl text-sm text-muted-foreground">{ui.lead}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Collapsible open={open} onOpenChange={setOpen} className={open ? "sm:col-span-2" : undefined}>
          <Card className="border-2 border-warning bg-warning/10" data-capability-card="sample" data-sample data-open={open ? "true" : "false"}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{ui.sampleTitle}</CardTitle>
              <CardDescription>{ui.sampleLead}</CardDescription>
              <CardAction>
                <Button type="button" variant="outline" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-sample-toggle>
                  {open ? ui.close : ui.open}
                </Button>
              </CardAction>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="flex flex-col gap-5">
                {state === "loading" && <Skeleton className="h-24 w-full" aria-label={ui.loading} />}
                {state === "failed" && <p className="text-sm text-destructive" role="alert">{ui.failed}</p>}
                {state === "ready" && (
                  <>
                    <section className="flex flex-col gap-2" data-card-description>
                      <span className="text-sm font-medium">{ui.descriptionTitle}</span>
                      <p className="text-sm text-muted-foreground">{description || ui.noDescription}</p>
                      <Link href={describeHref} className={buttonVariants({ variant: "secondary", size: "sm", className: "self-start" })} data-card-describe>
                        {ui.describe}
                      </Link>
                    </section>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        {label(ui.consultation, ui.consultationHint, "card-consultation")}
                        <Input id="card-consultation" inputMode="decimal" value={consultation} onChange={(e) => setConsultation(e.target.value)} data-card-consultation />
                        <FieldDescription>{ui.consultationUnit} · <DocLinks lang={ui.lang} docs={ui.consultationDocs} /></FieldDescription>
                      </Field>
                      <Field>
                        {label(ui.usage, ui.usageHint, "card-usage")}
                        <Input id="card-usage" inputMode="decimal" value={usage} onChange={(e) => setUsage(e.target.value)} data-card-usage />
                        <FieldDescription>{ui.usageUnit} · <DocLinks lang={ui.lang} docs={ui.usageDocs} /></FieldDescription>
                      </Field>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <Switch id="card-commission" checked={commission} onCheckedChange={setCommission} data-card-commission />
                        <Label htmlFor="card-commission">{ui.commission}</Label>
                        <IndicatorHint label={`${ui.commission}: ${ui.hint}`} text={ui.commissionHint} />
                      </div>
                      <DocLinks lang={ui.lang} docs={ui.commissionDocs} />
                    </div>
                    <section className="flex flex-col gap-2" data-card-web2={web2.length}>
                      <span className="text-sm font-medium">{ui.web2Title}</span>
                      <p className="text-xs text-muted-foreground">{ui.web2Lead}</p>
                      {web2.length
                        ? web2.map((w) => (
                          <div key={w.tool} className="flex items-center gap-2">
                            <Checkbox id={`card-web2-${w.tool}`} checked={w.on} onCheckedChange={(v) => setWeb2((xs) => xs.map((x) => (x.tool === w.tool ? { ...x, on: v === true } : x)))} data-card-web2-tool={w.tool} />
                            <Label htmlFor={`card-web2-${w.tool}`}>{w.name}</Label>
                          </div>
                        ))
                        : <p className="text-sm text-muted-foreground">{ui.web2None} <Link className="text-primary underline-offset-4 hover:underline" href={web2Href}>{ui.web2Open}</Link></p>}
                    </section>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" onClick={save} disabled={busy} data-card-save>{busy ? ui.saving : ui.save}</Button>
                      {note && <p className={`text-sm ${note.ok ? "text-muted-foreground" : "text-destructive"}`} role={note.ok ? "status" : "alert"}>{note.text}</p>}
                    </div>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  )
}
