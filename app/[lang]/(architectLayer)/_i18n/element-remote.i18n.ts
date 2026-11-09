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
  linked: "Linked to the node's CONFIG: the values below come from the shared settings of the node and are changed in CONFIG. To keep its own — turn the link off in the first line.",
  saved: "Saved — the element's pages show it without a build.",
  failed: "Not saved:",
  // Design tab
  fineTitle: "Fine tuning",
  fineLead: "Hand edits on top of the chosen design skill. Pinning a prototype replaces colours, fonts and shapes with its own; your later edits here stay until the next pin.",
  fineTabs: { colors: "Colours", fonts: "Fonts", type: "Text", shape: "Shapes and spacing" },
  brief: {
    title: "Brief",
    lead: "Before fonts and colours: who the site is for and what it should feel like. The element's agent reads this first and designs the pages from it.",
    inherited: "Taken from element",
    audience: "Who it is for", audienceHint: "The people who will open the site, and what they come for.",
    character: "Character", characterHint: "Up to five words, separated by commas: calm, strict, warm…",
    references: "References", referencesHint: "Sites whose spirit you like, with a word on what exactly.", link: "Link (https://…)", note: "What you like in it", media: "A screenshot kept in the element's storage — stays as it is.", addReference: "Add a reference", remove: "Remove",
    avoid: "What to avoid", avoidHint: "What you do not want to see: a template look, gradients, too much text…",
    skill: "Design skill", noSkill: "Not chosen yet — pick and pin it below.", pinnedFrom: "pinned from the prototype",
    save: "Save the brief", saving: "Saving…",
  },
  // Site settings tab
  siteTitle: "The element's own site settings",
  siteLead: "Name, search and sharing, languages, the menus, the cookie banner and the switches — the element's own files, changed from here.",
  siteTabs: { basics: "Basics", seo: "Search", metaMedia: "Meta and media", languages: "Languages", header: "Header", footer: "Footer", cookies: "Cookie banner", features: "Switches" },
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
  linked: "Связан с CONFIG узла: значения ниже приходят из общих настроек узла и правятся в CONFIG. Чтобы вести свои — выключите связь первой строкой.",
  saved: "Сохранено — страницы элемента покажут это без сборки.",
  failed: "Не сохранено:",
  fineTitle: "Тонкая настройка",
  fineLead: "Ручная правка поверх выбранного навыка дизайна. Закрепление прототипа заменит цвета, шрифты и формы его собственными; ваши правки здесь после него остаются до следующего закрепления.",
  fineTabs: { colors: "Цвета", fonts: "Шрифты", type: "Текст", shape: "Формы и отступы" },
  brief: {
    title: "Бриф",
    lead: "Прежде шрифтов и цветов: для кого сайт и каким он должен ощущаться. Агент элемента читает это первым и рисует страницы по брифу.",
    inherited: "Взят у элемента",
    audience: "Для кого", audienceHint: "Люди, которые откроют сайт, и за чем они приходят.",
    character: "Характер", characterHint: "До пяти слов через запятую: спокойный, строгий, тёплый…",
    references: "Референсы", referencesHint: "Сайты, дух которых нравится, и слово о том, что именно.", link: "Ссылка (https://…)", note: "Что в нём нравится", media: "Скриншот в хранилище элемента — остаётся как есть.", addReference: "Добавить референс", remove: "Убрать",
    avoid: "Чего избегать", avoidHint: "Чего вы не хотите видеть: шаблонный вид, градиенты, много текста…",
    skill: "Навык дизайна", noSkill: "Пока не выбран — выберите и закрепите его ниже.", pinnedFrom: "закреплён из прототипа",
    save: "Сохранить бриф", saving: "Сохраняю…",
  },
  siteTitle: "Свои настройки сайта элемента",
  siteLead: "Название, поиск и соцсети, языки, меню, баннер cookie и выключатели — собственные файлы элемента, правятся отсюда.",
  siteTabs: { basics: "Основное", seo: "Поиск", metaMedia: "Мета и медиа", languages: "Языки", header: "Шапка", footer: "Подвал", cookies: "Баннер cookie", features: "Выключатели" },
  imagesNote: "Картинки (логотип, картинка для соцсетей, картинки страниц) загружаются в собственное хранилище элемента — пульт ядра их пока не переносит.",
}

export function elementRemoteWords(lang: string): ElementRemoteWords {
  return lang === "ru" ? RU : EN
}
