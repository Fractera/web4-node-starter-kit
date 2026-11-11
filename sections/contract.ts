import type { ReactNode } from 'react'
import type { PageItem } from '@/lib/content/sections/types'
import type { PostBodyUi } from '@/lib/content/post-body-ui'

// ДОГОВОР СЕКЦИИ: что такое рендерер вида и что он получает.
//
// 🔒 ЗДЕСЬ НЕТ НИ ОДНОГО ЦВЕТА И НИ ОДНОГО КЛАССА. Договор описывает форму, а не
// оформление: первая же деталь вида, просочившаяся сюда, станет обязательной для
// всех шестнадцати рендереров разом.
//
// 🔒 ФОРМА ДАННЫХ СЕКЦИИ НЕ ПРИНАДЛЕЖИТ. Виды и их поля объявлены в
// `lib/content/sections/types.ts` — рендерер решает, КАК выглядит `quote`, и не
// решает, из чего `quote` состоит. Иначе материал перестал бы быть переносимым
// между поверхностями, а он один и тот же в статье, в машинной версии и в карте.

/** Всё, что рендерер получает сверх самой секции. */
export type SectionCtx = {
  lang: string
  /** Подписи, которые печатает сам механизм (кнопка `docref` и т. п.). */
  ui: PostBodyUi
  /** React-ключ этой секции; он же префикс ключей для его внутренностей. */
  key: string
  /** Нарисовать вложенные секции — ими пользуются контейнеры. */
  renderPage: (body: PageItem[], lang: string, ui: PostBodyUi, keyPrefix?: string) => ReactNode[]
}

type BlockOf<K extends PageItem['kind']> = Extract<PageItem, { kind: K }>

/** Рендерер одного вида секции. */
export type SectionRenderer<K extends PageItem['kind']> = (block: BlockOf<K>, ctx: SectionCtx) => ReactNode

/**
 * Полный набор рендереров.
 *
 * 🔒 ВСЕ ВИДЫ ОБЯЗАТЕЛЬНЫ, И ЭТО СИЛЬНЕЙШАЯ ИЗ ВОЗМОЖНЫХ ПРОВЕРОК. Добавили вид
 * в каталог, не написав рендерер, — проект НЕ СОБЕРЁТСЯ, и узнаете вы об этом за
 * секунду, а не через месяц по пустому месту на странице. Гейт такого дать не
 * может: он запускается, когда его запустили, а тип — всегда.
 */
export type SectionSet = {
  [K in PageItem['kind']]: SectionRenderer<K>
}
