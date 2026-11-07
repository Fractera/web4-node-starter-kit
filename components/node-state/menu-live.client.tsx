"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// 678-3: ЖИВОЕ ЛЕВОЕ МЕНЮ. Слово владельца 2026-11-07: «каждый раз когда ты создаёшь новый элемент или меняешь его название левое меню
// обновлялось бы возможно нужен какой-то Hook … до перезагрузки страницы я не могу увидеть твою работу». Главный агент создаёт и называет
// элементы мимо открытой страницы (`npm run create`, `rename`), поэтому островок спрашивает отпечаток состава узла (`/api/node/menu-stamp`)
// раз в 3 с, пока вкладка видна, и при возвращении на неё. Отпечаток сменился — дверь перерисовывает слой, страница обновляется на месте
// (`router.refresh()`), шапка «Кастомные элементы» спрашивает каталог заново (событие `node:menu-changed`).
// 🔒 ПРОВЕРКА ГЛАЗОМ, А НЕ ВЕРОЙ. ✗ Замерено 2026-11-05 (`menu-mode-switch.client.tsx`): `router.refresh()` после перерисовки двери однажды
// не принёс нового меню. Поэтому островок сверяет ссылки меню с именами; не сошлось за две проверки — страница перезагружается, но только
// когда человек ничего не печатает и это не терминал (перезагрузка оборвала бы ввод).
// Таймер — по слову владельца выше; цена — один короткий запрос раз в 3 с и только при открытой видимой вкладке архитектора.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const EVERY_MS = 3000

type Entry = { id: string; address: string; name: string; native: boolean }

function editing(): boolean {
  const a = document.activeElement as HTMLElement | null
  if (!a || a === document.body) return false
  return ["INPUT", "TEXTAREA", "SELECT", "IFRAME"].includes(a.tagName) || a.isContentEditable
}

const onTerminal = () => /\/terminal(\/|$)/.test(window.location.pathname)

/** Каждый кастомный элемент, чьи ссылки есть в меню, стоит под своим именем. Ссылок архитектора нет вовсе — сверять нечего. */
function shown(entries: Entry[]): boolean {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/architect/"]'))
  if (links.length === 0) return true
  const segOf = (a: HTMLAnchorElement) => new URL(a.href, window.location.href).pathname.split("/architect/")[1]?.split("/")[0] ?? ""
  return entries.filter((e) => !e.native).every((e) => {
    const name = e.name.toLocaleLowerCase()
    return links.some((a) => segOf(a) === e.address && (a.textContent ?? "").toLocaleLowerCase().includes(name))
  })
}

export function MenuLive() {
  const router = useRouter()
  useEffect(() => {
    let alive = true
    let busy = false
    let base: string | null = null
    let stale: Entry[] | null = null
    let checks = 0
    const tick = async () => {
      if (busy || document.hidden) return
      busy = true
      try {
        const r = await fetch(`${BASE}/api/node/menu-stamp`, { cache: "no-store" })
        if (!r.ok) return
        const d = (await r.json()) as { stamp?: unknown; entries?: Entry[] }
        if (!alive || typeof d.stamp !== "string") return
        if (base === null) { base = d.stamp; return }
        if (d.stamp !== base) {
          base = d.stamp
          await fetch(`${BASE}/api/node/menu-stamp`, { method: "POST", cache: "no-store" })
          if (!alive) return
          window.dispatchEvent(new Event("node:menu-changed"))
          router.refresh()
          stale = Array.isArray(d.entries) ? d.entries : []
          checks = 0
          return
        }
        if (stale) {
          if (shown(stale)) stale = null
          else if (++checks >= 2 && !editing() && !onTerminal()) window.location.reload()
        }
      } catch { /* узел не ответил — меню остаётся как есть */ } finally {
        busy = false
      }
    }
    void tick()
    const timer = window.setInterval(() => void tick(), EVERY_MS)
    const back = () => { if (!document.hidden) void tick() }
    document.addEventListener("visibilitychange", back)
    window.addEventListener("focus", back)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", back)
      window.removeEventListener("focus", back)
    }
  }, [router])
  return null
}
