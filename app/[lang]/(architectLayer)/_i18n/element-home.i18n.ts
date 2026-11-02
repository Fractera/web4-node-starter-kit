// ГЛАВНАЯ КАСТОМНОГО ЭЛЕМЕНТА (551-2): тревога, пока элемент не описан в ядре или без визитки A2A. Слова тревоги — владельца
// 2026-10-20: «пока не будет создана карточка протокола 2а2 этот элемент будет недоступен для обнаружения в web4 сети». `en` основа,
// `ru` перевод. Кошелёк говорит своими словами (`components/wallet/node-wallet.i18n.ts`).

export type ElementHomeUi = {
  /** Слова владельца — первая строка тревоги. */
  alarmTitle: string
  noDescription: string
  noCard: string
  /** Кнопка: задача «опиши себя» в терминал элемента. */
  order: string
  /** Подпись красной точки у заголовка «Кошелёк». */
  alarmMark: string
}

const DICT: Record<"en" | "ru", ElementHomeUi> = {
  en: {
    alarmTitle: "Until this element's A2A card is created, it cannot be discovered in the WEB4 network.",
    noDescription: "There is no description in the core yet: order it, and the element's agent writes it and hands it to the core.",
    noCard: "There is no A2A card: the element's passport has errors or no card body (Build → Documents → The element's own properties).",
    order: "Order a description",
    alarmMark: "The element needs a description",
  },
  ru: {
    alarmTitle: "Пока не создана карточка протокола A2A, этот элемент недоступен для обнаружения в сети WEB4.",
    noDescription: "Описания в ядре ещё нет: закажите его — агент элемента напишет описание и передаст его в ядро.",
    noCard: "Нет визитки A2A: в паспорте элемента ошибки или нет тела карточки (Строительство → Документы → Собственные свойства элемента).",
    order: "Заказать описание",
    alarmMark: "Элементу нужно описание",
  },
}

export function elementHomeUi(lang: string): ElementHomeUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
