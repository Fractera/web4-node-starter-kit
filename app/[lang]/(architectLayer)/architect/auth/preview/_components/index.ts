import type { PageItem } from '@/lib/content/sections/types'

// Живой просмотр элемента (слово владельца 2026-09-24).
export function content(lang: string): PageItem[] {
  return [{ kind: 'elementPreview', lang, serviceId: 'auth' }]
}
