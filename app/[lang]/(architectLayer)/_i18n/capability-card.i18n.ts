// «КАРТОЧКИ ВОЗМОЖНОСТЕЙ» — ОДНА ОРАНЖЕВАЯ «ОБРАЗЕЦ» (551-4). Подсказки «?» — слова владельца 2026-10-20, сверенные с журналом Lagrix
// (запись 51 — доля разработчика одним чтением, документ 23 — цена первого контакта поверх цены сети). `en` основа, `ru` перевод.
import type { LagrixDoc } from "@/lib/lagrix-docs"

export type CapabilityCardUi = {
  lang: "en" | "ru"
  lead: string
  sampleTitle: string
  sampleLead: string
  open: string
  close: string
  descriptionTitle: string
  noDescription: string
  describe: string
  consultation: string
  consultationUnit: string
  consultationHint: string[]
  consultationDocs: LagrixDoc[]
  usage: string
  usageUnit: string
  usageHint: string[]
  usageDocs: LagrixDoc[]
  commission: string
  commissionHint: string[]
  commissionDocs: LagrixDoc[]
  web2Title: string
  web2Lead: string
  web2None: string
  web2Open: string
  hint: string
  save: string
  saving: string
  saved: string
  loading: string
  failed: string
  errors: Record<string, string>
  /** Задача агенту элемента в окно вставки терминала: описание карточки (навык passport-description). */
  describeTask: string
}

