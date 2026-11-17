import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { domainPlaceWidget } from '@/components/hosting/widgets'
import { domainLadderWords } from '@/components/domain/domain-ladder.i18n'
import { homeHostingNotes } from './home-hosting-notes.i18n'

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
  const item = (x: { summary: string; text: string[] }): PageItem => ({
    kind: 'accordionItem', summary: x.summary, children: x.text.map((text): PageItem => ({ kind: 'p', text })),
  })
  return [
    // 344-5: когда подходит сайт с домашнего компьютера — свёрнуто по умолчанию. 775 (the owner, 2026-11-17: «проверь пожалуйста чтобы
    // не было никакого упоминания о России. Сейчас санкции не позволяют это делать»): the country card is gone.
    // (слово владельца: «По умолчанию эти карточки должны быть закрыты … пусть нажимает раскрыть если ему интересно»).
    // 742-2: the notes are the computer's — they ride inside its ladder and hide with it on a server.
    { kind: 'domainLadder', lang, words: domainLadderWords(lang), notes: [{ kind: 'accordion', title: n.title, cards: true, children: [item(n.home)] }] },
  ]
}

/** 742-2: on a server node the page is the server's own domain ladder (the island decides by the node's place). */
export function widget(lang: string): ReactNode {
  return domainPlaceWidget(lang)
}
