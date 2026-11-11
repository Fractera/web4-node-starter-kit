// ВРЕМЕННАЯ ВЕРСИЯ «КАК ЭТО РАБОТАЕТ» — ДО ЗАПУСКА LAGRIX (шаг 706-8). Владелец 2026-11-09: «На вкладке как это работает нужно создать
// вторую версию документа и убрать все что связывает этот проект с lagrix основную страницу которая находится сейчас закомментировать
// до появления lagrix, вместо этого показать временную.»
//
// 🔒 ВТОРАЯ ВЕРСИЯ ВЫВОДИТСЯ ИЗ ОСНОВНОЙ, А НЕ КОПИРУЕТСЯ: основная (`presentation.ts` + разделы памяти и платформ) остаётся целой и
// вернётся с сетью; здесь — что из неё убрано и чем заменено. Копия в 600 строк разошлась бы с основной молча при первой правке.
// Убрано: раздел 1 «Готов к Web4» целиком, карточка миссии Lagrix (`_components/index.ts`), строки о связи с Lagrix и заказах a2a;
// разделы перенумерованы. Строка об общей основе больше не называет Дизайн и Секции — их узел отменил тем же шагом 706.
// Сторож: ни одно слово этой версии не называет Lagrix (`assertNoLagrix`, падает при первом же показе страницы в сборке).
import { presentationWords, type PresentationWords } from './presentation'

type Lang = 'en' | 'ru'

const INTRO: Record<Lang, string> = {
  en: 'Fractera is a starter for building sites and apps with AI. From it, a node grows on your computer: a set of elements, each one a separate site or app with its own AI agent. You say what you need, and the agents build it, keep it running and grow it with you.',
  ru: 'Fractera — стартер для создания сайтов и приложений с ИИ. Из него на вашем компьютере вырастает узел: набор элементов, и каждый — отдельный сайт или приложение со своим ИИ-агентом. Вы говорите, что нужно, а агенты строят это, поддерживают в работе и развивают вместе с вами.',
}

/** Строка основной версии → строка временной. */
const REPLACE: Record<Lang, Record<string, string>> = {
  en: {
    'The basics are already built and shared: sign-in, data, design, body, settings and ready-made solutions — the agent connects them instead of writing them again.':
      'The basics are already built and shared: sign-in, data, files, search by meaning, settings and ready-made solutions — the agent connects them instead of writing them again.',
    'Agents, sites and the link with Lagrix keep working without being rebuilt.': 'Agents and sites keep working without being rebuilt.',
    'When a helper’s time comes, by an entry in its own calendar, the node wakes it; it does the job and goes back to sleep. Orders from outside agents (a2a) will wake it the same way once the Lagrix network is live.':
      'When a helper’s time comes, by an entry in its own calendar, the node wakes it; it does the job and goes back to sleep.',
  },
  ru: {
    'Основа уже построена и общая для всех: вход, данные, дизайн, секции, настройки, готовые решения — агент подключает их, а не пишет заново.':
      'Основа уже построена и общая для всех: вход, данные, файлы, поиск по смыслу, настройки, готовые решения — агент подключает их, а не пишет заново.',
    'Агенты, сайты и связь с Lagrix продолжают работать без переделки.': 'Агенты и сайты продолжают работать без переделки.',
    'Когда приходит время помощника, по записи в его собственном календаре, узел будит его; он делает работу и снова засыпает. Заказы внешних агентов (a2a) будут будить его так же, когда заработает сеть Lagrix.':
      'Когда приходит время помощника, по записи в его собственном календаре, узел будит его; он делает работу и снова засыпает.',
  },
}

/** «2. Заголовок» → «1. Заголовок», «2.1 Часть» → «1.1 Часть»: раздел 1 убран. */
const renumber = (title: string) => title.replace(/^(\d+)(\.\d+)?(\.?\s)/, (_, n: string, sub = '', tail: string) => `${Number(n) - 1}${sub}${tail}`)

function assertNoLagrix(w: PresentationWords) {
  const words = JSON.stringify({ intro: w.intro, card: w.card, aiCard: w.aiCard, sections: w.sections })
  if (/lagrix/i.test(words)) throw new Error('presentation-temporary: временная версия «Как это работает» называет Lagrix')
}

export function temporaryPresentationWords(lang: string): PresentationWords {
  const l: Lang = lang === 'ru' ? 'ru' : 'en'
  const base = presentationWords(l)
  const fix = (s: string) => REPLACE[l][s] ?? s
  const w: PresentationWords = {
    ...base,
    intro: INTRO[l],
    sections: base.sections.slice(1).map((s) => ({
      ...s,
      title: renumber(s.title),
      ...(s.lead ? { lead: fix(s.lead) } : {}),
      parts: s.parts.map((p) => ({ title: renumber(p.title), items: p.items.map(fix) })),
    })),
  }
  assertNoLagrix(w)
  return w
}
