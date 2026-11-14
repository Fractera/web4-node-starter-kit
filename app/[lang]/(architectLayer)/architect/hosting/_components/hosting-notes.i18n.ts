// THE WORDS OF THE PAGE «ДОМЕН И ХОСТИНГ»: a preface and two cards closed by default — the own domain and the dedicated server. The
// owner, 2026-11-13: «описание … универсальную среду в которой ваш домашний компьютер может работать как настоящий сервер … предисловие
// а затем два аккордеона закрытых по умолчанию один … про собственные домен а другой … про виртуальный хостинг»; his referral link to the
// hosting lives in `lib/helpful-links.json` (one place for every node, skill helpful-links) and comes here with its disclosure.
// 🔒 FACTS: the domain's price is porkbun.com's own page, read 2026-11-13 («.COM from $11.81» a year); the copy of the public pages and its
// limits — `domain/_components/home-hosting-notes.i18n.ts`; the temporary address closes sign-in (CLAUDE.md §2); the minimum of the
// server — the owner's word (8 GB, 4 cores), the build's own measure (peaks of 13.6–14.8 GiB, so prepare adds swap — step 737).

export type HostingNotes = {
  preface: string[]
  title: string
  domain: { summary: string; text: string[] }
  server: { summary: string; text: string[]; link: string }
}

const en: HostingNotes = {
  preface: [
    "Fractera turns your home computer into a real server. While the computer is on, the node runs its whole architecture: dynamic pages, sign-in, protected pages, data that partners can open and edit.",
    "When the computer is off or asleep, the site does not disappear. Its public pages answer instantly from a copy kept in your Cloudflare account, as a reference site. Nobody can register or change anything there until the computer is back.",
  ],
  title: "Which address and which machine",
  domain: {
    summary: "Your own domain: a permanent address for the same computer",
    text: [
      "Without a domain the node lives at a free temporary Cloudflare address. That is enough if the node is only for you: the internet sees your public pages, and sign-in and registration stay closed there on purpose. The weak side is that Cloudflare changes the address from time to time, so a link you shared stops working.",
      "A domain fixes this. Any registrar sells one: at porkbun.com a .com domain costs from $11.81 a year. With it, links stay permanent, sign-in works for your partners, and the site behaves almost like one on a dedicated server, while the computer stays yours and nothing depends on an outside provider.",
      "Fractera is built for the Web4 era, where every computer is a node of the network and dependence on outside providers shrinks toward zero. For that, a home computer with its own domain is the preferred base. The steps are on the page «Активация домена».",
    ],
  },
  server: {
    summary: "A dedicated server: when the internet must reach you around the clock",
    text: [
      "If visitors, sign-in and orders must work while your computer sleeps, take a domain and a rented server (VPS) too. For a small load, 8 GB of memory and 4 cores is the base minimum; as the business grows, you move to a bigger plan of the same server.",
      "The launch is the page «Активация выделенного сервера»: the node installs a fresh Fractera from your fork there step by step, and this computer stays as it was, ready to launch the next server.",
    ],
    link: "Choose a server",
  },
}

const ru: HostingNotes = {
  preface: [
    "Fractera превращает ваш домашний компьютер в настоящий сервер. Пока компьютер включён, узел работает во всю силу: динамические страницы, вход, закрытые страницы, данные, которые партнёры могут открыть и править.",
    "Когда компьютер выключен или спит, сайт не исчезает. Его публичные страницы мгновенно открываются из копии в вашем аккаунте Cloudflare, как справочный сайт. Зарегистрироваться или что-то изменить там нельзя, пока компьютер не вернётся.",
  ],
  title: "Какой адрес и какая машина",
  domain: {
    summary: "Свой домен: постоянный адрес для того же компьютера",
    text: [
      "Без домена узел живёт на бесплатном временном адресе Cloudflare. Если узел только для вас, этого достаточно: интернет видит ваши публичные страницы, а вход и регистрация там намеренно закрыты. Слабое место в том, что Cloudflare время от времени меняет этот адрес, и ссылка, которой вы поделились, перестаёт работать.",
      "Это решает свой домен. Его продаёт любой регистратор: на porkbun.com домен .com стоит от 11,81 $ в год. С ним ссылки постоянные, вход работает для ваших партнёров, и сайт ведёт себя почти как на выделенном сервере, а компьютер остаётся вашим и ни от какого внешнего поставщика не зависит.",
      "Fractera строится для эпохи Web4, где каждый компьютер становится узлом сети, а зависимость от внешних поставщиков стремится к нулю. Для этого домашний компьютер со своим доменом и есть предпочтительная основа. Шаги подключения на странице «Активация домена».",
    ],
  },
  server: {
    summary: "Выделенный сервер: когда интернет должен достучаться до вас круглосуточно",
    text: [
      "Если посетители, вход и заказы должны работать, пока ваш компьютер спит, возьмите не только домен, но и арендованный сервер (VPS). Для небольшой нагрузки базовый минимум 8 ГБ памяти и 4 ядра; когда бизнес растёт, вы переходите на тариф побольше у того же сервера.",
      "Запуск на странице «Активация выделенного сервера»: узел шаг за шагом ставит туда свежую Fractera из вашего форка, а этот компьютер остаётся как был и готов запускать следующие серверы.",
    ],
    link: "Подобрать сервер",
  },
}

export function hostingNotes(lang: string): HostingNotes {
  return lang === "ru" ? ru : en
}
