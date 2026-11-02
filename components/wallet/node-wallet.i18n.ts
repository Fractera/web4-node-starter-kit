import type { DocItem, LagrixDoc } from "@/lib/lagrix-docs"

// СЛОВА КОШЕЛЬКА УЗЛА (478-3; 530-1 вынесены из `sections/blocks/node-passport.server.tsx`). Кошелёк один на узел (документ Lagrix 19)
// и настраивается из четырёх мест — главная «Паспорта», «Паспорт → Главный кошелёк», «Настройки → Платежи → Web3» главного агента и
// каждого элемента; слова у всех одни. `en` основа, `ru` перевод.
// 533 (владелец 2026-10-18: «сильное расхождение о том на чем зарабатывают пользователи»): кошелёк говорит прежде всего, ЧТО на него
// ПОСТУПАЕТ, и только потом — что из него платится; у каждого пункта документ Lagrix (слово владельца 532). Деление комиссии — запись 51
// в обоих случаях (ответ владельца 2026-10-18: «Оставить запись 51»).

export type NodeWalletWords = {
  lang: "en" | "ru"
  title: string
  lead: string
  leadDocs: LagrixDoc[]
  connected: string
  placeholder: string
  connect: string
  disconnect: string
  badAddress: string
  failed: string
  loading: string
  beforeTitle: string
  before: DocItem[]
  incomeTitle: string
  income: DocItem[]
  costsTitle: string
  costs: DocItem[]
  // 532: создание ключа на узле, резервная копия, кошелёк элемента
  elementTitle: string
  temporaryAddress: string
  or: string
  generate: string
  generateNote: string
  generatedNote: string
  addressNote: string
  backup: string
  removeWarning: string
  removeYes: string
  cancel: string
  ownWallet: string
  removeOwn: string
  inheritsNode: string
  noNodeWallet: string
  nodeWalletLink: string
  addOwn: string
  /** 553-6: единый проект — кошелёк один, у элемента своего нет. */
  oneWallet: string
  ownNote: string
  afterRemove: string
}

const D = (text: string, ...docs: LagrixDoc[]): DocItem => ({ text, docs })

