import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import { githubWidget } from '../_github/widget'

// СОДЕРЖИМОЕ ВКЛАДКИ «GITHUB» (273): весь экран — собственный островок маршрута.
export function content(_lang: string): PageItem[] {
  return []
}

export function widget(lang: string): ReactNode {
  return githubWidget(lang)
}
