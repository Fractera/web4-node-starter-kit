"use client"

import { useEffect } from "react"

// ТРЕВОГИ ПУНКТОВ ЛЕВОГО МЕНЮ (632-2). Владелец 2026-11-03: «до тех пор пока не подключён собственный домен на вкладке основное в левом
// меню вкладку доме на хостинг подсвечивает красным шрифтом». Пункт несёт `data-alert` из `meta.alert` своей страницы; этот островок
// один раз при открытии страницы спрашивает узел (закон 264: состояние машины в сборку не запекается, таймеров нет) и ставит на `<html>`
// признак состояния — правило `styles/globals.css` красит такие пункты. Сейчас одно состояние: своего домена нет (`/api/domain/state`).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function NodeAlerts() {
  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { active?: boolean } | null) => {
        if (!alive || !d) return
        if (d.active === true) delete document.documentElement.dataset.noOwnDomain
        else document.documentElement.dataset.noOwnDomain = ""
      })
      .catch(() => { /* узел не ответил — тревоги нет: ложная красная хуже отсутствующей */ })
    return () => { alive = false }
  }, [])
  return null
}
