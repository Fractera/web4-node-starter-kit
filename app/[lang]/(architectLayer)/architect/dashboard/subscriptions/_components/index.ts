import type { PageItem } from '@/lib/content/sections/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Все подписки» (726-3). Сервисы × элементы × состояние — вид каталога `subscriptionsBoard`: страница предрендерена,
// строки спрашиваются в браузере у двери `/api/node/subscriptions`, а не читаются здесь при сборке.
export function content(lang: string): PageItem[] {
  return [{ kind: 'subscriptionsBoard', lang }]
}
