"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableTools } from "@/components/table/table-tools.client"
import type { TableUi } from "@/sections/table.i18n"
import type { PaymentElementsUi } from "../_i18n/payment-elements.i18n"
import { terminalLink } from "../architect/kits/_agent-kit/core/client/terminal-paste.mjs"

// «НАСТРОЙКИ → ПЛАТЕЖИ → WEB2» ЭЛЕМЕНТА (551-5). Владелец 2026-10-20: «Web два … должен а внутри показывать с какими платёжными элементами
// он интегрирован … как вкладки аккордеона подключённые платёжные элементы в раскрывающимся аккордеоне две другие вкладки какие были
// созданы для взаимодействия API и Hook, а также дашборд … заглушку с текстом создайте вам необходим … пустая таблица, а также аналитика
// … единственное график без обработки данных заглушку».
// Платёжные элементы узла и подключения спрашиваются при открытии у двери `/api/node/payments` (страница предрендерена); «Подключить»
// пишет `payments.web2.<инструмент>.element` в паспорт этого элемента — и только: агенты не будятся, i2i не начинается само. «Поручить
// агенту» кладёт задачу в окно вставки терминала, отправляет человек. Дашборд и аналитика — заглушки без выдуманных чисел.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Link_ = { skill: string; why: string; protocol?: string; via?: string }
type PaymentElement = { id: string; address: string; name: string; tool: string; connected: boolean; links: { api: Link_[]; hooks: Link_[] } }

/** Пустой график-заглушка: сетка и оси приглушёнными токенами, ни одной метки значения (данных нет — значит и чисел нет). */
function EmptyChart({ ui }: { ui: PaymentElementsUi }) {
  return (
    <figure className="flex flex-col gap-2" data-empty-chart>
      <svg viewBox="0 0 400 160" role="img" aria-label={`${ui.analyticsAxis.value}: ${ui.analyticsEmpty}`} className="h-40 w-full max-w-xl text-border">
        {[24, 60, 96].map((y) => <line key={y} x1="40" x2="390" y1={y} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />)}
        <line x1="40" x2="390" y1="132" y2="132" stroke="currentColor" strokeWidth="1" />
        <line x1="40" x2="40" y1="16" y2="132" stroke="currentColor" strokeWidth="1" />
        <text x="215" y="82" textAnchor="middle" className="fill-muted-foreground text-[12px]">{ui.analyticsEmpty}</text>
        <text x="215" y="152" textAnchor="middle" className="fill-muted-foreground text-[11px]">{ui.analyticsAxis.time}</text>
        <text x="12" y="74" textAnchor="middle" transform="rotate(-90 12 74)" className="fill-muted-foreground text-[11px]">{ui.analyticsAxis.value}</text>
      </svg>
    </figure>
  )
}

function Links({ title, links }: { title: string; links: Link_[] }) {
  return (
    <section className="flex flex-col gap-1">
      <span className="text-sm font-medium">{title}</span>
      <ul className="ml-5 list-disc text-sm text-muted-foreground">
        {links.map((l) => <li key={`${l.skill}-${l.why.slice(0, 20)}`}><span className="font-mono text-foreground">{l.skill}</span> — {l.why}{l.via ? ` (${l.via})` : ""}</li>)}
      </ul>
    </section>
  )
}

