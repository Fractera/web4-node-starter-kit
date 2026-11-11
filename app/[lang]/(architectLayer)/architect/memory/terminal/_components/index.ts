import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { agentKitWidget } from '../../_agent-kit/widgets'

// СОДЕРЖИМОЕ СТРАНИЦЫ — ИЗ КОПИИ КОМПЛЕКТА АГЕНТА ЭТОЙ СЛУЖБЫ (271, `../../_agent-kit/`).
// Шаблон `kits/_agent-kit/pages/terminal/`; установщик подставил имя службы вместо `memory`.
export function content(_lang: string): PageItem[] {
  return []
}

export function widget(lang: string): ReactNode {
  return agentKitWidget('terminal', 'memory', lang)
}
