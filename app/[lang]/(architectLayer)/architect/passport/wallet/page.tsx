import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { NodeWalletCard } from '@/components/wallet/node-wallet.client'
import { nodeWalletUi } from '@/components/wallet/node-wallet.i18n'
import { paymentsUi } from '@/components/payments/payments.i18n'
import { data } from './_data'
import { content } from './_components'

// «Паспорт» → `/{lang}/architect/passport/wallet` (530-2). Владелец 2026-10-18: «на вкладке паспорт мы добавляем две новые вкладки это
// официальный аккаунт, и главный кошелёк». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/passport')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/passport" page={data} content={content(lang)} widget={<NodeWalletCard words={nodeWalletUi(lang)} note={paymentsUi(lang).web3CoreNote} />} />
}
