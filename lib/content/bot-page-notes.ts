import type { PageItem } from '@/lib/content/sections/types'
import { browserNotes } from './bot-page-notes.i18n'

// THE NOTES OF A BOT PAGE (node step 767-6). Every service's page «Telegram-бот» comes from one template
// (`kits/_agent-kit/pages/telegram/`), and its content asks here with the service's name. The main agent's bot (`build` — the core's,
// not an element) carries the closed block «Управление браузером через Telegram»: the browser is driven through the main agent, which
// routes a request to the element whose field it is. Another service's page returns nothing — its page stays as it was.
// Sections of the core's catalogue only: an `accordion` of cards, closed by default; words in `bot-page-notes.i18n.ts`.
export function botPageNotes(service: string, lang: string): PageItem[] {
  if (service !== 'build') return []
  const n = browserNotes(lang)
  const part = (p: { title: string; items: string[] }): PageItem[] => [{ kind: 'h3', text: p.title }, { kind: 'list', items: p.items }]
  return [{
    kind: 'accordion',
    cards: true,
    children: [{ kind: 'accordionItem', summary: n.summary, children: [...part(n.how), ...part(n.need), ...part(n.gain)] }],
  }]
}
