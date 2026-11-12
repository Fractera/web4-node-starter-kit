// THE WORDS OF THE «TOOLS» TAB (node step 725-8). The server picks the language and hands them to the island as props; a client file
// imports only the type — the dictionary never travels to the browser whole.

export type ToolsTabWords = {
  aboutTitle: string
  about: string[]
  loading: string
  unavailable: string
  empty: string
  shown: string
  more: string
  usedBy: string
  usedNowhere: string
  full: string
  how: string
  value: string
  searchWords: string
  needs: string
  needNames: Record<string, string>
  show: string
  edit: string
  demoTitle: string
  demoLive: string
  demoNeeds: string
  demoNone: string
  add: string
  addTitle: string
  addHint: string
  addPlaceholder: string
  run: string
  cancel: string
  oneTerminal: string
  drawerTitle: string
  drawerHint: string
  collapse: string
}

const EN: ToolsTabWords = {
  aboutTitle: "What tools are",
  about: [
    "A tool is a ready working piece with its own logic — a voice input, a chat, image cropping, a code view, a terminal drawer. It lives in `_tools/<name>/` with a card that says what it solves, how it is used and what it needs, and any page or element of the node can take it.",
    "A section is a designed part of a page (a hero, a price list, questions) — it is how a page looks. A widget is code that belongs to one route only, when a section is not enough. A tool is neither: it carries behaviour that several places need.",
    "Before building anything, the agent asks the parts map (parts_find): a ready tool is taken as it is, never built a second time. A new one is born here — say what it must do, and the agent builds it with its card.",
  ],
  loading: "Asking the node for the tools…",
  unavailable: "The node did not answer, so the tools are not shown.",
  empty: "No tools here yet.",
  shown: "Shown {n} of {total}",
  more: "Show more",
  usedBy: "Where it is used",
  usedNowhere: "Not used here yet — ready for the first page that needs it.",
  full: "Full description",
  how: "How it works",
  value: "Why it exists",
  searchWords: "Found by the words",
  needs: "Needs",
  needNames: { browser: "a browser", https: "a secure address (https)", "openai-key": "the OpenAI key", ffmpeg: "ffmpeg on this computer" },
  show: "Show",
  edit: "Edit",
  demoTitle: "{title} — a look",
  demoLive: "A live look with sample data: nothing is saved and nothing is sent.",
  demoNeeds: "It cannot run here in full: it needs {needs}. This is what it does:",
  demoNone: "This tool has no look of its own here. This is what it does:",
  add: "Add a tool",
  addTitle: "What the new tool must do",
  addHint: "Say it or write it: what it does, where it will be used, what it needs.",
  addPlaceholder: "For example: a field that turns a pasted address into a map pin…",
  run: "Start the development",
  cancel: "Cancel",
  oneTerminal: "One terminal works on this screen: collapse the open one first — one tool is created or edited at a time.",
  drawerTitle: "The agent's terminal",
  drawerHint: "The task is already in it. The agent builds the tool with its card; collapse the drawer at any time — the session keeps running.",
  collapse: "Collapse",
}

const RU: ToolsTabWords = {
  aboutTitle: "Что такое инструменты",
  about: [
    "Инструмент — готовая рабочая часть со своей логикой: голосовой ввод, чат, обрезка картинки, просмотр кода, ящик терминала. Он живёт в `_tools/<имя>/` с карточкой: какую задачу решает, как им пользоваться и что ему нужно; его может взять любая страница или любой элемент узла.",
    "Секция — оформленная часть страницы (герой, прайс, вопросы): это то, как страница выглядит. Виджет — код, который принадлежит только одному маршруту, когда секции мало. Инструмент — ни то ни другое: он несёт поведение, которое нужно нескольким местам.",
    "Прежде чем что-то строить, агент спрашивает карту частей (parts_find): готовый инструмент берётся как есть и никогда не строится второй раз. Новый рождается здесь — скажите, что он должен уметь, и агент построит его вместе с карточкой.",
  ],
  loading: "Спрашиваю узел об инструментах…",
  unavailable: "Узел не ответил, поэтому инструменты не показаны.",
  empty: "Инструментов здесь пока нет.",
  shown: "Показано {n} из {total}",
  more: "Показать ещё",
  usedBy: "Где используется",
  usedNowhere: "Здесь пока не используется — готов для первой страницы, которой понадобится.",
  full: "Полное описание",
  how: "Как он устроен",
  value: "Зачем он нужен",
  searchWords: "Находится по словам",
  needs: "Нужно",
  needNames: { browser: "браузер", https: "защищённый адрес (https)", "openai-key": "ключ OpenAI", ffmpeg: "ffmpeg на этом компьютере" },
  show: "Показать",
  edit: "Редактировать",
  demoTitle: "{title} — как он выглядит",
  demoLive: "Живой показ на примере: ничего не сохраняется и никуда не уходит.",
  demoNeeds: "Здесь его не показать целиком: ему нужно {needs}. Вот что он умеет:",
  demoNone: "У этого инструмента здесь нет своего вида. Вот что он умеет:",
  add: "Добавить инструмент",
  addTitle: "Что должен уметь новый инструмент",
  addHint: "Скажите голосом или напишите: что он делает, где пригодится, что ему нужно.",
  addPlaceholder: "Например: поле, которое превращает вставленный адрес в точку на карте…",
  run: "Запустить в разработку",
  cancel: "Отмена",
  oneTerminal: "На экране работает один терминал: сначала сверните открытый — за раз создаётся или правится один инструмент.",
  drawerTitle: "Терминал агента",
  drawerHint: "Задача уже внутри. Агент построит инструмент вместе с карточкой; ящик можно свернуть в любой момент — сессия продолжится.",
  collapse: "Свернуть",
}

export function toolsTabUi(lang: string): ToolsTabWords {
  return lang === "ru" ? RU : EN
}
