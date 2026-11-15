import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'move',
  // right after «Активация выделенного сервера» (20) — the two never show together: one lives at home, this one on a server
  order: 21,
  // the owner, 2026-11-15: a server that hit its hosting's ceiling moves to a new machine — the item a server keeps
  place: 'server',
}