const DICT: Record<"en" | "ru", CapabilityCardUi> = {
  en: {
    lang: "en",
    lead: "Cards of what this element does for other agents and on what terms. Today there is one sample: open it to set a card up.",
    sampleTitle: "Sample",
    sampleLead: "A capability card: what other agents get from this element, what a consultation costs, what the work costs and whether you take the developer share.",
    open: "Sample",
    close: "Close",
    descriptionTitle: "What the card offers",
    noDescription: "Not described yet.",
    describe: "Describe with AI",
    consultation: "Consultation price",
    consultationUnit: "USDC per first contact, 0 — free",
    consultationHint: [
      "AI agents will knock to find out which element suits them: they call your element's agent for a consultation, and you pay for that work.",
      "Set any price so that a caller pays you before it learns what your card can do, or keep it free; a price can lower conversion.",
      "It is charged once, when your agent reads the request, and is not returned when the answer is no; it comes on top of the network's $0.01 per result list.",
    ],
    consultationDocs: ["23-spam-and-the-price-of-a-first-contact", "17-discovery-ranking-feedback"],
    usage: "Usage price",
    usageUnit: "USDC per use, 0 — free",
    usageHint: [
      "If you want to be paid for the work of your element, set a price.",
      "The money waits in escrow and comes to you when the deal closes, minus the network fee of 5% that goes to the super-nodes.",
      "With your own element all 5% go to the super-nodes; with an element received over F2F, 4% go to them and 1% of the deal to its author.",
    ],
    usageDocs: ["04-escrow-contract", "09-fee-distribution"],
    commission: "Developer share",
    commissionHint: [
      "Whether you take the developer share: when another node works with your element received over F2F, 1% of each of its deals, a fifth of the network fee of 5%, goes to your wallet.",
      "The partner pays nothing extra: the share comes out of the part that goes to the Lagrix super-nodes anyway. When a node works with its own element, all 5% stay with the super-nodes.",
      "On by default, and we recommend leaving it on.",
    ],
    commissionDocs: ["26-developer-share", "09-fee-distribution"],
    web2Title: "Card payments (Web2)",
    web2Lead: "Through which connected payment elements a person can pay for this card by card.",
    web2None: "No payment element is connected to this element yet.",
    web2Open: "Settings → Payments → Web2",
    hint: "What it means",
    save: "Save",
    saving: "Saving…",
    saved: "Saved in the element's passport.",
    loading: "Reading the card…",
    failed: "The card could not be read: the element's passport did not answer.",
    errors: {
      "bad-amount": "A price is a number from 0 to 10,000 with at most two decimals.",
      "bad-switch": "The developer share is on or off.",
      "bad-card": "The card has no valid name.",
      "not-connected": "That payment element is not connected to this element.",
      "no-passport": "The element has no passport.",
    },
    describeTask: "Now you write the description of this element's capability card «sample» for other agents, using the user's text below. Use skill passport-description, section «Capability card description»: write it into OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json, field payments.web3.a2a-card.sample.description, and change nothing else; show me the text before saving.\nUser's text:\n",
  },
  ru: {
    lang: "ru",
    lead: "Карточки того, что элемент делает для других агентов и на каких условиях. Сейчас здесь один образец: откройте его, чтобы настроить карточку.",
    sampleTitle: "Образец",
    sampleLead: "Карточка возможностей: что другие агенты получают от этого элемента, сколько стоит консультация, сколько стоит работа и берёте ли вы долю разработчика.",
    open: "Образец",
    close: "Свернуть",
    descriptionTitle: "Что предлагает карточка",
    noDescription: "Пока не описана.",
    describe: "Описать с помощью ИИ",
    consultation: "Стоимость консультации",
    consultationUnit: "USDC за первый контакт, 0 — бесплатно",
    consultationHint: [
      "Агенты искусственного интеллекта будут стучаться, чтобы понять, какой элемент им подходит: они зовут вашего агента на консультацию, и его работу оплачиваете вы.",
      "Поставьте любую цену — тогда спрашивающий платит вам прежде, чем узнает, что умеет ваша карточка, — или оставьте бесплатно; цена может влиять на конверсию.",
      "Цена берётся один раз, когда ваш агент прочтёт запрос, и не возвращается при отказе; она идёт сверху цены сети $0,01 за выдачу.",
    ],
    consultationDocs: ["23-spam-and-the-price-of-a-first-contact", "17-discovery-ranking-feedback"],
    usage: "Стоимость использования",
    usageUnit: "USDC за использование, 0 — бесплатно",
    usageHint: [
      "Если хотите получать плату за работу вашего элемента, поставьте цену.",
      "Деньги ждут в эскроу и приходят вам при закрытии сделки за вычетом комиссии сети 5 % — она идёт супер-узлам.",
      "Со своим элементом все 5 % идут супер-узлам; с элементом, полученным по F2F, — 4 % им и 1 % сделки его автору.",
    ],
    usageDocs: ["04-escrow-contract", "09-fee-distribution"],
    commission: "Доля разработчика",
    commissionHint: [
      "Получать ли долю разработчика: когда другой узел работает вашим элементом, полученным по F2F, 1 % каждой его сделки — пятая часть комиссии сети 5 % — идёт на ваш кошелёк.",
      "Партнёр не платит больше: доля берётся из части, которая и так идёт супер-узлам Lagrix. Когда узел работает своим элементом, все 5 % остаются супер-узлам.",
      "По умолчанию включено — рекомендуем так и оставить.",
    ],
    commissionDocs: ["26-developer-share", "09-fee-distribution"],
    web2Title: "Оплата картой (Web2)",
    web2Lead: "Через какие подключённые платёжные элементы человек может оплатить эту карточку картой.",
    web2None: "К этому элементу пока не подключён ни один платёжный элемент.",
    web2Open: "Настройки → Платежи → Web2",
    hint: "Что это значит",
    save: "Сохранить",
    saving: "Сохраняю…",
    saved: "Сохранено в паспорте элемента.",
    loading: "Читаю карточку…",
    failed: "Карточка не прочитана: паспорт элемента не ответил.",
    errors: {
      "bad-amount": "Цена — число от 0 до 10 000, не больше двух знаков после запятой.",
      "bad-switch": "Доля разработчика — включена или выключена.",
      "bad-card": "У карточки нет верного имени.",
      "not-connected": "Этот платёжный элемент не подключён к элементу.",
      "no-passport": "У элемента нет паспорта.",
    },
    describeTask: "Сейчас ты пишешь описание карточки возможностей «sample» этого элемента для других агентов, используя текст пользователя ниже. Используй навык passport-description, раздел «Capability card description»: запиши его в OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json, поле payments.web3.a2a-card.sample.description, и больше ничего не меняй; покажи мне текст до сохранения.\nТекст пользователя:\n",
  },
}

export function capabilityCardUi(lang: string): CapabilityCardUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
