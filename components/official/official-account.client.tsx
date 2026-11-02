"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { DocItems } from "@/components/lagrix/doc-items"
import type { OfficialWords } from "./official.i18n"

// «ПАСПОРТ → ОФИЦИАЛЬНЫЙ АККАУНТ» (530-2): что такое метка (документ Lagrix 24), заявка на узле — имя, чем известен, ≥ 3 источника.
// Состояние спрашивается у двери `/api/node/official` при открытии; без кошелька узла заявку не подготовить — ссылка на «Главный
// кошелёк». В сеть ничего не уходит; опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Draft = { name: string; knownFor: string; sources: string[]; wallet: string; savedAt: string }

export function OfficialAccount({ lang, words }: { lang: string; words: OfficialWords }) {
  const [state, setState] = useState<"loading" | "failed" | "ready">("loading")
  const [draft, setDraft] = useState<Draft | null>(null)
  const [wallet, setWallet] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [knownFor, setKnown] = useState("")
  const [sources, setSources] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  const apply = (d: Draft | null, w: string | null) => {
    setDraft(d)
    setWallet(w)
    if (d) { setName(d.name); setKnown(d.knownFor); setSources(d.sources.join("\n")) }
  }

  useEffect(() => {
    fetch(`${BASE}/api/node/official`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; draft?: Draft | null; wallet?: string | null }) => {
        if (!j.ok) { setState("failed"); return }
        apply(j.draft ?? null, j.wallet ?? null)
        setState("ready")
      })
      .catch(() => setState("failed"))
  }, [])

  async function send(method: "POST" | "DELETE") {
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${BASE}/api/node/official`, {
        method,
        headers: { "content-type": "application/json" },
        body: method === "POST" ? JSON.stringify({ name, knownFor, sources: sources.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) }) : undefined,
      })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; draft?: Draft | null; wallet?: string | null } | null
      if (j?.ok) {
        apply(j.draft ?? null, j.wallet ?? null)
        if (method === "DELETE") { setName(""); setKnown(""); setSources("") }
        setNote({ ok: true, text: words.saved })
      } else setNote({ ok: false, text: `${words.failed} ${words.errors[j?.error ?? ""] ?? j?.error ?? r.status}` })
    } catch {
      setNote({ ok: false, text: words.failed })
    }
    setBusy(false)
  }

  const date = (iso: string) => new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short" })

  return (
    <div className="flex max-w-3xl flex-col gap-6" data-official={state} data-official-draft={draft ? "yes" : "no"}>
      <Accordion type="single" collapsible className="rounded-lg border border-border px-4">
        <AccordionItem value="what" className="border-b-0">
          <AccordionTrigger>{words.whatTitle}</AccordionTrigger>
          <AccordionContent>
            <DocItems lang={lang} items={words.what} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {state === "loading" && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>}
      {state === "failed" && <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>}
      {state === "ready" && !wallet && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4" data-official-no-wallet>
          <p className="text-sm text-foreground">{words.noWallet}</p>
          <a href={`${BASE}/${lang}/passport/wallet`} className={buttonVariants({ size: "sm" })}>{words.walletLink}</a>
        </div>
      )}
      {state === "ready" && draft && (
        <Card data-official-saved>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{words.draftTitle}</CardTitle>
            <CardDescription>{words.draftNote.replace("{date}", date(draft.savedAt))}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">{draft.name}</p>
            <p className="text-muted-foreground">{draft.knownFor}</p>
            <ul className="list-disc pl-5">{draft.sources.map((s) => <li key={s} className="break-all">{s}</li>)}</ul>
          </CardContent>
        </Card>
      )}
      {state === "ready" && (
        <section className="flex flex-col gap-4">
          {wallet && <p className="text-sm text-muted-foreground" data-official-post>{words.postHint.replace("{wallet}", wallet)}</p>}
          <Field>
            <FieldLabel htmlFor="official-name">{words.nameLabel}</FieldLabel>
            <Input id="official-name" value={name} onChange={(e) => setName(e.target.value)} />
            <FieldDescription>{words.nameHint}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="official-known">{words.knownLabel}</FieldLabel>
            <Textarea id="official-known" rows={2} value={knownFor} onChange={(e) => setKnown(e.target.value)} />
            <FieldDescription>{words.knownHint}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="official-sources">{words.sourcesLabel}</FieldLabel>
            <Textarea id="official-sources" rows={4} className="font-mono" value={sources} onChange={(e) => setSources(e.target.value)} spellCheck={false} />
            <FieldDescription>{words.sourcesHint}</FieldDescription>
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => send("POST")} disabled={busy || !wallet} data-official-save>{busy ? words.saving : words.save}</Button>
            {draft && <Button type="button" variant="outline" onClick={() => send("DELETE")} disabled={busy}>{words.remove}</Button>}
            {note && <p className={note.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
          </div>
        </section>
      )}
    </div>
  )
}
