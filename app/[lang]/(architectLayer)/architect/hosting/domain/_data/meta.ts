import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'domain',
  order: 10,
  // 632-2: красный, пока у узла нет своего домена — сюда и ведёт тревога.
  alert: 'no-domain',
}
