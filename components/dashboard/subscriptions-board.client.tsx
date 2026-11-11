"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, RefreshCw, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"
import type { Balance, BoardRow, BoardUser } from "@/lib/web4-items/subscriptions-board"
import { BalanceLine, TodayLine, type SubscriptionsTodayWords } from "./subscriptions-today.client"

// «DASHBOARD → ВСЕ ПОДПИСКИ» (726-3). Владелец 2026-11-11: «таблица … все подписки она указывает название сервиса и выпадающем списке
// показывают все элементы которые его вызывают». Страница предрендерена: строки спрашиваются у `/api/node/subscriptions` при открытии и
// по «Обновить» (таймеров нет — их не заказывали). Слова приходят пропсами с сервера (словарь в браузер не уезжает).

type Keys = NonNullable<BoardRow["keys"]>

export type SubscriptionsBoardWords = {
  loading: string
  unavailable: string
  refresh: string
  /** `{days}` */
  lead: string
  head: [string, string, string, string, string, string]
  core: string
  example: string
  keys: Record<Keys, string>
  noKeys: string
  /** `{n}` */
  usersCount: string
  usersTitle: string
  /** `{n}` calls, `{r}` refused */
  usage: string
  noCalls: string
  answered: string
  refused: string
  /** `{in}`, `{out}` */
  tokens: string
  emptyTitle: string
  emptyHint: string
  /** 726-4: the button that asks the providers about money, on request only */
  checkBalances: string
  money: SubscriptionsTodayWords
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DASH = "—"
const KEY_TONE: Record<Keys, "secondary" | "outline" | "destructive"> = { set: "secondary", partial: "outline", missing: "destructive" }

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""))

