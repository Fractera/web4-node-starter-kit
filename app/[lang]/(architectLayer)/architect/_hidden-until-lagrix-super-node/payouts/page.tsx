import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { SuperNodePayouts } from '@/components/super-node/super-node-payouts.client'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { tableUi } from '@/sections/table.i18n'
import { data } from './_data'
import { content } from './_components'

// «Супер узел» → `/{lang}/architect/super-node/payouts` (530-3). Владелец 2026-10-18: «Выплаты здесь будет таблица которая показывает статистику за что начисляются выплаты это будет наши таблица с пагинации». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/super-node')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/super-node" page={data} content={content(lang)} widget={<SuperNodePayouts lang={lang} words={superNodeUi(lang)} table={tableUi(lang)} />} />
}
