import { MainAgentPage } from '../../../../_lib/main-agent-page'
import { collectionMetadata } from '../../../../_lib/collection-metadata'
import { data } from './_data'

// «Главный агент» → `/{lang}/architect/build/automation/google-calendar` (630): заглушка. Владелец 2026-11-03: «Мы синхронизации с Google
// календарем делать не будем просто в разделе автоматизации можешь создать заглушку. Тому пользователю которому это нужно сделать сам».
// Слова — `_data`; работающей части нет намеренно.
export const generateMetadata = collectionMetadata(data, '/architect/build/automation')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <MainAgentPage lang={lang} rel="automation/google-calendar" page={data} />
}