const UI: Record<"en" | "ru", NodeWalletWords> = {
  en: {
    lang: "en",
    title: "Node wallet",
    lead: "The wallet is the node's key and account in one: it is created free in any Ethereum wallet app, with no sign-up anywhere, and its address is the node's name in the network. Every payment of the node's elements goes through it and is recorded for the element and agent that earned it.",
    leadDocs: ["19-node-requirements"],
    connected: "Connected:",
    placeholder: "Wallet address, 0x…",
    connect: "Connect",
    disconnect: "Disconnect",
    badAddress: "This is not a wallet address: it starts with 0x and has 40 more characters, 0–9 and a–f.",
    failed: "The node did not save the wallet. Try again.",
    loading: "Asking the node about its wallet…",
    beforeTitle: "Without a wallet",
    before: [
      D("The node works on your computer, but it is not in the Lagrix network: its agents cannot be found, do not search through super-nodes and cannot be paid.", "19-node-requirements"),
      D("A wallet costs nothing: any Ethereum wallet app creates one in a minute, and there is no one to register with.", "19-node-requirements"),
    ],
    incomeTitle: "What comes into the wallet",
    income: [
      D("Payment for your agents' work. When a provider agent of your element delivers, the escrow sends the network part of the deal to the wallet, less the 5% fee. The fee goes to the super-nodes; when the element was received over F2F, 1% of the deal out of that fee goes to the element's author.", "04-escrow-contract", "09-fee-distribution", "26-developer-share"),
      D("The developer share. When another project received your element over F2F and works with it, 1% of each of its deals (20% of the fee) comes to you, for as long as the element is used.", "26-developer-share", "20-f2f-element-exchange"),
      D("Selling an element over F2F. Another Fractera project pays for your element with the same escrow deal: the price you set, less the fee.", "20-f2f-element-exchange"),
      D("The first-contact rate. Whoever writes to your agent or to you for the first time pays your rate (Messenger → Settings, $1 by default) — once, when the request is read, and it is not returned on a no.", "23-spam-and-the-price-of-a-first-contact"),
      D("If the node holds a super-node place — the super-node's income: its share of the period's fee pool, $0.01 per result list, $0.001 per delivered message, about $11 per vote on the Official mark, a reward for proving a violation. Details are in the Super node section.", "05-fees-and-reputation", "09-fee-distribution", "24-official-agents"),
    ],
    costsTitle: "What the wallet pays",
    costs: [
      D("A search: $0.01 per result list, one price for everyone.", "17-discovery-ranking-feedback"),
      D("A message through a super-node: $0.001; a direct message is free.", "17-discovery-ranking-feedback", "23-spam-and-the-price-of-a-first-contact"),
      D("The gas of its own transactions: in ether, or in USDC through a third-party paymaster.", "08-account-abstraction-bundler"),
    ],
    elementTitle: "Element wallet",
    temporaryAddress: "Wallets are changed only on this computer or on your own domain, not through the temporary address.",
    or: "or",
    generate: "Generate a wallet",
    generateNote: "Generating creates the wallet's key right here, on this node: the node will sign with it. The key never goes to the browser — only into a backup file you download yourself.",
    generatedNote: "Created on this node: the key is kept in the node's data, outside git. Download a backup and keep it offline — whoever knows the key controls the money on this wallet.",
    addressNote: "Connected by address: payments come to this wallet, but the node cannot sign with it.",
    backup: "Download the key backup",
    removeWarning: "The wallet stops being used. Its key is not erased: the node keeps it in the wallet-removed folder of its data. Make sure you have a backup.",
    removeYes: "Remove the wallet",
    cancel: "Cancel",
    ownWallet: "The element's own wallet:",
    removeOwn: "Remove own wallet",
    inheritsNode: "The element works with the node wallet:",
    noNodeWallet: "The node has no wallet yet, so there is nothing to inherit.",
    nodeWalletLink: "Node wallet",
    addOwn: "Add its own wallet",
    oneWallet: "This node is a single project: it has one wallet, the node's. Every element uses it.",
    ownNote: "The network sees an element with its own wallet as a separate node: the wallet's address is a node's name.",
    afterRemove: "Removing the own wallet returns the element to the node wallet",
  },
  ru: {
    lang: "ru",
    title: "Кошелёк узла",
    lead: "Кошелёк — ключ узла и его счёт в одном: создаётся бесплатно в любом приложении-кошельке Ethereum, ни у кого регистрироваться не нужно, а его адрес и есть имя узла в сети. Через него идут все платежи элементов узла, и каждый записан за тем элементом и агентом, который его заработал.",
    leadDocs: ["19-node-requirements"],
    connected: "Подключён:",
    placeholder: "Адрес кошелька, 0x…",
    connect: "Подключить",
    disconnect: "Отключить",
    badAddress: "Это не адрес кошелька: он начинается с 0x, и за ним идут ещё 40 знаков — цифры 0–9 и буквы a–f.",
    failed: "Узел не сохранил кошелёк. Попробуйте ещё раз.",
    loading: "Спрашиваю узел о его кошельке…",
    beforeTitle: "Без кошелька",
    before: [
      D("Узел работает на вашем компьютере, но в сети Lagrix его нет: его агентов нельзя найти, сами они не ищут через супер-узлы, и заплатить им нельзя.", "19-node-requirements"),
      D("Кошелёк ничего не стоит: любое приложение-кошелёк Ethereum создаёт его за минуту, и ни у кого регистрироваться не нужно.", "19-node-requirements"),
    ],
    incomeTitle: "Что поступает на кошелёк",
    income: [
      D("Оплата работы ваших агентов. Когда агент-исполнитель вашего элемента сдал работу, эскроу переводит на кошелёк сетевую часть сделки за вычетом комиссии 5 %. Комиссия идёт супер-узлам; если элемент получен по F2F, из неё 1 % сделки получает автор элемента.", "04-escrow-contract", "09-fee-distribution", "26-developer-share"),
      D("Доля разработчика. Если другой проект получил ваш элемент по F2F и работает им, с каждой его сделки вам приходит 1 % (20 % комиссии) — всё время, пока элементом пользуются.", "26-developer-share", "20-f2f-element-exchange"),
      D("Продажа элемента по F2F. Другой проект Fractera платит за ваш элемент той же сделкой с эскроу: назначенная вами цена за вычетом комиссии.", "20-f2f-element-exchange"),
      D("Тариф первого контакта. Тот, кто впервые пишет вашему агенту или вам, платит ваш тариф («Messenger → Настройки», по умолчанию $1) — один раз, когда обращение прочитано, и при «нет» он не возвращается.", "23-spam-and-the-price-of-a-first-contact"),
      D("Если узел держит место супер-узла — доход супер-узла: доля котла комиссий периода, $0,01 за выдачу, $0,001 за доставленное сообщение, около $11 за голос о метке «Официальный», награда за доказанное нарушение. Подробно — в разделе «Супер узел».", "05-fees-and-reputation", "09-fee-distribution", "24-official-agents"),
    ],
    costsTitle: "Что платится из кошелька",
    costs: [
      D("Поиск: $0,01 за выдачу, одна цена для всех.", "17-discovery-ranking-feedback"),
      D("Сообщение через супер-узел: $0,001; прямое сообщение бесплатно.", "17-discovery-ranking-feedback", "23-spam-and-the-price-of-a-first-contact"),
      D("Газ своих транзакций: эфиром или в USDC через сторонний Paymaster.", "08-account-abstraction-bundler"),
    ],
    elementTitle: "Кошелёк элемента",
    temporaryAddress: "Кошелёк меняется только на этом компьютере или на вашем домене, не через временный адрес.",
    or: "или",
    generate: "Сгенерировать кошелёк",
    generateNote: "Генерация создаёт ключ кошелька прямо здесь, на узле: узел будет им подписывать. В браузер ключ не уходит — только в файл резервной копии, который вы скачиваете сами.",
    generatedNote: "Создан на этом узле: ключ хранится в данных узла, вне git. Скачайте резервную копию и храните её вне сети — кто знает ключ, тот распоряжается деньгами на кошельке.",
    addressNote: "Подключён адресом: платежи приходят на этот кошелёк, но подписывать им узел не может.",
    backup: "Скачать резервную копию ключа",
    removeWarning: "Кошелёк перестанет использоваться. Ключ не стирается: узел сохранит его в папке wallet-removed своих данных. Убедитесь, что резервная копия у вас есть.",
    removeYes: "Снять кошелёк",
    cancel: "Отмена",
    ownWallet: "Свой кошелёк элемента:",
    removeOwn: "Удалить свой кошелёк",
    inheritsNode: "Элемент работает кошельком узла:",
    noNodeWallet: "У узла пока нет кошелька — наследовать нечего.",
    nodeWalletLink: "Кошелёк узла",
    addOwn: "Добавить свой кошелёк",
    oneWallet: "Узел — единый проект: кошелёк один — кошелёк узла, им пользуются все элементы.",
    ownNote: "Элемент со своим кошельком сеть видит отдельным узлом: адрес кошелька — имя узла.",
    afterRemove: "Удалив свой кошелёк, элемент снова работает кошельком узла",
  },
}

export function nodeWalletUi(lang: string): NodeWalletWords {
  return lang === "ru" ? UI.ru : UI.en
}
