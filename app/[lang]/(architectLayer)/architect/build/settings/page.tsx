import { MainAgentPage } from '../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { NodeSettings } from '@/components/panel-design/node-settings'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/settings` (530-1): владелец 2026-10-18 — «На вкладке настройки создать вкладку платежи … веб два
// и web3 … Это нужно также сделать и в ядре». Общая оболочка: заголовок, строка о назначении, пункты под страницей
// и эта же страница у элементов.
export const generateMetadata = collectionMetadata(data, '/architect/build')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  // 691: базовый AI-провайдер узла — Anthropic по умолчанию, Codex пока нельзя (шаг 690); 718: раскрывающийся список — провайдер и
  // «Дизайн панели» (владелец 2026-11-11).
  return <MainAgentPage lang={lang} rel="settings" page={data} own={<NodeSettings lang={lang} />} />
}
