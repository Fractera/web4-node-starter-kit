import { MainAgentPage } from '../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/automation` (558-3): раздел «Автоматизированное управление» — запуск агентов и приложений по
// расписанию. Слова — `_data`; работающая часть — `_components/main-agent-automation.tsx` (сервисы, календарь, задача главному агенту).
export const generateMetadata = collectionMetadata(data, '/architect/build')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="automation" page={data} />
}
