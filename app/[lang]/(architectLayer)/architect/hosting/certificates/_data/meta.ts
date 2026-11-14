import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'certificates',
  // the owner, 2026-11-14: «ниже чем активация домена»
  order: 15,
  // 742-4: a page of a server node only — a computer's domain runs through Cloudflare with no certificates of its own
  place: 'server',
}
