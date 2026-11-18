// THE WORDS OF THE «APP MODE» CARD (node step 782-1). The server picks the language and hands them to the island as props; a client file
// imports only the type — the dictionary never travels to the browser whole.
// The owner's words, 2026-11-18 (Telegram 565): «один пользователь: настройки распространяются на все созданные элементы и домены. До 980
// доменов работают на цели одного супер пользователя – много пользователей: один супер пользователь создает до 980 доменов для других
// пользователей. Один пользователь может иметь один или несколько доменов».

export type AppModeWords = {
  title: string
  project: string
  factory: string
  projectText: string
  factoryText: string
  configurator: string
  failed: string
  readOnly: string
  confirmTitle: { project: string; factory: string }
  confirmLead: string
  confirmLeadEmpty: string
  back: string
  nowTitle: string
  now: { project: string[]; factory: string[] }
  keepTitle: string
  linked: string
  own: string
  how: string
  cancel: string
  switch: string
}

const EN: AppModeWords = {
  title: "App mode",
  project: "One user",
  factory: "Many users",
  projectText: "Settings apply to every element and domain you create. Up to 980 domains work toward the goals of one super user.",
  factoryText: "One super user creates up to 980 domains for other users. One user may own one domain or several.",
  configurator: "Open the configurator",
  failed: "The mode was not switched: the node did not answer. Try again in a minute.",
  readOnly: "The mode is switched only after sign-in as the architect or an administrator.",
  confirmTitle: { project: "Switch to «One user»?", factory: "Switch to «Many users»?" },
  confirmLead: "The node already has elements. The mode changes what comes next — the elements created earlier stay as they are.",
  confirmLeadEmpty: "There are no elements of your own on the node yet, so nothing created earlier is affected.",
  back: "The mode comes back here, with the same button, at any moment.",
  nowTitle: "What changes now",
  now: {
    project: [
      "New elements are born under the configurator: one header, footer and set of switches for all.",
      "The node keeps one wallet; the own wallets of earlier elements are named to you, their keys are never erased.",
      "The «Messenger» section is hidden in every element's menu.",
      "Elements may take each other's tools.",
    ],
    factory: [
      "New elements are born with their own settings, outside the configurator.",
      "Every element may have its own wallet.",
      "The «Messenger» section appears in every element's menu.",
      "Tools are taken from the core only, never from a neighbour.",
    ],
  },
  keepTitle: "Elements created earlier keep their state",
  linked: "under the configurator",
  own: "own settings",
  how: "Each of them is switched on its own page: «Build → Site settings». The mode itself comes back here, with the same button.",
  cancel: "Cancel",
  switch: "Switch",
}

const RU: AppModeWords = {
  title: "Режим работы приложения",
  project: "Один пользователь",
  factory: "Много пользователей",
  projectText: "Настройки распространяются на все созданные элементы и домены. До 980 доменов работают на цели одного суперпользователя.",
  factoryText: "Один суперпользователь создаёт до 980 доменов для других пользователей. У одного пользователя может быть один домен или несколько.",
  configurator: "Открыть конфигуратор",
  failed: "Режим не переключился: узел не ответил. Попробуйте через минуту.",
  readOnly: "Режим переключается только после входа архитектором или администратором.",
  confirmTitle: { project: "Переключить на «Один пользователь»?", factory: "Переключить на «Много пользователей»?" },
  confirmLead: "На узле уже есть элементы. Режим меняет то, что будет дальше, — созданные раньше элементы останутся как есть.",
  confirmLeadEmpty: "Своих элементов на узле пока нет — созданного раньше переключение не касается.",
  back: "Режим возвращается здесь же, той же кнопкой, в любой момент.",
  nowTitle: "Что изменится сейчас",
  now: {
    project: [
      "Новые элементы рождаются под конфигуратором: одна шапка, один подвал и одни переключатели на всех.",
      "У узла один кошелёк; собственные кошельки прежних элементов будут названы вам, их ключи не стираются никогда.",
      "Раздел «Мессенджер» скрывается в меню каждого элемента.",
      "Элементы могут брать инструменты друг у друга.",
    ],
    factory: [
      "Новые элементы рождаются со своими настройками, вне конфигуратора.",
      "У каждого элемента может быть свой кошелёк.",
      "Раздел «Мессенджер» появляется в меню каждого элемента.",
      "Инструменты берутся только у ядра, не у соседа.",
    ],
  },
  keepTitle: "Созданные раньше элементы сохранят своё состояние",
  linked: "под конфигуратором",
  own: "свои настройки",
  how: "Каждый из них переключается на своей странице: «Сборка → Настройки сайта». Сам режим возвращается здесь же, той же кнопкой.",
  cancel: "Отмена",
  switch: "Переключить",
}

export function appModeUi(lang: string): AppModeWords {
  return lang === "ru" ? RU : EN
}
