import { redirect } from 'next/navigation'
import { ARCHITECT_HOME } from '../../_lib/architect-menu'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'

// ГРУППА «ГЛАВНЫЙ TELEGRAM-БОТ» — `/{lang}/architect/main-telegram` (владелец 2026-11-02: «В левом меню выше чем кнопка главный агент
// поставь кнопку main Telegram бот … переадресация и открыть страницы h2A/telegram … Потому что его найти в проекте почти невозможно»).
// 🔒 ТОЛЬКО ПЕРЕАДРЕСАЦИЯ. Страница бота остаётся по своему адресу `build/telegram` (её ставит общий комплект агента, в меню она под
// «Главный агент → Messenger → H2A»); здесь — короткий путь к ней с верхнего уровня меню, без второй копии страницы.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}${ARCHITECT_HOME}/build/telegram`)
}
