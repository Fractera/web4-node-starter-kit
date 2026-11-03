import type { Block } from '@/lib/content/blocks/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Платежи Stripe» (631) — как у «Быстрого хранилища»: где элемент живёт (порт на машине, адрес в интернете).
// Элемент приходит выключенным по своему паспорту («Включите, когда введёте ключи Stripe»): причину называет плашка страниц элемента.
// 🛑 Слова отсюда не пишутся — они приходят из `_data`.
export function content(lang: string): Block[] {
  return [{ kind: 'servicePort', serviceId: 'stripe', words: servicePortWords(lang, 'stripe') }]
}
