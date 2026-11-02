import type { ScheduleTaskWords } from "./schedule-task.client"
import type { CronUi } from "./cron-calendar.client"

// 558: слова «Настроек» двух разделов с расписанием (en и ru; остальные языки — английский).
const BACKUP: Record<string, ScheduleTaskWords> = {
  en: {
    title: "How to back up",
    hint: "Say or type what to copy, how often and where to: «every night copy the whole database to my storage on Backblaze», «every weekday at 13:00 copy only the orders table».",
    placeholder: "What to copy, how often, where to keep the copies…",
    comment: "«Add to development» opens the terminal of this element with your words as the task: the agent builds the copying service and puts its schedule into «Cron events».",
    button: "Add to development",
    taskLead: "Build process: build the backup of this element as the person describes below. The copying service is code (build process: commit, «Preview & Deploy»); its schedule is a record in data/cron.json outside git (working process) and shows up in «Backup → Cron events»; outside services it needs go to «Backup → Tools» (OWN-SERVICE-PROPS/SUBSCRIPTIONS.json, keys only by variable name). Skill: backup-schedule. No personal data in git. The person's words:",
  },
  ru: {
    title: "Как делать резервную копию",
    hint: "Скажите или напишите, что копировать, как часто и куда: «каждую ночь копируй всю базу в моё хранилище на Backblaze», «по будням в 13:00 копируй только таблицу заказов».",
    placeholder: "Что копировать, как часто, где хранить копии…",
    comment: "«Добавить в разработку» открывает терминал этого элемента с вашими словами как задачей: агент строит службу копирования и ставит её расписание в «Крон события».",
    button: "Добавить в разработку",
    taskLead: "Build process: построй резервное копирование этого элемента так, как описывает человек ниже. Служба копирования — код (строительный процесс: коммит, «Предпросмотр и развёртывание»); её расписание — запись в data/cron.json вне git (рабочий процесс), она видна в «Резервное копирование → Крон события»; внешние сервисы, которые ей нужны, — в «Резервное копирование → Инструменты» (OWN-SERVICE-PROPS/SUBSCRIPTIONS.json, ключи — только именем переменной). Навык: backup-schedule. Личных данных в git нет. Слова человека:",
  },
}

const AUTOMATION: Record<string, ScheduleTaskWords> = {
  en: {
    title: "What to automate",
    hint: "Say or type which agent or application to run, when, and what decides it: «every morning check the news on my topic; if there is a fitting one, give the blog agent a task to write a post».",
    placeholder: "Which agent to run, on what schedule, on what condition…",
    comment: "«Add to development» opens the main agent's terminal with your words as the task: it writes the automation into «Cron events».",
    button: "Add to development",
    taskLead: "Set up the automation the person describes below. It is an entry in data/cron.json of your folder (outside git): event agent-task, the time and repeat, and in message — the instruction you will get as your task when the clock wakes you (what to check, and which element gets the work by npm run task). The entry shows up in «Automated management → Cron events». An outside service it needs — add it to OWN-SERVICE-PROPS/SUBSCRIPTIONS.json of lib/main-agent (keys by variable name only) and say so. No personal data in git. Tell the person when it first runs. The person's words:",
  },
  ru: {
    title: "Что автоматизировать",
    hint: "Скажите или напишите, какого агента или приложение запускать, когда и по какому условию: «каждое утро проверяй новости по моей теме; если нашлась подходящая — дай агенту блога задачу написать пост».",
    placeholder: "Какого агента запускать, по какому расписанию, при каком условии…",
    comment: "«Добавить в разработку» открывает терминал главного агента с вашими словами как задачей: он записывает автоматизацию в «Крон события».",
    button: "Добавить в разработку",
    taskLead: "Настрой автоматизацию, которую описывает человек ниже. Это запись в data/cron.json твоей папки (вне git): событие agent-task, время и повтор, а в message — поручение, которое ты получишь задачей, когда часы тебя разбудят (что проверить и какой элемент получит работу через npm run task). Запись видна в «Автоматизированное управление → Крон события». Нужен внешний сервис — добавь его в OWN-SERVICE-PROPS/SUBSCRIPTIONS.json папки lib/main-agent (ключи — только именем переменной) и скажи об этом. Личных данных в git нет. Скажи человеку, когда первый запуск. Слова человека:",
  },
}

