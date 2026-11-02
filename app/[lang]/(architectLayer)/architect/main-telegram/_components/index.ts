import type { Block } from '@/lib/content/blocks/types'

// Содержимого нет: страница только переадресует на `build/telegram`. Слова — в `_data`.
export function content(_lang: string): Block[] {
  return []
}
