import type { Block } from '@/lib/content/blocks/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Этот компьютер» (572). Числа о машине — в браузере у `/api/node/machine` (закон 264), не при сборке.
export function content(lang: string): Block[] {
  return [{ kind: 'machineBoard', lang }]
}
