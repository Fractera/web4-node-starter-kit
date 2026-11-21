// Слова уведомлений главного чата (узел, шаг 636-8): значок и название рода события, имя главного агента в шапке.
// 663-3: «load» — правило нагрузки узла (предложение усыпить, усыплённые, тревога у предела).
// 833-4: «account» — an element's agent on a server has no Claude account of its own, its task could not start.
export type NoticeKind = "reminder" | "memory" | "work" | "load" | "missed" | "account"
export const NOTICE_KINDS: readonly NoticeKind[] = ["reminder", "memory", "work", "load", "missed", "account"]

type NoticeWords = { mark: Record<NoticeKind, string>; title: Record<NoticeKind, string>; main: string }

const MARK: Record<NoticeKind, string> = { reminder: "⏰", memory: "🟢", work: "⚙️", load: "📊", missed: "⚠️", account: "🔑" }

const WORDS: Record<"en" | "ru", NoticeWords> = {
  en: { mark: MARK, title: { reminder: "Reminder", memory: "Deep memory", work: "Working process", load: "Node load", missed: "An entry did not run", account: "An agent is not signed in to Claude" }, main: "Main agent" },
  ru: { mark: MARK, title: { reminder: "Напоминание", memory: "Глубокая память", work: "Рабочий процесс", load: "Нагрузка узла", missed: "Запись не сработала", account: "Агент не вошёл в Claude" }, main: "Главный агент" },
}

export const noticeWords = (lang: string): NoticeWords => WORDS[lang === "ru" ? "ru" : "en"]
