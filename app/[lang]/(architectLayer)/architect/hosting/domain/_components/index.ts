import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { domainPlaceWidget } from '@/components/hosting/widgets'
import { domainLadderWords } from '@/components/domain/domain-ladder.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Domain activation» (259-1).
//
// 🔒 ЗДЕСЬ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА СТРАНИЦЫ. Лестница — не текст
// страницы, а переиспользуемая часть со своим словарём рядом с собой; поэтому её
// слова берутся у неё, а не у страницы. Разница проверяемая: слова страницы
// переводятся вместе со страницей, слова лестницы поедут с лестницей в любое
// место, где домен подключают снова.
//
// 🔒 ЯЗЫК ВЫБИРАЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ, И В БЛОК УХОДИТ ОДИН НАБОР СТРОК. Отдай
// мы островку весь словарь — он уехал бы в браузер целиком, и это поймал бы
// сторож `check:lang-delivery`.
export function content(lang: string): PageItem[] {
  // 775 (the owner, 2026-11-17: «убери подробнее во всех аккордеонах … Слишком много мусора»): the page is its two sections and the
  // registrars' card; the topics and the home-computer notes are not shown anywhere on it.
  return [{ kind: 'domainLadder', lang, words: domainLadderWords(lang) }]
}

/** 742-2: on a server node the page is the server's own domain ladder (the island decides by the node's place). */
export function widget(lang: string): ReactNode {
  return domainPlaceWidget(lang)
}
