import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { SuperNodeStatus } from '@/components/super-node/super-node-status.client'
import { DocLinks } from '@/components/lagrix/doc-items'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { data } from './_data'
import { content } from './_components'

// «Супер узел» → `/{lang}/architect/super-node/status` (531). Владелец 2026-10-18: «вкладку что-то типа статус в котором пользователь может
// нажать кнопку подать заявку … заявка одобрена показывает время и как раз там должна быть кнопка пройти тест». Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/super-node')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const w = superNodeUi(lang)
  return (
    <CollectionPage
      lang={lang}
      dir="/architect/super-node"
      page={data}
      content={content(lang)}
      widget={
        <div className="flex flex-col gap-4">
          <SuperNodeStatus lang={lang} words={w} />
          <p className="max-w-3xl text-sm text-muted-foreground">{w.docsTitle}: <DocLinks lang={lang} docs={w.pageDocs.status} className="text-sm" /></p>
        </div>
      }
    />
  )
}
