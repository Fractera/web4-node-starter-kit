// ГДЕ СТОИТ УЗЕЛ — ЕДИНСТВЕННОЕ ОБЪЯВЛЕННОЕ СВЕДЕНИЕ ИНДИКАТОРА (276-3).
//
// 🔒 ЭТО НЕ ИЗМЕРЯЕТСЯ НИЧЕМ, И ПРИТВОРЯТЬСЯ ОБРАТНЫМ ЗАПРЕЩЕНО. «Домашний компьютер» и «выделенный
// сервер» — не свойство сети и не свойство машины: тот же Linux, тот же процесс, тот же порт. Угадывать
// по признакам (есть ли монитор, как называется хост, кто провайдер) значит строить прибор, который
// однажды уверенно соврёт. Поэтому узел спрашивает человека и помечает ответ как его слова.
//
// 🔒 ФАЙЛ ЖИВЁТ В `data/`, А НЕ В КОНФИГЕ ПРОДУКТА. Это факт о машине конкретного человека, а не о
// приложении: `data/*` стоит в `.gitignore`, и объявление не уедет ни в репозиторий, ни к гостю.
// Проверено `git check-ignore`: `data/node/place.json` игнорируется правилом `data/*`.
//
// 🛑 ЗНАЧЕНИЕ ПРОВЕРЯЕТСЯ ПРИ ЗАПИСИ И ПРИ ЧТЕНИИ. Файл лежит на диске человека, его можно поправить
// руками; неизвестное слово читается как «не сказано», а не пролезает в индикатор чужим состоянием.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const FILE = path.join(ROOT, 'data', 'node', 'place.json')

/** Где стоит узел. `unknown` — «человек ещё не сказал», а не «нигде». */
export type PlaceKind = 'home' | 'server' | 'unknown'

export type Place = { kind: PlaceKind; source: 'declared' | 'moved' | 'unknown'; changedAt: string | null }

// 737-9 (the owner, 2026-11-13: «после того как проект обнаружит себя что он тоже работает на удалённом сервере он соответствующем
// образом переключить режим в режим выделенный сервер»): THE MOVE ITSELF RECORDS THE PLACE. The tool that carried the node to its server
// writes `data/node/server.json` there (phase silent or live) — a fact written by the act, not a guess from signs, so the rule above
// («это не измеряется ничем») still holds: nothing is guessed. That record outranks a declaration; a node put on a server by hand still
// declares it here.
const SERVER_MARK = path.join(ROOT, 'data', 'node', 'server.json')
function movedHere(): Place | null {
  try {
    const m = JSON.parse(readFileSync(SERVER_MARK, 'utf8')) as { phase?: unknown; movedAt?: unknown; at?: unknown }
    if (m.phase !== 'live' && m.phase !== 'silent') return null
    const at = typeof m.movedAt === 'string' ? m.movedAt : typeof m.at === 'string' ? m.at : null
    return { kind: 'server', source: 'moved', changedAt: at }
  } catch {
    return null
  }
}

function isKind(value: unknown): value is 'home' | 'server' {
  return value === 'home' || value === 'server'
}

export function readPlace(): Place {
  const moved = movedHere()
  if (moved) return moved
  if (!existsSync(FILE)) return { kind: 'unknown', source: 'unknown', changedAt: null }
  try {
    const raw = JSON.parse(readFileSync(FILE, 'utf8')) as { place?: unknown; changedAt?: unknown }
    if (!isKind(raw.place)) return { kind: 'unknown', source: 'unknown', changedAt: null }
    return { kind: raw.place, source: 'declared', changedAt: typeof raw.changedAt === 'string' ? raw.changedAt : null }
  } catch {
    return { kind: 'unknown', source: 'unknown', changedAt: null }
  }
}

/** Записать объявление. Возвращает `null`, если слово не из списка, — дверь превращает это в отказ. */
export function writePlace(value: unknown): Place | null {
  if (!isKind(value)) return null
  const changedAt = new Date().toISOString()
  mkdirSync(path.dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify({ place: value, changedAt }, null, 2)}\n`)
  return { kind: value, source: 'declared', changedAt }
}
