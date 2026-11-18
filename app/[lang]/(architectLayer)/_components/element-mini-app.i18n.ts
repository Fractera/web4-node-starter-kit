import type { ElementMiniAppWords } from "./element-mini-app.client"

// 790: the words of the Mini App screen on an element's «Working process» (en and ru; other languages — English).
const WORDS: Record<string, ElementMiniAppWords> = {
  en: {
    note: "The same screen as in Telegram. Its menu is on the left, under «Working process»: what the element's agent adds to the Mini App appears in both places.",
    open: "Open in a new tab",
    loading: "Opening the element's Mini App…",
    none: "This element has no Mini App menu yet: it comes with the custom template v0.3.216. Ask the element's agent to take it.",
    off: "The element does not answer now — turn it on in «Settings → Danger zone».",
    noAddress: "The Mini App opens here on this computer or on the node's own domain; on a temporary address it is not shown.",
  },
  ru: {
    note: "Тот же экран, что в Telegram. Его меню — слева, под «Рабочим процессом»: что агент элемента добавит в мини-приложение, появится в обоих местах.",
    open: "Открыть в новой вкладке",
    loading: "Открываю мини-приложение элемента…",
    none: "У этого элемента пока нет меню мини-приложения: оно приходит с кастомным шаблоном v0.3.216. Попросите агента элемента взять его.",
    off: "Элемент сейчас не отвечает — включите его в «Настройки → Опасная зона».",
    noAddress: "Мини-приложение открывается здесь на этом компьютере или на своём домене узла; на временном адресе его не показать.",
  },
}

export const elementMiniAppWords = (lang: string): ElementMiniAppWords => WORDS[lang] ?? WORDS.en
