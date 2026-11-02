"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { StripeWords } from "./payments.i18n"

// «ПЛАТЕЖИ → WEB2» (530-1): ключи Stripe цели — ядра (`core`) или элемента. Состояние (какие заданы, режим) спрашивается у двери
// `/api/node/stripe` при открытии; «Сохранить» шлёт только заполненные поля, дверь проверяет их у Stripe и пишет в `.env.local`.
// Значения на страницу не возвращаются никогда — поля после сохранения пустые. Опроса нет.
// 573-4: ключ агента (`rk_…` с меткой агента) — инструменты MCP Stripe агента элемента; после записи дверь отвечает, готов ли его `.mcp.json`.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Name = "STRIPE_SECRET_KEY" | "STRIPE_PUBLISHABLE_KEY" | "STRIPE_WEBHOOK_SECRET" | "STRIPE_AGENT_API_KEY"
type State = { set: Name[]; mode: "test" | "live" | null }

export function StripeKeys({ target, words }: { target: string; words: StripeWords }) {
  const [state, setState] = useState<State | "loading" | "failed">("loading")
  const [secretKey, setSecret] = useState("")
  const [publishableKey, setPublishable] = useState("")
  const [webhookSecret, setWebhook] = useState("")
  const [agentKey, setAgent] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/stripe?target=${encodeURIComponent(target)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean } & Partial<State>) => setState(j.ok ? { set: j.set ?? [], mode: j.mode ?? null } : "failed"))
      .catch(() => setState("failed"))
  }, [target])

  async function save() {
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${BASE}/api/node/stripe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target, secretKey, publishableKey, webhookSecret, agentKey }),
      })
      const j = (await r.json().catch(() => null)) as ({ ok?: boolean; error?: string; mcp?: "on" | "off" | "failed" | "no-script" } & Partial<State>) | null
      if (j?.ok) {
        setState({ set: j.set ?? [], mode: j.mode ?? null })
        setSecret(""); setPublishable(""); setWebhook(""); setAgent("")
        const mcp = j.mcp === "on" ? ` ${words.mcpOn}` : j.mcp === "no-script" ? ` ${words.mcpNoScript}` : j.mcp === "failed" ? ` ${words.mcpFailed}` : ""
        setNote({ ok: j.mcp !== "failed" && j.mcp !== "no-script", text: words.saved + mcp })
      } else setNote({ ok: false, text: `${words.failed} ${words.errors[j?.error ?? ""] ?? j?.error ?? r.status}` })
    } catch {
      setNote({ ok: false, text: words.failed })
    }
    setBusy(false)
  }

  const badge = (name: Name) =>
    state !== "loading" && state !== "failed" && state.set.includes(name)
      ? <Badge variant="secondary" data-stripe-set={name}>{words.isSet}</Badge>
      : <Badge variant="outline" data-stripe-unset={name}>{words.notSet}</Badge>

  return (
    <Card className="my-4 max-w-3xl" data-stripe-keys={target}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{words.title}</CardTitle>
        <CardDescription>{words.lead}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {state === "loading" ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>
        ) : state === "failed" ? (
          <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>
        ) : (
          state.mode && <p className="text-sm text-foreground" data-stripe-mode={state.mode}>{words.mode[state.mode]}</p>
        )}
        <Field>
          <div className="flex items-center gap-2"><FieldLabel htmlFor="stripe-secret">{words.secretLabel}</FieldLabel>{badge("STRIPE_SECRET_KEY")}</div>
          <Input id="stripe-secret" type="password" autoComplete="off" spellCheck={false} className="font-mono" value={secretKey} onChange={(e) => setSecret(e.target.value)} />
          <FieldDescription>{words.secretHint}</FieldDescription>
        </Field>
        <Field>
          <div className="flex items-center gap-2"><FieldLabel htmlFor="stripe-publishable">{words.publishableLabel}</FieldLabel>{badge("STRIPE_PUBLISHABLE_KEY")}</div>
          <Input id="stripe-publishable" autoComplete="off" spellCheck={false} className="font-mono" value={publishableKey} onChange={(e) => setPublishable(e.target.value)} />
          <FieldDescription>{words.publishableHint}</FieldDescription>
        </Field>
        <Field>
          <div className="flex items-center gap-2"><FieldLabel htmlFor="stripe-webhook">{words.webhookLabel}</FieldLabel>{badge("STRIPE_WEBHOOK_SECRET")}</div>
          <Input id="stripe-webhook" type="password" autoComplete="off" spellCheck={false} className="font-mono" value={webhookSecret} onChange={(e) => setWebhook(e.target.value)} />
          <FieldDescription>{words.webhookHint}</FieldDescription>
        </Field>
        <Field>
          <div className="flex items-center gap-2"><FieldLabel htmlFor="stripe-agent">{words.agentLabel}</FieldLabel>{badge("STRIPE_AGENT_API_KEY")}</div>
          <Input id="stripe-agent" type="password" autoComplete="off" spellCheck={false} className="font-mono" value={agentKey} onChange={(e) => setAgent(e.target.value)} />
          <FieldDescription>{words.agentHint}</FieldDescription>
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={save} disabled={busy || (!secretKey.trim() && !publishableKey.trim() && !webhookSecret.trim() && !agentKey.trim())} data-stripe-save>
            {busy ? words.saving : words.save}
          </Button>
          {note && <p className={note.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
        </div>
        <p className="text-[length:var(--fs-small)] text-muted-foreground">{words.restartNote}</p>
        <Accordion type="single" collapsible className="rounded-md border border-border px-3">
          <AccordionItem value="how" className="border-b-0">
            <AccordionTrigger>{words.howTitle}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">{words.how.map((x) => <li key={x}>{x}</li>)}</ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
