import type { PageItem } from '@/lib/content/sections/types'

// Содержимого нет: страница только переадресует на `build/telegram`. Слова — в `_data`.
export function content(_lang: string): PageItem[] {
  return []
}
