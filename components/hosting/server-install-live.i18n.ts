// THE WORDS OF THE SERVER'S LIVE INSTALL (node step 806-4/806-5) — a part of «Активация выделенного сервера», chosen on the server with
// the page's other words (`server-launch.i18n.ts`), one language reaching the browser.

export type LiveWords = {
  running: string
  done: string
  failed: string
  reading: string
  unreadable: string
  checklist: string
  last: string
  quietBusy: string
  quietIdle: string
  quietUnknown: string
  machine: string
  file: string
  sec: string
  min: string
  hour: string
  element: string
  /** 806-2: the disk whole in the server's check — `{copies}` is `copies` or nothing */
  disk: string
  copies: string
  names: Record<string, string>
}

export const LIVE_EN: LiveWords = {
  running: "Installing on the server — its own log, live",
  done: "The installation is finished",
  failed: "The installation stopped",
  reading: "Reading the server's log…",
  unreadable: "The server's log could not be read ({reason}) — asking again in a few seconds.",
  checklist: "The course of the installation",
  last: "last time {t}",
  quietBusy: "The log has been quiet for {t}, the processor is busy at {cpu}% — a long step without output is running.",
  quietIdle: "The log has been quiet for {t} and the processor is almost idle ({cpu}%) — the installation looks stuck.",
  quietUnknown: "The log has been quiet for {t}.",
  machine: "Free memory {mem} MB · free disk {disk} GB · processor busy {cpu}%",
  file: "file {file}",
  sec: "{s} s",
  min: "{m} min {s} s",
  hour: "{h} h {m} min",
  element: "element «{id}»",
  disk: "Disk: {used} of {total} GB used, {free} GB free{copies}",
  copies: " · older copies of the node: {n}{gb} — «Install from zero» erases them",
  names: {
    auth: "sign-in", data: "database", storage: "file storage", vectors: "vector store", embeddings: "search by meaning", config: "configurator",
    graph: "knowledge graph", cache: "cache", memory: "deep memory", stripe: "Stripe payments",
  },
}

export const LIVE_RU: LiveWords = {
  running: "Идёт установка на сервере — его собственный журнал вживую",
  done: "Установка закончена",
  failed: "Установка остановилась",
  reading: "Читаю журнал сервера…",
  unreadable: "Журнал сервера не прочитался ({reason}) — спрошу снова через несколько секунд.",
  checklist: "Ход установки",
  last: "в прошлый раз {t}",
  quietBusy: "Журнал молчит {t}, процессор занят на {cpu}% — идёт долгий шаг без вывода.",
  quietIdle: "Журнал молчит {t}, а процессор почти свободен ({cpu}%) — похоже, установка зависла.",
  quietUnknown: "Журнал молчит {t}.",
  machine: "Свободно памяти {mem} МБ · диска {disk} ГБ · процессор занят на {cpu}%",
  file: "файл {file}",
  sec: "{s} с",
  min: "{m} мин {s} с",
  hour: "{h} ч {m} мин",
  element: "элемент «{id}»",
  disk: "Диск: занято {used} из {total} ГБ, свободно {free} ГБ{copies}",
  copies: " · старые копии узла: {n}{gb} — их сотрёт «Установить с нуля»",
  names: {
    auth: "вход в аккаунт", data: "база данных", storage: "хранилище файлов", vectors: "векторное хранилище", embeddings: "поиск по смыслу",
    config: "конфигуратор", graph: "граф знаний", cache: "кэш", memory: "глубокая память", stripe: "платежи Stripe",
  },
}
