// СЛОВА СТРАНИЦЫ «MESSENGER → НАСТРОЙКИ» ЭЛЕМЕНТА (528-2): тариф первого контакта, что это значит, правила агента.
// `en` основа, `ru` перевод; слой архитектора двуязычен.

export type MessengerSettingsUi = {
  feeTitle: string
  feeSwitch: string
  feeOn: string
  feeOff: string
  amountLabel: string
  amountHint: string
  explainTitle: string
  explain: string[]
  rulesTitle: string
  rulesLead: string
  forbiddenLabel: string
  forbiddenHint: string
  interestsLabel: string
  interestsHint: string
  save: string
  saving: string
  saved: string
  failed: string
  errors: Record<"bad-amount" | "bad-switch" | "bad-rules" | "no-passport", string>
  loading: string
  loadFailed: string
  defaults: string
  stored: string
  notBorn: string
}

const UI: Record<"en" | "ru", MessengerSettingsUi> = {
  en: {
    feeTitle: "First contact price",
    feeSwitch: "Charge for a first contact",
    feeOn: "On: whoever writes to you for the first time pays {usd} once.",
    feeOff: "Off: anyone may write to you for the first time without this payment.",
    amountLabel: "Amount, USD",
    amountHint: "From $0.01 to $10,000, to the cent. The default is $1.",
    explainTitle: "What this means",
    explain: [
      "The first contact price is a sum paid once by whoever writes to you for the first time: a person through their agent, or someone else's agent.",
      "The money reaches you when you or your agent have read that first message. If you answer «no», it is not returned: you spent your time reading.",
      "The price is visible in advance — in your announcement and your card — so the writer knows it before sending. After that the conversation goes on as usual: the price is paid once.",
      "Why: it filters out advertising and random requests — writing to you is worth it only for someone who really needs to. Turn it off, and anyone may write to you for the first time without this payment.",
      "For now the node only keeps this setting in the element's passport. The Lagrix network will apply it once the element is connected to it; until then nothing is charged.",
    ],
    rulesTitle: "Rules for the agent that holds the conversation",
    rulesLead: "Before you decide, your agent talks to newcomers for you. One rule per line.",
    forbiddenLabel: "Strictly forbidden",
    forbiddenHint: "What the agent must never do or say — for example, «never give out my phone number».",
    interestsLabel: "What interests me",
    interestsHint: "What the agent should look for and bring to you — for example, «offers of joint concerts».",
    save: "Save",
    saving: "Saving…",
    saved: "Saved in the element's passport.",
    failed: "Not saved:",
    errors: {
      "bad-amount": "the amount must be a number from 0.01 to 10,000, to the cent",
      "bad-switch": "the switch value is missing",
      "bad-rules": "up to 30 rules in each list, each up to 300 characters",
      "no-passport": "the element's passport was not found",
    },
    loading: "Reading the element's passport…",
    loadFailed: "The element's passport could not be read.",
    defaults: "Nothing saved yet — the defaults are shown.",
    stored: "Kept in the element's passport (OWN-SERVICE-PROPS). The agent will follow these rules once H2H and A2A conversations are connected.",
    notBorn: "The element is not born yet: it has no passport to keep these settings.",
  },
  ru: {
    feeTitle: "Тариф первого контакта",
    feeSwitch: "Брать плату за первый контакт",
    feeOn: "Включено: тот, кто пишет вам впервые, один раз платит {usd}.",
    feeOff: "Выключено: написать вам впервые можно без этой платы.",
    amountLabel: "Сумма, USD",
    amountHint: "От $0,01 до $10 000, с точностью до цента. По умолчанию $1.",
    explainTitle: "Что это значит",
    explain: [
      "Тариф первого контакта — сумма, которую один раз платит тот, кто пишет вам впервые: человек через своего агента или чужой агент.",
      "Деньги приходят вам, когда вы или ваш агент прочитали это первое сообщение. Если вы ответили «нет», они не возвращаются: вы потратили время на чтение.",
      "Тариф виден заранее — в вашем объявлении и визитке, поэтому написавший знает цену до отправки. Дальше переписка идёт как обычно: платят один раз.",
      "Зачем: тариф отсекает рекламу и случайные обращения — писать вам имеет смысл тому, кому это действительно нужно. Выключите его — и написать вам впервые можно будет без этой платы.",
      "Сейчас узел только хранит эту настройку в паспорте элемента. Применит её сеть Lagrix, когда элемент будет к ней подключён; до тех пор ничего не списывается.",
    ],
    rulesTitle: "Правила для агента, который ведёт диалог",
    rulesLead: "Пока вы не решили, с новыми собеседниками за вас говорит ваш агент. Одно правило — одна строка.",
    forbiddenLabel: "Категорически запрещено",
    forbiddenHint: "Что агент не должен делать и говорить никогда — например, «никогда не давать мой номер телефона».",
    interestsLabel: "Что меня интересует",
    interestsHint: "Что агенту искать и приносить вам — например, «предложения о совместных концертах».",
    save: "Сохранить",
    saving: "Сохраняю…",
    saved: "Сохранено в паспорте элемента.",
    failed: "Не сохранено:",
    errors: {
      "bad-amount": "сумма должна быть числом от 0,01 до 10 000, с точностью до цента",
      "bad-switch": "нет значения переключателя",
      "bad-rules": "не больше 30 правил в каждом списке, каждое — не длиннее 300 знаков",
      "no-passport": "паспорт элемента не найден",
    },
    loading: "Читаю паспорт элемента…",
    loadFailed: "Паспорт элемента прочитать не удалось.",
    defaults: "Пока ничего не сохранено — показаны значения по умолчанию.",
    stored: "Хранится в паспорте элемента (OWN-SERVICE-PROPS). Агент начнёт следовать этим правилам, когда будут подключены диалоги H2H и A2A.",
    notBorn: "Элемент ещё не родился: у него нет паспорта, в котором хранить эти настройки.",
  },
}

export function messengerSettingsUi(lang: string): MessengerSettingsUi {
  return lang === "ru" ? UI.ru : UI.en
}
