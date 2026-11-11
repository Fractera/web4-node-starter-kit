"use client"

import { useEffect, useRef, useState } from "react"
import { StateDot } from "@/components/workspace/menu-state-dot"

// ОСТАЛЬНЫЕ КАСТОМНЫЕ ЭЛЕМЕНТЫ ЛЕВОГО МЕНЮ — ПОРЦИЯМИ ПО 12 (722-2). Слово владельца 2026-11-11: «ленивые загрузка то есть ты
// подгружает по 12 элементов предварительно отрисовывает сначала скелетрон, а затем запрашиваем очередные 12 элементов».
// Первые 12 рисует сервер деревьями (видны сразу и без JavaScript); этот островок стоит под ними.
// 🔒 БЕЗ JAVASCRIPT — ССЫЛКА «Все проекты (N)» на страницу проектов: меню не теряет ни одного элемента.
// 🔒 С JAVASCRIPT — когда конец списка входит в вид: 12 строк скелета, запрос двери `/api/architect/menu/elements`, строки с точкой
// состояния; и так до конца. Строка несёт `data-state` — флажок «только работающие» прячет её тем же правилом CSS, что и серверные.
// Элемент, который сервер уже нарисовал (страница, на которой стоит человек), второй раз не показывается (`skip`).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Row = { id: string; label: string; href: string; state: { kind: "running" | "asleep" | "off" | "draft"; label: string } }
type Words = { allProjects: string; loadingMore: string; loadFailed: string }

export function MenuMore({ lang, from, total, skip, projectsHref, words }: { lang: string; from: number; total: number; skip: string[]; projectsHref: string; words: Words }) {
  const [js, setJs] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [next, setNext] = useState<number | null>(from)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { setJs(true) }, [])

  useEffect(() => {
    if (!js || next === null || loading || failed || !end.current) return
    const io = new IntersectionObserver(async (seen) => {
      if (!seen.some((e) => e.isIntersecting)) return
      io.disconnect()
      setLoading(true)
      try {
        const r = await fetch(`${BASE}/api/architect/menu/elements?lang=${encodeURIComponent(lang)}&from=${next}&limit=12`, { cache: "no-store" })
        const j = (await r.json()) as { ok?: boolean; rows?: Row[]; next?: number | null }
        if (!r.ok || !j.ok || !Array.isArray(j.rows)) throw new Error("bad answer")
        setRows((xs) => [...xs, ...j.rows!.filter((x) => !skip.includes(x.id))])
        setNext(j.next ?? null)
      } catch {
        setFailed(true)
      } finally {
        setLoading(false)
      }
    }, { rootMargin: "120px" })
    io.observe(end.current)
    return () => io.disconnect()
  }, [js, next, loading, failed, lang, skip])

  const all = <a href={projectsHref} className="block rounded-md px-[9px] py-2 text-[length:var(--fs-small)] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{words.allProjects.replace("{n}", String(total))}</a>

  if (!js) return <div data-block="menu-more" data-menu-more="static">{all}</div>
  return (
    <div data-block="menu-more" data-menu-more="live">
      <ul className="flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.id} data-state={r.state.kind}>
            <a href={r.href} className="flex min-w-0 items-center gap-2 rounded-md px-[9px] py-2 text-[length:var(--fs-body)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
              <StateDot state={r.state} />
              <span className="truncate">{r.label.toLocaleUpperCase(lang)}</span>
            </a>
          </li>
        ))}
        {loading && Array.from({ length: 12 }, (_, k) => (
          <li key={`s${k}`} aria-hidden data-menu-skeleton>
            <div className="mx-[9px] my-2 h-4 animate-pulse rounded bg-muted" />
          </li>
        ))}
      </ul>
      {loading && <span className="sr-only" role="status">{words.loadingMore}</span>}
      {failed && <a href={projectsHref} className="block px-[9px] py-2 text-[length:var(--fs-small)] text-destructive underline">{words.loadFailed}</a>}
      {next !== null && !failed && <div ref={end} aria-hidden className="h-1" />}
      {next === null && !failed && total > 0 && all}
    </div>
  )
}
