import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { agentKitWidget } from '../../_agent-kit/widgets'
import { botPageNotes } from '@/lib/content/bot-page-notes'

// СОДЕРЖИМОЕ СТРАНИЦЫ — ИЗ КОПИИ КОМПЛЕКТА АГЕНТА ЭТОЙ СЛУЖБЫ (271, `../../_agent-kit/`).
// Шаблон `kits/_agent-kit/pages/telegram/`; установщик подставил имя службы вместо `auth`.
// 767-6: the notes of a bot page — the main agent's carries «Управление браузером через Telegram» (`lib/content/bot-page-notes.ts`).
export function content(lang: string): PageItem[] {
  return botPageNotes('auth', lang)
}

export function widget(lang: string): ReactNode {
  return agentKitWidget('telegram', 'auth', lang)
}
