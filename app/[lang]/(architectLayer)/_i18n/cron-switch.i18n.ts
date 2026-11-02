// ПЕРЕКЛЮЧАТЕЛЬ «ИСПОЛЬЗОВАТЬ АВТОМАТИЗАЦИЮ» НА СТРАНИЦЕ КРОНА (551-3). `en` основа, `ru` перевод.

export type CronSwitchUi = {
  label: string
  on: string
  off: string
  where: string
  loading: string
  failed: string
  saveFailed: string
}

const DICT: Record<"en" | "ru", CronSwitchUi> = {
  en: {
    label: "Use automation",
    on: "On: the element's server runs the schedule below at its times.",
    off: "Off: nothing in the schedule runs, the entries are kept. Turn it on again — the next times run as planned; missed runs are not made up.",
    where: "The switch is kept in the element's passport (OWN-SERVICE-PROPS, field automation.cron) and works within a minute, with no rebuild. The element's agent turns it on and off on your word in the terminal or in Telegram.",
    loading: "Reading the switch…",
    failed: "The switch could not be read: the element's passport did not answer.",
    saveFailed: "Not saved: the element's passport did not accept the change.",
  },
  ru: {
    label: "Использовать автоматизацию",
    on: "Включено: сервер элемента выполняет расписание ниже в его время.",
    off: "Выключено: ни одна запись расписания не выполняется, записи сохранены. Включите снова — следующие запуски пойдут по плану; пропущенные не догоняются.",
    where: "Переключатель хранится в паспорте элемента (OWN-SERVICE-PROPS, поле automation.cron) и действует в течение минуты, без сборки. Агент элемента включает и выключает его по вашему слову в терминале или в Telegram.",
    loading: "Читаю переключатель…",
    failed: "Переключатель не прочитан: паспорт элемента не ответил.",
    saveFailed: "Не сохранено: паспорт элемента не принял изменение.",
  },
}

export function cronSwitchUi(lang: string): CronSwitchUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
