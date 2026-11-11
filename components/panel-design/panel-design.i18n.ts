// Слова «Настройки → Дизайн панели» (шаг 718).
const EN = {
  provider: "Main provider",
  providerLead: "The AI that builds and runs this node.",
  panel: "Panel design",
  panelLead: "Colours, fonts, text and spacing of this control panel. The site and the elements keep their own look.",
  tabs: { colors: "Colours", fonts: "Fonts", type: "Text", shape: "Shapes and spacing" },
  copying: "Now the panel copies the site's look. Your first change gives the panel a look of its own.",
  own: "The panel has a look of its own; the site's look does not reach it.",
  back: "Back to the site's look",
  loading: "Reading the panel's look…",
  failed: "The panel's look could not be read — reload the page.",
}
export type PanelDesignWords = typeof EN
const RU: PanelDesignWords = {
  provider: "Главный провайдер",
  providerLead: "ИИ, который строит и ведёт этот узел.",
  panel: "Дизайн панели",
  panelLead: "Цвета, шрифты, текст и отступы этой панели управления. Сайт и элементы сохраняют свой вид.",
  tabs: { colors: "Цвета", fonts: "Шрифты", type: "Текст", shape: "Формы и отступы" },
  copying: "Сейчас панель повторяет оформление сайта. Первое ваше изменение даст панели собственный вид.",
  own: "У панели собственный вид; оформление сайта на неё больше не влияет.",
  back: "Вернуть оформление сайта",
  loading: "Читаю оформление панели…",
  failed: "Оформление панели не прочиталось — обновите страницу.",
}
export function panelDesignUi(lang: string): PanelDesignWords {
  return lang === "ru" ? RU : EN
}
