// СЛОВА ПОЛОСЫ «ВРЕМЕННЫЙ АДРЕС УМЕР» (шаг 632-5). `en` основа, `ru` перевод; выбирает сервер и передаёт острову пропсом.
export type DeadAddressAlarmWords = { lead: string; body: string; raise: string; raising: string; raised: string; failed: string; note: string; connect: string }

const DICT: Record<"en" | "ru", DeadAddressAlarmWords> = {
  en: {
    lead: "The node's temporary internet address stopped working {since}: Cloudflare no longer knows it.",
    body: "The site keeps working on this computer, but from the internet the old link opens nothing.",
    raise: "Raise a new address",
    raising: "Raising a new address… up to a minute",
    raised: "New address:",
    failed: "A new address could not be raised:",
    note: "The address will be a new one: the links you gave out lead nowhere anyway. A permanent address is your own domain.",
    connect: "Connect your own domain",
  },
  ru: {
    lead: "Временный адрес узла в интернете перестал работать {since}: Cloudflare его больше не знает.",
    body: "Сайт на этом компьютере работает, но из интернета по старой ссылке ничего не открывается.",
    raise: "Поднять новый адрес",
    raising: "Поднимаю новый адрес… до минуты",
    raised: "Новый адрес:",
    failed: "Новый адрес поднять не удалось:",
    note: "Адрес будет другим: выданные ссылки и так уже никуда не ведут. Постоянный адрес — свой домен.",
    connect: "Подключить свой домен",
  },
}

export function deadAddressAlarmWords(lang: string): DeadAddressAlarmWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
