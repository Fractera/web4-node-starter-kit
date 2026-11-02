import { MainAgentPage } from '../../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../../_lib/collection-metadata'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/messenger/h2h` (528-3, 528-6): меню главного агента повторяет меню элемента. Страница рисуется
// общей оболочкой: заголовок и строка о назначении, пункты под ней в меню (`main-agent-scheme.ts`) и, где это та же страница
// элемента, — она у root и каждого кастомного элемента.
export const generateMetadata = collectionMetadata(data, '/architect/build/messenger')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="messenger/h2h" page={data} />
}
