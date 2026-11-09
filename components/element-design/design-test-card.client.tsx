"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { H4, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DesignPrototypeRow } from "./design-prototype-row.client"
import { BASE, type ActResult, type DesignState, type ProjectSkill } from "./types"

// КАНДИДАТ НА ТЕСТ (711-3, 711-5): свои референсы (ссылка с подписью или картинка в хранилище узла), «Сгенерировать тестовую
// страницу» с ценой до нажатия и его прототипы. По одной генерации за раз; навык со скриптами — только после отдельного «да».
export function DesignTestCard({ item, lang, skill, state, base, words, act }: {
  item: string; lang: string; skill: ProjectSkill; state: DesignState; base: string | null; words: ElementDesignWords; act: (p: Record<string, unknown>) => Promise<ActResult>
}) {
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [note, setNote] = useState("")
  const [askScripts, setAskScripts] = useState(false)
  const [working, setWorking] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const refs = state.refs.filter((r) => r.mark === skill.mark)
  const protos = state.prototypes.filter((p) => p.skill === skill.mark)
  const queued = state.runs.filter((r) => r.kind === "generate" && r.mark === skill.mark && state.pending.includes(r.prototype)).map((r) => r.prototype)
  const price = words.price.replace("{sub}", state.limits.own ? words.subOwn : words.subNode).replace("{five}", String(state.limits.fiveHour ?? "?")).replace("{seven}", String(state.limits.sevenDay ?? "?"))
  const report = (r: ActResult) => { if (!r.ok) setNote(`${words.failed} ${r.error ?? r.reason ?? ""}`); else setNote(""); return r }
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
    <li data-block="edt01" data-test-card={skill.mark} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <H4 data-block="edt02">{skill.name}</H4>
      <Small data-block="edt03" className="font-medium text-foreground">{words.refs}</Small>
      {refs.length === 0 ? <Small data-block="edt04" className="text-muted-foreground">{words.refsEmpty}</Small> : (
        <ul data-block="edt05" className="flex flex-col gap-1.5">
          {refs.map((r) => (
            <li data-block="edt06" key={r.id} className="flex items-center gap-2">
              {r.mediaId ? <img src={`${BASE}${r.url}`} alt={r.caption ?? ""} className="h-12 w-12 rounded border border-border object-cover" /> : null}
              <a href={r.url.startsWith("/") ? `${BASE}${r.url}` : r.url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-primary">{r.caption || r.url}</a>
              <Button size="sm" variant="ghost" onClick={async () => report(await act({ action: "remove-ref", id: r.id }))}>{words.remove}</Button>
            </li>
          ))}
        </ul>
      )}
      <form data-block="edt07" className="flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); if (!url) return; const r = report(await act({ action: "add-ref", mark: skill.mark, url, caption })); if (r.ok) { setUrl(""); setCaption("") } }}>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={words.link} className="min-w-48 flex-1" aria-label={words.link} />
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={words.caption} className="min-w-48 flex-1" aria-label={words.caption} />
        <Button type="submit" variant="outline">{words.addLink}</Button>
        <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }} />
        <Button type="button" variant="outline" disabled={working} onClick={() => file.current?.click()}>{working ? words.uploading : words.upload}</Button>
      </form>
      <div data-block="edt08" className="flex flex-col gap-1.5">
        <Button className="w-fit" disabled={working || state.busy || !state.supported} onClick={() => void generate()} data-design-generate>{words.generate}</Button>
        <Small data-block="edt09" className="text-muted-foreground">{state.busy ? words.busy : price}</Small>
        {askScripts && <span data-block="edt10" className="flex items-center gap-2"><Small data-block="edt11">{words.scriptsAsk}</Small><Button size="sm" variant="outline" onClick={() => void generate(true)}>{words.scriptsYes}</Button></span>}
        {note && <Small data-block="edt12" className="text-destructive">{note}</Small>}
      </div>
      {(protos.length > 0 || queued.length > 0) && (
        <ul data-block="edt13" className="flex flex-col gap-2">
          {queued.map((id) => <DesignPrototypeRow key={id} item={item} lang={lang} proto={null} queued={id} base={base} words={words} canPin={false} onPin={() => {}} />)}
          {protos.map((p) => <DesignPrototypeRow key={p.id} item={item} lang={lang} proto={p} base={base} words={words} canPin={!state.busy} onPin={async (id) => report(await act({ action: "pin", prototype: id }))} />)}
        </ul>
      )}
    </li>
  )
}
