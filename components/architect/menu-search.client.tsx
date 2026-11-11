"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StateDot, type MenuStateKind } from "@/components/workspace/menu-state-dot"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"

// ПОИСК ЭЛЕМЕНТОВ В МЕНЮ АРХИТЕКТОРА (722-3). Слово владельца 2026-11-11: «И в левом меню и верхнем меню должно быть два поиска это одно
// поле ввода и две кнопки кнопка найти и кнопка искусственный интеллект. Кнопка найти ищет по совпадению в названии».
// 🔒 БЕЗ JAVASCRIPT ПОЛЯ НЕТ: островок рисует себя только после первой отрисовки в браузере — меню остаётся полным списком ссылок.
// 🔒 «НАЙТИ» — совпадение в названии через дверь меню (`?q=`, имена читаются у всех — это нажатие, не отрисовка); строки — с точкой
// состояния и `data-state`, поэтому флажок «только работающие» прячет и их. «ИИ» — `aiSlot` (722-4).
// `header` — вид для шапки: кнопка-лупа открывает ту же панель под шапкой (мобильная и широкая).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Row = { id: string; label: string; href: string; state: { kind: MenuStateKind; label: string } }

function Panel({ lang, words, aiSlot }: { lang: string; words: MenuSearchWords; aiSlot?: ReactNode }) {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

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
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-block="menu-search" className="flex flex-col gap-2">
      <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); void find() }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={words.placeholder} aria-label={words.placeholder} className="h-8 min-w-0 flex-1 text-[length:var(--fs-small)]" />
        <Button type="submit" size="sm" variant="secondary" disabled={busy || !q.trim()}>{words.find}</Button>
        {aiSlot}
      </form>
      {failed && <p className="text-[length:var(--fs-small)] text-destructive" role="status">{words.failed}</p>}
      {rows && (
        <div data-block="menu-search-result" className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-[length:var(--fs-small)] text-muted-foreground">
            <span role="status">{rows.length ? words.found.replace("{n}", String(total)) : words.none}</span>
            <button type="button" onClick={() => { setRows(null); setQ("") }} className="inline-flex items-center gap-1 hover:text-foreground"><X size={12} aria-hidden />{words.clear}</button>
          </div>
          <ul className="flex flex-col gap-0.5">
            {rows.map((r) => (
              <li key={r.id} data-state={r.state.kind}>
                <a href={r.href} className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-[length:var(--fs-small)] text-foreground hover:bg-muted/60">
                  <StateDot state={r.state} />
                  <span className="truncate">{r.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function MenuSearch({ lang, words, variant = "menu", aiSlot }: { lang: string; words: MenuSearchWords; variant?: "menu" | "header"; aiSlot?: ReactNode }) {
  const [js, setJs] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => { setJs(true) }, [])
  if (!js) return null
  if (variant === "menu") return <div className="px-[9px] py-1"><Panel lang={lang} words={words} aiSlot={aiSlot} /></div>
  return (
    <div data-block="menu-search-header" className="flex items-center">
      <Button type="button" size="icon" variant="ghost" aria-label={words.open} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Search size={16} aria-hidden />
      </Button>
      {open && (
        <div className="fixed right-3 top-16 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-popover p-3 shadow-lg">
          <Panel lang={lang} words={words} aiSlot={aiSlot} />
        </div>
      )}
    </div>
  )
}
