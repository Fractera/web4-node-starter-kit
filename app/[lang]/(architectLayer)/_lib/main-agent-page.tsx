import type { ReactNode } from 'react'
import type { Block } from '@/lib/content/blocks/types'
import { type WorkspacePageData, wordsOf } from '@/lib/collection/types'
import { ArchitectPage } from './architect-page'
import { groupNode } from './architect-menu'
import { elementPathOf, MAIN_AGENT } from './main-agent-scheme'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'
import { MainAgentElements } from '../_components/main-agent-elements'

// СТРАНИЦА «ГЛАВНОГО АГЕНТА» С ПУНКТАМИ ПОД НЕЙ (528-6): Messenger, H2H, H2A, Рабочий процесс, Процесс, A2A ×2, Строительство, i2i,
// Документы. Заголовок и строка о назначении — из `_data` папки; ниже — пункты, которые стоят под ней в меню (свои папки и страницы,
// поставленные сюда схемой `main-agent-scheme.ts`, со своими адресами); у страниц Messenger и Рабочего процесса — эта же страница у
// элементов. Одна оболочка на все такие страницы, чтобы список пунктов страницы и меню не разошлись: оба берутся из `groupTree`.

/** `own` — своя работающая часть страницы (530-1: ключи Stripe ядра, кошелёк узла); встаёт над ссылками на элементы. */
export function MainAgentPage({ lang, rel, page, own }: { lang: string; rel: string; page: WorkspacePageData; own?: ReactNode }) {
  const ui = architectLayerUi(lang)
  const words = wordsOf(page, lang)
  const node = groupNode(MAIN_AGENT, rel)
  const items: Block[] = (node?.kids ?? []).map((k) => ({
    kind: 'docref',
    title: wordsOf(k.page, lang).title,
    summary: wordsOf(k.page, lang).lead ?? ui.emptyLead,
    // 285-6: страницы архитектора — от корня ядра, без `/architect`.
    href: `/${lang}${k.path.replace(/^\/architect(?=\/|$)/, '')}`,
    label: ui.openSection,
    navigate: true,
  }))
  const elementPath = elementPathOf(rel)
  return (
    <ArchitectPage
      lang={lang}
      path={`/architect/${MAIN_AGENT}/${rel}`}
      title={words.title}
      lead={words.lead}
      children={items}
      widget={own || elementPath ? <>{own}{elementPath ? <MainAgentElements lang={lang} path={elementPath} /> : null}</> : undefined}
    />
  )
}
