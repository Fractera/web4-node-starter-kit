// 632-1: слова карточки каталога ядра, чей элемент не ответил: выключен по паспорту или человеком — или молчит сейчас. Каталог говорит
// на двух языках, как его дверь (`/api/node/catalog?lang=en|ru`); `en` основа, `ru` перевод.
export type CatalogWords = { off: string; silent: string }

const DICT: Record<"en" | "ru", CatalogWords> = {
  en: { off: "Turned off", silent: "Not answering now — open its section" },
  ru: { off: "Выключен", silent: "Сейчас не отвечает — откройте его раздел" },
}

export function catalogWords(lang: string): CatalogWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
