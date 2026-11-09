import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { AccordionSection } from '@/components/accordion/accordion-section.client'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocItems, DocLinks } from '@/components/lagrix/doc-items'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { data } from './_data'
import { content } from './_components'
import { PAGES } from './_list.generated'

// ГРУППА «СУПЕР УЗЕЛ» — `/{lang}/architect/super-node` (530-3, 531). Владелец 2026-10-18: «главная страница опиши что такое супер узел и
// предложит подать заявку»; о доходе: «Все что здесь нужно было – перечислить по пунктам все финансовые выгоды, передать ссылку на
// техническую информацию на сайте Lagrix»; «Все вещи которые ты рассказываешь должны ссылаться на соответствующую страницу документации
// Lagrix». Что такое супер-узел (свёрнуто), за что ему платят — пять пунктов, у каждого документ Lagrix; заявка — на вкладке «Статус».
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const w = superNodeUi(lang)
  return (
    <CollectionIndex
      lang={lang}
      dir="/architect/super-node"
      page={data}
      pages={PAGES}
      content={content(lang)}
      widget={
        <div className="mb-6 flex max-w-3xl flex-col gap-4">
          <AccordionSection panels={[{ id: 'what', summary: w.whatTitle, content: <DocItems lang={lang} items={w.what} /> }]} />
          <Card data-super-node-income>
            <CardHeader><CardTitle className="text-xl font-semibold">{w.incomeTitle}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <DocItems lang={lang} items={w.income} ordered />
              <p className="text-sm text-muted-foreground">{w.incomeNote.text} <DocLinks lang={lang} docs={w.incomeNote.docs} /></p>
            </CardContent>
          </Card>
          <a href={`/${lang}/super-node/status`} className={buttonVariants({ className: 'w-fit' })} data-super-node-status-link>{w.statusLink}</a>
          <p className="text-sm text-muted-foreground">{w.docsTitle}: <DocLinks lang={lang} docs={w.pageDocs.home} className="text-sm" /></p>
        </div>
      }
    />
  )
}
