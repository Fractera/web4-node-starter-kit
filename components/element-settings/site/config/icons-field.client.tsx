"use client"
// @local — the icon set field of the site settings tab: one action of one door (`/api/architect/icons`), nothing else needs it

import { useRef, useState } from "react"
import { ImageUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Small } from "@/components/ui/typography"
import { remoteItem } from "./settings-door"
import type { FieldsUi } from "./fields.i18n"

// НАБОР ЗНАЧКОВ ЭЛЕМЕНТА (узел, шаг 844). Не значение формы, а действие: картинка уходит в дверь ядра сразу, сервер режет восемь
// файлов и пишет `iconSet` в настройки элемента, — поэтому поле не зовёт `onChange` и кнопка «Сохранить» к нему отношения не имеет.
// Предпросмотр — значок 192 из того же набора через раздачу ядра (`/api/media/icons/<id>/file/<имя>`).
type IconSet = { id: string; files: Record<string, string> } | null

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/architect/icons`

function parse(value: string): IconSet {
  try {
    const v = JSON.parse(value) as IconSet
    return v && typeof v.id === "string" && v.files && typeof v.files === "object" ? v : null
  } catch {
    return null
  }
}

function preview(set: IconSet): string | null {
  if (!set) return null
  const rel = set.files.icon_192 ?? set.files.apple_touch_icon ?? set.files.icon_512
  if (!rel) return null
  return `${BASE}/api/media/icons/${encodeURIComponent(set.id)}/file/${encodeURIComponent(rel.split("/").pop() ?? rel)}`
}

export function IconsField({ id, value, disabled, ui }: { id: string; value: string; disabled?: boolean; ui: FieldsUi }) {
  const [set, setSet] = useState<IconSet>(() => parse(value))
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const src = preview(set)

  async function slice(file: File) {
    setBusy(true)
    setStatus(null)
    const form = new FormData()
    form.append("item", remoteItem())
    form.append("file", file)
    const r = await fetch(DOOR, { method: "POST", body: form, credentials: "include" })
      .then((res) => res.json() as Promise<{ ok?: boolean; iconSet?: IconSet; reason?: string }>)
      .catch(() => null)
    if (r?.ok && r.iconSet) {
      setSet(r.iconSet)
      setStatus({ ok: true, text: ui.iconsDone })
    } else {
      setStatus({ ok: false, text: r?.reason ? `${ui.iconsFailed}: ${r.reason}` : ui.iconsFailed })
    }
    setBusy(false)
  }

  async function drop() {
    setBusy(true)
    setStatus(null)
    const r = await fetch(`${DOOR}?item=${encodeURIComponent(remoteItem())}`, { method: "DELETE", credentials: "include" })
      .then((res) => res.json() as Promise<{ ok?: boolean; reason?: string }>)
      .catch(() => null)
    if (r?.ok) {
      setSet(null)
      setStatus({ ok: true, text: ui.iconsDropped })
    } else {
      setStatus({ ok: false, text: r?.reason ? `${ui.iconsFailed}: ${r.reason}` : ui.iconsFailed })
    }
    setBusy(false)
  }

  return (
    <div data-block="ic84a" data-icon-set={set?.id ?? ""} className="flex flex-col gap-3">
      <div data-block="ic84b" className="flex flex-wrap items-center gap-4">
        <div
          data-block="ic84c"
          className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" aria-hidden className="size-full object-contain" />
          ) : (
            <ImageUp className="size-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div data-block="ic84d" className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={disabled || busy} onClick={() => input.current?.click()}>
            <ImageUp data-icon aria-hidden />
            {ui.iconsSlice}
          </Button>
          {set && (
            <Button type="button" variant="ghost" disabled={disabled || busy} onClick={drop}>
              <Trash2 data-icon aria-hidden />
              {ui.iconsDrop}
            </Button>
          )}
        </div>
        <Input
          ref={input}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          tabIndex={-1}
          disabled={disabled || busy}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) void slice(file)
          }}
        />
      </div>
      <Small data-block="ic84e">{set ? ui.iconsCurrent : ui.iconsNone}</Small>
      {status && (
        <Small data-block="ic84f" role="status" className={status.ok ? "text-foreground" : "text-destructive"}>
          {status.text}
        </Small>
      )}
    </div>
  )
}
