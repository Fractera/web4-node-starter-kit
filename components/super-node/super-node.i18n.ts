import type { DocItem, LagrixDoc } from "@/lib/lagrix-docs"

// СЛОВА РАЗДЕЛА «СУПЕР УЗЕЛ» (530-3, 531). Каждое утверждение о сети — со ссылкой на документ Lagrix (слово владельца 2026-10-18).
// Цифры — по журналу 000: комиссия до 5 % сетевой части (запись 25); при элементе, полученном по F2F, 20 % комиссии — автору, то есть 4 %
// сделки в котёл и 1 % автору; при своём элементе — все 5 % в котёл (запись 51); поиск $0,01 (39), доставка $0,001 (52), метка — $100 на
// девять голосов (49); доля супер-узла, не прошедшего минимум, и доля основателя (41) остаются в котле прошедших (05 §5.6, 09 §9.3) —
// это перераспределение, которое владелец 2026-10-18 назвал среди выплат; доказавший нарушение получает награду из комиссий (док. 06).
// Оба случая записи 51 называются вместе — ответ владельца 2026-10-18 на вопрос о 4 % и 5 %: «Оставить запись 51».
// `en` основа, `ru` перевод.

export type HardwareRow = "cpus" | "aes" | "ram" | "disk" | "nvme" | "bandwidth" | "ipv4" | "ipv6"

export type SuperNodeWords = {
  whatTitle: string
  what: DocItem[]
  incomeTitle: string
  income: DocItem[]
  incomeNote: DocItem
  statusLink: string
  docsTitle: string
  // Статус
  howTitle: string
  how: DocItem[]
  status: { none: string; submitted: string; approved: string }
  submittedNote: string
  approvedAt: string
  deadline: string
  expired: string
  apply: string
  withdraw: string
  simulate: string
  simulateNote: string
  busy: string
  noWallet: string
  walletLink: string
  server: {
    title: string
    lead: string
    packageLink: string
    urlLabel: string
    keyLabel: string
    keyHint: string
    connect: string
    disconnect: string
    connected: string
  }
  test: { run: string; running: string; title: string; ok: string; short: string; forwardNote: string; none: string }
  failed: string
  errors: Record<string, string>
  loading: string
  loadFailed: string
  // Уведомления
  notConnected: string
  statusLinkShort: string
  machine: { title: string; lead: string; head: [string, string, string, string]; rows: Record<HardwareRow, string>; ok: string; short: string; notMeasured: string; measured: string }
  warnings: { title: string; none: string; deadline: string }
  checks: { title: string; none: string; passed: string; failed: string }
  // Выплаты
  payouts: { head: [string, string, string, string, string, string]; kinds: Record<"pool" | "search" | "delivery" | "official-vote" | "violation-reward", string>; empty: string; whatTitle: string; what: DocItem[] }
  // Настройки
  settings: {
    countryLabel: string; countryHint: string; coverageLabel: string; coverageHint: string; regionalLabel: string; regionalHint: string
    listsLabel: string; listsHint: string; defaultTitle: string; defaults: string[]; defaultNote: string; save: string
    saved: string; savedPushed: string; savedNotPushed: string; declarationNote: string
  }
  pageDocs: Record<"home" | "status" | "notices" | "payouts" | "settings", LagrixDoc[]>
}

const D = (text: string, ...docs: LagrixDoc[]): DocItem => ({ text, docs })

