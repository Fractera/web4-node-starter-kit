"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MenuStateKind } from "@/components/workspace/menu-state-dot"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ElementRow } from "@/components/architect/element-row"
import { MenuAi } from "@/components/architect/menu-ai.client"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"

// ПОИСК ЭЛЕМЕНТОВ В ШАПКЕ АРХИТЕКТОРА (722-3 → 729). Слово владельца 2026-11-11: «почему ты не можешь взять и в интерфейсе на широкой
// версии при нажатии на лупу просто анимировано сдвинуть лупу вправо и слева от лупы показать Input а справа от лупы сразу нарисовать
// иконку искусственный интеллект зачем это лишняя модельное окно».
// ✗ 722-3: лупа открывала отдельную панель в правом верхнем углу экрана (`fixed right-3 top-16`) — поле и две кнопки далеко от лупы.
// 🔒 ОДНА СТРОКА, БЕЗ ПАНЕЛИ. Широкая: поле вырастает СЛЕВА от лупы (200 мс, ease-out — единственный переход ширины, редкое действие),
// лупа уезжает вправо вместе с ним, справа проявляется иконка ИИ. Открытая лупа — «Найти» (и Enter); пустое поле — лупа закрывает.
// Узкая: строка занимает всю шапку (поверх логотипа и меню), слева «←». Совпадения — список под полем. Esc и щелчок мимо закрывают
// (пока открыто окно ИИ — нет: щелчки по нему не «мимо»). Иконка ИИ открывает окно «Поиск по смыслу» с уже набранными словами.
// 🔒 БЕЗ JAVASCRIPT ЛУПЫ НЕТ: островок рисует себя только после первой отрисовки — меню остаётся списком ссылок.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]"
type Row = { id: string; label: string; href: string; state: { kind: MenuStateKind; label: string } }

export function MenuSearch({ lang, words, dialogUi }: { lang: string; words: MenuSearchWords; dialogUi: AppDialogUi }) {
  const [js, setJs] = useState(false)
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const box = useRef<HTMLFormElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const lens = useRef<HTMLButtonElement>(null)

  useEffect(() => { setJs(true) }, [])
  useEffect(() => { if (open) field.current?.focus() }, [open])

  function close() {
    setOpen(false)
    setRows(null)
    setFailed(false)
    setQ("")
    lens.current?.focus()
  }

  useEffect(() => {
    if (!open || aiOpen) return
    const away = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) close() }
    document.addEventListener("pointerdown", away)
    return () => document.removeEventListener("pointerdown", away)
  }, [open, aiOpen])

  async function find() {
    const needle = q.trim()
    if (!needle || busy) return
    setBusy(true)
    setFailed(false)
    try {
      const r = await fetch(`${BASE}/api/architect/menu/elements?lang=${encodeURIComponent(lang)}&limit=24&root=1&q=${encodeURIComponent(needle)}`, { cache: "no-store" })
      const j = (await r.json()) as { ok?: boolean; rows?: Row[]; total?: number }
      if (!r.ok || !j.ok || !Array.isArray(j.rows)) throw new Error("bad answer")
      setRows(j.rows)
      setTotal(j.total ?? j.rows.length)
    } catch {
      setRows(null)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  function onLens() {
    if (!open) { setOpen(true); return }
    if (!q.trim()) { close(); return }
    void find()
  }

  if (!js) return null
  const shown = open ? "opacity-100" : "pointer-events-none opacity-0"
  return (
    <form
      ref={box}
      data-block="menu-search-header"
      data-open={open || undefined}
      onSubmit={(e) => { e.preventDefault(); void find() }}
      className={`flex items-center gap-1 ${open ? "max-md:absolute max-md:inset-0 max-md:z-10 max-md:bg-background max-md:px-3 md:relative" : "relative"}`}
    >
      {open && (
        <Button type="button" size="icon" variant="ghost" className="md:hidden" aria-label={words.close} onClick={close}>
          <ArrowLeft size={16} aria-hidden />
        </Button>
      )}
      <div className={`min-w-0 overflow-hidden transition-[width,opacity] duration-200 ${EASE} ${open ? "max-md:flex-1 md:w-64" : "w-0"} ${shown}`} inert={!open}>
        <Input
          ref={field}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); close() } }}
          placeholder={words.placeholder}
          aria-label={words.placeholder}
          className="h-8 w-full text-[length:var(--fs-small)]"
        />
      </div>
      <Button ref={lens} type="button" size="icon" variant="ghost" aria-label={open ? words.find : words.open} aria-expanded={open} disabled={busy} onClick={onLens} title={open ? words.find : words.open}>
        <Search size={16} aria-hidden />
      </Button>
      <div className={`transition-opacity duration-200 ${EASE} ${shown} ${open ? "" : "w-0 overflow-hidden"}`} inert={!open}>
        <MenuAi lang={lang} words={words} dialogUi={dialogUi} seed={q} onOpenChange={setAiOpen} />
      </div>
      {open && (failed || rows) && (
        <div data-block="menu-search-result" className="absolute top-full mt-2 flex flex-col gap-1 rounded-lg border border-border bg-popover p-2 shadow-md max-md:inset-x-3 md:left-0 md:w-80">
          <div className="flex items-center justify-between gap-2 px-1 text-[length:var(--fs-small)] text-muted-foreground">
            <span role="status" className={failed ? "text-destructive" : undefined}>
              {failed ? words.failed : rows && rows.length ? words.found.replace("{n}", String(total)) : words.none}
            </span>
            <button type="button" onClick={() => { setRows(null); setFailed(false); setQ(""); field.current?.focus() }} className="inline-flex items-center gap-1 hover:text-foreground">
              <X size={12} aria-hidden />{words.clear}
            </button>
          </div>
          {rows && rows.length > 0 && (
            <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
              {rows.map((r) => (
                <li key={r.id} data-state={r.state.kind}><ElementRow href={r.href} label={r.label} state={r.state} /></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  )
}
