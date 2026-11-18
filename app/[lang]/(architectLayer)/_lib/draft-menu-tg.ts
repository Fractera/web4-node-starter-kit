import type { WorkspaceItem } from '@/lib/content/sections/types'
import { elementTgMenu, tgSegment, type TgMenu, type TgTreeNode } from '@/lib/web4-items/element-tg-menu'

/** The element's Mini App menu in one language, or null — no menu (an older template). */
export const tgMenuOf = (id: string, lang: string): TgMenu | null => elementTgMenu(id, lang)

// 790 (the owner, 2026-11-18, Telegram 741–748: «все что делаем и строим в Telegram отображается в рабочих процессах на левом меню»):
// the element's Mini App menu (`tg/_data/menu.json` of the element) drawn right under «Working process» — the modes («My projects»,
// «A2A · Web4») on the third level, items on the fourth, a category's children on the fifth (the sidebar's depth, types.ts). A screen
// is `workflow/mini-app/<segment>` — the same `/<lang>/tg/<slug>` of the element in a phone frame; «Subscriptions» and «Cron automation»
// lead to the core's own real pages (the element's services as the children), so «Process» folds away and nothing shows twice.
// 757: the common items (`common` of menu.json — Subscriptions, Cron, Settings, Help) stand BESIDE the modes, their siblings.

type Ctx = { dir: string; at: (path: string) => string; currentPath: string; services: Array<{ id: string; name: string }> }

export function tgMenuItems({ modes, common }: TgMenu, { dir, at, currentPath, services }: Ctx): WorkspaceItem[] {
  const own: Record<string, string> = { subscriptions: `${dir}/workflow/process/subscriptions`, cron: `${dir}/workflow/process/cron` }
  const leaf = (n: TgTreeNode): WorkspaceItem => {
    const href = own[n.slug] ?? `${dir}/workflow/mini-app/${tgSegment(n.slug)}`
    const kids = n.slug === 'subscriptions'
      ? services.map((x) => ({ label: x.name, href: at(`${href}/${x.id}`), active: `${href}/${x.id}` === currentPath }))
      : n.children.map(leaf)
    const inside = currentPath.startsWith(`${href}/`)
    return kids.length
      ? { label: n.title, href: at(href), active: href === currentPath, open: href === currentPath || inside, children: kids }
      : { label: n.title, href: at(href), active: href === currentPath || inside }
  }
  return [
    ...modes.map((m) => {
      const items = m.items.map(leaf)
      const first = items[0]?.href
      return { label: m.title, ...(first ? { href: first } : {}), open: items.some((k) => k.active || k.open), children: items }
    }),
    ...common.map(leaf),
  ]
}
