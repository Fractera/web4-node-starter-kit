import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'github',
  // 🎯 Первая вкладка «Строительства» (решение владельца 2026-09-22): прежде чем строить, человек
  // обязан знать, с каким репозиторием он работает.
  order: 5,
  // 705 (владелец 2026-11-09): красный, пока у узла нет своего репозитория или токена GitHub (островок `NodeAlerts`) — как «Активация
  // домена» без своего домена.
  alert: 'no-github',
}
