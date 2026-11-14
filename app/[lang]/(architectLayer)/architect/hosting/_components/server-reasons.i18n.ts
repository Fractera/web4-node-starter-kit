// «ЧЕТЫРЕ ПРИЧИНЫ ДЛЯ СЕРВЕРА» — four cards closed by default on the page «Домен и хостинг», right after «Какой адрес и какая машина». The
// owner, 2026-11-13, gave the four cases (a service for real load · a node shared with others · a clean Fractera for friends · staying at
// home) and «рассматривать свой локальный компьютер как стартовую площадку»; 2026-11-14 he moved them here: «Четыре причины для сервера
// убери его отсюда и перенеси на вкладку доменных хостин … после раздела какой адрес и какая машина» — and there is no move any more:
// «Никакого переезда нет есть просто запуск сервера» (738). Each case names the page that launches a server; the licence is MIT (the
// repository's own words).

type Case = { summary: string; text: string[] }
export type ServerReasons = { title: string; whole: Case; shared: Case; friends: Case; home: Case }

const en: ServerReasons = {
  title: "Four reasons for a server",
  whole: {
    summary: "Your service needs to work around the clock",
    text: [
      "You tuned the node and its elements, tested how they work together and now expect many users and customers, at any hour.",
      "Launch a server on the page «Активация выделенного сервера»: it gets a fresh Fractera from your fork, its own domain and certificates, and works while your computer sleeps. This computer changes nothing and stays the launch pad for the next servers. The server starts from a clean node; its own agent carries the project on there.",
    ],
  },
  shared: {
    summary: "Share an environment with others for a fee",
    text: [
      "You can build an environment for other people, a content platform for example, and offer it for a subscription. Fractera's MIT licence lets you distribute it and asks no royalties. You keep payments and access in your own hands and can switch off anyone who stopped paying.",
      "Launch a separate server for them: it runs its own Fractera, and its first registration becomes its architect. Your computer keeps working as before.",
    ],
  },
  friends: {
    summary: "A clean Fractera for a friend",
    text: [
      "You stay on your own computer, and a friend who cannot use a home computer gets a clean copy of Fractera on a remote server, to build their own project the way you built yours.",
      "Launch a server for them: it takes the starter from your fork and nothing of this node.",
    ],
  },
  home: {
    summary: "Stay at home: a portfolio of many projects",
    text: [
      "If you have a free computer or laptop, you may not need a server at all. This is a sound choice especially when you build many projects and need their static pages to be reachable: a collection of portfolio sites. You get your own Vercel at home, with full control of the data.",
      "Then buy a domain if you have not yet, and keep using Fractera as it is.",
    ],
  },
}

const ru: ServerReasons = {
  title: "Четыре причины для сервера",
  whole: {
    summary: "Сервис должен работать круглосуточно",
    text: [
      "Вы настроили узел и элементы, проверили, как они работают вместе, и теперь ждёте притока пользователей и заказчиков в любое время суток.",
      "Запустите сервер на странице «Активация выделенного сервера»: он получит свежую Fractera из вашего форка, свой домен и сертификаты и будет работать, пока ваш компьютер спит. Этот компьютер ничего не меняет и остаётся стартовой площадкой для следующих серверов. Сервер начинает с чистого узла, и проект там продолжает его собственный агент.",
    ],
  },
  shared: {
    summary: "Поделиться средой с другими за плату",
    text: [
      "Вы можете настроить среду для других людей, например контент-платформу, и давать к ней доступ по подписке. Лицензия Fractera (MIT) разрешает распространять её и не требует отчислений. Оплаты и доступ остаются в ваших руках: любого, кто перестал платить, можно отключить в любой момент.",
      "Запустите для них отдельный сервер: на нём своя Fractera, и его первая регистрация станет его архитектором. Ваш компьютер работает как прежде.",
    ],
  },
  friends: {
    summary: "Чистая Fractera для друга",
    text: [
      "Вы остаётесь на своём компьютере, а другу, которому домашний компьютер по каким-то причинам не подходит, поднимаете чистую копию Fractera на удалённом сервере, чтобы он построил свой проект так же, как вы свой.",
      "Запустите для него сервер: он возьмёт стартовый шаблон из вашего форка и ничего от этого узла.",
    ],
  },
  home: {
    summary: "Остаться дома: коллекция проектов-портфолио",
    text: [
      "Если у вас есть свободный компьютер или ноутбук, сервер может вовсе не понадобиться. Это оправданный выбор, особенно когда вы создаёте много проектов и вам нужно, чтобы их статические страницы были доступны: коллекция сайтов-портфолио. У вас появляется собственный аналог Vercel дома, с полным контролем над данными.",
      "Тогда просто купите домен, если ещё не купили, и продолжайте пользоваться Fractera как есть.",
    ],
  },
}

export function serverReasons(lang: string): ServerReasons {
  return lang === "ru" ? ru : en
}
