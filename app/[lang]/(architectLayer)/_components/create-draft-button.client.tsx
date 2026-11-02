"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

// КНОПКА «СОЗДАТЬ МИКРОСЕРВИС» В ЛЕВОМ МЕНЮ (314-1). Создаёт черновик дверью ядра и ведёт на главную его группы.
// Действие — только по нажатию человека; дверь сама пускает лишь архитектора.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// 582 (владелец 2026-10-24): `native` — та же кнопка в зоне нативных («+ создать нативный элемент»); шрифт кнопки мельче подписи
// зоны: «вкладка плюс создать элемент … должна быть более мелким шрифтом даже чем название раздела».
export function CreateDraftButton({ lang, label, busyLabel, failed, native = false }: { lang: string; label: string; busyLabel: string; failed: string; native?: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function create() {
    setBusy(true)
    setError(false)
    try {
      const r = await fetch(`${BASE}/api/architect/drafts`, native
        ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ native: true }) }
        : { method: "POST" })
      const d = (await r.json().catch(() => null)) as { id?: string } | null
      if (!r.ok || !d?.id) throw new Error(String(r.status))
      router.push(`/${lang}/architect/${d.id}`)
      router.refresh()
    } catch {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1" data-create-draft={native ? "native" : "custom"}>
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-[9px] py-1.5 text-left text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
      >
        <Plus size={14} aria-hidden className="shrink-0" />
        <span className="truncate">{busy ? busyLabel : label}</span>
      </button>
      {error ? <p className="px-[9px] text-[length:var(--fs-small)] text-destructive" role="alert">{failed}</p> : null}
    </div>
  )
}
