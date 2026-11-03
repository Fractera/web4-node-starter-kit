import type { Block } from '@/lib/content/blocks/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Модель векторов» (631) — как у «Векторов»: где элемент живёт (порт на машине, адрес в интернете).
// Векторы узла считает он (626): векторы, граф и глубокая память зовут его двери, ключа OpenAI для векторов нет.
// 🛑 Слова отсюда не пишутся — они приходят из `_data`.
export function content(lang: string): Block[] {
  return [{ kind: 'servicePort', serviceId: 'embeddings', words: servicePortWords(lang, 'embeddings') }]
}
