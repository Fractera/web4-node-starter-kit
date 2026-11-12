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
    "A tool solves a task and shows its own interface for it: crop a picture, enter text by voice, open a window over the page. It does not know which page it stands on — its material comes from outside, its result goes back out — so any page of any element can use it. It lives in `_tools/<name>/` with a card: the task, how it is used, what it is made of.",
    "Tools nest: an image-editing form is a window holding a crop, a voice input and a call to an image technology, and the form is a tool too, kept as a recipe of its parts. A section is how a page's content looks (a hero, prices, questions); a widget is code of one page address that reads its data and holds tools. A task with its own interface is a tool even when only one place needs it today — the agent decides this when the code is born.",
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
    "Инструмент — то, что решает задачу и показывает для этого свой интерфейс: обрезать картинку, ввести текст голосом, открыть окно поверх страницы. Он не знает, на какой странице стоит — материал получает снаружи и результат отдаёт наружу, — поэтому им может пользоваться любая страница любого элемента. Он живёт в `_tools/<имя>/` с карточкой: задача, как им пользоваться, из чего он состоит.",
    "Инструменты вкладываются друг в друга: форма правки изображения — это окно, внутри которого обрезка, голосовой ввод и вызов работы с изображениями, и сама форма — тоже инструмент, который хранится как рецепт из своих частей. Секция — то, как выглядит содержание страницы (герой, цены, вопросы); виджет — код одного адреса страницы, который читает её данные и собирает инструменты. Задача со своим интерфейсом — это инструмент, даже если сегодня она нужна в одном месте: агент решает это в момент, когда код рождается.",
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
