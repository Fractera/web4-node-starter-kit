// СЛОВА «НАСТРОЙКИ → БАЗОВЫЙ AI-ПРОВАЙДЕР» (691, владелец 2026-11-08: «in the settings you can to do now part base AI provider default
// antropic , not possible now replace to codex»). `en` основа, `ru` перевод.

export type AiProviderWords = {
  title: string
  lead: string
  anthropic: string
  anthropicState: string
  codex: string
  codexState: string
  ownNote: string
}

const DICT: Record<string, AiProviderWords> = {
  en: {
    title: "The node's base AI provider",
    lead: "The engine every agent of this node runs on: the main agent and every element.",
    anthropic: "Anthropic · Claude Code",
    anthropicState: "Default, in use",
    codex: "OpenAI · Codex",
    codexState: "Not possible yet: switching the engine of the whole node is a long job of its own, queued as step 690.",
    ownNote: "An element can still work on its own person's Claude subscription — on its page «Claude Code subscription».",
  },
  ru: {
    title: "Базовый AI-провайдер узла",
    lead: "Движок, на котором работают все агенты этого узла: главный агент и каждый элемент.",
    anthropic: "Anthropic · Claude Code",
    anthropicState: "По умолчанию, работает",
    codex: "OpenAI · Codex",
    codexState: "Пока нельзя: замена движка у всего узла — долгая отдельная работа, она в очереди как шаг 690.",
    ownNote: "Элемент при этом может работать по своей подписке Claude своего человека — на его странице «Подписка Claude Code».",
  },
}

/** Слова на выбранном языке; незнакомый язык честно деградирует до английского. */
export function aiProviderUi(lang: string): AiProviderWords {
  return DICT[lang] ?? DICT.en
}
