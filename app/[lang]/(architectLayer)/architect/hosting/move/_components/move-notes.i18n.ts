// THE ORDER OF A MOVE (the owner, 2026-11-15, his words improved and the order made safe): the new server is checked on a spare name while
// the main domain still leads here; the main domain moves only after the check; this server stops last. The facts said here were
// checked in the code that day: a server is launched only from a node on the person's computer (the launch form lives there); a launch
// installs a fresh node from the fork; the server's domain ladder takes a subdomain («node.example.com») and «Another domain»; nothing
// carries elements or data from one server to another — that is the clone, a step of its own (748). The page says what moves and what
// stays, and never promises the clone.

export type MoveNotes = { order: string; steps: string[]; link: string; moves: string; what: string[] }

const en: MoveNotes = {
  order: "The order of a move",
  steps: [
    "Take a new server with spare memory and cores. If you have not chosen one yet, {link}.",
    "Launch a node on it from the page «Активация выделенного сервера» of the node on your computer. If that node is gone, install it again from your fork: it is needed only for the launch.",
    "At the launch give the new server a spare name, for example new.your-domain, and check everything there: the sites, the sign-in, the elements. Your main domain keeps leading to this server the whole time.",
    "When everything works, connect the main domain to the new server: its domain ladder shows which records to change and where.",
    "Make sure the new server answers on the main domain, and only then stop this one.",
  ],
  link: "you can choose one here",
  moves: "What moves and what stays",
  what: [
    "The new server gets a fresh node from your fork: the core and the native elements. Its own agent carries the project on there.",
    "This server's elements and data — databases, files, memory, bots and keys — stay on it.",
    "So that your elements' work does not live on this server only, add a GitHub token and give every element its own repository on the page «GitHub».",
  ],
}

const ru: MoveNotes = {
  order: "Порядок переезда",
  steps: [
    "Возьмите новый сервер с запасом памяти и ядер. Если ещё не выбрали, {link}.",
    "Запустите на нём узел со страницы «Активация выделенного сервера» узла на вашем компьютере. Если узла на компьютере уже нет, поставьте его заново из вашего форка: он нужен только для запуска.",
    "При запуске дайте новому серверу запасное имя, например new.ваш-домен, и проверьте на нём всё: сайты, вход, элементы. Основной домен всё это время ведёт на этот сервер.",
    "Когда всё работает, подключите основной домен к новому серверу: его лестница домена покажет, какие записи изменить и где.",
    "Убедитесь, что новый сервер отвечает по основному домену, и только после этого остановите этот.",
  ],
  link: "можно подобрать здесь",
  moves: "Что переезжает, а что остаётся",
  what: [
    "Новый сервер получает свежий узел из вашего форка: ядро и нативные элементы. Дальше проект ведёт его собственный агент.",
    "Элементы и данные этого сервера — базы, файлы, память, боты и ключи — остаются на нём.",
    "Чтобы работа ваших элементов не жила только на этом сервере, добавьте токен GitHub и создайте каждому элементу свой репозиторий на странице «GitHub».",
  ],
}

export function moveNotes(lang: string): MoveNotes {
  return lang === "ru" ? ru : en
}
