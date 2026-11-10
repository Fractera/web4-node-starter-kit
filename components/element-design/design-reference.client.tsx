"use client"

import { useRef, useState, type ClipboardEvent } from "react"
import { ImagePlus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { P, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { BASE, prototypeHref, type ActResult, type DesignState, type ProjectSkill } from "./types"
import { SMALL } from "./step-parts"

// «ИЗМЕНИТЬ РЕФЕРЕНС» — ПЕРВЫЙ АККОРДЕОН ПОД БОЛЬШОЙ КАРТИНКОЙ (узел, шаг 715-4). Владелец 2026-11-10: «попробуйте использовать этот навык
// с другим референс, добавьте скриншот или ссылку на проект … Ниже ссылки и кнопки загрузить картинку ставим кнопку генерация тестовой
// главный страницы. Ссылка с текстом когда генерация будет закончена вы сможете увидеть всю страницу по этой ссылке»; и раньше: «почему у
// тебя нету возможности загрузить скриншоты например из Pinterest». Скриншот ложится в объектное хранилище узла (`/api/media/upload`) —
// кнопкой или вставкой из буфера прямо сюда. Цена — до нажатия; навык со скриптами — только после отдельного «да».
export function DesignReference({ skill, state, base, lang, words, act }: {
  skill: ProjectSkill; state: DesignState; base: string | null; lang: string; words: ElementDesignWords; act: (p: Record<string, unknown>) => Promise<ActResult>
}) {
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [note, setNote] = useState("")
  const [askScripts, setAskScripts] = useState(false)
  const [working, setWorking] = useState(false)
  const [started, setStarted] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const refs = state.refs.filter((r) => r.mark === skill.mark)
  const price = words.price.replace("{sub}", state.limits.own ? words.subOwn : words.subNode).replace("{five}", String(state.limits.fiveHour ?? "?")).replace("{seven}", String(state.limits.sevenDay ?? "?"))
  const report = (r: ActResult) => { setNote(r.ok ? "" : `${words.failed} ${r.error ?? r.reason ?? ""}`); return r }
  async function upload(f: File) {
    setWorking(true)
    const fd = new FormData()
    fd.append("file", f)
    fd.append("title", f.name || "screenshot.png")
    const j = (await fetch(`${BASE}/api/media/upload`, { method: "POST", body: fd }).then((r) => r.json()).catch(() => null)) as { ok?: boolean; item?: { id: string } } | null
    if (j?.ok && j.item) report(await act({ action: "add-ref", mark: skill.mark, url: `/api/media/${j.item.id}/file`, mediaId: j.item.id, caption }))
    else setNote(`${words.failed} upload`)
    setWorking(false)
    if (file.current) file.current.value = ""
  }
  function paste(e: ClipboardEvent<HTMLDivElement>) {
    const img = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"))
    if (img) { e.preventDefault(); void upload(img) }
  }
  async function generate(scriptsYes = false) {
    setWorking(true)
    const r = report(await act({ action: "generate", mark: skill.mark, scriptsYes }))
    setAskScripts(!r.ok && r.reason === "scripts")
    if (r.ok && "started" in r && r.started) setStarted(r.started)
    setWorking(false)
  }
  const link = started ? prototypeHref(base, lang, started) : null
  return (
    <div data-block="erf01" data-design-reference={skill.mark} onPaste={paste} className="flex flex-col gap-5">
      <div data-block="erf02" className="flex max-w-prose flex-col gap-2">
        <P data-block="erf03">{words.refLead}</P>
        <Small data-block="erf04">{words.howRef}</Small>
      </div>
      <div data-block="erf05" className="flex flex-col gap-2">
        <span data-block="erf06" className={`font-medium text-foreground ${SMALL}`}>{words.refs}</span>
        {refs.length === 0 ? <Small data-block="erf07">{words.refsEmpty}</Small> : (
          <ul data-block="erf08" className="flex flex-col gap-1">
            {refs.map((r) => (
              <li data-block="erf09" key={r.id} className="flex items-center gap-2">
                {r.mediaId ? <img src={`${BASE}${r.url}`} alt={r.caption ?? ""} className="size-10 shrink-0 rounded border border-border object-cover" /> : null}
                <a href={r.url.startsWith("/") ? `${BASE}${r.url}` : r.url} target="_blank" rel="noopener noreferrer" className={`min-w-0 truncate text-primary hover:underline ${SMALL}`}>{r.caption || r.url}</a>
                <Button size="icon-xs" variant="ghost" aria-label={`${words.removeRef}: ${r.caption || r.url}`} title={words.removeRef} onClick={async () => report(await act({ action: "remove-ref", id: r.id }))}>
                  <X aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form data-block="erf10" className="flex flex-col gap-2 sm:flex-row" onSubmit={async (e) => { e.preventDefault(); if (!url) return; const r = report(await act({ action: "add-ref", mark: skill.mark, url, caption })); if (r.ok) { setUrl(""); setCaption("") } }}>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={words.link} className="min-w-0 sm:flex-1" aria-label={words.link} />
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={words.caption} className="min-w-0 sm:flex-1" aria-label={words.caption} />
          <Button type="submit" variant="outline" disabled={!url}>{words.addLink}</Button>
        </form>
        <div data-block="erf11" className="flex flex-wrap items-center gap-2">
          <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }} />
          <Button type="button" variant="outline" disabled={working} onClick={() => file.current?.click()}>
            <ImagePlus data-icon="inline-start" aria-hidden />
            {working ? words.uploading : words.upload}
          </Button>
          <Small data-block="erf12">{words.pasteHint}</Small>
        </div>
      </div>
      <div data-block="erf13" className="flex flex-col items-start gap-2">
        <Button disabled={working || state.busy || !state.supported} onClick={() => void generate()} data-design-generate>
          <Sparkles data-icon="inline-start" aria-hidden />
          {words.generate}
        </Button>
        <Small data-block="erf14">{state.busy ? words.busy : price}</Small>
        {askScripts ? (
          <div data-block="erf15" className="flex flex-wrap items-center gap-2">
            <Small data-block="erf16" className="text-foreground">{words.scriptsAsk}</Small>
            <Button size="sm" variant="outline" onClick={() => void generate(true)}>{words.scriptsYes}</Button>
          </div>
        ) : null}
        {note ? <Small data-block="erf17" className="text-destructive" role="alert">{note}</Small> : null}
        {link ? (
          <Small data-block="erf18" className="text-foreground">{words.linkAfter} <a href={link} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">{link}</a></Small>
        ) : <Small data-block="erf19">{words.linkLater}</Small>}
      </div>
    </div>
  )
}
