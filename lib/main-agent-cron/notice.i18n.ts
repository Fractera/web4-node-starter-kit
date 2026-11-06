// Слова уведомлений главного чата (узел, шаг 636-8): значок и название рода события, имя главного агента в шапке.
// 663-3: «load» — правило нагрузки узла (предложение усыпить, усыплённые, тревога у предела).
export type NoticeKind = "reminder" | "memory" | "work" | "load"
export const NOTICE_KINDS: readonly NoticeKind[] = ["reminder", "memory", "work", "load"]

type NoticeWords = { mark: Record<NoticeKind, string>; title: Record<NoticeKind, string>; main: string }

const MARK: Record<NoticeKind, string> = { reminder: "⏰", memory: "🟢", work: "⚙️", load: "📊" }

const WORDS: Record<"en" | "ru", NoticeWords> = {
  en: { mark: MARK, title: { reminder: "Reminder", memory: "Deep memory", work: "Working process", load: "Node load" }, main: "Main agent" },
  ru: { mark: MARK, title: { reminder: "Напоминание", memory: "Глубокая память", work: "Рабочий процесс", load: "Нагрузка узла" }, main: "Главный агент" },
}

export const noticeWords = (lang: string): NoticeWords => WORDS[lang === "ru" ? "ru" : "en"]