export const backupTaskWords = (lang: string): ScheduleTaskWords => BACKUP[lang] ?? BACKUP.en
export const automationTaskWords = (lang: string): ScheduleTaskWords => AUTOMATION[lang] ?? AUTOMATION.en

// 558: календарь «Крон события» — у элементов памяти копирование, у главного агента автоматизация; общий словарь календаря говорит о
// напоминаниях элемента, здесь подменяются только пояснение, примеры и пустое состояние.
type CronWords = Pick<CronUi, "lead" | "examplesTitle" | "examples" | "empty">
const BACKUP_CRON: Record<string, CronWords> = {
  en: {
    lead: "When copies of this element's data are made. The schedule is written by the element's agent — from «Settings» or when you ask it in the terminal or Telegram. The element's own server checks the clock once a minute by the local time of this computer; while the computer is off, copies are skipped and not made up later.",
    examplesTitle: "For example, tell the agent:",
    examples: ["Copy the whole database every night at 03:00", "Copy only the orders table on weekdays at 13:00", "Pause the nightly copy", "When was the last copy made?"],
    empty: "No copies are scheduled yet. Describe them in «Settings» and add them to development.",
  },
  ru: {
    lead: "Когда делаются копии данных этого элемента. Расписание пишет агент элемента — по «Настройкам» или когда вы просите его в терминале или Telegram. Сервер элемента сверяется с часами раз в минуту по местному времени этого компьютера; пока компьютер выключен, копии пропускаются и потом не делаются.",
    examplesTitle: "Например, скажите агенту:",
    examples: ["Каждую ночь в 03:00 копируй всю базу", "По будням в 13:00 копируй только таблицу заказов", "Приостанови ночную копию", "Когда была последняя копия?"],
    empty: "Копирование пока не запланировано. Опишите его в «Настройках» и добавьте в разработку.",
  },
}
const AUTOMATION_CRON: Record<string, CronWords> = {
  en: {
    lead: "When the main agent is woken by the clock and what it is asked to do. The core server checks the schedule once a minute by the local time of this computer; every run is a session of the main agent on your Claude subscription. While the computer is off, runs are skipped and not made up later.",
    examplesTitle: "For example, tell the main agent:",
    examples: ["Every morning at 08:00 check the news on my topic and give the blog agent a post to write if one fits", "On Mondays at 10:00 ask every element for a short report", "Pause the morning news check"],
    empty: "Nothing is automated yet. Describe it in «Settings» and add it to development.",
  },
  ru: {
    lead: "Когда часы будят главного агента и что ему поручено. Сервер ядра сверяется с расписанием раз в минуту по местному времени этого компьютера; каждый запуск — сессия главного агента по вашей подписке Claude. Пока компьютер выключен, запуски пропускаются и потом не делаются.",
    examplesTitle: "Например, скажите главному агенту:",
    examples: ["Каждое утро в 08:00 проверяй новости по моей теме и, если найдётся подходящая, дай агенту блога написать пост", "По понедельникам в 10:00 попроси у каждого элемента короткий отчёт", "Приостанови утреннюю проверку новостей"],
    empty: "Пока ничего не автоматизировано. Опишите это в «Настройках» и добавьте в разработку.",
  },
}
export const backupCronUi = (lang: string, base: CronUi): CronUi => ({ ...base, ...(BACKUP_CRON[lang] ?? BACKUP_CRON.en) })
export const automationCronUi = (lang: string, base: CronUi): CronUi => ({ ...base, ...(AUTOMATION_CRON[lang] ?? AUTOMATION_CRON.en) })

const TOOLS: Record<string, { empty: string }> = {
  en: { empty: "The automations use no outside service yet. When one needs it, the main agent adds it here with the names of its keys." },
  ru: { empty: "Автоматизации пока не пользуются ни одним внешним сервисом. Когда понадобится, главный агент добавит его сюда с именами ключей." },
}
export const automationToolsWords = (lang: string) => TOOLS[lang] ?? TOOLS.en
