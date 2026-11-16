// «УПРАВЛЕНИЕ БРАУЗЕРОМ ЧЕРЕЗ TELEGRAM» — the closed section on the main agent's page «Telegram-бот» (node step 767-6). The owner,
// 2026-11-16: «На вкладке настройках в Telegram бот сделай отдельный раздел управления браузером через Telegram. Показывай его как
// … аккордеон закрытым при раскрытии опиши как именно происходит управление браузером через Telegram что для этого нужно и что
// пользователь может из этого извлечь». Every sentence was measured with him on 2026-11-16 (17:30–17:55): AppleScript brings
// a tab of any Chrome profile forward after one OK in macOS's Automation window; acting inside a page is the Claude extension.

type Part = { title: string; items: string[] }
export type BrowserNotes = { summary: string; how: Part; need: Part; gain: Part }

const en: BrowserNotes = {
  summary: "Controlling the browser through Telegram",
  how: {
    title: "How it works",
    items: [
      "You write to this bot in plain words: «show my mail», «find the news about the Starship flight and show it», «open the link about electric bikes I asked you to remember».",
      "The main agent first decides whose request it is. If it belongs to the field of one of your elements (your social networks, say), that element's agent gets it. A remembered link is found in the deep memory. A general request the main agent does itself, with what you told it about yourself.",
      "The tab opens in Chrome on this computer and comes onto your screen — in any Chrome profile, even outside the agent's group of tabs.",
      "A step only you can take — a sign-in, a password, a code, the last «Publish» or «Pay» — comes as an action window in the panel and in this chat: a link to the place and a «Done» button.",
    ],
  },
  need: {
    title: "What it needs",
    items: [
      "A computer with macOS and Google Chrome, with the node running. Windows and Linux are not checked yet.",
      "One OK when macOS asks whether the node's app may control Google Chrome. You can take it back in System Settings → Privacy & Security → Automation.",
      "For the agent to work inside pages — read, click, fill in — and not only show them, the Claude extension must be connected in that Chrome profile. Showing pages works without it.",
    ],
  },
  gain: {
    title: "What you get",
    items: [
      "From your phone, put the page you need on the computer's screen — mail, an account, a draft, a news story — without hunting through dozens of tabs.",
      "The agent prepares the work in the browser: pastes the text of a post, fills in a form, adds records. One press is left for you.",
      "Links and preferences from the deep memory are found by meaning, not by an exact name.",
      "Passwords, codes and the final presses always stay yours. The agent never sends the full addresses of your tabs to the chat.",
    ],
  },
}

const ru: BrowserNotes = {
  summary: "Управление браузером через Telegram",
  how: {
    title: "Как это работает",
    items: [
      "Вы пишете этому боту обычными словами: «покажи мою почту», «найди новости о полёте Starship и покажи», «открой ссылку про электровелосипеды, которую я просил запомнить».",
      "Главный агент сначала решает, чья это просьба. Если она из поля одного из ваших элементов, например соцсетей, её получает агент этого элемента. Запомненную ссылку он находит в глубокой памяти. Общую просьбу выполняет сам и учитывает то, что вы о себе рассказали.",
      "Нужная вкладка открывается в Chrome на этом компьютере и выходит вам на экран — в любом профиле Chrome, даже вне группы вкладок агента.",
      "Шаг, который можете сделать только вы, — вход, пароль, код, последнее «Опубликовать» или «Оплатить» — приходит окном действия в пульт и в этот чат: ссылка на место и кнопка «Готово».",
    ],
  },
  need: {
    title: "Что для этого нужно",
    items: [
      "Компьютер с macOS и Google Chrome, узел включён. На Windows и Linux это пока не проверено.",
      "Один раз нажать OK, когда macOS спросит, может ли приложение узла управлять Google Chrome. Отозвать доступ можно в «Системных настройках» → «Конфиденциальность и безопасность» → «Автоматизация».",
      "Чтобы агент не только показывал страницы, но и работал в них — читал, нажимал, заполнял, — в этом профиле Chrome должно быть подключено расширение Claude. Показывать страницы можно и без него.",
    ],
  },
  gain: {
    title: "Что это даёт",
    items: [
      "С телефона вывести на экран компьютера нужную страницу — почту, кабинет, черновик, новость — не ища её среди десятков вкладок.",
      "Агент готовит работу в браузере: вставляет текст поста, заполняет форму, вносит записи. Вам остаётся одно нажатие.",
      "Ссылки и предпочтения из глубокой памяти находятся по смыслу, а не по точному названию.",
      "Пароли, коды и последние нажатия всегда остаются за вами. Полные адреса ваших вкладок агент в чат не пересылает.",
    ],
  },
}

export function browserNotes(lang: string): BrowserNotes {
  return lang.startsWith("ru") ? ru : en
}
