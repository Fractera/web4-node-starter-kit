"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { isTemporaryHostname } from "@/components/shell/temporary-host"

// 657-1: СТРОКА «НАСТРОЙКА» ПЕРВОЙ В «ОСНОВНОМ» — режим левого меню ядра (владелец 2026-11-05: «Рекомендуемый режим минимальные
// настройки по умолчанию, полные для глубокого управления настройки»). Два положения, текущее отмечено; щелчок пишет режим узла
// (`/api/node/menu-mode`) и перерисовывает страницу. На временном адресе панель только читает: кнопки неактивны и это сказано.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Mode = "compact" | "full"
type Words = { title: string; compact: string; full: string; failed: string; readOnly: string }

export function MenuModeSwitch({ mode, words }: { mode: Mode; words: Words }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  // Признак адреса — только в браузере и после первой отрисовки: сервер его не знает, и разметка обязана совпасть.
  const [readOnly, setReadOnly] = useState(false)
  useEffect(() => { setReadOnly(isTemporaryHostname(window.location.hostname)) }, [])

  async function pick(next: Mode) {
    if (busy || readOnly || next === mode) return
    setBusy(true)
    setError(false)
    try {
      const r = await fetch(`${BASE}/api/node/menu-mode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: next }),
      })
      if (!r.ok) throw new Error(String(r.status))
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-block="mmsw1" className="flex flex-col gap-1" data-menu-mode={mode}>
      <div data-block="mmsw2" className="flex items-center gap-2 px-[9px] py-1 text-[length:var(--fs-small)] text-muted-foreground">
        <SlidersHorizontal size={14} aria-hidden className="shrink-0" />
        <span className="truncate">{words.title}</span>
      </div>
      <div data-block="mmsw3" role="group" aria-label={words.title} className="mx-[9px] grid grid-cols-2 gap-1 rounded-md border border-border p-0.5">
        {(["compact", "full"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={m === mode}
            disabled={busy || readOnly}
            onClick={() => pick(m)}
            className={
              m === mode
                ? "rounded-[calc(var(--radius)-2px)] bg-primary px-2 py-1 text-[length:var(--fs-small)] font-medium text-primary-foreground disabled:opacity-80"
                : "rounded-[calc(var(--radius)-2px)] px-2 py-1 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
            }
          >
            {words[m]}
          </button>
        ))}
      </div>
      {readOnly ? <p data-block="mmsw4" className="px-[9px] text-[length:var(--fs-small)] text-muted-foreground">{words.readOnly}</p> : null}
      {error ? <p data-block="mmsw5" className="px-[9px] text-[length:var(--fs-small)] text-destructive" role="alert">{words.failed}</p> : null}
    </div>
  )
}
