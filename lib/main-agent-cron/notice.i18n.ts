// Слова уведомлений главного чата (узел, шаг 636-8): значок и название рода события, имя главного агента в шапке.
export type NoticeKind = "reminder" | "memory" | "work"
export const NOTICE_KINDS: readonly NoticeKind[] = ["reminder", "memory", "work"]

type NoticeWords = { mark: Record<NoticeKind, string>; title: Record<NoticeKind, string>; main: string }

const MARK: Record<NoticeKind, string> = { reminder: "⏰", memory: "🟢", work: "⚙️" }

const WORDS: Record<"en" | "ru", NoticeWords> = {
  en: { mark: MARK, title: { reminder: "Reminder", memory: "Deep memory", work: "Working process" }, main: "Main agent" },
  ru: { mark: MARK, title: { reminder: "Напоминание", memory: "Глубокая память", work: "Рабочий процесс" }, main: "Главный агент" },
}

export const noticeWords = (lang: string): NoticeWords => WORDS[lang === "ru" ? "ru" : "en"]
