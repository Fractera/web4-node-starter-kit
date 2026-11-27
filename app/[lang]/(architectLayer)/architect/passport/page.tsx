import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'
import { PAGES } from './_list.generated'
import { NodeIdentity } from '@/components/passport/node-identity.client'
import { nodeIdentityUi } from '@/components/passport/node-identity.i18n'

// РУБРИКАТОР ГРУППЫ «Passport» — `/{lang}/architect/passport`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и отдаёт три вещи — свои слова
// (`_data`), свою работающую часть (`_components`) и список детей, порождённый
// сборкой. Ничего из этого она не знает сама. Устройство — в README рядом.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  // 862-11 (Roma 2026-11-27, Telegram 1662): the node ID, read on the architect's click — `components/passport/node-identity.client.tsx`.
  return (
    <CollectionIndex
      lang={lang}
      dir="/architect/passport"
      page={data}
      pages={PAGES}
      content={content(lang)}
      widget={<NodeIdentity words={nodeIdentityUi(lang)} />}
    />
  )
}
