import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import links from '@/lib/helpful-links.json'
import { launchNotes } from './launch-notes.i18n'
import { serverLaunchWidget } from '@/components/hosting/widgets'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Активация выделенного сервера».
//
// 🔒 ЗДЕСЬ ЖИВЁТ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА. Разница проверяемая: в
// `_data` лежит то, что переводится, здесь — то, что исполняется (островки,
// таблицы, формы, чтение дверей `/api/*`), разобранное в секции каталога.
//
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ: любая строка, которую увидит человек, приходит
// параметром из `_data` — иначе она не переводится и её не видит сторож словарей.
// 738 (the owner, 2026-11-14): «предварительно условия: … сервер как минимум 8 ГБ и четыре ядра если ещё не купили можете подобрать здесь
// партнёркой ссылка. На сервере должна быть установлена операционной системы Ubuntu» — the island «Запустить сервер» follows.
export function content(lang: string): PageItem[] {
  const n = launchNotes(lang)
  return [
    { kind: 'h2', text: n.title },
    { kind: 'list', items: [`${n.server} ${serverLink(n.link, lang)}`, n.ubuntu, n.access] },
  ]
}

/** The owner's partner link to a server (`lib/helpful-links.json`, one place for every node) with its disclosure, in the page's language. */
function serverLink(label: string, lang: string): string {
  const link = links.links.find((l) => l.id === 'contabo-vps')
  if (!link) return ''
  const note = (links.disclosure as Record<string, string>)[lang] ?? links.disclosure.en
  return `[${label}](${link.url})${link.referral ? ` (${note})` : ''}.`
}

// 🔒 738-4 (владелец 2026-11-14: «Никакого переезда нет есть просто запуск сервера … в данном локальном компьютере меняться ничего не
// должно»): ЗДЕСЬ ОСТРОВОК ЗАПУСКА — пустой при каждом входе, состояние каждого сервера читается с самого сервера по его IP.
// 🔒 ЭТО ОСТРОВОК, А НЕ БЛОК: страница предрендерена, и состояние застыло бы в сборке. Словарь остаётся на сервере — островок получает
// уже выбранный язык пропсами.
export function widget(lang: string): ReactNode {
  return serverLaunchWidget(lang)
}
