// «НАСТРОЙКИ → ПЛАТЕЖИ → WEB2» — ПЛАТЁЖНЫЕ ЭЛЕМЕНТЫ УЗЛА (551-5). `en` основа, `ru` перевод. Слова заглушек — владельца 2026-10-20:
// «дашборд, который будет представлять для себя заглушку с текстом создайте вам необходим и там просто будет стандартный пустая таблица,
// а также аналитика и также там будет вкладка создайте эту аналитику которую вам нужна … единственное график без обработки данных».

export type PaymentElementsUi = {
  lead: string
  none: string
  connected: string
  notConnected: string
  connect: string
  loading: string
  failed: string
  saveFailed: string
  tabApi: string
  tabDashboard: string
  tabAnalytics: string
  apiTitle: string
  hooksTitle: string
  nothingBuilt: string
  notConnectedYet: string
  assign: string
  /** Задача агенту этого элемента: договориться с платёжным элементом по i2i. `{name}`, `{address}` — платёжный элемент. */
  assignTask: string
  dashboardTitle: string
  dashboardHead: string[]
  dashboardEmpty: string
  analyticsTitle: string
  analyticsEmpty: string
  analyticsAxis: { value: string; time: string }
  terminal: string
  openElement: string
  /** Своя страница платёжного элемента. */
  selfLead: string
  selfStripe: string
  selfOther: string
  selfConnected: string
  selfNobody: string
  errors: Record<string, string>
}

const DICT: Record<"en" | "ru", PaymentElementsUi> = {
  en: {
    lead: "Card payments on the element's site go through the payment elements of your node. Connect the ones this element works with: connecting only records your choice — the API between the two elements is agreed by their agents over i2i.",
    none: "There are no payment elements in your node yet.",
    connected: "Connected",
    notConnected: "Not connected",
    connect: "Connect",
    loading: "Reading the payment elements…",
    failed: "The payment elements could not be read: the element's passport did not answer.",
    saveFailed: "Not saved: the element's passport did not accept the change.",
    tabApi: "API and Hook",
    tabDashboard: "Dashboard",
    tabAnalytics: "Analytics",
    apiTitle: "API — what this element calls at the payment element",
    hooksTitle: "Hook — what the payment element calls back here",
    nothingBuilt: "Nothing is built yet. When the agents of the two elements agree over i2i, the calls and callbacks they built appear here.",
    notConnectedYet: "Connect the payment element first: then the agents can agree on the API.",
    assign: "Give the task to the agent",
    assignTask: "Agree over i2i with the payment element {name} ({address}) an API to take card payments for this element: what you send, what it returns, and what it calls back here when a payment is done. Use skill use-i2i.",
    dashboardTitle: "Create the dashboard you need",
    dashboardHead: ["Date", "Amount", "Status", "Description"],
    dashboardEmpty: "No payments yet: the dashboard is built by the element's agent.",
    analyticsTitle: "Create the analytics you need",
    analyticsEmpty: "No data yet",
    analyticsAxis: { value: "Payments", time: "Time" },
    terminal: "Open the element's terminal",
    openElement: "Open the payment element",
    selfLead: "This element is the payment element of your node: other elements connect to it on their «Settings → Payments → Web2» page.",
    selfStripe: "The keys of your Stripe account live here, in this element.",
    selfOther: "The key of your account is added when the element's agent builds the payments: it names the variable, and you enter it in «Build → Environment variables».",
    selfConnected: "Connected to it:",
    selfNobody: "No element is connected to it yet.",
    errors: {
      "no-payment-element": "There is no such payment element in the node.",
      self: "A payment element is not connected to itself.",
      "bad-connect": "The connection request is not valid.",
      "no-passport": "The element has no passport.",
    },
  },
  ru: {
    lead: "Оплата картой на сайте элемента идёт через платёжные элементы вашего узла. Подключите те, с которыми работает этот элемент: подключение только записывает ваш выбор — API между двумя элементами договорят их агенты по i2i.",
    none: "В вашем узле пока нет платёжных элементов.",
    connected: "Подключён",
    notConnected: "Не подключён",
    connect: "Подключить",
    loading: "Читаю платёжные элементы…",
    failed: "Платёжные элементы не прочитаны: паспорт элемента не ответил.",
    saveFailed: "Не сохранено: паспорт элемента не принял изменение.",
    tabApi: "API и Hook",
    tabDashboard: "Дашборд",
    tabAnalytics: "Аналитика",
    apiTitle: "API — что этот элемент вызывает у платёжного",
    hooksTitle: "Hook — что платёжный элемент вызывает здесь в ответ",
    nothingBuilt: "Пока ничего не построено. Когда агенты двух элементов договорятся по i2i, здесь появятся построенные вызовы и обратные вызовы.",
    notConnectedYet: "Сначала подключите платёжный элемент: тогда агенты смогут договориться об API.",
    assign: "Поручить агенту",
    assignTask: "Договорись по i2i с платёжным элементом {name} ({address}) об API приёма оплаты картой для этого элемента: что ты отправляешь, что он возвращает и что он вызывает здесь, когда оплата прошла. Используй навык use-i2i.",
    dashboardTitle: "Создайте дашборд, который вам нужен",
    dashboardHead: ["Дата", "Сумма", "Статус", "Описание"],
    dashboardEmpty: "Платежей пока нет: дашборд строит агент элемента.",
    analyticsTitle: "Создайте аналитику, которая вам нужна",
    analyticsEmpty: "Данных пока нет",
    analyticsAxis: { value: "Платежи", time: "Время" },
    terminal: "Открыть терминал элемента",
    openElement: "Открыть платёжный элемент",
    selfLead: "Этот элемент — платёжный элемент вашего узла: другие элементы подключают его на своей странице «Настройки → Платежи → Web2».",
    selfStripe: "Ключи вашего аккаунта Stripe хранятся здесь, в этом элементе.",
    selfOther: "Ключ вашего аккаунта добавляется, когда агент элемента построит приём оплаты: он назовёт переменную, а ввести её можно в «Строительство → Переменные окружения».",
    selfConnected: "К нему подключены:",
    selfNobody: "К нему пока не подключён ни один элемент.",
    errors: {
      "no-payment-element": "Такого платёжного элемента в узле нет.",
      self: "Платёжный элемент не подключается сам к себе.",
      "bad-connect": "Запрос подключения неверен.",
      "no-passport": "У элемента нет паспорта.",
    },
  },
}

export function paymentElementsUi(lang: string): PaymentElementsUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
