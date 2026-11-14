"use client"
// @part node-place-reader — where the node lives (computer or server) for the browser: one /api/node/place request per page, shared

import { useEffect, useState } from "react"

// ГДЕ ЖИВЁТ УЗЕЛ — ДЛЯ БРАУЗЕРА, ИЗ ОДНОГО ВОПРОСА К УЗЛУ (741-6; владелец утвердил 2026-11-14: «да, утверждаю 741 и D31–D37 -> go»).
//
// ✗ Прежде каждый виджет решал «компьютер или сервер» по адресной строке (`window.location.hostname`): страница хостинга, открытая на
// компьютере через быстрый туннель, рисовала вид СЕРВЕРА (измерено 2026-11-14), а окно на сервер (`npm run server -- window`) говорило
// `localhost` — то есть «этот компьютер» — на сервере. Адрес называет, как вы пришли; где живёт узел, знает только узел — его запись
// (`lib/hosting/place.mjs`, 741-2), которую отдаёт дверь `/api/node/place`.
// 🔒 ОДИН ЗАПРОС НА СТРАНИЦУ: обещание живёт в модуле, и все виджеты страницы получают один и тот же ответ. Страницы остаются
// статическими — браузер спрашивает дверь, как и прежде (`server-place.client.tsx`).
// 🔒 НЕТ ОТВЕТА — `null`, и виджет ведёт себя как прежде (по адресу): отказ двери не должен прятать тревогу на компьютере.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type NodePlaceAnswer = {
  kind: "home" | "server"
  source: string
  detail?: string
  mismatch?: string
  foreign?: boolean
  /** живые серверы, которые запустил этот компьютер (D36) — домен и время */
  launched: Array<{ domain: string; readyAt: string | null }>
}

let asked: Promise<NodePlaceAnswer | null> | null = null

/** Один вопрос на страницу; ответ `null` — узел не ответил (или не на чтение для этого посетителя). */
export function askNodePlace(): Promise<NodePlaceAnswer | null> {
  if (asked) return asked
  type Raw = { place?: { kind?: string; source?: string; detail?: string; mismatch?: string; foreign?: boolean }; launched?: NodePlaceAnswer["launched"] }
  const p: Promise<NodePlaceAnswer | null> = fetch(`${BASE}/api/node/place`, { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<Raw>) : null))
    .then((a): NodePlaceAnswer | null => {
      const kind = a?.place?.kind === "server" ? "server" : a?.place?.kind === "home" ? "home" : null
      if (!kind) return null
      return { kind, source: a?.place?.source ?? "unknown", detail: a?.place?.detail, mismatch: a?.place?.mismatch, foreign: a?.place?.foreign,
        launched: Array.isArray(a?.launched) ? a.launched : [] }
    })
    .catch(() => null)
  asked = p
  return p
}

/** `undefined` — ещё спрашиваем; `null` — узел не ответил; иначе — где живёт узел. */
export function useNodePlace(): NodePlaceAnswer | null | undefined {
  const [place, setPlace] = useState<NodePlaceAnswer | null | undefined>(undefined)
  useEffect(() => {
    let alive = true
    void askNodePlace().then((p) => { if (alive) setPlace(p) })
    return () => { alive = false }
  }, [])
  return place
}
