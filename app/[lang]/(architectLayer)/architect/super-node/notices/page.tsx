import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { SuperNodeNotices } from '@/components/super-node/super-node-notices.client'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { data } from './_data'
import { content } from './_components'

// «Супер узел» → `/{lang}/architect/super-node/notices` (530-3). Владелец 2026-10-18: «Следующая вкладка будет уведомление от lagrix здесь вкладка будет подсвечивать удовлетворён или не удовлетворён lagrix параметрами компьютера». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/super-node')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/super-node" page={data} content={content(lang)} widget={<SuperNodeNotices lang={lang} words={superNodeUi(lang)} />} />
}
