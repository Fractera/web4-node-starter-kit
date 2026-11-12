import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'

// РАЗДЕЛ «Инструменты» главного агента — `/{lang}/architect/build/tools` (узел, шаг 725-8), в «Рабочих процессах».
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку, отдаёт свои слова и свою работающую часть (вид `toolsTab`). Устройство — README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/build')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/build" page={data} content={content(lang)} />
}
