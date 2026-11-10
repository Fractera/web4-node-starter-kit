// СЛОВА ПУЛЬТА ЯДРА К НАСТРОЙКАМ ЭЛЕМЕНТА (узел, шаг 712): вкладки «Строительство → Дизайн» и «Строительство → Настройки сайта».
// Владелец 2026-11-09: «для CONFIG и для дизайна мы должны избавиться от внешних страниц которые уводят нас из вкладки работы с элементом».
const EN = {
  state: {
    loading: "Asking the element…",
    "template-older": "This element was born from an older template: its remote control appears after the template update (the «Update» button of the element).",
    "not-answering": "The element does not answer: it is off or restarting. Turn it on and open the tab again.",
    "no-element": "The node has no running element with this name.",
    "no-settings-key": "The node has no settings key — the installer did not finish; run the node update.",
    "bad-key": "The element refused the node's key — its settings key differs from the core's; reinstall the element.",
    "core-not-answering": "The core did not answer. Open the tab again.",
    "config-connected": "The element takes the node's CONFIG — these values are shared and are changed in CONFIG.",
    other: "The element answered with an error:",
  },
  saved: "Saved — the element's pages show it without a build.",
  failed: "Not saved:",
  // Design tab
  fineTitle: "Fine tuning",
  fineLead: "Hand edits of the approved design: colours, fonts, text, shapes and spacing. Approving another design replaces them.",
  fineTabs: { colors: "Colours", fonts: "Fonts", type: "Text", shape: "Shapes and spacing" },
  brief: {
    title: "Brief",
    lead: "Optional. Tell the agent who the site is for and how it should feel — it takes this into every test page. You can skip it and come back later.",
    inherited: "Taken from element",
    audience: "Who it is for", audienceHint: "The people who will open the site, and what they come for.",
    character: "Character", characterHint: "Up to five words, separated by commas: calm, strict, warm…",
    references: "References", referencesHint: "Sites whose spirit you like, with a word on what exactly.", link: "Link (https://…)", note: "What you like in it", media: "A screenshot kept in the element's storage — stays as it is.", mediaShort: "screenshot", addReference: "Add a reference", remove: "Remove",
    avoid: "What to avoid", avoidHint: "What you do not want to see: a template look, gradients, too much text…",
    skill: "Design skill", noSkill: "Not chosen yet — the design you approve on «Generate and compare» sets it.", pinnedFrom: "approved from the test page",
    save: "Save the brief", saving: "Saving…",
  },
  // Site settings tab — 713-3: a list of sections and the one chosen section with its title, lead and save.
  siteNav: "Sections of the site settings",
  siteTabs: { basics: "Basics", seo: "Search", metaMedia: "Meta and media", languages: "Languages", header: "Header", footer: "Footer", cookies: "Cookie banner", features: "Switches", web4: "Web4 network", linked: "From CONFIG" },
  siteLeads: {
    basics: "The project's name and description, the author, the currency and the organisation's address — what visitors and search engines see.",
    seo: "How pages look in search and when shared: the title template, link previews, the markup for search engines and analytics.",
    metaMedia: "The app on a phone and the social accounts of the site.",
    languages: "The site's languages and its default one.",
    header: "The items of the site's top menu.",
    footer: "The items of the site's footer.",
    cookies: "The cookie consent banner for visitors.",
    features: "What the site has: the menus, sign-in, breadcrumbs, questions and answers, the theme, width and language switches.",
    web4: "Choose with the star. Web4 is the network of agents: other nodes' agents find this element and send it orders through Lagrix.",
    linked: "While the link is on, these values come from the node's shared CONFIG and are changed there.",
  },
  imagesNote: "Images (logo, sharing picture, page pictures) are uploaded into the element's own storage — the core's remote control does not carry them yet.",
}

export type ElementRemoteWords = typeof EN

