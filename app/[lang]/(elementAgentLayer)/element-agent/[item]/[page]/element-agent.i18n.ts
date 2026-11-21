// @local — the words of the element agent frame (node step 834-4)
export const PAGES = ["subscription", "terminal", "telegram", "openai"] as const
export type ElementAgentPage = (typeof PAGES)[number]

type Words = { eyebrow: string; tabs: string; page: Record<ElementAgentPage, string> }

const WORDS: Record<"en" | "ru", Words> = {
  en: { eyebrow: "The element's agent", tabs: "The agent's pages", page: { subscription: "Claude Code subscription", terminal: "Terminal", telegram: "Telegram bot", openai: "OpenAI key" } },
  ru: { eyebrow: "Агент элемента", tabs: "Страницы агента", page: { subscription: "Подписка Claude Code", terminal: "Терминал", telegram: "Telegram-бот", openai: "Ключ OpenAI" } },
}

export const elementAgentWords = (lang: string): Words => WORDS[lang === "ru" ? "ru" : "en"]
