// 632-1: слова карточки каталога ядра, чей элемент не ответил: выключен по паспорту или человеком — или молчит сейчас. Каталог говорит
// на двух языках, как его дверь (`/api/node/catalog?lang=en|ru`); `en` основа, `ru` перевод.
// 662-1: `mark` — метка выключенного элемента в «Все проекты» (ядро и шапки элементов).
export type CatalogWords = { off: string; silent: string; mark: string }

const DICT: Record<"en" | "ru", CatalogWords> = {
  en: { off: "Turned off", silent: "Not answering now — open its section", mark: "off" },
  ru: { off: "Выключен", silent: "Сейчас не отвечает — откройте его раздел", mark: "выключен" },
}

export function catalogWords(lang: string): CatalogWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