const UI: Record<"en" | "ru", SuperNodeWords> = {
  en: {
    whatTitle: "What a super-node is",
    what: [
      D("A super-node is a permanent server of the Lagrix network. It keeps the discovery index of the kinds of services it holds, builds search results, keeps the index of receipts and reviews and helps agents connect; payment itself is settled by the escrow contract.", "06-super-nodes-downtime-and-violations", "17-discovery-ranking-feedback"),
      D("A place is not bought and has no number. When a place opens, nodes whose elements work as providers apply — one application per node wallet; those whose paid work over 12 months lies between 0.75 and 1.25 of the network median are put in a random order by the contract.", "05-fees-and-reputation"),
      D("The first in the order gets an invitation and 48 hours to set up the server, pass the test and the check by agents of the network; then the place is registered and the super-node becomes active. Each super-node serves about a year and leaves by rotation once its successor is included.", "05-fees-and-reputation", "15-super-node-deployment-flow"),
      D("Downtime is not a violation: a switched-off super-node only loses income, and after 30 days unavailable it leaves without a mark. A proven violation puts a permanent mark on the node's wallet and closes super-node places to it for good.", "06-super-nodes-downtime-and-violations"),
    ],
    incomeTitle: "What a super-node is paid for",
    income: [
      D("The deal fee — the main part. Every deal in the network pays a fee of up to 5% of its network part. The fees of all deals of a period are pooled and divided equally among the super-nodes that passed the quality minimum: 4% of a deal when the provider worked with an element received over F2F (1% goes to the element's author), the whole 5% when the element is the provider's own.", "05-fees-and-reputation", "09-fee-distribution", "26-developer-share"),
      D("Redistribution: a super-node that fails the quality minimum in a period — downtime, failed checks — gets no share of that period's pool; the pool is divided only among those who passed, so their shares grow. The founder's share stays in the pool of the others in the same way until ten super-nodes pass the minimum.", "05-fees-and-reputation", "09-fee-distribution"),
      D("Search, the connection of a customer to providers: $0.01 for every result list this super-node built.", "17-discovery-ranking-feedback"),
      D("Message delivery: $0.001 — a tenth of a cent — for every H2H message it delivered.", "17-discovery-ranking-feedback"),
      D("A vote on the Official mark: about $11 a vote — the $100 application fee is divided among the nine panel members who voted.", "24-official-agents"),
      D("Proof of a violation by another super-node: a reward in USDC from the fees.", "06-super-nodes-downtime-and-violations"),
    ],
    incomeNote: D("Everything is paid in USDC. How much is not known in advance and not guaranteed: it depends on the deals of the network and on how many super-nodes pass the minimum.", "05-fees-and-reputation", "09-fee-distribution"),
    statusLink: "Status and application",
    docsTitle: "Lagrix documents",
    howTitle: "How an application works",
    how: [
      D("You need no server to apply and spend nothing in advance.", "05-fees-and-reputation"),
      D("The application comes from the node's main wallet — a node whose elements work as providers; one application per wallet.", "05-fees-and-reputation"),
      D("Places go by random choice among applicants in the window around the median of paid work.", "05-fees-and-reputation"),
      D("After the approval (the invitation) you have 48 hours: set up the server from the installation package, connect it to this node and pass the test, then the check by agents of the network.", "05-fees-and-reputation", "15-super-node-deployment-flow"),
      D("A powerful home computer can do this job if it meets the requirements; if needed, you move it to a dedicated server later.", "14-node-hardware-network"),
    ],
    status: {
      none: "No application yet.",
      submitted: "The application is submitted and waits for approval.",
      approved: "The application is approved and waits for integration.",
    },
    submittedNote: "Until the node is connected to the Lagrix network the application is kept on this node; the contract takes it when a place opens.",
    approvedAt: "Approved on {date}.",
    deadline: "Set up the server and pass the test by {date} — about {hours} h left.",
    expired: "The 48 hours ended on {date}: the invitation passes to the next applicant in the order.",
    apply: "Apply for a place",
    withdraw: "Withdraw the application",
    simulate: "Simulate the approval (prototype)",
    simulateNote: "In the network the approval comes from the contract; this button lets you check the prototype.",
    busy: "Saving…",
    noWallet: "The application comes from the node's wallet, and the node has none yet.",
    walletLink: "Connect the main wallet",
    server: {
      title: "The super-node's server",
      lead: "The address of the machine the super-node runs on (on this computer — http://127.0.0.1:4011) and the operator key it showed at its first start. The node reads the machine's data through the operator API.",
      packageLink: "Installation package: lagrix-supernode (operator API prototype)",
      urlLabel: "Server address",
      keyLabel: "Operator key",
      keyHint: "Kept on this node and never shown on the page again.",
      connect: "Connect",
      disconnect: "Disconnect",
      connected: "Connected: {url}",
    },
    test: {
      run: "Run the test",
      running: "Testing…",
      title: "Test of {date}",
      ok: "The measured parameters satisfy the Tier-2 profile.",
      short: "Lagrix is not satisfied: {list}.",
      forwardNote: "This is your own check before the check by agents of the network; it goes to the network once the node is connected to Lagrix.",
      none: "No test yet.",
    },
    failed: "Not done:",
    errors: {
      "no-wallet": "connect the node's main wallet first",
      "no-application": "there is no application",
      "bad-url": "the address must start with http:// or https://",
      "bad-key": "the operator key was refused",
      unreachable: "the server did not answer at this address",
      "not-connected": "the super-node's server is not connected",
      "server-error": "the server answered with an error",
      "bad-country": "the country is two letters of ISO 3166-1, for example DE",
      "bad-tag": "tags are lower-case Latin letters, digits and hyphens, up to 200",
      overlap: "the same tag cannot be both accepted and forbidden",
      "bad-list": "lists are links starting with https://, up to 20",
      "temporary-address": "this is changed only on this computer or on your own domain",
    },
    loading: "Asking the node…",
    loadFailed: "The node did not answer.",
    notConnected: "The super-node's server is not connected.",
    statusLinkShort: "Connect it on «Status»",
    machine: {
      title: "The super-node's server and the Tier-2 profile",
      lead: "Measured on the super-node's own machine and read through the operator API; the Tier-2 profile is the starting point for a server that passes the network's checks.",
      head: ["Parameter", "Tier-2", "The server", "Lagrix"],
      rows: { cpus: "CPU cores", aes: "AES-NI", ram: "Memory", disk: "Disk", nvme: "NVMe", bandwidth: "Bandwidth", ipv4: "Static IPv4", ipv6: "IPv6 /64" },
      ok: "satisfies",
      short: "falls short",
      notMeasured: "not measured",
      measured: "{platform}, measured {date}.",
    },
    warnings: {
      title: "Warnings from Lagrix",
      none: "No warnings. If the network's checks find that capacity falls short, a warning comes to the operator's point of contact and appears here; if capacity is not added in time, the super-node leaves early, without a mark.",
      deadline: "add capacity by {date}",
    },
    checks: { title: "Checks by agents of the network", none: "No check results yet.", passed: "passed", failed: "failed" },
    payouts: {
      head: ["Date", "Period", "What for", "Amount, USDC", "Note", "Transaction"],
      kinds: {
        pool: "Share of the period's fee pool",
        search: "Search fee",
        delivery: "Delivery fee",
        "official-vote": "Vote on an «Official» mark",
        "violation-reward": "Proof of a violation",
      },
      empty: "No payouts yet.",
      whatTitle: "What payouts are for",
      what: [],
    },
    settings: {
      countryLabel: "Operator's country (ISO 3166-1, two letters)",
      countryHint: "The super-node applies the laws of this country as regional restrictions; the country is published in its declaration with a point of contact.",
      coverageLabel: "Coverage — kinds of services (tags) you accept into the index",
      coverageHint: "Beyond the kinds the super-node must hold. One tag per line, for example legal-advice.",
      regionalLabel: "Regional restrictions — tags you do not take into the index",
      regionalHint: "What the law of your country forbids. Other super-nodes still show them. One tag per line.",
      listsLabel: "Open restriction lists you apply",
      listsHint: "Signed lists of tags anyone can publish; links starting with https://, one per line.",
      defaultTitle: "Prohibited by default for every super-node",
      defaults: ["sexual exploitation of children", "trafficking in persons", "terrorism and its financing", "weapons of mass destruction", "violence for hire", "stolen data and access", "malicious software"],
      defaultNote: "This list is fixed in the protocol version: a super-node that shows such announcements fails the quality minimum.",
      save: "Save settings",
      saved: "Saved on the node.",
      savedPushed: "Saved on the node and sent to the super-node's server.",
      savedNotPushed: "Saved on the node; the super-node's server did not take the declaration.",
      declarationNote: "The super-node publishes the declaration as the information document (NIP-11) of its relay.",
    },
    pageDocs: {
      home: ["05-fees-and-reputation", "06-super-nodes-downtime-and-violations", "09-fee-distribution", "15-super-node-deployment-flow"],
      status: ["05-fees-and-reputation", "14-node-hardware-network", "15-super-node-deployment-flow"],
      notices: ["14-node-hardware-network", "15-super-node-deployment-flow", "06-super-nodes-downtime-and-violations"],
      payouts: ["09-fee-distribution", "17-discovery-ranking-feedback", "24-official-agents", "06-super-nodes-downtime-and-violations"],
      settings: ["17-discovery-ranking-feedback", "18-governance-protocols-council"],
    },
  },
  ru: {
    whatTitle: "Что такое супер-узел",
    what: [
      D("Супер-узел — постоянный сервер сети Lagrix. Он держит индекс обнаружения тех видов услуг, за которые отвечает, строит выдачу, хранит индекс чеков и отзывов и помогает агентам соединиться; сам платёж рассчитывает контракт условного депонирования.", "06-super-nodes-downtime-and-violations", "17-discovery-ranking-feedback"),
      D("Место не покупается и не имеет номера. Когда место открывается, заявки подают узлы, чьи элементы работают исполнителями, — одна заявка на кошелёк узла; тех, чья оплаченная работа за 12 месяцев лежит между 0,75 и 1,25 медианы сети, контракт ставит в случайный порядок.", "05-fees-and-reputation"),
      D("Первый в порядке получает приглашение и 48 часов, чтобы развернуть сервер, пройти тест и проверку агентами сети; затем место записывается, и супер-узел становится активным. Каждый супер-узел служит около года и уходит по ротации, когда его преемник включён.", "05-fees-and-reputation", "15-super-node-deployment-flow"),
      D("Простой — не нарушение: выключенный супер-узел только теряет доход, а после 30 дней недоступности уходит без отметки. Доказанное нарушение ставит постоянную отметку на кошелёк узла и навсегда закрывает ему места супер-узлов.", "06-super-nodes-downtime-and-violations"),
    ],
    incomeTitle: "За что платят супер-узлу",
    income: [
      D("Комиссия сделок — главная часть. Каждая сделка в сети платит комиссию до 5 % своей сетевой части. Комиссии всех сделок периода собираются в котёл и делятся поровну между супер-узлами, прошедшими минимум качества: 4 % сделки, если исполнитель работал элементом, полученным по F2F (1 % — автору элемента), и все 5 %, если элемент свой.", "05-fees-and-reputation", "09-fee-distribution", "26-developer-share"),
      D("Перераспределение: супер-узел, не прошедший минимум качества за период (простой, проваленные проверки), не получает доли котла этого периода — котёл делится только между прошедшими, и их доли растут. Так же в котле остальных остаётся доля основателя, пока минимум не прошли десять супер-узлов.", "05-fees-and-reputation", "09-fee-distribution"),
      D("Поиск — подключение заказчика к исполнителям: $0,01 за каждую выдачу, которую построил этот супер-узел.", "17-discovery-ranking-feedback"),
      D("Доставка сообщений: $0,001 — десятая часть цента — за каждое доставленное сообщение H2H.", "17-discovery-ranking-feedback"),
      D("Голос о метке «Официальный»: около $11 за голос — плата $100 за заявку делится между девятью проголосовавшими.", "24-official-agents"),
      D("Доказательство нарушения другого супер-узла: награда в USDC из комиссий.", "06-super-nodes-downtime-and-violations"),
    ],
    incomeNote: D("Всё платится в USDC. Сколько — заранее не известно и не гарантировано: зависит от сделок сети и от того, сколько супер-узлов пройдёт минимум.", "05-fees-and-reputation", "09-fee-distribution"),
    statusLink: "Статус и заявка",
    docsTitle: "Документы Lagrix",
    howTitle: "Как работает заявка",
    how: [
      D("Для заявки не нужен сервер, и заранее ничего не тратится.", "05-fees-and-reputation"),
      D("Заявку подаёт главный кошелёк узла, чьи элементы работают исполнителями; одна заявка на кошелёк.", "05-fees-and-reputation"),
      D("Места назначаются случайным выбором среди заявок в окне вокруг медианы оплаченной работы.", "05-fees-and-reputation"),
      D("После одобрения (приглашения) у вас 48 часов: развернуть сервер из установочного пакета, подключить его к этому узлу и пройти тест, затем — проверку агентами сети.", "05-fees-and-reputation", "15-super-node-deployment-flow"),
      D("Для этой работы подойдёт и мощный домашний компьютер, если он удовлетворяет требованиям; при необходимости его потом переносят на выделенный сервер.", "14-node-hardware-network"),
    ],
    status: {
      none: "Заявки пока нет.",
      submitted: "Заявка подана и ожидает одобрения.",
      approved: "Заявка одобрена и ожидает интеграции.",
    },
    submittedNote: "Пока узел не подключён к сети Lagrix, заявка хранится на этом узле; контракт примет её, когда откроется место.",
    approvedAt: "Одобрена {date}.",
    deadline: "Развернуть сервер и пройти тест — до {date}, осталось около {hours} ч.",
    expired: "48 часов истекли {date}: приглашение переходит следующему в порядке.",
    apply: "Подать заявку на место",
    withdraw: "Отозвать заявку",
    simulate: "Имитировать одобрение (прототип)",
    simulateNote: "В сети одобрение придёт из контракта; эта кнопка нужна, чтобы проверить прототип.",
    busy: "Сохраняю…",
    noWallet: "Заявка подаётся от кошелька узла, а у узла его пока нет.",
    walletLink: "Подключить главный кошелёк",
    server: {
      title: "Сервер супер-узла",
      lead: "Адрес машины, на которой работает супер-узел (на этом же компьютере — http://127.0.0.1:4011), и ключ оператора, который она показала при первом запуске. Узел читает данные машины через API оператора.",
      packageLink: "Установочный пакет: lagrix-supernode (прототип API оператора)",
      urlLabel: "Адрес сервера",
      keyLabel: "Ключ оператора",
      keyHint: "Хранится на этом узле и на страницу больше не выводится.",
      connect: "Подключить",
      disconnect: "Отключить",
      connected: "Подключён: {url}",
    },
    test: {
      run: "Пройти тест",
      running: "Тест идёт…",
      title: "Тест {date}",
      ok: "Измеренные параметры удовлетворяют профилю Tier-2.",
      short: "Lagrix не удовлетворён: {list}.",
      forwardNote: "Это ваша проверка до проверки агентами сети; в сеть итог уйдёт, когда узел будет подключён к Lagrix.",
      none: "Теста ещё не было.",
    },
    failed: "Не сделано:",
    errors: {
      "no-wallet": "сначала подключите главный кошелёк узла",
      "no-application": "заявки нет",
      "bad-url": "адрес начинается с http:// или https://",
      "bad-key": "ключ оператора не принят",
      unreachable: "сервер по этому адресу не ответил",
      "not-connected": "сервер супер-узла не подключён",
      "server-error": "сервер ответил ошибкой",
      "bad-country": "страна — две буквы ISO 3166-1, например DE",
      "bad-tag": "теги — строчные латинские буквы, цифры и дефис, не больше 200",
      overlap: "один и тот же тег не может быть и принят, и запрещён",
      "bad-list": "списки — ссылки, начинающиеся с https://, не больше 20",
      "temporary-address": "это меняется только на этом компьютере или на вашем домене",
    },
    loading: "Спрашиваю узел…",
    loadFailed: "Узел не ответил.",
    notConnected: "Сервер супер-узла не подключён.",
    statusLinkShort: "Подключить на вкладке «Статус»",
    machine: {
      title: "Сервер супер-узла и профиль Tier-2",
      lead: "Измерено на самой машине супер-узла и прочитано через API оператора; профиль Tier-2 — отправная точка для сервера, который проходит проверки сети.",
      head: ["Параметр", "Tier-2", "Сервер", "Lagrix"],
      rows: { cpus: "Ядра процессора", aes: "AES-NI", ram: "Память", disk: "Диск", nvme: "NVMe", bandwidth: "Канал", ipv4: "Статический IPv4", ipv6: "IPv6 /64" },
      ok: "удовлетворяет",
      short: "не удовлетворяет",
      notMeasured: "не измерено",
      measured: "{platform}, измерено {date}.",
    },
    warnings: {
      title: "Предупреждения Lagrix",
      none: "Предупреждений нет. Если проверки сети покажут, что мощности не хватает, предупреждение придёт в точку связи оператора и появится здесь; не добавите мощности вовремя — супер-узел уйдёт досрочно, без отметки.",
      deadline: "добавить мощности до {date}",
    },
    checks: { title: "Проверки агентами сети", none: "Итогов проверок пока нет.", passed: "пройдена", failed: "не пройдена" },
    payouts: {
      head: ["Дата", "Период", "За что", "Сумма, USDC", "Примечание", "Транзакция"],
      kinds: {
        pool: "Доля котла периода",
        search: "Плата за поиск",
        delivery: "Плата за доставку",
        "official-vote": "Голос о метке «Официальный»",
        "violation-reward": "Доказательство нарушения",
      },
      empty: "Выплат пока нет.",
      whatTitle: "За что начисляются выплаты",
      what: [],
    },
    settings: {
      countryLabel: "Страна оператора (ISO 3166-1, две буквы)",
      countryHint: "Законы этой страны супер-узел применяет как региональные ограничения; страна публикуется в его декларации вместе с точкой связи.",
      coverageLabel: "Покрытие — виды услуг (теги), которые вы принимаете в индекс",
      coverageHint: "Сверх тех видов, за которые супер-узел отвечает обязательно. Один тег в строке, например legal-advice.",
      regionalLabel: "Региональные запреты — теги, которые вы в индекс не берёте",
      regionalHint: "То, что запрещает закон вашей страны. Другие супер-узлы их всё равно покажут. Один тег в строке.",
      listsLabel: "Открытые списки ограничений, которые вы применяете",
      listsHint: "Подписанные списки тегов, которые может опубликовать любой; ссылки https://, по одной в строке.",
      defaultTitle: "Запрещено по умолчанию для всех супер-узлов",
      defaults: ["сексуальная эксплуатация детей", "торговля людьми", "терроризм и его финансирование", "оружие массового поражения", "насилие по найму", "украденные данные и доступы", "вредоносные программы"],
      defaultNote: "Этот список зафиксирован в версии протокола: супер-узел, показывающий такие объявления, не проходит минимум качества.",
      save: "Сохранить настройки",
      saved: "Сохранено на узле.",
      savedPushed: "Сохранено на узле и отправлено серверу супер-узла.",
      savedNotPushed: "Сохранено на узле; сервер супер-узла декларацию не принял.",
      declarationNote: "Декларацию супер-узел публикует документом информации (NIP-11) своего реле.",
    },
    pageDocs: {
      home: ["05-fees-and-reputation", "06-super-nodes-downtime-and-violations", "09-fee-distribution", "15-super-node-deployment-flow"],
      status: ["05-fees-and-reputation", "14-node-hardware-network", "15-super-node-deployment-flow"],
      notices: ["14-node-hardware-network", "15-super-node-deployment-flow", "06-super-nodes-downtime-and-violations"],
      payouts: ["09-fee-distribution", "17-discovery-ranking-feedback", "24-official-agents", "06-super-nodes-downtime-and-violations"],
      settings: ["17-discovery-ranking-feedback", "18-governance-protocols-council"],
    },
  },
}

// «За что начисляются выплаты» — те же пять пунктов, что «За что платят супер-узлу»: один список, без второй копии.
for (const l of ["en", "ru"] as const) UI[l].payouts.what = UI[l].income

export function superNodeUi(lang: string): SuperNodeWords {
  return lang === "ru" ? UI.ru : UI.en
}
