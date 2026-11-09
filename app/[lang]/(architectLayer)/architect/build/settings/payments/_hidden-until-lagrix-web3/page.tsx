import { MainAgentPage } from '../../../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../../../_lib/collection-metadata'
import { NodeWalletCard } from '@/components/wallet/node-wallet.client'
import { nodeWalletUi } from '@/components/wallet/node-wallet.i18n'
import { paymentsUi } from '@/components/payments/payments.i18n'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/settings/payments/web3` (530-1): владелец 2026-10-18 — «На вкладке настройки создать вкладку платежи … веб два
// и web3 … Это нужно также сделать и в ядре». Общая оболочка: заголовок, строка о назначении, пункты под страницей, своя часть
// и эта же страница у элементов.
export const generateMetadata = collectionMetadata(data, '/architect/build/settings/payments')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="settings/payments/web3" page={data} own={<NodeWalletCard words={nodeWalletUi(lang)} note={paymentsUi(lang).web3CoreNote} />} />
}
