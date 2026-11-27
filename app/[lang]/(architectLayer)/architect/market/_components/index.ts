import type { PageItem } from '@/lib/content/sections/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Маркетплейс» (862-1) — как у «Платежей Stripe» (631): где элемент живёт (порт на машине, адрес в интернете).
// 🛑 Слова отсюда не пишутся — они приходят из `_data`.
export function content(lang: string): PageItem[] {
  return [{ kind: 'servicePort', serviceId: 'market', words: servicePortWords(lang, 'market') }]
}
