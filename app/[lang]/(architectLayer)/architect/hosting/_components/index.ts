import type { PageItem } from '@/lib/content/sections/types'
import links from '@/lib/helpful-links.json'
import { hostingNotes } from './hosting-notes.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Domain and hosting».
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
// 737 (the owner, 2026-11-13): a preface and two cards closed by default — the own domain and the dedicated server.
export function content(lang: string): PageItem[] {
  const n = hostingNotes(lang)
  const card = (summary: string, text: string[]): PageItem => ({ kind: 'accordionItem', summary, children: text.filter(Boolean).map((t): PageItem => ({ kind: 'p', text: t })) })
  return [
    ...n.preface.map((text): PageItem => ({ kind: 'p', text })),
    { kind: 'accordion', title: n.title, cards: true, children: [card(n.domain.summary, n.domain.text), card(n.server.summary, [...n.server.text, serverLink(n.server.link, lang)])] },
  ]
}

/** The owner's partner link to a server (`lib/helpful-links.json`, one place for every node) with its disclosure, in the page's language. */
function serverLink(label: string, lang: string): string {
  const link = links.links.find((l) => l.id === 'contabo-vps')
  if (!link) return ''
  const note = (links.disclosure as Record<string, string>)[lang] ?? links.disclosure.en
  return `[${label}](${link.url})${link.referral ? ` (${note})` : ''}`
}

