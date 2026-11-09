"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Small } from "@/components/ui/typography"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { SMALL, StepHead, StepNext } from "@/components/element-design/step-parts"
import { useRemote } from "./remote.client"
import { RemoteState } from "./remote-state"

// ШАГ 1 «БРИФ» ВКЛАДКИ «ДИЗАЙН» (712-3, вид 713-2) — перенесён из шаблона (`admin/_components/design-editors/design-brief.client.tsx`):
// для кого сайт, характер, референсы, чего избегать; навык только показан — его выбирают шаги «Навыки» и «Закрепление». Одна колонка
// без рамки; внизу — «Сохранить бриф» и «Дальше». Несохранённое переживает смену шага: шаги не размонтируются (`design-flow`).
// 🔒 Заплата, а не замена: уходят только изменённые поля; запись о закреплении пробы элемент сохраняет сам.
// 🔒 Скриншот референса живёт в хранилище элемента, закрытом для ядра: строка с ним показана и уходит обратно как есть.
type Ref = { url?: string; media?: string; note?: string }
type Brief = { skill?: string; audience?: string; character?: string[]; avoid?: string; references?: Ref[]; inheritedFrom?: string; pinned?: { prototype: string } }

export function BriefEditor({ words, nextLabel, onNext }: { words: ElementRemoteWords; nextLabel: string; onNext: () => void }) {
  const { files, visible, save } = useRemote()
  const loaded = files.brief
  const initial = (loaded?.state === "ok" ? loaded.config : null) as Brief | null
  const [brief, setBrief] = useState<Brief | null>(null)
  const [character, setCharacter] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle")
  const w = words.brief
  if (!initial) {
    return (
      <section data-block="erb01" data-design-panel="brief" className="flex flex-col gap-6">
        <StepHead title={w.title} lead={w.lead} />
        <RemoteState loaded={loaded} words={words} />
        <StepNext label={nextLabel} onNext={onNext} />
      </section>
    )
  }
  const b = brief ?? initial
  const chars = character ?? (b.character ?? []).join(", ")
  const dirty = brief !== null || character !== null
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
    <section data-block="erb02" data-design-brief data-design-panel="brief" className="flex flex-col gap-8">
      <StepHead title={w.title} lead={w.lead}>
        {b.inheritedFrom ? <Small data-block="erb03" data-brief-inherited>{w.inherited} {b.inheritedFrom}</Small> : null}
      </StepHead>
      <div data-block="erb04" className="flex flex-col gap-6">
        {visible("brief", "audience", "string") && (
          <Field data-block="erb05">
            <FieldLabel htmlFor="brief-audience">{w.audience}</FieldLabel>
            <Textarea id="brief-audience" value={b.audience ?? ""} onChange={(e) => set({ audience: e.target.value })} rows={3} />
            <FieldDescription>{w.audienceHint}</FieldDescription>
          </Field>
        )}
        {visible("brief", "character", "array") && (
          <Field data-block="erb06">
            <FieldLabel htmlFor="brief-character">{w.character}</FieldLabel>
            <Input id="brief-character" value={chars} onChange={(e) => { setCharacter(e.target.value); setState("idle") }} />
            <FieldDescription>{w.characterHint}</FieldDescription>
          </Field>
        )}
        {visible("brief", "references", "array") && (
          <Field data-block="erb07">
            <FieldLabel>{w.references}</FieldLabel>
            {refs.map((r, i) => (
              <div key={i} data-block="erb08" className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input aria-label={w.link} placeholder={w.link} value={r.url ?? ""} onChange={(e) => setRef(i, { url: e.target.value })} className="min-w-0 sm:flex-1" />
                <Input aria-label={w.note} placeholder={w.note} value={r.note ?? ""} onChange={(e) => setRef(i, { note: e.target.value })} className="min-w-0 sm:flex-1" />
                {r.media ? <span data-block="erb09" className={`text-muted-foreground ${SMALL}`} title={w.media}>{w.mediaShort}</span> : null}
                <Button type="button" variant="ghost" size="icon-sm" className="self-end sm:self-auto" aria-label={`${w.remove}: ${r.url ?? ""}`} title={w.remove}
                  onClick={() => set({ references: refs.filter((_, k) => k !== i) })}>
                  <X aria-hidden />
                </Button>
              </div>
            ))}
            {refs.length < 12 ? (
              <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => set({ references: [...refs, {}] })}>
                <Plus data-icon="inline-start" aria-hidden />
                {w.addReference}
              </Button>
            ) : null}
            <FieldDescription>{w.referencesHint}</FieldDescription>
          </Field>
        )}
        {visible("brief", "avoid", "string") && (
          <Field data-block="erb10">
            <FieldLabel htmlFor="brief-avoid">{w.avoid}</FieldLabel>
            <Textarea id="brief-avoid" value={b.avoid ?? ""} onChange={(e) => set({ avoid: e.target.value })} rows={2} />
            <FieldDescription>{w.avoidHint}</FieldDescription>
          </Field>
        )}
        {visible("brief", "skill", "string") && (
          <div data-block="erb11" className="flex flex-col gap-1">
            <span data-block="erb12" className={`font-medium text-foreground ${SMALL}`}>{w.skill}</span>
            <Small data-block="erb13" data-brief-skill={b.skill ?? ""}>{b.skill ? (b.pinned ? `${b.skill} · ${w.pinnedFrom} ${b.pinned.prototype}` : b.skill) : w.noSkill}</Small>
          </div>
        )}
      </div>
      <StepNext label={nextLabel} onNext={onNext}>
        <Button type="button" onClick={() => void submit()} disabled={state === "saving" || !dirty} data-brief-save>{state === "saving" ? w.saving : w.save}</Button>
        {state === "saved" ? <Small data-block="erb14" data-brief-state="saved">{words.saved}</Small> : state !== "idle" && state !== "saving" ? <Small data-block="erb15" className="text-destructive" data-brief-state="failed">{state}</Small> : null}
      </StepNext>
    </section>
  )
}