export function PaymentElements({ item, address, lang, ui, table }: {
  item: string
  /** Адрес этого элемента в ядре — для ссылки на его терминал (`<адрес>/build/terminal`). */
  address: string
  lang: string
  ui: PaymentElementsUi
  table: TableUi
}) {
  const terminalHref = `/${lang}/architect/${address}/build/terminal`
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  const [list, setList] = useState<PaymentElement[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/payments?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; paymentElements?: PaymentElement[] }) => {
        if (!live) return
        if (j.ok && Array.isArray(j.paymentElements)) { setList(j.paymentElements); setState("ready") } else setState("failed")
      })
      .catch(() => live && setState("failed"))
    return () => { live = false }
  }, [item])

  async function toggle(e: PaymentElement, on: boolean) {
    setBusy(e.id)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, connect: { tool: e.tool, on } }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (r.ok && j?.ok) setList((xs) => xs.map((x) => (x.id === e.id ? { ...x, connected: on } : x)))
      else setError(ui.errors[j?.error ?? ""] ?? ui.saveFailed)
    } catch {
      setError(ui.saveFailed)
    } finally {
      setBusy(null)
    }
  }

  const head = (
    <tr className="border-b border-border">
      {ui.dashboardHead.map((h) => <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>)}
    </tr>
  )

  return (
    <div className="my-4 flex max-w-4xl flex-col gap-3" data-payment-elements>
      <p className="text-sm text-muted-foreground">{ui.lead}</p>
      {state === "loading" && <Skeleton className="h-24 w-full" aria-label={ui.loading} />}
      {state === "failed" && <p className="text-sm text-destructive" role="alert">{ui.failed}</p>}
      {state === "ready" && list.length === 0 && <p className="text-sm text-muted-foreground" data-payment-elements-none>{ui.none}</p>}
      {state === "ready" && list.length > 0 && (
        <Accordion type="single" collapsible className="rounded-lg border border-border px-4">
          {list.map((e) => {
            const task = ui.assignTask.replace("{name}", e.name).replace("{address}", e.address)
            const built = e.links.api.length + e.links.hooks.length > 0
            return (
              <AccordionItem key={e.id} value={e.id} data-payment-element={e.id} data-connected={e.connected ? "true" : "false"}>
                <div className="flex flex-wrap items-center gap-3 py-2">
                  <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{e.name}</span>
                      <Badge variant={e.connected ? "secondary" : "outline"}>{e.connected ? ui.connected : ui.notConnected}</Badge>
                    </span>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Switch id={`connect-${e.id}`} checked={e.connected} disabled={busy === e.id} onCheckedChange={(on) => toggle(e, on)} data-connect={e.tool} />
                    <Label htmlFor={`connect-${e.id}`}>{ui.connect}</Label>
                  </div>
                </div>
                <AccordionContent>
                  <Tabs defaultValue="api" className="gap-3">
                    <TabsList>
                      <TabsTrigger value="api">{ui.tabApi}</TabsTrigger>
                      <TabsTrigger value="dashboard">{ui.tabDashboard}</TabsTrigger>
                      <TabsTrigger value="analytics">{ui.tabAnalytics}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="api" className="flex flex-col gap-3" data-payment-tab="api">
                      {built ? (
                        <>
                          {e.links.api.length > 0 && <Links title={ui.apiTitle} links={e.links.api} />}
                          {e.links.hooks.length > 0 && <Links title={ui.hooksTitle} links={e.links.hooks} />}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{e.connected ? ui.nothingBuilt : ui.notConnectedYet}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {e.connected && !built && (
                          <Link href={terminalLink({ lang, service: `${address}/build`, text: task })} className={buttonVariants({ variant: "secondary", size: "sm" })} data-payment-assign>{ui.assign}</Link>
                        )}
                        <Link href={`/${lang}/architect/${e.address}/settings/payments/web2`} className={buttonVariants({ variant: "outline", size: "sm" })}>{ui.openElement}</Link>
                      </div>
                    </TabsContent>
                    <TabsContent value="dashboard" className="flex flex-col gap-3" data-payment-tab="dashboard">
                      <span className="text-sm font-medium">{ui.dashboardTitle}</span>
                      <TableTools columns={ui.dashboardHead.length} head={head} rows={[]} texts={[]} words={{ ...table, empty: ui.dashboardEmpty }} />
                      <Link href={terminalHref} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>{ui.terminal}</Link>
                    </TabsContent>
                    <TabsContent value="analytics" className="flex flex-col gap-3" data-payment-tab="analytics">
                      <span className="text-sm font-medium">{ui.analyticsTitle}</span>
                      <EmptyChart ui={ui} />
                      <Link href={terminalHref} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}>{ui.terminal}</Link>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
