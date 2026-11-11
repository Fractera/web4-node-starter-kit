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
  /** 722-4: окно «ИИ». */
  aiTitle: string
  aiLead: string
  aiPlaceholder: string
  aiFind: string
  aiNone: string
  aiNoVectors: string
  whySkill: string
  whyArea: string
  whyName: string
  whyDescription: string
}

const DICT: Record<"en" | "ru", MenuSearchWords> = {
  en: { open: "Search elements", placeholder: "Element name", find: "Find", ai: "AI", found: "Found: {n}", none: "No element with this name", clear: "Clear", failed: "The search did not answer — try again", aiTitle: "Find by meaning", aiLead: "Tell me which component you are looking for", aiPlaceholder: "For example: do we have something that helps to make clips?", aiFind: "Search", aiNone: "Nothing in this node is close by meaning", aiNoVectors: "The search by meaning is not available now — the node's vectors do not answer", whySkill: "does it now", whyArea: "it is its field", whyName: "the name matches", whyDescription: "close by its description" },
  ru: { open: "Поиск элементов", placeholder: "Название элемента", find: "Найти", ai: "ИИ", found: "Найдено: {n}", none: "Элемента с таким названием нет", clear: "Очистить", failed: "Поиск не ответил — попробуйте ещё раз", aiTitle: "Поиск по смыслу", aiLead: "Расскажите, какой компонент вы ищете", aiPlaceholder: "Например: есть у нас что-то, что помогает создавать клипы?", aiFind: "Искать", aiNone: "Ничего похожего по смыслу в узле нет", aiNoVectors: "Поиск по смыслу сейчас недоступен — векторы узла не отвечают", whySkill: "умеет это сейчас", whyArea: "это его область", whyName: "совпало название", whyDescription: "похоже по описанию" },
}

export function menuSearchWords(lang: string): MenuSearchWords {
  return DICT[lang === "ru" ? "ru" : "en"]
}
