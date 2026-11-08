import type { SectionRenderer } from '@/sections/contract'
import { H2 } from '@/components/ui/typography'
import { inline } from '@/lib/content/blocks/inline'
import { AccordionSection, type AccordionPanel } from '@/components/accordion/accordion-section.client'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { CircleHelp } from 'lucide-react'

// РАСКРЫВАЮЩИЕСЯ ПОЛОСЫ — вид каталога (244-1).
//
// 🔒 ЗАЧЕМ ВИД НУЖЕН. Решение владельца 2026-09-19: «Дело эту идею достаточно
// компактно при необходимости можешь использовать раскрывающуюся карточку типа
// аккордеон чтобы показать больше описание». Страница, обязанная объяснить
// десяток тем сразу, либо превращается в простыню, которую не читают, либо
// теряет половину сказанного. Аккордеон — третий ответ: видно всё оглавление,
// читается выбранное.
//
// 🔒 ЭТО НЕ `faq`, И РАЗЛИЧИЕ НЕ В ОФОРМЛЕНИИ. Там `<dl>` — пара «термин —
// определение», постоянный якорь и один раздел на страницу: разметка там и есть
// содержание. Здесь — произвольные разделы с произвольной начинкой, и соврать
// разметкой ради похожего вида нельзя.
//
// 🔒 РЕНДЕРЕР СЕРВЕРНЫЙ, ДВИЖЕНИЕ — В ОСТРОВКЕ. Ни один файл под `sections/` не
// бывает клиентским. Здесь блоки превращаются в готовое дерево средствами самого
// каталога, и островок получает уже нарисованное: он не знает о видах и не
// заводит второй системы разметки.
//
// 🛑 ЧУЖИЕ ДЕТИ ИГНОРИРУЮТСЯ МОЛЧА — И ЭТО НАМЕРЕННО, а не недосмотр. Детьми
// `accordion` бывают только `accordionItem`: иначе внутрь попал бы блок, которому
// негде открыться, и он исчез бы с экрана без следа. Тип уже не даёт положить
// сюда что угодно; эта проверка — последняя линия для материала, собранного не
// типами (например, пришедшего из конфига).
export const accordion: SectionRenderer<'accordion'> = (b, ctx) => {
  const panels: AccordionPanel[] = b.children
    .filter((child): child is Extract<typeof child, { kind: 'accordionItem' }> => child.kind === 'accordionItem')
    .map((item, index) => ({
      id: `${ctx.key}-${index}`,
      summary: item.summary,
      content: ctx.renderBlocks(item.children, ctx.lang, ctx.ui, `${ctx.key}-${index}`),
      // Подробности рисуются тем же каталогом и едут в островок готовым деревом — окно о видах не знает.
      details: item.details
        ? { title: item.details.title, content: ctx.renderBlocks(item.details.children, ctx.lang, ctx.ui, `${ctx.key}-${index}-d`) }
        : undefined,
    }))
  const hasDetails = panels.some(panel => panel.details)

  // Полоса, открытая при загрузке, — не более одной: берём первую помеченную.
  const openIndex = b.children.findIndex(
    child => child.kind === 'accordionItem' && child.open,
  )

  // 693: `tone: 'question'` — тёплая рамка цвета `warning` и значок вопроса слева; цвет — токеном, перекрашивается из «Дизайна».
  const question = b.tone === 'question'
  return (
    <section key={ctx.key} data-block="acc1" data-tone={question ? 'question' : undefined} className={question ? 'flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4' : 'flex flex-col gap-4'}>
      {question ? <CircleHelp aria-hidden className="mt-3 size-6 shrink-0 text-warning" /> : null}
      <div data-block="acc2" className="flex min-w-0 flex-1 flex-col gap-4">
      {b.title ? <H2>{inline(b.title, `${ctx.key}-t`)}</H2> : null}
      {b.lead ? (
        <p className="text-muted-foreground leading-relaxed">{inline(b.lead, `${ctx.key}-l`)}</p>
      ) : null}
      <AccordionSection
        panels={panels}
        defaultOpen={openIndex >= 0 ? `${ctx.key}-${openIndex}` : undefined}
        capped={b.capped === true}
        cards={b.cards === true}
        dialogUi={hasDetails ? appDialogUi(ctx.lang) : undefined}
      />
      </div>
    </section>
  )
}

// Полоса сама по себе ничего не рисует: её содержимое достаёт и показывает
// `accordion`. Рендерер существует, потому что набор видов ПОЛНЫЙ по типу —
// пропусти его, и проект не соберётся. То же устройство у `card` внутри `cards`.
export const accordionItem: SectionRenderer<'accordionItem'> = () => null
