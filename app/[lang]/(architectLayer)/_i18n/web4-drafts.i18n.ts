// СЛОВА ЧЕРНОВИКОВ ЭЛЕМЕНТОВ (314-1): кнопка «Создать микросервис», карточки главной группы, окно удаления.
// `en` основа, `ru` перевод; слой архитектора двуязычен.

export type Web4DraftsUi = {
  create: string
  /** 327: подписи зон левого меню. */
  zoneNative: string
  zoneCustom: string
  /** 560-2: группа встроенных элементов памяти. */
  memoryGroup: string
  creating: string
  createFailed: string
  draftBadge: string
  sectionPages: string
  /** 528-1: подпись свёрнутого описания раздела или страницы элемента. */
  aboutSummary: string
  /** 528-1: «A2A: ваши заказы → Сделки» — честная строка, пока источника заказов элемента нет. */
  ordersEmpty: string
  portTitle: string
  portLine: string
  addressTitle: string
  addressLine: string
  note: string
  delete: string
  deleteTitle: string
  deleteText: string
  deleteLabel: string
  deleteConfirm: string
  deleting: string
  deleteMismatch: string
  deleteFailed: string
  cancel: string
  elementBadge: string
  portLineBorn: string
  noteBorn: string
  birth: string
  birthTitle: string
  birthText: string
  birthConfirm: string
  /** 367: облик рождённого элемента — вопрос в окне рождения. */
  lookQuestion: string
  lookProject: string
  lookProjectText: string
  lookOwn: string
  lookOwnText: string
  lookPick: string
  /** 553: подсказка под вопросом облика на заводе приложений. */
  lookFactoryHint: string
  /** 367-3: «Самостоятельный» раскрывается — откуда взять код. */
  sourceStarter: string
  sourceStarterText: string
  sourceRepo: string
  sourceRepoText: string
  repoPlaceholder: string
  repoWarning: string
  repoBad: string
  sourcePick: string
  birthStarting: string
  birthRunning: string
  birthDone: string
  birthFailed: string
  birthInterrupted: string
  birthRepeat: string
  birthRetry: string
  /** 338: вводный текст под заголовком черновика — виден только до нажатия «Родить WEB4 элемент»; абзацы через \n\n. */
  draftIntro: string
  /** 582: кнопка в зоне нативных, вводный текст черновика нативного элемента, текст окна его рождения, зона «Основное». */
  createNative: string
  nativeDraftIntro: string
  nativeBirthText: string
  zoneMain: string
}

