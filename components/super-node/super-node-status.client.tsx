"use client"

import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DocItems } from "@/components/lagrix/doc-items"
import type { SuperNodeWords } from "./super-node.i18n"
import { TestTable, type SuperNodeTest } from "./test-table"

// «СУПЕР УЗЕЛ → СТАТУС» (531). Владелец 2026-10-18: «вкладку что-то типа статус в котором пользователь может нажать кнопку подать заявку
// (здесь надо написать что на момент заявки не нужно иметь сервер … у вас будет 48 … можете использовать домашний мощный компьютер …).
// Также в статусе нужно предположить как работает заявка одобрена показывает время и как раз там должна быть кнопка пройти тест».
// Состояния: нет · подана (ждёт одобрения; в прототипе — кнопка «Имитировать одобрение») · одобрена (дата, срок 48 часов, сервер супер-узла,
// «Пройти тест»). Всё — через `/api/node/super-node`; сервер супер-узла узел спрашивает по API оператора v1. Опроса и таймеров нет: оставшиеся
// часы считаются при открытии.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const HOURS = 48
type App = { status: "submitted" | "approved"; wallet: string; at: string; approvedAt?: string } | null
type State = { application: App; server: { url: string } | null; lastTest: SuperNodeTest | null; wallet: string | null }

export function SuperNodeStatus({ lang, words }: { lang: string; words: SuperNodeWords }) {
  const [state, setState] = useState<State | "loading" | "failed">("loading")
  const [url, setUrl] = useState("http://127.0.0.1:4011")
  const [key, setKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/super-node`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean } & Partial<State>) => setState(j.ok ? { application: j.application ?? null, server: j.server ?? null, lastTest: j.lastTest ?? null, wallet: j.wallet ?? null } : "failed"))
      .catch(() => setState("failed"))
  }, [])

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/super-node`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) })
      const j = (await r.json().catch(() => null)) as ({ ok?: boolean; error?: string } & Partial<State>) | null
      if (j?.ok) {
        setState({ application: j.application ?? null, server: j.server ?? null, lastTest: j.lastTest ?? null, wallet: j.wallet ?? null })
        if (action === "connect") setKey("")
      } else setError(`${words.failed} ${words.errors[j?.error ?? ""] ?? j?.error ?? r.status}`)
    } catch {
      setError(words.failed)
    }
    setBusy(false)
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short" })
  const howCard = (
    <Card>
      <CardHeader><CardTitle className="text-lg font-semibold">{words.howTitle}</CardTitle></CardHeader>
      <CardContent><DocItems lang={lang} items={words.how} /></CardContent>
    </Card>
  )

  if (state === "loading") return <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>
  if (state === "failed") return <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>

  const app = state.application
  const status = app ? app.status : "none"
  let deadlineLine: string | null = null
  if (app?.status === "approved" && app.approvedAt) {
    const end = new Date(new Date(app.approvedAt).getTime() + HOURS * 3600_000)
    const left = Math.ceil((end.getTime() - Date.now()) / 3600_000)
    deadlineLine = left > 0 ? words.deadline.replace("{date}", fmt(end.toISOString())).replace("{hours}", String(left)) : words.expired.replace("{date}", fmt(end.toISOString()))
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6" data-super-node-status={status}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{words.status[status]}</CardTitle>
          {app?.status === "submitted" && <CardDescription>{words.submittedNote}</CardDescription>}
          {app?.status === "approved" && app.approvedAt && <CardDescription className="text-foreground">{words.approvedAt.replace("{date}", fmt(app.approvedAt))} {deadlineLine}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!app && !state.wallet && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <p className="text-sm text-foreground">{words.noWallet}</p>
              <a href={`${BASE}/${lang}/passport/wallet`} className={buttonVariants({ size: "sm" })}>{words.walletLink}</a>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!app && <Button type="button" onClick={() => act("apply")} disabled={busy || !state.wallet} data-super-node-apply>{busy ? words.busy : words.apply}</Button>}
            {app?.status === "submitted" && <Button type="button" variant="secondary" onClick={() => act("approve")} disabled={busy} data-super-node-simulate>{words.simulate}</Button>}
            {app && <Button type="button" variant="outline" onClick={() => act("withdraw")} disabled={busy} data-super-node-withdraw>{words.withdraw}</Button>}
          </div>
          {app?.status === "submitted" && <p className="text-[length:var(--fs-small)] text-muted-foreground">{words.simulateNote}</p>}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </CardContent>
      </Card>

      {app?.status === "approved" && (
        <Card data-super-node-server={state.server ? "connected" : "none"}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{words.server.title}</CardTitle>
            <CardDescription>{words.server.lead}</CardDescription>
            <a href="https://github.com/lagrix-dev/lagrix-supernode/tree/main/prototype" target="_blank" rel="noopener noreferrer" className="w-fit text-sm text-primary underline-offset-4 hover:underline">{words.server.packageLink}</a>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {state.server ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-foreground">{words.server.connected.replace("{url}", state.server.url)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => act("disconnect")} disabled={busy}>{words.server.disconnect}</Button>
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); act("connect", { url, key }) }}>
                <Field>
                  <FieldLabel htmlFor="sn-url">{words.server.urlLabel}</FieldLabel>
                  <Input id="sn-url" className="max-w-md font-mono" value={url} onChange={(e) => setUrl(e.target.value)} spellCheck={false} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sn-key">{words.server.keyLabel}</FieldLabel>
                  <Input id="sn-key" type="password" autoComplete="off" className="max-w-md font-mono" value={key} onChange={(e) => setKey(e.target.value)} spellCheck={false} />
                  <FieldDescription>{words.server.keyHint}</FieldDescription>
                </Field>
                <Button type="submit" className="w-fit" disabled={busy || !url.trim() || !key.trim()} data-super-node-connect>{words.server.connect}</Button>
              </form>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => act("test")} disabled={busy || !state.server} data-super-node-test-run>{busy ? words.test.running : words.test.run}</Button>
            </div>
            {state.lastTest ? <TestTable test={state.lastTest} words={words} lang={lang} /> : <p className="text-sm text-muted-foreground">{words.test.none}</p>}
            <p className="text-[length:var(--fs-small)] text-muted-foreground">{words.test.forwardNote}</p>
          </CardContent>
        </Card>
      )}

      {howCard}
    </div>
  )
}
