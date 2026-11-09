"use client"

import { useRef, useState } from "react"
import { ImageUp, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { H4, H5, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignPrototypeRow } from "./design-prototype-row.client"
import { BASE, type ActResult, type DesignState, type ProjectSkill } from "./types"
import { SMALL } from "./step-parts"

// ОДИН НАВЫК НА ТЕСТЕ (711-3, 711-5, вид 713-2): шапка с именем и «Сгенерировать пробную страницу» с ценой до нажатия, свои референсы
// (ссылка с подписью или картинка в хранилище узла) и его пробы строками. Рамки нет: навыки разделяет линия шага. По одной генерации за
// раз; навык со скриптами — только после отдельного «да».
export function DesignTestCard({ item, lang, skill, state, base, words, act, time }: {
  item: string; lang: string; skill: ProjectSkill; state: DesignState; base: string | null; words: ElementDesignWords
  act: (p: Record<string, unknown>) => Promise<ActResult>; time: (iso?: string) => string
}) {
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [note, setNote] = useState("")
  const [askScripts, setAskScripts] = useState(false)
  const [working, setWorking] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const refs = state.refs.filter((r) => r.mark === skill.mark)
  const protos = state.prototypes.filter((p) => p.skill === skill.mark && !p.archived)
  const queued = state.runs.filter((r) => r.kind === "generate" && r.mark === skill.mark && state.pending.includes(r.prototype) && !protos.some((p) => p.id === r.prototype)).map((r) => r.prototype)
  const price = words.price.replace("{sub}", state.limits.own ? words.subOwn : words.subNode).replace("{five}", String(state.limits.fiveHour ?? "?")).replace("{seven}", String(state.limits.sevenDay ?? "?"))
  const report = (r: ActResult) => { setNote(r.ok ? "" : `${words.failed} ${r.error ?? r.reason ?? ""}`); return r }
  async function upload(f: File) {
    setWorking(true)
    const fd = new FormData()
    fd.append("file", f)
    fd.append("title", f.name)
    const j = (await fetch(`${BASE}/api/media/upload`, { method: "POST", body: fd }).then((r) => r.json()).catch(() => null)) as { ok?: boolean; item?: { id: string } } | null
    if (j?.ok && j.item) report(await act({ action: "add-ref", mark: skill.mark, url: `/api/media/${j.item.id}/file`, mediaId: j.item.id, caption }))
    else setNote(`${words.failed} upload`)
    setWorking(false)
    if (file.current) file.current.value = ""
  }
  async function generate(scriptsYes = false) {
    setWorking(true)
    const r = report(await act({ action: "generate", mark: skill.mark, scriptsYes }))
    setAskScripts(!r.ok && r.reason === "scripts")
    setWorking(false)
  }
  return (
    <section data-block="edt01" data-test-card={skill.mark} className="flex flex-col gap-5">
      <div data-block="edt02" className="flex flex-wrap items-start justify-between gap-3">
        <div data-block="edt03" className="flex min-w-0 flex-col gap-0.5">
          <H4 data-block="edt04" variant="ui">{skill.name}</H4>
          <Small data-block="edt05">{words.groups[skill.origin]}{skill.source ? ` · ${skill.source}` : ""}</Small>
        </div>
        <Button disabled={working || state.busy || !state.supported} onClick={() => void generate()} data-design-generate>
          <Sparkles data-icon="inline-start" aria-hidden />
          {words.generate}
        </Button>
      </div>
      <Small data-block="edt06" className="-mt-2">{state.busy ? words.busy : price}</Small>
      {askScripts ? (
        <div data-block="edt07" className="flex flex-wrap items-center gap-2">
          <Small data-block="edt08" className="text-foreground">{words.scriptsAsk}</Small>
          <Button size="sm" variant="outline" onClick={() => void generate(true)}>{words.scriptsYes}</Button>
        </div>
      ) : null}
      {note ? <Small data-block="edt09" className="text-destructive" role="alert">{note}</Small> : null}
      {(protos.length > 0 || queued.length > 0) && (
        <ul data-block="edt10" className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {queued.map((id) => <DesignPrototypeRow key={id} item={item} lang={lang} proto={null} queued={id} base={base} words={words} time={time} />)}
          {protos.map((p) => <DesignPrototypeRow key={p.id} item={item} lang={lang} proto={p} base={base} words={words} time={time} onBuild={async () => report(await act({ action: "build" })).ok} />)}
        </ul>
      )}
      <div data-block="edt11" className="flex flex-col gap-2">
        <H5 data-block="edt12" variant="ui" className="text-muted-foreground">{words.refs}</H5>
        {refs.length === 0 ? <Small data-block="edt13">{words.refsEmpty}</Small> : (
          <ul data-block="edt14" className="flex flex-col gap-1">
            {refs.map((r) => (
              <li data-block="edt15" key={r.id} className="flex items-center gap-2">
                {r.mediaId ? <img src={`${BASE}${r.url}`} alt={r.caption ?? ""} className="size-8 shrink-0 rounded border border-border object-cover" /> : null}
                <a href={r.url.startsWith("/") ? `${BASE}${r.url}` : r.url} target="_blank" rel="noopener noreferrer" className={`min-w-0 truncate text-primary hover:underline ${SMALL}`}>
                  {r.caption || r.url}
                </a>
                <Button size="icon-xs" variant="ghost" aria-label={`${words.remove}: ${r.caption || r.url}`} title={words.remove} onClick={async () => report(await act({ action: "remove-ref", id: r.id }))}>
                  <X aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form data-block="edt16" className="flex flex-col gap-2 sm:flex-row" onSubmit={async (e) => { e.preventDefault(); if (!url) return; const r = report(await act({ action: "add-ref", mark: skill.mark, url, caption })); if (r.ok) { setUrl(""); setCaption("") } }}>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={words.link} className="min-w-0 sm:flex-1" aria-label={words.link} />
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={words.caption} className="min-w-0 sm:flex-1" aria-label={words.caption} />
          <div data-block="edt17" className="flex gap-2">
            <Button type="submit" variant="outline" disabled={!url}>{words.addLink}</Button>
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }} />
            <Button type="button" variant="ghost" disabled={working} onClick={() => file.current?.click()} title={words.upload}>
              <ImageUp data-icon="inline-start" aria-hidden />
              {working ? words.uploading : words.upload}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
