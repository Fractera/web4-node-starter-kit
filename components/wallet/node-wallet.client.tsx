"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DocItems, DocLinks } from "@/components/lagrix/doc-items"
import type { NodeWalletWords } from "./node-wallet.i18n"

// КОШЕЛЁК УЗЛА — ОДИН ОСТРОВОК НА ЧЕТЫРЕ МЕСТА (530-1). Владелец 2026-10-18: «кладка с кошельком на уровне ядра будет продублировано её
// можно будет настроить и изнутри главного агента и из паспорта это нормально». Кошелёк один на узел (документ Lagrix 19): главная
// «Паспорта» (карточка в аккордеоне, 478-3), «Паспорт → Главный кошелёк», «Настройки → Платежи → Web3» главного агента и элемента —
// одна дверь `/api/node/wallet` и это тело. Ответ двери сразу меняет вид, без перезагрузки; опроса нет.
// 532: «Сгенерировать кошелёк» (ключ создаётся на узле, наружу — только файлом резервной копии) и у элемента (`element`) — наследование
// кошелька узла, «Добавить свой» и «Удалить свой» (снова кошелёк узла). Слово владельца — в `lib/web4-items/node-wallet.ts`.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const walletUrl = (element?: string, extra = "") =>
  `${BASE}/api/node/wallet${element !== undefined ? `?element=${encodeURIComponent(element)}${extra ? `&${extra}` : ""}` : extra ? `?${extra}` : ""}`
type Wallet = { address: string; kind?: "address" | "generated" } | null
type Source = "element" | "node" | null
// 553-6: `oneWallet` — узел единый проект: свой кошелёк элементу не завести (дверь отвечает 409 `one-wallet`).
type State = { wallet: Wallet; source: Source; own: Wallet; node: Wallet; oneWallet?: boolean }

const pick = (w: unknown): Wallet => {
  const x = w as { address?: string; kind?: "address" | "generated" } | null
  return x && typeof x.address === "string" ? { address: x.address, kind: x.kind } : null
}
const stateOf = (d: Record<string, unknown>, element?: string): State =>
  element === undefined
    ? { wallet: pick(d.wallet), source: d.wallet ? "node" : null, own: null, node: pick(d.wallet) }
    : { wallet: pick(d.wallet), source: (d.source as Source) ?? null, own: pick(d.own), node: pick(d.node), oneWallet: d.oneWallet === true }

/** Подключить, создать, снять кошелёк узла — или свой кошелёк элемента (`element` — адрес элемента в ядре). `initial` — уже известный
 *  кошелёк узла (паспорт спрашивает его сам). */
