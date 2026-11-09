import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { SuperNodeSettings } from '@/components/super-node/super-node-settings.client'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { data } from './_data'
import { content } from './_components'

// «Супер узел» → `/{lang}/architect/super-node/settings` (530-3). Владелец 2026-10-18: «Настройки здесь будет пользователь настраивать теги которые он одобряет использовать и запрещает зависимости от своего региона». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/super-node')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/super-node" page={data} content={content(lang)} widget={<SuperNodeSettings lang={lang} words={superNodeUi(lang)} />} />
}
