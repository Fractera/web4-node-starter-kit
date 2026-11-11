// СЛОВА ИМЕНИ ЭЛЕМЕНТА (721-1): запасное имя главного сайта, пока человек не дал ему своего. `en` основа, `ru` перевод.
const DICT: Record<"en" | "ru", { rootSite: string }> = {
  en: { rootSite: "Main site" },
  ru: { rootSite: "Главный сайт" },
}

export function elementNameWords(lang: string): { rootSite: string } {
  return DICT[lang === "ru" ? "ru" : "en"]
}