function UsersMenu({ row, words, lang }: { row: BoardRow; words: SubscriptionsBoardWords; lang: string }) {
  const name = (u: BoardUser) => (u.id === "core" ? words.core : u.label)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-subscription-users={row.users.length}>
          {row.users.length === 1 ? name(row.users[0]) : fill(words.usersCount, { n: row.users.length })}
          <ChevronDown aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-72">
        <DropdownMenuLabel>{words.usersTitle}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {row.users.map((u) => {
          const body = (
            <span className="flex w-full flex-col gap-0.5">
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">{name(u)}</span>
                {u.keys ? <Badge variant={KEY_TONE[u.keys]}>{words.keys[u.keys]}</Badge> : null}
              </span>
              <span className="text-xs text-muted-foreground">
                {u.calls ? fill(words.usage, { n: u.calls, r: u.refused }) : words.noCalls}
                {u.example ? ` · ${words.example}` : ""}
                {u.consumers.length ? ` · ${u.consumers.join(", ")}` : ""}
              </span>
            </span>
          )
          return u.href
            ? <DropdownMenuItem key={u.id} asChild data-subscription-user={u.id}><a href={`${BASE}/${lang}${u.href}`}>{body}</a></DropdownMenuItem>
            : <DropdownMenuItem key={u.id} data-subscription-user={u.id}>{body}</DropdownMenuItem>
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SubscriptionsBoard({ words, lang }: { words: SubscriptionsBoardWords; lang: string }) {
  const [state, setState] = useState<{ rows: BoardRow[]; windowDays: number } | "loading" | "failed">("loading")
  const [balances, setBalances] = useState<Record<string, Balance> | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback((withBalances = false) => {
    setBusy(true)
    fetch(`${BASE}/api/node/subscriptions?lang=${lang}${withBalances ? "&balances=1" : ""}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { rows: BoardRow[]; windowDays: number; balances: Record<string, Balance> | null }) => {
        setState({ rows: d.rows, windowDays: d.windowDays })
        if (d.balances) setBalances(d.balances)
      })
      .catch(() => setState((s) => (s === "loading" ? "failed" : s)))
      .finally(() => setBusy(false))
  }, [lang])

  useEffect(() => { load() }, [load])

  if (state === "loading") {
    return (
      <div className="my-6 flex flex-col gap-3" role="status" aria-label={words.loading} data-subscriptions-skeleton>
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }
  if (state === "failed") return <Small className="my-6 text-destructive" role="alert">{words.unavailable}</Small>

  const when = (at: string) => new Date(at).toLocaleString(lang, { dateStyle: "short", timeStyle: "short" })

  return (
    <div className="my-6 flex flex-col gap-4" data-subscriptions-board={state.rows.length}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Small className="text-muted-foreground">{fill(words.lead, { days: state.windowDays })}</Small>
        <span className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={busy} data-subscriptions-balances>
            <Wallet aria-hidden /> {words.checkBalances}
          </Button>
          <Button variant="outline" size="sm" onClick={() => load()} disabled={busy} data-subscriptions-refresh>
            <RefreshCw className={busy ? "animate-spin" : undefined} aria-hidden /> {words.refresh}
          </Button>
        </span>
      </div>
      {!state.rows.length ? (
        <EmptyState title={words.emptyTitle} hint={words.emptyHint} />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>{words.head.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {state.rows.map((r) => (
                <TableRow key={r.service} data-subscription-row={r.service} className="align-top">
                  <TableCell className="min-w-44 max-w-60 whitespace-normal">
                    <span className="flex flex-wrap items-center gap-2">
                      {r.docs
                        ? <a className="font-semibold text-foreground underline-offset-4 hover:underline" href={r.docs} target="_blank" rel="noopener noreferrer">{r.name}</a>
                        : <span className="font-semibold text-foreground">{r.name}</span>}
                      {r.example ? <Badge variant="outline">{words.example}</Badge> : null}
                    </span>
                    {r.description ? <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{r.description}</span> : null}
                  </TableCell>
                  <TableCell><UsersMenu row={r} words={words} lang={lang} /></TableCell>
                  <TableCell className="whitespace-normal">
                    {r.keys ? <Badge variant={KEY_TONE[r.keys]}>{words.keys[r.keys]}</Badge> : <span className="text-muted-foreground">{words.noKeys}</span>}
                    <BalanceLine row={r} balance={balances?.[r.service]} words={words.money} />
                  </TableCell>
                  <TableCell className="whitespace-normal tabular-nums">
                    {r.calls ? fill(words.usage, { n: r.calls, r: r.refused }) : <span className="text-muted-foreground">{words.noCalls}</span>}
                    {r.tokensIn || r.tokensOut ? <span className="block text-xs text-muted-foreground">{fill(words.tokens, { in: r.tokensIn, out: r.tokensOut })}</span> : null}
                    <TodayLine row={r} words={words.money} lang={lang} onSaved={() => load()} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {r.lastCall ? (
                      <>
                        <span className={r.lastCall.ok ? "text-foreground" : "text-destructive"}>{r.lastCall.ok ? words.answered : words.refused}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">{when(r.lastCall.at)} · {r.lastCall.element === "core" ? words.core : r.lastCall.label}{r.lastCall.who ? ` · ${r.lastCall.who}` : ""}</span>
                      </>
                    ) : <span className="text-muted-foreground">{DASH}</span>}
                  </TableCell>
                  <TableCell className="min-w-52 max-w-72 whitespace-normal break-words" data-subscription-error={r.lastError?.code ?? r.lastError?.reason ?? ""}>
                    {r.lastError ? (
                      <>
                        <span className="text-destructive">{r.lastError.reason ?? DASH}{r.lastError.code ? <> · <code className="text-xs break-all">{r.lastError.code}</code></> : null}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">{when(r.lastError.at)} · {r.lastError.element === "core" ? words.core : r.lastError.label}{r.lastError.who ? ` · ${r.lastError.who}` : ""}</span>
                        {r.lastError.message ? <span className="mt-1 line-clamp-3 block text-xs break-all text-muted-foreground">{r.lastError.message}</span> : null}
                      </>
                    ) : <span className="text-muted-foreground">{DASH}</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
