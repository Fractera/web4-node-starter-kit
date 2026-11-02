"use client"

import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { TableTools } from "@/components/table/table-tools.client"
import { DocItems, DocLinks } from "@/components/lagrix/doc-items"
import type { TableUi } from "@/sections/table.i18n"
import type { SuperNodeWords } from "./super-node.i18n"

// «СУПЕР УЗЕЛ → ВЫПЛАТЫ» (530-3, 531): таблица (`TableTools` — поиск сверху, страницы снизу) с сервера супер-узла по API оператора
// (`/operator/v1/payouts`, документ Lagrix 15 §15.7); ниже — за что платят супер-узлу, с документами. Сервер не подключён — так и сказано.
// Спрашивается при открытии; опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Payout = { at: string; period?: string; kind: keyof SuperNodeWords["payouts"]["kinds"]; amount: number; note?: string; tx?: string }

export function SuperNodePayouts({ lang, words, table }: { lang: string; words: SuperNodeWords; table: TableUi }) {
  const [rows, setRows] = useState<Payout[] | "loading" | "not-connected" | "failed">("loading")
  useEffect(() => {
    fetch(`${BASE}/api/node/super-node/remote?part=payouts`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; error?: string; data?: { payouts?: Payout[] } }) => setRows(j.ok ? j.data?.payouts ?? [] : j.error === "not-connected" ? "not-connected" : "failed"))
      .catch(() => setRows("failed"))
  }, [])

  const p = words.payouts
  const cell = "px-4 py-3 align-top"
  const money = new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  const head = <tr className="border-b border-border">{p.head.map((h) => <th key={h} scope="col" className={`${cell} font-semibold whitespace-nowrap text-foreground`}>{h}</th>)}</tr>

  return (
    <div className="flex max-w-5xl flex-col gap-4" data-super-node-payouts={typeof rows === "string" ? rows : rows.length}>
      {rows === "loading" && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>}
      {rows === "failed" && <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>}
      {rows === "not-connected" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm text-foreground">{words.notConnected}</p>
          <a href={`${BASE}/${lang}/super-node/status`} className={buttonVariants({ size: "sm", variant: "outline" })}>{words.statusLinkShort}</a>
        </div>
      )}
      {Array.isArray(rows) && rows.length === 0 && <p className="text-sm text-muted-foreground" data-payouts-empty>{p.empty}</p>}
      {Array.isArray(rows) && rows.length > 0 && (
        <TableTools
          columns={p.head.length}
          head={head}
          rows={rows.map((r, i) => (
            <tr key={`${r.at}-${i}`} className="border-b border-border last:border-0 text-muted-foreground">
              <td className={cell}>{r.at.replace("T", " ").slice(0, 16)}</td>
              <td className={cell}>{r.period || "—"}</td>
              <td className={`${cell} text-foreground`}>{p.kinds[r.kind] ?? r.kind}</td>
              <td className={`${cell} text-foreground`}>{money.format(r.amount)}</td>
              <td className={cell}>{r.note || "—"}</td>
              <td className={`${cell} font-mono`}>{r.tx ? `${r.tx.slice(0, 10)}…` : "—"}</td>
            </tr>
          ))}
          texts={rows.map((r) => [r.at, r.period, p.kinds[r.kind], r.note, r.tx].filter(Boolean).join(" "))}
          words={table}
        />
      )}
      <Card>
        <CardHeader><CardTitle className="text-lg font-semibold">{p.whatTitle}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <DocItems lang={lang} items={p.what} ordered />
          <p className="text-sm text-muted-foreground">{words.incomeNote.text} <DocLinks lang={lang} docs={words.incomeNote.docs} /></p>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{words.docsTitle}: <DocLinks lang={lang} docs={words.pageDocs.payouts} className="text-sm" /></p>
    </div>
  )
}
