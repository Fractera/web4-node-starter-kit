"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { DocLinks } from "@/components/lagrix/doc-items"
import type { SuperNodeWords } from "./super-node.i18n"

// «СУПЕР УЗЕЛ → НАСТРОЙКИ» (530-3, 531): страна оператора, покрытие (принимаемые теги), региональные запреты, открытые списки — три слоя
// ограничений документа Lagrix 17.9 и декларация 18.4; запрещённое по умолчанию — только для чтения. Хранится на узле
// (`/api/node/super-node`, `action: "settings"`); если сервер супер-узла подключён, декларация уходит ему (`PUT /operator/v1/declaration`,
// документ 15 §15.7), и он публикует её. Опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Settings = { country: string; coverage: string[]; regional: string[]; lists: string[] } | null
const lines = (t: string) => t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)

export function SuperNodeSettings({ lang, words }: { lang: string; words: SuperNodeWords }) {
  const [state, setState] = useState<"loading" | "failed" | "ready">("loading")
  const [country, setCountry] = useState("")
  const [coverage, setCoverage] = useState("")
  const [regional, setRegional] = useState("")
  const [lists, setLists] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  const apply = (s: Settings) => {
    if (!s) return
    setCountry(s.country); setCoverage(s.coverage.join("\n")); setRegional(s.regional.join("\n")); setLists(s.lists.join("\n"))
  }

  useEffect(() => {
    fetch(`${BASE}/api/node/super-node`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; settings?: Settings }) => { if (!j.ok) { setState("failed"); return } apply(j.settings ?? null); setState("ready") })
      .catch(() => setState("failed"))
  }, [])

  const s = words.settings
  async function save() {
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${BASE}/api/node/super-node`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "settings", country, coverage: lines(coverage), regional: lines(regional), lists: lines(lists) }),
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; settings?: Settings; pushed?: boolean | null } | null
      if (j?.ok) {
        apply(j.settings ?? null)
        setNote({ ok: j.pushed !== false, text: j.pushed === true ? s.savedPushed : j.pushed === false ? s.savedNotPushed : s.saved })
      } else setNote({ ok: false, text: `${words.failed} ${words.errors[j?.error ?? ""] ?? j?.error ?? r.status}` })
    } catch {
      setNote({ ok: false, text: words.failed })
    }
    setBusy(false)
  }

  if (state === "loading") return <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>
  if (state === "failed") return <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>
  return (
    <div className="flex max-w-3xl flex-col gap-6" data-super-node-settings>
      <section className="flex flex-col gap-4">
        <Field className="max-w-sm">
          <FieldLabel htmlFor="sn-country">{s.countryLabel}</FieldLabel>
          <Input id="sn-country" className="max-w-24 uppercase" maxLength={2} value={country} onChange={(e) => setCountry(e.target.value)} />
          <FieldDescription>{s.countryHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="sn-coverage">{s.coverageLabel}</FieldLabel>
          <Textarea id="sn-coverage" rows={4} className="font-mono" spellCheck={false} value={coverage} onChange={(e) => setCoverage(e.target.value)} />
          <FieldDescription>{s.coverageHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="sn-regional">{s.regionalLabel}</FieldLabel>
          <Textarea id="sn-regional" rows={4} className="font-mono" spellCheck={false} value={regional} onChange={(e) => setRegional(e.target.value)} />
          <FieldDescription>{s.regionalHint}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="sn-lists">{s.listsLabel}</FieldLabel>
          <Textarea id="sn-lists" rows={3} className="font-mono" spellCheck={false} value={lists} onChange={(e) => setLists(e.target.value)} />
          <FieldDescription>{s.listsHint}</FieldDescription>
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={save} disabled={busy} data-super-node-settings-save>{busy ? words.busy : s.save}</Button>
          {note && <p className={note.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
        </div>
        <p className="text-[length:var(--fs-small)] text-muted-foreground">{s.declarationNote}</p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{s.defaultTitle}</CardTitle>
          <CardDescription>{s.defaultNote}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground" data-default-prohibited>{s.defaults.map((d) => <li key={d}>{d}</li>)}</ul>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{words.docsTitle}: <DocLinks lang={lang} docs={words.pageDocs.settings} className="text-sm" /></p>
    </div>
  )
}
