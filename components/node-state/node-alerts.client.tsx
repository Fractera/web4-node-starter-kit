"use client"

import { useEffect } from "react"

// ТРЕВОГИ ПУНКТОВ ЛЕВОГО МЕНЮ (632-2). Владелец 2026-11-03: «до тех пор пока не подключён собственный домен на вкладке основное в левом
// меню вкладку доме на хостинг подсвечивает красным шрифтом». Пункт несёт `data-alert` из `meta.alert` своей страницы; этот островок
// один раз при открытии страницы спрашивает узел (закон 264: состояние машины в сборку не запекается, таймеров нет) и ставит на `<html>`
// признак состояния — правило `styles/globals.css` красит такие пункты. Своего домена нет (`/api/domain/state`); 677 — узел не работает со
// своим репозиторием (дверь страницы GitHub «Строительства»).
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
    // 677: репозиторий узла — та же дверь и тот же вердикт, что у страницы GitHub «Строительства» (`own` и `foreign-host` — спокойно).
    // 705 (владелец 2026-11-09: «эта вкладка должна светиться красным если не подключён Token»): спокойно только вместе — свой
    // репозиторий И токен GitHub узла (`token.configured` той же двери). ✗ До 705 узел из своего форка без токена горел спокойно, хотя
    // без токена он не синхронизирует форк и не отправляет код сам.
    const lang = document.documentElement.lang || "en"
    fetch(`${BASE}/${lang}/architect/build/github/api/state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { binding?: { state?: string }; token?: { configured?: boolean } } | null) => {
        if (!alive || !d?.binding?.state) return
        const ownRepo = d.binding.state === "own" || d.binding.state === "foreign-host"
        if (ownRepo && d.token?.configured === true) delete document.documentElement.dataset.noGithub
        else document.documentElement.dataset.noGithub = ""
      })
      .catch(() => { /* узел не ответил или временный адрес — тревоги нет */ })
    return () => { alive = false }
  }, [])
  return null
}
