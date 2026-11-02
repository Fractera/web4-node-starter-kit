import type { Block } from '@/lib/content/blocks/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Быстрое хранилище» (560-2) — как у «Хранилища»: где элемент живёт (порт на машине, адрес в интернете).
// Элемент приходит выключенным по своему паспорту (567): причину называет плашка страниц элемента, процесса нет.
// 🛑 Слова отсюда не пишутся — они приходят из `_data`.
export function content(lang: string): Block[] {
  return [{ kind: 'servicePort', serviceId: 'cache', words: servicePortWords(lang, 'cache') }]
}
