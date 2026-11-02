import { join } from "node:path"
import { folderAutomation } from "@/lib/a2a/element-passport"
import { CronCalendar } from "./cron-calendar.client"
import { SubscriptionsView } from "./subscriptions-view.client"
import { ScheduleTask } from "./schedule-task.client"
import { automationCronUi, automationTaskWords, automationToolsWords } from "./schedule-task.i18n"
import { elementPassportUi } from "../_i18n/element-passport.i18n"

// «АВТОМАТИЗИРОВАННОЕ УПРАВЛЕНИЕ» ГЛАВНОГО АГЕНТА (узел, шаг 558-3) — три вкладки, как «Резервное копирование» элементов памяти.
// Слово владельца 2026-10-21: «вкладка такая же для подключения сервисов, такая же для запуска Cron события и такая же для настройки …
// в Аргенти это будет автоматизированное управление агентами или приложениями». Данные — папка главного агента `data/main-agent` по
// раскладке элемента (`folderAutomation`); страницы динамические — календарь читает файлы на каждый запрос.

const MAIN_AGENT_DIR = () => join(process.cwd(), "data", "main-agent")

export function AutomationView({ lang, view }: { lang: string; view: "tools" | "cron" | "settings" }) {
  if (view === "settings") return <ScheduleTask lang={lang} service="build" words={automationTaskWords(lang)} />
  const { subscriptions, cron } = folderAutomation(MAIN_AGENT_DIR())
  const ui = elementPassportUi(lang)
  if (view === "tools") {
    const w = automationToolsWords(lang)
    return subscriptions
      ? <div className="my-4 flex flex-col gap-3" data-automation-tools={subscriptions.services.length}>
          {subscriptions.services.map((s) => <SubscriptionsView key={s.id} service={s} example={subscriptions.example} ui={ui.subscriptions} />)}
        </div>
      : <p className="my-4 max-w-3xl text-sm text-muted-foreground" data-automation-tools="0">{w.empty}</p>
  }
  const cronUi = automationCronUi(lang, ui.cron)
  return cron
    ? <div className="my-4" data-automation-cron><CronCalendar plan={cron} lang={lang} ui={cronUi} /></div>
    : <p className="my-4 max-w-3xl text-sm text-muted-foreground" data-automation-cron="empty">{cronUi.empty}</p>
}
