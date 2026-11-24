// СЛОВА СТРАНИЦЫ «СТРОИТЕЛЬСТВО → ПРЕДЛОЖИТЬ В МАРКЕТПЛЕЙСЕ» СВОЕГО НАТИВНОГО ЭЛЕМЕНТА (854): выбор маркетплейса и форма заявки.
// `en` основа, `ru` перевод; слой архитектора двуязычен.

export type MarketOfferUi = {
  marketLabel: string
  marketPlaceholder: string
  markets: Record<"web2" | "web4", { name: string; hint: string }>
  next: string
  back: string
  formTitle: string
  summaryLabel: string
  summaryHint: string
  priceLabel: string
  priceHint: string
  per: Record<"once" | "month", string>
  noteLabel: string
  noteHint: string
  send: string
  sending: string
  kept: Record<"web2" | "web4", string>
  last: string
  failed: string
  errors: Record<"bad-market" | "bad-summary" | "bad-price" | "bad-note" | "not-own-native", string>
  loading: string
  loadFailed: string
}

const UI: Record<"en" | "ru", MarketOfferUi> = {
  en: {
    marketLabel: "Where to offer it",
    marketPlaceholder: "Choose a marketplace",
    markets: {
      web2: { name: "Web2 — the Fractera marketplace", hint: "A public page of the element with its price at f2f-marketplace.fractera.ai." },
      web4: { name: "Web4 — Lagrix", hint: "The open network of agents. It has not launched yet: this choice is a simulation, the application is only kept on your node." },
    },
    next: "Next",
    back: "Change the marketplace",
    formTitle: "Application",
    summaryLabel: "What the element does",
    summaryHint: "In the words of a buyer: what task it solves and for whom. From 20 to 2,000 characters.",
    priceLabel: "Price, USD",
    priceHint: "Empty or 0 — free.",
    per: { once: "once", month: "per month" },
    noteLabel: "Note for the marketplace",
    noteHint: "Optional: version, limits, what it needs from the node. No keys and no personal data.",
    send: "Send the application",
    sending: "Sending…",
    kept: {
      web2: "The application is kept on your node. The Fractera marketplace does not receive applications yet — it will be sent from here when it does.",
      web4: "The application is kept on your node. Lagrix has not launched: nothing was sent, this is a simulation.",
    },
    last: "Last application: {date}, {market}.",
    failed: "Not sent:",
    errors: {
      "bad-market": "choose a marketplace",
      "bad-summary": "describe the element in 20 to 2,000 characters",
      "bad-price": "the price is a number from 0 to 100,000",
      "bad-note": "the note is at most 1,000 characters",
      "not-own-native": "only a native element created on this node can be offered",
    },
    loading: "Reading the last application…",
    loadFailed: "The last application could not be read.",
  },
  ru: {
    marketLabel: "Где предложить",
    marketPlaceholder: "Выберите маркетплейс",
    markets: {
      web2: { name: "Web2 — маркетплейс Fractera", hint: "Публичная страница элемента с ценой на f2f-marketplace.fractera.ai." },
      web4: { name: "Web4 — Lagrix", hint: "Открытая сеть агентов. Она ещё не запущена: этот выбор — имитация, заявка только хранится на вашем узле." },
    },
    next: "Далее",
    back: "Сменить маркетплейс",
    formTitle: "Заявка",
    summaryLabel: "Что делает элемент",
    summaryHint: "Словами покупателя: какую задачу решает и для кого. От 20 до 2 000 знаков.",
    priceLabel: "Цена, USD",
    priceHint: "Пусто или 0 — бесплатно.",
    per: { once: "разово", month: "в месяц" },
    noteLabel: "Примечание для маркетплейса",
    noteHint: "Необязательно: версия, ограничения, что ему нужно от узла. Без ключей и персональных данных.",
    send: "Отправить заявку",
    sending: "Отправляю…",
    kept: {
      web2: "Заявка сохранена на вашем узле. Маркетплейс Fractera пока не принимает заявки — отсюда она уйдёт, когда он начнёт.",
      web4: "Заявка сохранена на вашем узле. Lagrix ещё не запущен: ничего не отправлено, это имитация.",
    },
    last: "Последняя заявка: {date}, {market}.",
    failed: "Не отправлено:",
    errors: {
      "bad-market": "выберите маркетплейс",
      "bad-summary": "опишите элемент от 20 до 2 000 знаков",
      "bad-price": "цена — число от 0 до 100 000",
      "bad-note": "примечание — не длиннее 1 000 знаков",
      "not-own-native": "предложить можно только нативный элемент, созданный на этом узле",
    },
    loading: "Читаю последнюю заявку…",
    loadFailed: "Последнюю заявку прочитать не удалось.",
  },
}

export function marketOfferUi(lang: string): MarketOfferUi {
  return lang === "ru" ? UI.ru : UI.en
}
