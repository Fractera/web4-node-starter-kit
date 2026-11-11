import type { PageItem, WorkspaceItem } from '@/lib/content/sections/types'
import { headingId } from '@/lib/content/sections/inline'
import { labelGlossaryWords, labelsToForms, resolveTermLabels } from '@/lib/content/sections/term'
import { architectHomeUi, type BasicsTerm } from '../../../../_i18n/architect-home.i18n'
import { glossaryForms } from '../../../../_i18n/glossary-forms'
import { type PresentationSection } from '../_data/presentation'
// 706-8: до запуска Lagrix страница показывает временную версию без Lagrix; основная закомментирована ниже, её слова целы в `presentation.ts`.
// import { presentationWords } from '../_data/presentation'
import { temporaryPresentationWords as presentationWords } from '../_data/presentation-temporary'

// СОДЕРЖИМОЕ СТРАНИЦЫ «How it works» — презентация узла и его связи с Lagrix (шаг 535, слово владельца 2026-10-18 — в
// `../_data/presentation.ts`). Три уровня нумерации: раздел «1.» (h2) → часть «1.1» (h3) → нумерованный список. Сразу после вступления —
// карточка «панель открывать не обязательно»: владелец назвал её самым важным.
//
// 600-1 (владелец 2026-10-26): разделы 5–6 — «Глубокая память» и «Непрерывная эволюция» — переехали сюда со входа `/architect`;
// вверху страницы — оглавление из заголовков разделов (`tabsOf`), тот же ряд якорей, что на `/ru/auth`.
//
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ: любая строка, которую увидит человек, приходит из `_data` — иначе она не переводится и её не видит сторож
// словарей. Метки `[[форма|ключ]]` в этих словах раскрывает ликбез входа: `architect-home.i18n.ts`, раздел «basics».
//
// 600-5 (владелец 2026-10-26: «каждый раз когда встречается слова из этого глоссария подсвечивай их в Tooltip чтобы приучить нового
// пользователя к нашему языку»): каждое слово ликбеза в тексте страницы находится само (`labelGlossaryWords`, формы — `glossary-forms.ts`)
// и раскрывается подсказкой. Заголовки — без подсказок: по `h2` строятся якоря оглавления.

function glossaryOf(lang: string): (text: string) => string {
  const termWord = (t: BasicsTerm) => (t.aside ? `${t.word} (${t.aside})` : t.word)
  const terms = Object.fromEntries(architectHomeUi(lang).basics.items.map((t) => [t.key, { word: termWord(t), text: labelsToForms(t.text) }]))
  const forms = glossaryForms(lang)
  return (text) => resolveTermLabels(labelGlossaryWords(text, forms), terms)
}

/** Оглавление: одна вкладка на раздел, якорь — тот же, что печатает заголовок `h2` (`headingId`). */
export function tabsOf(lang: string): WorkspaceItem[] {
  return presentationWords(lang).sections.map((s) => ({ label: s.tab, href: `#${headingId(s.title)}` }))
}

export function content(lang: string): PageItem[] {
  const w = presentationWords(lang)
  const words = glossaryOf(lang)
  return [
    { kind: 'p', text: words(w.intro) },
    // Кнопка карточки — подключение Telegram главного агента (владелец 2026-10-18: «add button … -> …/ru/build/telegram»).
    { kind: 'callout', title: w.card.title, text: words(w.card.text), action: { href: `/${lang}/build/telegram`, label: w.card.action } },
    ...w.sections.flatMap((s: PresentationSection, i): PageItem[] => [
      { kind: 'h2', text: s.title },
      ...(s.lead ? [{ kind: 'p', text: words(s.lead) } as PageItem] : []),
      // 688 (владелец 2026-11-08): вопрос раздела — раскрывашкой под вступлением («можно сделать как раскрывашку с вопросом как вообще
      // это можно сравнивать?»); одна полоса, свёрнута.
      ...(s.question
        ? [{ kind: 'accordion', tone: 'question', children: [{ kind: 'accordionItem', summary: s.question.summary, children: [{ kind: 'p', text: words(s.question.text) }] }] } as PageItem]
        : []),
      ...s.parts.flatMap((p): PageItem[] => [
        { kind: 'h3', text: p.title },
        { kind: 'olist', items: p.items.map(words) },
      ]),
      // 535-3 (владелец 2026-10-18): в конце первого раздела — карточка о миссии Lagrix с кнопкой на главную lagrix.dev (en/ru).
      // 706-8: закомментирована до запуска Lagrix вместе с разделом 1 «Готов к Web4».
      // ...(i === 0
      //   ? [{ kind: 'callout', title: w.lagrixCard.title, text: words(w.lagrixCard.text), action: { href: `https://lagrix.dev/${lang === 'ru' ? 'ru' : 'en'}`, label: w.lagrixCard.action, external: true } } as Section]
      //   : []),
      // 535-4 (владелец 2026-10-18): в конце раздела «Обычный интернет» — карточка «ИИ — сердце узла» с кнопкой на активацию Claude Code.
      // 706-8: во временной версии этот раздел первый (`i === 0`); с основной версией — снова `i === 1`.
      ...(i === 0
        ? [{ kind: 'callout', title: w.aiCard.title, text: words(w.aiCard.text), action: { href: `/${lang}/build/subscription`, label: w.aiCard.action } } as PageItem]
        : []),
      // 600-1: карточка раздела памяти — ключ OpenAI, кнопка ведёт в редактор ключей ядра.
      ...(s.card
        ? [{ kind: 'callout', title: s.card.title, text: words(s.card.text), action: { href: `/${lang}${s.card.path}`, label: s.card.action } } as PageItem]
        : []),
    ]),
  ]
}
