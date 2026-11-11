"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StateDot, type MenuStateKind } from "@/components/workspace/menu-state-dot"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { MenuAi } from "@/components/architect/menu-ai.client"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"

// ПОИСК ЭЛЕМЕНТОВ В ШАПКЕ АРХИТЕКТОРА (722-3 → 729 → 730-0). Слово владельца 2026-11-11: «на широкой версии при нажатии на лупу просто
// анимировано сдвинуть лупу вправо и слева от лупы показать Input а справа от лупы сразу нарисовать иконку искусственный интеллект».
// ✗ 729 собрал это руками рядом с готовыми частями: голый <button> «Очистить», самодельная «всплывашка» с ручным Esc и щелчком мимо,
// поле с кнопками без `InputGroup`, подсказки атрибутом `title`. Владелец: «каждый раз когда ты пытаешься делать что-то свое это
// получается натуральное уродство». 🔒 ТОЛЬКО ЧАСТИ shadcn: `InputGroup` (поле, лупа и ИИ в одной рамке; рамка растёт вправо — лупа
// уезжает вправо, поле открывается слева от неё), `Popover` + `Command` (рецепт shadcn «combobox»: стрелки, Enter открывает элемент,
// Esc и щелчок мимо закрывают список), `Tooltip`, `Button`. Своего — только ширина рамки и закрытие строки, когда фокус ушёл.
// Узкая шапка: строка поверх всей шапки, слева «←». 🔒 БЕЗ JAVASCRIPT ЛУПЫ НЕТ — меню остаётся списком ссылок.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Row = { id: string; label: string; href: string; state: { kind: MenuStateKind; label: string } }

export function MenuSearch({ lang, words, dialogUi }: { lang: string; words: MenuSearchWords; dialogUi: AppDialogUi }) {
  const [js, setJs] = useState(false)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const aiOpen = useRef(false)
  const list = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => { setJs(true) }, [])
  useEffect(() => { if (open) field.current?.focus() }, [open])

  const results = (v: Row[] | null, bad = false) => { setRows(v); setFailed(bad) }
  function close() { setOpen(false); setQ(""); results(null) }

  async function find() {
    const needle = q.trim()
    if (!needle || busy) return
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/api/architect/menu/elements?lang=${encodeURIComponent(lang)}&limit=24&root=1&q=${encodeURIComponent(needle)}`, { cache: "no-store" })
      const j = (await r.json()) as { ok?: boolean; rows?: Row[] }
      if (!r.ok || !j.ok || !Array.isArray(j.rows)) throw new Error("bad answer")
      results(j.rows)
    } catch {
      results(null, true)
    } finally {
      setBusy(false)
    }
  }

  function onLens() {
    if (!open) return setOpen(true)
    if (!q.trim()) return close()
    void find()
  }

  if (!js) return null
  const shown = rows !== null || failed
  return (
    <TooltipProvider>
      <form
        data-block="menu-search-header"
        data-open={open || undefined}
        onSubmit={(e) => { e.preventDefault(); void find() }}
        onBlur={(e) => {
          const to = e.relatedTarget as Node | null
          if (aiOpen.current || (to && (e.currentTarget.contains(to) || list.current?.contains(to)))) return
          if (!to || !shown) close()
        }}
        className={`flex items-center gap-1 ${open ? "max-md:absolute max-md:inset-0 max-md:z-10 max-md:bg-background max-md:px-3" : ""}`}
      >
        {open && (
          <Button type="button" size="icon" variant="ghost" className="md:hidden" aria-label={words.close} onClick={close}>
            <ArrowLeft aria-hidden />
          </Button>
        )}
        <Command shouldFilter={false} className="h-auto w-auto flex-1 overflow-visible rounded-none bg-transparent">
          <Popover open={open && shown} onOpenChange={(v) => { if (!v) results(null) }}>
            <PopoverAnchor asChild>
              <InputGroup
                className={`h-8 overflow-hidden transition-[width,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "max-md:w-full md:w-80" : "w-9 border-transparent !bg-transparent shadow-none"}`}
              >
                <InputGroupInput
                  ref={field}
                  value={q}
                  inert={!open}
                  onChange={(e) => { setQ(e.target.value); if (shown) results(null) }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !shown) { e.preventDefault(); e.stopPropagation(); void find() }
                    // 730-0: Esc has ONE owner — the field. ✗ Seen on the node: Radix closed the list first, React re-rendered before this
                    // handler ran, `shown` was already false and the second branch closed the whole bar. First Esc — the list, second — the bar.
                    if (e.key === "Escape") { e.preventDefault(); if (shown) results(null); else close() }
                  }}
                  placeholder={words.placeholder}
                  aria-label={words.placeholder}
                  className={open ? "" : "w-0 px-0"}
                />
                <InputGroupAddon align="inline-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton size="icon-xs" aria-label={open ? words.find : words.open} aria-expanded={open} disabled={busy} onClick={onLens}>
                        <Search aria-hidden />
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{open ? words.find : words.open}</TooltipContent>
                  </Tooltip>
                  {open && <MenuAi lang={lang} words={words} dialogUi={dialogUi} seed={q} onOpenChange={(v) => { aiOpen.current = v }} />}
                </InputGroupAddon>
              </InputGroup>
            </PopoverAnchor>
            <PopoverContent ref={list} align="start" className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => { e.preventDefault(); field.current?.focus() }} onEscapeKeyDown={(e) => e.preventDefault()} data-block="menu-search-result">
              <CommandList>
                {failed && <p role="status" className="p-3 text-[length:var(--fs-small)] text-destructive">{words.failed}</p>}
                {!failed && <CommandEmpty>{words.none}</CommandEmpty>}
                {rows?.map((r) => (
                  <CommandItem key={r.id} value={r.id} data-state={r.state.kind} onSelect={() => { window.location.href = r.href }}>
                    <StateDot state={r.state} />
                    <span className="truncate">{r.label}</span>
                  </CommandItem>
                ))}
              </CommandList>
              {rows && rows.length > 0 && (
                <p role="status" className="border-t border-border px-3 py-2 text-[length:var(--fs-small)] text-muted-foreground">{words.found.replace("{n}", String(rows.length))}</p>
              )}
            </PopoverContent>
          </Popover>
        </Command>
      </form>
    </TooltipProvider>
  )
}