const RU: ElementRemoteWords = {
  state: {
    loading: "Спрашиваю элемент…",
    "template-older": "Этот элемент родился из шаблона старше: его пульт появится после обновления шаблона (кнопка элемента «Обновить»).",
    "not-answering": "Элемент не отвечает: он выключен или перезапускается. Включите его и откройте вкладку снова.",
    "no-element": "На узле нет запущенного элемента с таким именем.",
    "no-settings-key": "У узла нет ключа настроек — установка не завершилась; запустите обновление узла.",
    "bad-key": "Элемент не принял ключ узла — его ключ настроек не совпадает с ключом ядра; переустановите элемент.",
    "core-not-answering": "Ядро не ответило. Откройте вкладку снова.",
    "config-connected": "Элемент берёт CONFIG узла — эти значения общие и правятся в CONFIG.",
    other: "Элемент ответил ошибкой:",
  },
  saved: "Сохранено — страницы элемента покажут это без сборки.",
  failed: "Не сохранено:",
  fineTitle: "Тонкая настройка",
  fineLead: "Ручная правка утверждённого дизайна: цвета, шрифты, текст, формы и отступы. Утверждение другого дизайна заменит эти правки.",
  fineTabs: { colors: "Цвета", fonts: "Шрифты", type: "Текст", shape: "Формы и отступы" },
  brief: {
    title: "Бриф",
    lead: "Необязательный шаг. Расскажите агенту, для кого сайт и каким он должен ощущаться, — он учтёт это в каждой тестовой странице. Можно пропустить и вернуться позже.",
    inherited: "Взят у элемента",
    audience: "Для кого", audienceHint: "Люди, которые откроют сайт, и за чем они приходят.",
    character: "Характер", characterHint: "До пяти слов через запятую: спокойный, строгий, тёплый…",
    references: "Референсы", referencesHint: "Сайты, дух которых нравится, и слово о том, что именно.", link: "Ссылка (https://…)", note: "Что в нём нравится", media: "Скриншот в хранилище элемента — остаётся как есть.", mediaShort: "скриншот", addReference: "Добавить референс", remove: "Убрать",
    avoid: "Чего избегать", avoidHint: "Чего вы не хотите видеть: шаблонный вид, градиенты, много текста…",
    skill: "Навык дизайна", noSkill: "Пока не выбран — его задаёт дизайн, который вы утвердите на шаге «Сгенерировать и сравнить».", pinnedFrom: "утверждён из тестовой страницы",
    save: "Сохранить бриф", saving: "Сохраняю…",
  },
  siteNav: "Разделы настроек сайта",
  siteTabs: { basics: "Основное", seo: "Поиск", metaMedia: "Мета и медиа", languages: "Языки", header: "Шапка", footer: "Подвал", cookies: "Баннер cookie", features: "Выключатели", web4: "Сеть Web4", linked: "Из CONFIG" },
  siteLeads: {
    basics: "Имя и описание проекта, автор, валюта и адрес организации — то, что видят посетители и поисковики.",
    seo: "Как страницы выглядят в поиске и при пересылке: шаблон заголовка, превью ссылок, разметка для поисковиков и аналитика.",
    metaMedia: "Приложение на телефоне и аккаунты сайта в соцсетях.",
    languages: "Языки сайта и язык по умолчанию.",
    header: "Пункты верхнего меню сайта.",
    footer: "Пункты подвала сайта.",
    cookies: "Баннер согласия на cookie для посетителей.",
    features: "Что есть на сайте: меню, вход, хлебные крошки, вопросы и ответы, переключатели темы, ширины и языка.",
    web4: "Выберите звёздочкой. Web4 — сеть агентов: агенты других узлов находят этот элемент и присылают ему заказы через Lagrix.",
    linked: "Пока связь включена, эти значения приходят из общего CONFIG узла и правятся там.",
  },
  imagesNote: "Картинки (логотип, картинка для соцсетей, картинки страниц) загружаются в собственное хранилище элемента — пульт ядра их пока не переносит.",
}

export function elementRemoteWords(lang: string): ElementRemoteWords {
  return lang === "ru" ? RU : EN
}
