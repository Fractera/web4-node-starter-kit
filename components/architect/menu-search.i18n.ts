// СЛОВА ПОИСКА МЕНЮ АРХИТЕКТОРА (722-3, 722-4). `en` основа, `ru` перевод; выбирает сервер и передаёт островку пропсом.
export type MenuSearchWords = {
  open: string
  placeholder: string
  find: string
  ai: string
  found: string
  none: string
  clear: string
  failed: string
}

const DICT: Record<"en" | "ru", MenuSearchWords> = {
  en: { open: "Search elements", placeholder: "Element name", find: "Find", ai: "AI", found: "Found: {n}", none: "No element with this name", clear: "Clear", failed: "The search did not answer — try again" },
  ru: { open: "Поиск элементов", placeholder: "Название элемента", find: "Найти", ai: "ИИ", found: "Найдено: {n}", none: "Элемента с таким названием нет", clear: "Очистить", failed: "Поиск не ответил — попробуйте ещё раз" },
}

export function menuSearchWords(lang: string): MenuSearchWords {
  return DICT[lang === "ru" ? "ru" : "en"]
}
