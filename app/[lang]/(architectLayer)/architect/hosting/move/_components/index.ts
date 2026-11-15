import type { PageItem } from '@/lib/content/sections/types'
import { serverLink } from '../../_components'
import { moveNotes } from './move-notes.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Переезд на другой сервер» (the owner, 2026-11-15): text only — a server launches nothing itself, the launch lives on
// the person's computer. The words come from `move-notes.i18n.ts`; the partner link is the hosting group's one (`lib/helpful-links.json`).
export function content(lang: string): PageItem[] {
  const n = moveNotes(lang)
  return [
    { kind: 'h2', text: n.order },
    { kind: 'olist', items: n.steps.map((s) => s.replace('{link}', serverLink(n.link, lang))) },
    { kind: 'h2', text: n.moves },
    { kind: 'list', items: n.what },
  ]
}
