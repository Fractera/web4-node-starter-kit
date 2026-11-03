import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'hosting',
  // Второй пункт меню, сразу под «Паспортом» — слово владельца 2026-09-21:
  // «домены хостинг ставим второй сверху под паспорт». Было 40.
  order: 15,
  icon: 'server',
  // 632-2: красный, пока у узла нет своего домена (островок `NodeAlerts`).
  alert: 'no-domain',
}
