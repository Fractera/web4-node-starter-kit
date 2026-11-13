// THE WORDS ABOVE THE MOVE LADDER: a light preface and four cards closed by default — the cases of a server and the road of the tab each
// one takes. The owner, 2026-11-13: «рассматривать свой локальный компьютер как стартовую площадку для различных вариантов
// использования Fractera … минимальный рекомендуемый тарифный план это 8 ГБ оперативной памяти и четыре ядра»; the four cases are his
// (the move with the databases · a node shared with others without the data · a clean Fractera for friends · staying at home); «лёгкое
// предисловие а затем несколько выпадающих карточек каждый из которых более подробно расскажет о преимуществах недостатках».
// 🔒 Each case names the road of the ladder below it (737-11b): «Переезд этого узла» · «Новый независимый сервер» → «Копия этого узла»
// without «Перенести данные» · → «Свежий узел». The licence is MIT (the repository's own words). His referral link — `lib/helpful-links.json`.

type Case = { summary: string; text: string[] }
export type MoveCases = { preface: string[]; link: string; title: string; whole: Case; shared: Case; friends: Case; home: Case }

const en: MoveCases = {
  preface: [
    "Think of this computer as the launch pad: Fractera is built and tried here, and a server is one of several ways to go on. Each way may need its own plan; the recommended minimum is 8 GB of memory and 4 cores.",
  ],
  link: "Choose a server",
  title: "Four reasons for a server",
  whole: {
    summary: "Your service is ready for real use: move the whole node",
    text: [
      "You tuned the node and its elements, tested how they work together and went through several stages of evolution. Now you expect many users and customers.",
      "Choose «Переезд этого узла». Everything moves, the databases included, and the site works around the clock. This computer keeps a cold copy and the road back. The cost is the server's monthly fee, and the node now lives in a data centre rather than on your desk.",
    ],
  },
  shared: {
    summary: "Share your node with others for a fee: move it without the data",
    text: [
      "You can build an environment for other people, a content platform for example, and offer it for a subscription. Fractera's MIT licence lets you distribute it and asks no royalties. You keep payments and access in your own hands and can switch off anyone who stopped paying.",
      "Choose «Новый независимый сервер», then «Копия этого узла», and leave «Перенести данные этого узла» unticked. The server gets your elements and settings without your accounts, stores or memory; its first registration becomes its architect. Your computer keeps working as before.",
    ],
  },
  friends: {
    summary: "A clean Fractera for a friend: the starter on their server",
    text: [
      "You stay on your own computer, and a friend who cannot use a home computer gets a clean copy of Fractera on a remote server, to build their own project the way you built yours.",
      "Choose «Новый независимый сервер», then «Свежий узел»: the server takes the starter from your fork and nothing of this node.",
    ],
  },
  home: {
    summary: "Stay at home: a portfolio of many projects",
    text: [
      "If you have a free computer or laptop, you may not need a server at all. This is a sound choice especially when you build many projects and need their static pages to be reachable: a collection of portfolio sites. You get your own Vercel at home, with full control of the data.",
      "Then close this tab, buy a domain if you have not yet, and keep using Fractera as it is.",
    ],
  },
}

const ru: MoveCases = {
  preface: [
    "Считайте этот компьютер стартовой площадкой: здесь Fractera строится и проверяется, а сервер лишь один из путей дальше. Каждому пути может понадобиться свой тариф; рекомендуемый минимум 8 ГБ памяти и 4 ядра.",
  ],
  link: "Подобрать сервер",
  title: "Четыре причины для сервера",
  whole: {
    summary: "Сервис готов к настоящей работе: переносите узел целиком",
    text: [
      "Вы настроили узел и элементы, проверили, как они работают вместе, прошли несколько этапов эволюции и теперь ждёте большого притока пользователей и заказчиков.",
      "Выберите «Переезд этого узла». Переезжает всё, базы данных тоже, и сайт работает круглосуточно. Этот компьютер хранит холодную копию и дорогу обратно. Цена в ежемесячной оплате сервера, и узел живёт теперь в дата-центре, а не на вашем столе.",
    ],
  },
  shared: {
    summary: "Поделиться узлом за плату: переносите его без данных",
    text: [
      "Вы можете настроить среду для других людей, например контент-платформу, и давать к ней доступ по подписке. Лицензия Fractera (MIT) разрешает распространять её и не требует отчислений. Оплаты и доступ остаются в ваших руках: любого, кто перестал платить, можно отключить в любой момент.",
      "Выберите «Новый независимый сервер», затем «Копия этого узла», и не отмечайте «Перенести данные этого узла». Сервер получит ваши элементы и настройки без учётных записей, хранилищ и памяти; его первая регистрация станет его архитектором. Ваш компьютер работает как прежде.",
    ],
  },
  friends: {
    summary: "Чистая Fractera для друга: стартовый шаблон на его сервере",
    text: [
      "Вы остаётесь на своём компьютере, а другу, которому домашний компьютер по каким-то причинам не подходит, поднимаете чистую копию Fractera на удалённом сервере, чтобы он построил свой проект так же, как вы свой.",
      "Выберите «Новый независимый сервер», затем «Свежий узел»: сервер возьмёт стартовый шаблон из вашего форка и ничего от этого узла.",
    ],
  },
  home: {
    summary: "Остаться дома: коллекция проектов-портфолио",
    text: [
      "Если у вас есть свободный компьютер или ноутбук, сервер может вовсе не понадобиться. Это оправданный выбор, особенно когда вы создаёте много проектов и вам нужно, чтобы их статические страницы были доступны: коллекция сайтов-портфолио. У вас появляется собственный аналог Vercel дома, с полным контролем над данными.",
      "Тогда просто закройте эту вкладку, купите домен, если ещё не купили, и продолжайте пользоваться Fractera как есть.",
    ],
  },
}

export function moveCases(lang: string): MoveCases {
  return lang === "ru" ? ru : en
}
