import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { OfficialAccount } from '@/components/official/official-account.client'
import { officialUi } from '@/components/official/official.i18n'
import { data } from './_data'
import { content } from './_components'

// «Паспорт» → `/{lang}/architect/passport/official` (530-2). Владелец 2026-10-18: «на вкладке паспорт мы добавляем две новые вкладки это
// официальный аккаунт, и главный кошелёк». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/passport')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/passport" page={data} content={content(lang)} widget={<OfficialAccount lang={lang} words={officialUi(lang)} />} />
}
