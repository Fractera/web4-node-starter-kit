import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'

// РАЗДЕЛ «Move to another server» — `/{lang}/architect/hosting/move`, a page of a server node only (the place of «Активация выделенного
// сервера» on the person's computer). The owner, 2026-11-15: «существует вероятность что в определённый момент тот сервер … упрётся в
// технический предел … тогда пользователя нужно будет переехать на другой хостинг. Поэтому получается что кнопка должна существовать».
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и папку-родителя, отдаёт свои слова
// и свою работающую часть. Меню, раскладка и обработка пустоты — в оболочке.
// Устройство страницы и её правила — в README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/hosting')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/hosting" page={data} content={content(lang)} />
}
