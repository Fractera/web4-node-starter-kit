import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import links from '@/lib/helpful-links.json'
import { moveCases } from './move-cases.i18n'
import { serverMoveWidget } from '@/components/hosting/widgets'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Hosting activation».
//
// 🔒 ЗДЕСЬ ЖИВЁТ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА. Разница проверяемая: в
// `_data` лежит то, что переводится, здесь — то, что исполняется (островки,
// таблицы, формы, чтение дверей `/api/*`), разобранное в секции каталога.
//
// 🔒 ПУСТОЙ ОТВЕТ — ЗАКОННОЕ СОСТОЯНИЕ, А НЕ ЗАГОТОВКА. Страница обработает его
// сама и скажет человеку, что содержимое скоро будет построено; поэтому страница
// завершена уже сейчас: существует, открывается, стоит в меню и не выглядит
// поломкой. Правило и его причина — в README рядом.
//
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ: любая строка, которую увидит человек, приходит
// параметром из `_data` — иначе она не переводится и её не видит сторож словарей.
// 737 (the owner, 2026-11-13): a light preface and four cards closed by default — why a server, and which road below takes each case.
export function content(lang: string): PageItem[] {
  const n = moveCases(lang)
  const card = (c: { summary: string; text: string[] }): PageItem => ({ kind: 'accordionItem', summary: c.summary, children: c.text.map((text): PageItem => ({ kind: 'p', text })) })
  return [
    ...n.preface.map((text): PageItem => ({ kind: 'p', text })),
    { kind: 'p', text: serverLink(n.link, lang) },
    { kind: 'accordion', title: n.title, cards: true, children: [card(n.whole), card(n.shared), card(n.friends), card(n.home)] },
  ]
}

/** The owner's partner link to a server (`lib/helpful-links.json`, one place for every node) with its disclosure, in the page's language. */
function serverLink(label: string, lang: string): string {
  const link = links.links.find((l) => l.id === 'contabo-vps')
  if (!link) return ''
  const note = (links.disclosure as Record<string, string>)[lang] ?? links.disclosure.en
  return `[${label}](${link.url})${link.referral ? ` (${note})` : ''}`
}


// 🔒 737-7 (владелец 2026-11-13: «после того как проект обнаружит себя что он тоже работает на удалённом сервере он соответствующем
// образом переключить режим в режим выделенный сервер»): ЗДЕСЬ ТЕПЕРЬ ЛЕСТНИЦА ПЕРЕЕЗДА, А НЕ ОБЪЯВЛЕНИЕ. «Где стоит узел» больше не
// спрашивается у человека — его записывает сам переезд (`data/node/server.json` на сервере, `data/node/moved.json` здесь), и индикатор
// на главной читает эту запись (`lib/node-state/place.ts`). Прежний островок объявления (276-3) остаётся в `components/node-state/`.
//
// 🔒 ЭТО ОСТРОВОК, А НЕ БЛОК: страница предрендерена, и состояние застыло бы в сборке. Словарь остаётся на сервере — островок получает
// уже выбранный язык пропсами.
export function widget(lang: string): ReactNode {
  return serverMoveWidget(lang)
}
