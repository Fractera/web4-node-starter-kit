import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { serverCertificatesWidget } from '@/components/hosting/widgets'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Security certificates» (742-4): the working part is the island — the server's certificates read from its own door.
export function content(_lang: string): PageItem[] {
  return []
}

export function widget(lang: string): ReactNode {
  return serverCertificatesWidget(lang)
}