const DICT: Record<string, Web4DraftsUi> = {
  en: {
    create: "Create a WEB4 ITEM",
    creating: "Creating…",
    createFailed: "The WEB4 ITEM was not created: the node could not write the draft.",
    zoneNative: "Native elements",
    zoneCustom: "Custom elements",
    zoneMain: "Main",
    createNative: "Create a native element",
    nativeDraftIntro: "A native element is a service that any custom element of this node can use. Sign-in, memory, data, design and blocks are already installed. Here you can create a shared service of your own, such as a content factory or email marketing, and every element will be able to use it.\n\nA native element is born from the Fractera native template. It is not sold and is not shown to the network: it works only inside this node.",
    nativeBirthText: "The node downloads the native element template, gives this draft its own copy, a port, a build and a process. It takes about three minutes and a lot of memory; the page may be closed — the birth goes on.",
    memoryGroup: "Memory",
    draftBadge: "Draft",
    sectionPages: "Pages of this section",
    aboutSummary: "More about this",
    ordersEmpty: "No orders yet. Work this element orders from other agents will appear here once it starts placing orders over A2A.",
    portTitle: "Port on this machine",
    portLine: "No port assigned yet: the draft has no process of its own.",
    addressTitle: "Address on the internet",
    addressLine: "The subdomain has not been created yet.",
    note: "This is the name the microservice will live under. The port and the subdomain are assigned in a later step.",
    delete: "Delete",
    deleteTitle: "Delete this WEB4 Item?",
    deleteText: "Its group of pages disappears from the architect layer. Type its address to confirm:",
    deleteLabel: "Address",
    deleteConfirm: "Delete for good",
    deleting: "Deleting…",
    deleteMismatch: "The address does not match — nothing was deleted.",
    deleteFailed: "Nothing was deleted: the node refused.",
    cancel: "Cancel",
    elementBadge: "Element",
    portLineBorn: "The element's own process answers on this port.",
    noteBorn: "The element is born from the item template and lives as its own project. Its subdomain is connected with «Address on the internet».",
    birth: "Give birth to the WEB4 element",
    birthTitle: "Give birth to this WEB4 element?",
    birthText: "The node downloads the item template, gives this draft its own copy, a port, a build and a process. It takes about three minutes and a lot of memory; the page may be closed — the birth goes on.",
    birthConfirm: "Give birth",
    lookQuestion: "How should the element look and be set up?",
    lookProject: "Like the whole project",
    lookProjectText: "Takes the project's design and CONFIG settings now and follows their changes: colours, menu, languages. You can detach it from the platform at any moment.",
    lookOwn: "An independent project",
    lookOwnText: "Keeps the starter's own design and settings and does not follow the project; you change them on its own pages.",
    lookPick: "Choose how the element is born.",
    lookFactoryHint: "This node is an app factory: a new element is born on its own settings — its own header, footer and policy pages.",
    sourceStarter: "Fractera starter template",
    sourceStarterText: "Our Next.js starter with its own design and settings.",
    sourceRepo: "From my repository",
    sourceRepoText: "Next.js, any Node project that builds and starts on a port, or a static site (Vite React, Gatsby, Astro). Anything else is refused with the reason.",
    repoPlaceholder: "https://github.com/owner/project",
    repoWarning: "Installing runs this repository's code on this computer with your rights (dependency scripts, build). Use only repositories you trust.",
    repoBad: "Enter an https address of a public Git repository: https://host/owner/name.",
    sourcePick: "Choose where the code comes from.",
    birthStarting: "Starting…",
    birthRunning: "The element is being born:",
    birthDone: "The element is born.",
    birthFailed: "The birth stopped:",
    birthInterrupted: "The birth process ended without a result (the node restarted or ran out of memory).",
    birthRepeat: "The element is already written into the node, its installation did not finish. To repeat it run in the node folder: npm run services:install -- --only",
    birthRetry: "The draft is intact and nothing was written into the node — press «Give birth to the WEB4 element» to try again.",
    draftIntro: "Your project gets its own disk space with a separate server of its own. It receives an automatic address right away, and you can connect your own domain later and turn it into a full-fledged project. It can become your website, an application, an agent automation project or a tool for your own productivity — you decide.\n\nIt is built on Next 16. Sign-in, the database and all the other services are connected automatically, and you can switch off any of them at any moment if you don't need it. A complete web3 infrastructure is created for the project, so you can sell this solution and receive orders automatically.\n\nHappy creating!",
  },
  ru: {
    create: "Создать WEB4 ITEM",
    creating: "Создаю…",
    createFailed: "WEB4 ITEM не создан: узел не смог записать черновик.",
    zoneNative: "Нативные элементы",
    zoneCustom: "Кастомные элементы",
    zoneMain: "Основное",
    createNative: "Создать нативный элемент",
    nativeDraftIntro: "Нативный элемент — служба, которой пользуется любой кастомный элемент узла. Авторизация, память, данные, дизайн и блоки уже установлены. Здесь вы можете создать свою общую службу, например контент-завод или email-маркетинг, и её смогут использовать все элементы.\n\nНативный элемент рождается из нативного шаблона Fractera. Его не продают и не показывают сети: он работает только внутри этого узла.",
    nativeBirthText: "Узел скачает шаблон нативного элемента и даст черновику свою копию, порт, сборку и процесс. Это около трёх минут и много памяти; страницу можно закрыть — рождение продолжится.",
    memoryGroup: "Память",
    draftBadge: "Черновик",
    sectionPages: "Страницы раздела",
    aboutSummary: "Подробнее",
    ordersEmpty: "Заказов пока нет. Работа, которую элемент закажет у других агентов, появится здесь, когда он начнёт заказывать по A2A.",
    portTitle: "Порт на этой машине",
    portLine: "Порт ещё не назначен: у черновика нет своего процесса.",
    addressTitle: "Адрес в интернете",
    addressLine: "Поддомен ещё не создан.",
    note: "Под этим именем будет жить микросервис. Порт и поддомен назначаются следующим шагом.",
    delete: "Удалить",
    deleteTitle: "Удалить этот WEB4 Item?",
    deleteText: "Его группа страниц исчезнет из слоя архитектора. Для подтверждения введите его адрес:",
    deleteLabel: "Адрес",
    deleteConfirm: "Удалить навсегда",
    deleting: "Удаляю…",
    deleteMismatch: "Адрес не совпал — ничего не удалено.",
    deleteFailed: "Ничего не удалено: узел отказал.",
    cancel: "Отмена",
    elementBadge: "Элемент",
    portLineBorn: "На этом порту отвечает собственный процесс элемента.",
    noteBorn: "Элемент рождён из шаблона и живёт самостоятельным проектом. Поддомен подключается кнопкой «Адрес в интернете».",
    birth: "Родить WEB4 элемент",
    birthTitle: "Родить этот WEB4 элемент?",
    birthText: "Узел скачает шаблон элемента и даст черновику свою копию, порт, сборку и процесс. Это около трёх минут и много памяти; страницу можно закрыть — рождение продолжится.",
    birthConfirm: "Родить",
    lookQuestion: "Каким будет элемент — по облику и настройкам?",
    lookProject: "Как весь проект",
    lookProjectText: "Сразу берёт дизайн и настройки CONFIG проекта и дальше меняется вместе с ними: цвета, меню, языки. Отвязать от платформы можно в любой момент.",
    lookOwn: "Самостоятельный проект",
    lookOwnText: "Остаётся со своим дизайном и настройками стартера и не следует за проектом; меняете их на его собственных страницах.",
    lookPick: "Выберите, каким родится элемент.",
    lookFactoryHint: "Узел — завод приложений: новый элемент рождается со своими настройками — своя шапка, подвал и страницы политик.",
    sourceStarter: "Стартовый шаблон Fractera",
    sourceStarterText: "Наш стартер на Next.js со своим дизайном и настройками.",
    sourceRepo: "Из своего репозитория",
    sourceRepoText: "Next.js, любой Node-проект со сборкой и запуском на порту или статический сайт (Vite React, Gatsby, Astro). Остальное — отказ с причиной.",
    repoPlaceholder: "https://github.com/владелец/проект",
    repoWarning: "Установка запускает код этого репозитория на этом компьютере с вашими правами (скрипты зависимостей, сборка). Используйте только репозитории, которым доверяете.",
    repoBad: "Введите https-адрес публичного Git-репозитория: https://хост/владелец/имя.",
    sourcePick: "Выберите, откуда взять код.",
    birthStarting: "Запускаю…",
    birthRunning: "Элемент рождается:",
    birthDone: "Элемент родился.",
    birthFailed: "Рождение остановилось:",
    birthInterrupted: "Процесс рождения закончился без результата (узел перезапускался или не хватило памяти).",
    birthRepeat: "Элемент уже записан в узел, но его установка не закончилась. Повторить её можно в папке узла: npm run services:install -- --only",
    birthRetry: "Черновик цел, в узел ничего не записано — нажмите «Родить WEB4 элемент», чтобы попробовать снова.",
    draftIntro: "Для проекта будет выделено своё дисковое пространство, и на нём разместится отдельный сервер вашего проекта. Он сразу получит автоматический адрес, а позже вы сможете привязать собственный домен и превратить его в полноценный проект. Это может стать вашим сайтом, приложением, проектом агентной автоматизации или инструментом для вашей личной эффективности — решать вам.\n\nВ основе — фреймворк Next 16. Авторизация, база данных и все остальные службы подключаются автоматически, и любую из них можно отключить в любой момент, если она вам не нужна. Для проекта будет создана полная web3-инфраструктура, чтобы вы могли продавать это решение и получать заказы автоматически.\n\nУдачного творчества!",
  },
}

export function web4DraftsUi(lang: string): Web4DraftsUi {
  return DICT[lang] ?? DICT.en
}
