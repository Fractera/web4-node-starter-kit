import type { PageItem } from '@/lib/content/sections/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Этот компьютер» (572). Числа о машине — в браузере у `/api/node/machine` (закон 264), не при сборке.
export function content(lang: string): PageItem[] {
  return [{ kind: 'machineBoard', lang }]
}
