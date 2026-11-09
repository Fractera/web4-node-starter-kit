"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { H2, P, Small } from "@/components/ui/typography"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { useRemote } from "./remote.client"
import { RemoteState } from "./remote-state"

// БРИФ ДИЗАЙНА ЭЛЕМЕНТА ВО ВКЛАДКЕ ЯДРА (712-3) — перенесён из шаблона (`admin/_components/design-editors/design-brief.client.tsx`):
// для кого сайт, характер, референсы, чего избегать; навык только показан — его выбирают и закрепляют ниже, в панели 711.
// 🔒 Заплата, а не замена: уходят только изменённые поля; запись о закреплении прототипа элемент сохраняет сам.
// 🔒 Скриншот референса живёт в хранилище элемента, закрытом для ядра: строка с ним показана и уходит обратно как есть.
type Ref = { url?: string; media?: string; note?: string }
type Brief = { skill?: string; audience?: string; character?: string[]; avoid?: string; references?: Ref[]; inheritedFrom?: string; pinned?: { prototype: string } }

export function BriefEditor({ words }: { words: ElementRemoteWords }) {
  const { files, visible, save } = useRemote()
  const loaded = files.brief
  const initial = (loaded?.state === "ok" ? loaded.config : null) as Brief | null
  const [brief, setBrief] = useState<Brief | null>(null)
  const [character, setCharacter] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle")
  if (!initial) return <RemoteState loaded={loaded} words={words} />
  const w = words.brief
  const b = brief ?? initial
  const chars = character ?? (b.character ?? []).join(", ")
  const set = (patch: Partial<Brief>) => { setBrief({ ...b, ...patch }); setState("idle") }
  const refs = b.references ?? []
  const setRef = (i: number, patch: Partial<Ref>) => set({ references: refs.map((r, k) => (k === i ? { ...r, ...patch } : r)) })
  async function submit() {
    setState("saving")
    const next = { ...b, character: chars.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5) }
    const patch: Record<string, unknown> = {}
    for (const k of ["audience", "avoid", "character", "references"] as const) {
      if (JSON.stringify(next[k] ?? null) !== JSON.stringify(initial?.[k] ?? null)) patch[k] = next[k] === "" ? null : next[k] ?? null
    }
    const r = await save("brief", patch)
    if (r.ok) { setBrief(null); setCharacter(null); setState("saved") } else setState(`${words.failed} ${r.reason ?? ""}`)
  }
  return (
    <section data-block="erb01" data-design-brief className="flex max-w-3xl flex-col gap-5 rounded-lg border border-border p-5">
      <div data-block="erb02" className="flex flex-col gap-1">
        <H2 data-block="erb03" variant="ui">{w.title}</H2>
        <P data-block="erb04" className="text-muted-foreground">{w.lead}</P>
        {b.inheritedFrom ? <Small data-block="erb05" data-brief-inherited>{w.inherited} {b.inheritedFrom}</Small> : null}
      </div>
      {visible("brief", "audience", "string") && (
        <Field data-block="erb06">
          <FieldLabel htmlFor="brief-audience">{w.audience}</FieldLabel>
          <Textarea id="brief-audience" value={b.audience ?? ""} onChange={(e) => set({ audience: e.target.value })} rows={3} />
          <FieldDescription>{w.audienceHint}</FieldDescription>
        </Field>
      )}
      {visible("brief", "character", "array") && (
        <Field data-block="erb07">
          <FieldLabel htmlFor="brief-character">{w.character}</FieldLabel>
          <Input id="brief-character" value={chars} onChange={(e) => { setCharacter(e.target.value); setState("idle") }} />
          <FieldDescription>{w.characterHint}</FieldDescription>
        </Field>
      )}
      {visible("brief", "references", "array") && (
        <div data-block="erb08" className="flex flex-col gap-3">
          <FieldLabel>{w.references}</FieldLabel>
          <FieldDescription>{w.referencesHint}</FieldDescription>
          {refs.map((r, i) => (
            <div key={i} data-block="erb09" className="flex flex-col gap-2 rounded-md border border-border p-3">
              <Input aria-label={w.link} placeholder={w.link} value={r.url ?? ""} onChange={(e) => setRef(i, { url: e.target.value })} />
              <Input aria-label={w.note} placeholder={w.note} value={r.note ?? ""} onChange={(e) => setRef(i, { note: e.target.value })} />
              <div data-block="erb10" className="flex flex-wrap items-center gap-3">
                {r.media ? <Small data-block="erb11" className="text-muted-foreground">{w.media}</Small> : null}
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ references: refs.filter((_, k) => k !== i) })}>{w.remove}</Button>
              </div>
            </div>
          ))}
          {refs.length < 12 ? <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => set({ references: [...refs, {}] })}>{w.addReference}</Button> : null}
        </div>
      )}
      {visible("brief", "avoid", "string") && (
        <Field data-block="erb12">
          <FieldLabel htmlFor="brief-avoid">{w.avoid}</FieldLabel>
          <Textarea id="brief-avoid" value={b.avoid ?? ""} onChange={(e) => set({ avoid: e.target.value })} rows={2} />
          <FieldDescription>{w.avoidHint}</FieldDescription>
        </Field>
      )}
      {visible("brief", "skill", "string") && (
        <Field data-block="erb13">
          <FieldLabel>{w.skill}</FieldLabel>
          <P data-block="erb14" data-brief-skill={b.skill ?? ""}>{b.skill ? (b.pinned ? `${b.skill} · ${w.pinnedFrom} ${b.pinned.prototype}` : b.skill) : w.noSkill}</P>
        </Field>
      )}
      <div data-block="erb15" className="flex items-center gap-3">
        <Button type="button" onClick={() => void submit()} disabled={state === "saving"} data-brief-save>{state === "saving" ? w.saving : w.save}</Button>
        {state === "saved" ? <Small data-block="erb16" data-brief-state="saved">{words.saved}</Small> : state !== "idle" && state !== "saving" ? <Small data-block="erb17" className="text-destructive" data-brief-state="failed">{state}</Small> : null}
      </div>
    </section>
  )
}