export function NodeWalletBody({ words, initial, element }: { words: NodeWalletWords; initial?: Wallet; element?: string }) {
  const [state, setState] = useState<State | "loading">(
    initial === undefined || element !== undefined ? "loading" : { wallet: initial, source: initial ? "node" : null, own: null, node: initial },
  )
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const url = (extra = "") => walletUrl(element, extra)

  useEffect(() => {
    if (initial !== undefined && element === undefined) { setState({ wallet: initial, source: initial ? "node" : null, own: null, node: initial }); return }
    fetch(walletUrl(element), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Record<string, unknown>) => setState(stateOf(d, element)))
      .catch(() => { setState({ wallet: null, source: null, own: null, node: null }); setError(words.failed) })
  }, [initial, element, words.failed])

  const send = async (method: "POST" | "DELETE", body?: object) => {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(url(), { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
      if (r.status === 422) { setError(words.badAddress); return }
      if (r.status === 403) { setError(words.temporaryAddress); return }
      if (!r.ok) { setError(words.failed); return }
      setState(stateOf((await r.json()) as Record<string, unknown>, element))
      setAddress("")
      setAdding(false)
      setConfirming(false)
    } catch {
      setError(words.failed)
    } finally {
      setBusy(false)
    }
  }

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`
  if (state === "loading") return <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>

  // Кошелёк, которым распоряжается ЭТА страница: узла — у узла, свой — у элемента.
  const mine = element === undefined ? state.wallet : state.own
  const showForm = element === undefined ? !mine : !mine && adding

  const form = (
    <div className="flex flex-col gap-3" data-wallet-form>
      <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); send("POST", { address }) }}>
        <Input className="max-w-md font-mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={words.placeholder} aria-label={words.placeholder} spellCheck={false} />
        <Button type="submit" variant="outline" disabled={busy || !address.trim()}>{words.connect}</Button>
      </form>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">{words.or}</span>
        <Button type="button" disabled={busy} onClick={() => send("POST", { generate: true })} data-wallet-generate>{words.generate}</Button>
      </div>
      <p className="text-sm text-muted-foreground">{words.generateNote}</p>
    </div>
  )

  const own = mine && (
    <div className="flex flex-col gap-3" data-wallet-kind={mine.kind ?? "address"}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">{element === undefined ? words.connected : words.ownWallet}</span>
        <code className="font-mono text-base text-foreground" title={mine.address}>{short(mine.address)}</code>
        {mine.kind === "generated" && (
          <a href={url("backup=1")} className={buttonVariants({ variant: "outline", size: "sm" })} data-wallet-backup>{words.backup}</a>
        )}
        {!confirming && (
          <Button variant="outline" size="sm" disabled={busy} onClick={() => (mine.kind === "generated" ? setConfirming(true) : send("DELETE"))}>
            {element === undefined ? words.disconnect : words.removeOwn}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{mine.kind === "generated" ? words.generatedNote : words.addressNote}</p>
      {confirming && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" role="alert" data-wallet-confirm>
          <p className="text-sm text-foreground">{words.removeWarning}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" disabled={busy} onClick={() => send("DELETE")}>{words.removeYes}</Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirming(false)}>{words.cancel}</Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-4" data-node-wallet={state.wallet ? "connected" : "none"} data-wallet-source={state.source ?? "none"}>
      {element !== undefined && !mine && (
        <div className="flex flex-col gap-2" data-wallet-inherits>
          {state.node ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">{words.inheritsNode}</span>
              <code className="font-mono text-base text-foreground" title={state.node.address}>{short(state.node.address)}</code>
            </div>
          ) : (
            <p className="text-sm text-foreground">{words.noNodeWallet} <a href={`${BASE}/${words.lang}/passport/wallet`} className="text-primary underline-offset-4 hover:underline">{words.nodeWalletLink}</a></p>
          )}
          {state.oneWallet
            ? <p className="text-sm text-muted-foreground" data-wallet-one>{words.oneWallet}</p>
            : !adding && <Button variant="outline" size="sm" className="w-fit" onClick={() => setAdding(true)} data-wallet-add-own>{words.addOwn}</Button>}
        </div>
      )}
      {element !== undefined && (mine || adding) && (
        <p className="text-sm text-muted-foreground" data-wallet-own-note>{words.ownNote} <DocLinks lang={words.lang} docs={["19-node-requirements"]} /></p>
      )}
      {own}
      {showForm && form}
      {element !== undefined && mine && state.node && (
        <p className="text-sm text-muted-foreground">{words.afterRemove} <code className="font-mono">{short(state.node.address)}</code></p>
      )}
      {/* 533: что поступает и что платится — при любом состоянии; «без кошелька» — только пока его нет. */}
      <Accordion type="single" collapsible defaultValue="wallet-income" className="flex flex-col gap-4">
        {!state.wallet && (
          <AccordionItem value="wallet-before" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4" data-wallet-before>
            <AccordionTrigger className="text-destructive">{words.beforeTitle}</AccordionTrigger>
            <AccordionContent><DocItems lang={words.lang} items={words.before} /></AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="wallet-income" className="rounded-lg border border-primary/30 bg-primary/5 px-4" data-wallet-income>
          <AccordionTrigger className="text-primary">{words.incomeTitle}</AccordionTrigger>
          <AccordionContent><DocItems lang={words.lang} items={words.income} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="wallet-costs" className="rounded-lg border px-4" data-wallet-costs>
          <AccordionTrigger>{words.costsTitle}</AccordionTrigger>
          <AccordionContent><DocItems lang={words.lang} items={words.costs} /></AccordionContent>
        </AccordionItem>
      </Accordion>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}

/** Карточка кошелька для своих вкладок: заголовок, пояснение, тело; `note` — строка о месте (главный агент); `element` — кошелёк элемента. */
export function NodeWalletCard({ words, note, element }: { words: NodeWalletWords; note?: string; element?: string }) {
  return (
    <Card className="my-4 max-w-3xl" data-node-wallet-card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{element === undefined ? words.title : words.elementTitle}</CardTitle>
        <CardDescription>{words.lead} <DocLinks lang={words.lang} docs={words.leadDocs} /></CardDescription>
        {note && <CardDescription className="text-foreground">{note}</CardDescription>}
      </CardHeader>
      <CardContent>
        <NodeWalletBody words={words} element={element} />
      </CardContent>
    </Card>
  )
}
