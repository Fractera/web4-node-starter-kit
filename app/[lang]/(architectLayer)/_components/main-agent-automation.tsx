import { join } from "node:path"
import { folderAutomation, type CronPlan } from "@/lib/a2a/element-passport"
import allClocks from "@/lib/web4-items/all-clocks.cjs"
import { CronCalendar } from "./cron-calendar.client"
import { ScheduleTask } from "./schedule-task.client"
import { automationCronUi, automationTaskWords } from "./schedule-task.i18n"
import { elementPassportUi } from "../_i18n/element-passport.i18n"

// «АВТОМАТИЗИРОВАННОЕ УПРАВЛЕНИЕ» ГЛАВНОГО АГЕНТА (узел, шаг 558-3) — вкладки календаря и нового события (709: без «Инструментов»), как «Резервное копирование» элементов памяти.
// Слово владельца 2026-10-21: «вкладка такая же для подключения сервисов, такая же для запуска Cron события и такая же для настройки …
// в Аргенти это будет автоматизированное управление агентами или приложениями». Данные — папка главного агента `data/main-agent` по
// раскладке элемента (`folderAutomation`); страницы динамические — календарь читает файлы на каждый запрос.

const MAIN_AGENT_DIR = () => join(process.cwd(), "data", "main-agent")

// 709 (владелец 2026-11-09: «все инструменты могут быть только у агентов»): вкладки «Инструменты» у главного агента нет; «Настройки» —
// «Добавить событие».
export function AutomationView({ lang, view }: { lang: string; view: "cron" | "settings" }) {
  if (view === "settings") return <ScheduleTask lang={lang} service="build" words={automationTaskWords(lang)} />
  const { cron } = folderAutomation(MAIN_AGENT_DIR())
  const ui = elementPassportUi(lang)
  const cronUi = automationCronUi(lang, ui.cron)
  // 697-1 (владелец 2026-11-08: «проверить что все возможные задачи из элементов переносится на главный холст Cron событий»): на холсте
  // главного агента — и настоящие записи каждого элемента (не заготовки шаблона), с именем элемента и его журналом; исполняет их сам
  // элемент, ядро только показывает (`lib/web4-items/all-clocks.cjs`).
  const part = allClocks.canvasPart(process.cwd()) as Pick<CronPlan, "events" | "schedules" | "runs">
  const merged: CronPlan | null = cron || part.schedules.length
    ? { repeatsPaused: cron?.repeatsPaused ?? false, events: [...(cron?.events ?? []), ...part.events], schedules: [...(cron?.schedules ?? []), ...part.schedules], runs: [...(cron?.runs ?? []), ...part.runs] }
    : null
  return merged
    ? <div className="my-4" data-automation-cron data-element-entries={part.schedules.length}><CronCalendar plan={merged} lang={lang} ui={cronUi} /></div>
    : <p className="my-4 max-w-3xl text-sm text-muted-foreground" data-automation-cron="empty">{cronUi.empty}</p>
}
