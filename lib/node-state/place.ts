// ГДЕ СТОИТ УЗЕЛ — ОПРЕДЕЛЯЕТСЯ, А НЕ ОБЪЯВЛЯЕТСЯ (737-18; было объявлением 276-3).
//
// 🔒 Владелец 2026-11-13: «очень важно теперь найти способ нативно отслеживать является ли данное состояние локальным или это выделенный
// сервер потому что до сих пор у нас существует вкладка где мы все это переключали руками. Больше этого быть не должно».
// Знание живёт в одном месте — `lib/hosting/place.mjs` (`nodePlace`): запись переезда на сервере, иначе замер машины. Этот модуль лишь
// отдаёт его страницам. Файл объявления `data/node/place.json` больше не читается: объявленное «server» на Mac 2026-11-13 10:15 жило в
// индикаторе — переключатель, который нельзя проверить, однажды соврёт.

import path from 'node:path'
import { nodePlace } from '@/lib/hosting/place.mjs'

const ROOT = process.cwd()

/** Где стоит узел. `unknown` остаётся в типе ради старых слов островка — определение его больше не возвращает. */
export type PlaceKind = 'home' | 'server' | 'unknown'

export type Place = { kind: PlaceKind; source: 'moved' | 'measured' | 'unknown'; changedAt: string | null; detail?: string }

export function readPlace(): Place {
  return nodePlace(path.resolve(ROOT)) as Place
}
