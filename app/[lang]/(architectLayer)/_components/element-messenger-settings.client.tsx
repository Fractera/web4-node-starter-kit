"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { H2 } from "@/components/ui/typography"
import type { MessengerSettingsUi } from "../_i18n/element-messenger-settings.i18n"

// «MESSENGER → НАСТРОЙКИ» ЭЛЕМЕНТА (528-2): тариф первого контакта (вкл/выкл, сумма, по умолчанию $1), раскрывающаяся карточка «что
// это значит», правила агента — «Категорически запрещено» и «Что меня интересует». Значения спрашиваются при открытии у двери ядра
// `/api/node/messenger-settings` (страница предрендерена), «Сохранить» пишет их в паспорт элемента. Таймеров и опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Settings = { firstContact: { enabled: boolean; usd: number }; agentRules: { forbidden: string[]; interests: string[] } }

const lines = (t: string) => t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)

export function ElementMessengerSettings({ item, lang, ui }: { item: string; lang: string; ui: MessengerSettingsUi }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  const [saved, setSaved] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [usd, setUsd] = useState("1")
  const [forbidden, setForbidden] = useState("")
  const [interests, setInterests] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  const apply = (s: Settings) => {
    setEnabled(s.firstContact.enabled)
    setUsd(String(s.firstContact.usd))
    setForbidden(s.agentRules.forbidden.join("\n"))
    setInterests(s.agentRules.interests.join("\n"))
  }

  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/messenger-settings?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; settings?: Settings; saved?: boolean }) => {
        if (!live) return
        if (j.ok && j.settings) { apply(j.settings); setSaved(!!j.saved); setState("ready") } else setState("failed")
      })
      .catch(() => live && setState("failed"))
    return () => { live = false }
  }, [item])

  async function save() {
    setBusy(true)
    setNote(null)
    const amount = Number(usd.replace(",", "."))
    try {
      const r = await fetch(`${BASE}/api/node/messenger-settings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          item,
          firstContact: { enabled, usd: Number.isFinite(amount) && usd.trim() !== "" ? amount : usd },
          agentRules: { forbidden: lines(forbidden), interests: lines(interests) },
        }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; settings?: Settings } | null
      if (j?.ok && j.settings) { apply(j.settings); setSaved(true); setNote({ ok: true, text: ui.saved }) }
      else setNote({ ok: false, text: `${ui.failed} ${ui.errors[j?.error as keyof MessengerSettingsUi["errors"]] ?? j?.error ?? r.status}` })
    } catch {
      setNote({ ok: false, text: ui.failed })
    }
    setBusy(false)
  }

  if (state === "loading") {
    return (
      <div className="flex max-w-3xl flex-col gap-3" aria-label={ui.loading} data-messenger-settings="loading">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (state === "failed") return <p className="my-4 text-sm text-destructive" role="alert" data-messenger-settings="failed">{ui.loadFailed}</p>

  const money = new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD" })
  const amount = Number(usd.replace(",", "."))
  return (
    <div className="flex max-w-3xl flex-col gap-6" data-messenger-settings="ready" data-saved={saved ? "yes" : "no"}>
      {!saved && <p className="text-sm text-muted-foreground">{ui.defaults}</p>}

      <section className="flex flex-col gap-4 rounded-lg border border-border p-4" data-first-contact>
        <H2 variant="ui">{ui.feeTitle}</H2>
        <div className="flex items-center gap-3">
          <Switch id="first-contact-on" checked={enabled} onCheckedChange={setEnabled} data-first-contact-switch />
          <Label htmlFor="first-contact-on">{ui.feeSwitch}</Label>
        </div>
        <p className="text-sm text-muted-foreground" data-first-contact-state={enabled ? "on" : "off"}>
          {enabled ? ui.feeOn.replace("{usd}", Number.isFinite(amount) ? money.format(amount) : usd) : ui.feeOff}
        </p>
        <Field>
          <FieldLabel htmlFor="first-contact-usd">{ui.amountLabel}</FieldLabel>
          <Input id="first-contact-usd" className="max-w-48" inputMode="decimal" value={usd} onChange={(e) => setUsd(e.target.value)} data-first-contact-usd />
          <FieldDescription>{ui.amountHint}</FieldDescription>
        </Field>
        <Accordion type="single" collapsible className="rounded-md border border-border px-3">
          <AccordionItem value="explain" className="border-b-0">
            <AccordionTrigger>{ui.explainTitle}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 text-sm leading-relaxed">{ui.explain.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border p-4" data-agent-rules>
        <div className="flex flex-col gap-1">
          <H2 variant="ui">{ui.rulesTitle}</H2>
          <p className="text-sm text-muted-foreground">{ui.rulesLead}</p>
        </div>
        <Field>
          <FieldLabel htmlFor="agent-forbidden">{ui.forbiddenLabel}</FieldLabel>
          <Textarea id="agent-forbidden" rows={4} value={forbidden} onChange={(e) => setForbidden(e.target.value)} data-agent-forbidden />
          <FieldDescription>{ui.forbiddenHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="agent-interests">{ui.interestsLabel}</FieldLabel>
          <Textarea id="agent-interests" rows={4} value={interests} onChange={(e) => setInterests(e.target.value)} data-agent-interests />
          <FieldDescription>{ui.interestsHint}</FieldDescription>
        </Field>
        <p className="text-[length:var(--fs-small)] text-muted-foreground">{ui.stored}</p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={busy} data-messenger-save>{busy ? ui.saving : ui.save}</Button>
        {note && <p className={note.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
      </div>
    </div>
  )
}
