import { MainAgentPage } from '../../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../../_lib/collection-metadata'
import { AutomationView } from '../../../../_components/main-agent-automation'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/automation/cron` (558-3): раздел «Автоматизированное управление» — запуск агентов и приложений по
// расписанию. Слова — `_data`; работающая часть — `_components/main-agent-automation.tsx` (сервисы, календарь, задача главному агенту).
// Файлы главного агента читаются на каждый запрос: календарь и сервисы меняются без сборки ядра (закрытый слой архитектора).
export const dynamic = 'force-dynamic'
export const generateMetadata = collectionMetadata(data, '/architect/build/automation')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="automation/cron" page={data} own={<AutomationView lang={lang} view="cron" />} />
}
