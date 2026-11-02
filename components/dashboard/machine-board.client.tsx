"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TestTable, type TestRow } from "@/components/super-node/test-table"
import type { SuperNodeWords } from "@/components/super-node/super-node.i18n"

// «ЭТОТ КОМПЬЮТЕР» В DASHBOARD (572). Владелец 2026-10-22: «покажи в нём технические характеристики компьютера»; поля — «Машина + что ест
// память», сравнение с супер-узлом — «Да, строкой сравнения». Страница предрендерена: числа о машине спрашиваются у `/api/node/machine` при
// открытии и по кнопке «Обновить» (таймеров нет). Таблица Tier-2 — тот же вид, что в «Супер узел → Статус» (`TestTable`).

type Machine = {
  platform: string; cpus: number; cpuModel: string; aes: boolean | null; ramGb: number; ramFreeGb: number
  diskTotalGb: number | null; diskFreeGb: number | null; uptimeHours: number; node: string; measuredAt: string
}
type MemoryRow = { id: string; name: string; kind: "core" | "element" | "resident"; mb: number; watchMb: number; status: string }
type Report = { machine: Machine; memory: MemoryRow[] | null; tier2: TestRow[] }

export type MachineBoardWords = {
  loading: string
  unavailable: string
  refresh: string
  machineTitle: string
  machineLead: string
  facts: { platform: string; cpu: string; cores: string; ram: string; disk: string; uptime: string; node: string }
  free: string
  hours: string
  notMeasured: string
  memoryTitle: string
  memoryLead: string
  memoryUnavailable: string
  memoryHead: [string, string, string, string, string]
  kinds: { core: string; resident: string }
  status: Record<string, string>
  total: string
  tier2Title: string
  tier2Lead: string
  tier2: { title: string; ok: string; short: string; head: [string, string, string, string] }
  superNode: SuperNodeWords
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function MachineBoard({ words, lang }: { words: MachineBoardWords; lang: string }) {
  const [state, setState] = useState<Report | "loading" | "failed">("loading")
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setBusy(true)
    fetch(`${BASE}/api/node/machine`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Report) => setState(d))
      .catch(() => setState((s) => (s === "loading" ? "failed" : s)))
      .finally(() => setBusy(false))
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = (
    <Button variant="outline" size="sm" onClick={load} disabled={busy} data-machine-refresh>
      <RefreshCw className={busy ? "animate-spin" : undefined} aria-hidden /> {words.refresh}
    </Button>
  )

  if (state === "loading") {
    // 567-7: форма будущих карточек, пока узел отвечает.
    return (
      <div className="flex flex-col gap-4" role="status" aria-label={words.loading} data-machine-skeleton>
        {[6, 8, 8].map((n, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-3/4" /></CardHeader>
            <CardContent className="flex flex-col gap-2">{Array.from({ length: n }, (_, k) => <Skeleton key={k} className="h-4 w-full" />)}</CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (state === "failed") return <p className="text-sm text-destructive" role="alert">{words.unavailable}</p>

  const m = state.machine
  const gb = (n: number | null) => (typeof n === "number" ? `${n} GB` : words.notMeasured)
  const facts: [string, string][] = [
    [words.facts.platform, m.platform],
    [words.facts.cpu, m.cpuModel || words.notMeasured],
    [words.facts.cores, String(m.cpus)],
    [words.facts.ram, `${gb(m.ramGb)} · ${words.free} ${gb(m.ramFreeGb)}`],
    [words.facts.disk, `${gb(m.diskTotalGb)} · ${words.free} ${gb(m.diskFreeGb)}`],
    [words.facts.uptime, `${m.uptimeHours} ${words.hours}`],
    [words.facts.node, m.node],
  ]
  const rows = [...(state.memory ?? [])].sort((a, b) => b.mb + b.watchMb - (a.mb + a.watchMb))
  const sum = rows.reduce((s, r) => s + r.mb + r.watchMb, 0)
  const name = (r: MemoryRow) => (r.kind === "core" ? words.kinds.core : r.kind === "resident" ? `${r.name} (${words.kinds.resident})` : r.name)
  const cell = "px-3 py-2 align-top whitespace-nowrap"
  const sn = words.superNode
  const { head: tierHead, ...tierTest } = words.tier2
  const tierWords: SuperNodeWords = { ...sn, test: { ...sn.test, ...tierTest }, machine: { ...sn.machine, head: tierHead } }

  return (
    <div className="flex flex-col gap-4" data-machine-board>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{words.machineTitle}</CardTitle>
          <CardDescription>{words.machineLead}</CardDescription>
          <CardAction>{refresh}</CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]" data-machine-facts>
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{words.memoryTitle}</CardTitle>
          <CardDescription>{words.memoryLead}</CardDescription>
        </CardHeader>
        <CardContent>
          {state.memory === null ? (
            <p className="text-sm text-muted-foreground">{words.memoryUnavailable}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm" data-machine-memory={rows.length}>
                <thead className="border-b border-border bg-muted/40">
                  <tr>{words.memoryHead.map((h) => <th key={h} scope="col" className={`${cell} font-semibold text-foreground`}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 text-muted-foreground" data-memory-row={r.id}>
                      <td className={`${cell} text-foreground`}>{name(r)}</td>
                      <td className={cell}>{r.mb} MB</td>
                      <td className={cell}>{r.watchMb ? `${r.watchMb} MB` : "—"}</td>
                      <td className={`${cell} font-medium text-foreground`}>{r.mb + r.watchMb} MB</td>
                      <td className={cell}>{words.status[r.status] ?? r.status}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-semibold text-foreground">
                    <td className={cell}>{words.total}</td><td className={cell} /><td className={cell} /><td className={cell}>{sum} MB</td><td className={cell} />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{words.tier2Title}</CardTitle>
          <CardDescription>{words.tier2Lead}</CardDescription>
        </CardHeader>
        <CardContent>
          <TestTable test={{ at: m.measuredAt, verdict: state.tier2.some((r) => r.verdict === "short") ? "short" : "ok", rows: state.tier2, platform: m.platform }} words={tierWords} lang={lang} />
        </CardContent>
      </Card>
    </div>
  )
}
