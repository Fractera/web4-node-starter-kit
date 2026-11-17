import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { domainPlaceWidget } from '@/components/hosting/widgets'
import { domainLadderWords } from '@/components/domain/domain-ladder.i18n'
import { homeHostingNotes } from './home-hosting-notes.i18n'
import { wordsOf } from '@/lib/collection/types'
import { topicItems } from '../../../../_lib/collection-page'
import { data } from '../_data'

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
  const n = homeHostingNotes(lang)
  // 775 (the owner, 2026-11-17: «на этой вкладке огромная простыня информации должна быть скрыта в аккордеоне подробнее … Внутри одного
  // аккордеона не должно быть информации о других аккордеонов»): the page shows only its two sections and the registrars' card. The
  // page's topics (why a permanent address, how it works, the price, without a domain) and the notes on a site from a home computer are
  // instructions of the main domain — they live folded in that section's «Подробнее»: `topics` while the node has no main domain, `notes`
  // always. The page itself never renders its topics (`hideTopics`).
  const notes: PageItem[] = [{ kind: 'h3', text: n.home.summary }, ...n.home.text.map((text): PageItem => ({ kind: 'p', text }))]
  return [
    // 742-2: the notes are the computer's — they ride inside its ladder and hide with it on a server.
    { kind: 'domainLadder', lang, words: domainLadderWords(lang), topics: topicItems(wordsOf(data, lang).topics ?? []), notes },
  ]
}

/** 742-2: on a server node the page is the server's own domain ladder (the island decides by the node's place). */
export function widget(lang: string): ReactNode {
  return domainPlaceWidget(lang)
}
