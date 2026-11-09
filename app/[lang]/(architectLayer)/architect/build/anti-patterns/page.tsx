import { MainAgentPage } from '../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { ElementDocIsland } from '@/components/element-docs/element-doc.client'
import { elementDocsUi } from '../../../_i18n/element-docs.i18n'
import { data } from './_data'

// РАЗДЕЛ «Anti-patterns» — `/{lang}/architect/build/anti-patterns`.
//
// 🔒 710 (владелец 2026-11-09: «у главного агента почему-то надпись что эти страницы ещё не построены»): страница показывает файл ядра
// (`lib/main-agent/core-docs.ts`) тем же островком, что и документ элемента, — текст спрашивается при открытии
// (`/api/node/element-docs?item=build&page=anti-patterns`), сборка его не запекает: агент переписывает документы в любую минуту.
export const generateMetadata = collectionMetadata(data, '/architect/build')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="anti-patterns" page={data} own={<ElementDocIsland item="build" page="anti-patterns" words={elementDocsUi(lang)} />} />
}
