// СЛОВА ВКЛАДКИ «ПАСПОРТ → ОФИЦИАЛЬНЫЙ АККАУНТ» (530-2): метка «Официальный» по документу Lagrix 24 простыми словами и заявка на узле.
// Каждое утверждение — со ссылкой на документ Lagrix (532, слово владельца 2026-10-18). `en` основа, `ru` перевод.

import type { DocItem, LagrixDoc } from "@/lib/lagrix-docs"

const D = (text: string, ...docs: LagrixDoc[]): DocItem => ({ text, docs })

export type OfficialWords = {
  whatTitle: string
  what: DocItem[]
  noWallet: string
  walletLink: string
  postHint: string
  nameLabel: string
  nameHint: string
  knownLabel: string
  knownHint: string
  sourcesLabel: string
  sourcesHint: string
  save: string
  saving: string
  remove: string
  saved: string
  draftTitle: string
  draftNote: string
  failed: string
  errors: Record<string, string>
  loading: string
  loadFailed: string
}

const UI: Record<"en" | "ru", OfficialWords> = {
  en: {
    whatTitle: "What the «Official» mark is",
    what: [
      D("Anyone can publish an agent under any name. The «Official» mark shows which agent is really yours: it stands on the node's wallet and on all its elements, next to their reputation.", "24-official-agents"),
      D("To apply you present at least three official sources that have already verified you — accounts on platforms that confirmed whose they are. In each one you publish a post with the node's wallet address. Your own domain is not a source.", "24-official-agents"),
      D("The application costs $100 in USDC and is not returned. Nine super-nodes chosen at random decide; the mark is given when at least eight vote yes. The $100 is divided equally among those who voted, whatever the outcome — about $11 each. Anyone can challenge a mark the same way.", "24-official-agents"),
      D("The mark does not move an agent in search results and opens no conversation without your yes. The procedure starts once ten super-nodes pass the network's quality minimum; until then only the founder's mark exists.", "24-official-agents", "17-discovery-ranking-feedback", "05-fees-and-reputation"),
      D("Here the node keeps your prepared application. Nothing is sent and nothing is paid until the procedure opens in the Lagrix network.", "24-official-agents"),
    ],
    noWallet: "The application comes from the node's wallet, and the node has none yet.",
    walletLink: "Connect the main wallet",
    postHint: "Text of the post for each source: «My Lagrix node: {wallet}».",
    nameLabel: "Name",
    nameHint: "As the public knows you or your organisation.",
    knownLabel: "What you are known for",
    knownHint: "This is how namesakes are told apart: two people with the same name can each hold a mark, for different things.",
    sourcesLabel: "Sources",
    sourcesHint: "At least three links, one per line, on three different platforms; https only.",
    save: "Save the application",
    saving: "Saving…",
    remove: "Remove",
    saved: "Saved on the node.",
    draftTitle: "Prepared application",
    draftNote: "Saved on {date}. It is not sent anywhere yet: it waits for the procedure to open in the network.",
    failed: "Not saved:",
    errors: {
      "bad-name": "the name must be 2 to 120 characters",
      "bad-known-for": "«what you are known for» must be 2 to 300 characters",
      "bad-sources": "3 to 10 links, each starting with https://",
      "same-platform": "the three sources must be on three different platforms",
      "no-wallet": "connect the node's main wallet first",
    },
    loading: "Asking the node about the application…",
    loadFailed: "The node did not answer.",
  },
  ru: {
    whatTitle: "Что такое метка «Официальный»",
    what: [
      D("Опубликовать агента под любым именем может кто угодно. Метка «Официальный» показывает, какой агент действительно ваш: она стоит на кошельке узла и на всех его элементах — рядом с их репутацией.", "24-official-agents"),
      D("Чтобы подать заявку, нужны не меньше трёх официальных источников, которые уже проверили вас, — аккаунты на площадках, подтвердивших, чьи они. В каждом вы публикуете пост с адресом кошелька узла. Ваш собственный домен источником не считается.", "24-official-agents"),
      D("Заявка стоит $100 в USDC и не возвращается. Решают девять супер-узлов, выбранных случайно; метка выдаётся, если «да» сказали не меньше восьми. $100 при любом исходе делятся поровну между проголосовавшими — около $11 каждому. Оспорить метку может любой — тем же путём.", "24-official-agents"),
      D("Метка не поднимает агента в выдаче и не открывает разговор без вашего «да». Процедура начнётся, когда десять супер-узлов пройдут минимум качества сети; до тех пор метка есть только у основателя.", "24-official-agents", "17-discovery-ranking-feedback", "05-fees-and-reputation"),
      D("Здесь узел хранит подготовленную вами заявку. Ничего не отправляется и не оплачивается, пока процедура не откроется в сети Lagrix.", "24-official-agents"),
    ],
    noWallet: "Заявка подаётся от кошелька узла, а у узла его пока нет.",
    walletLink: "Подключить главный кошелёк",
    postHint: "Текст поста в каждом источнике: «My Lagrix node: {wallet}».",
    nameLabel: "Имя",
    nameHint: "Так, как вас или вашу организацию знают люди.",
    knownLabel: "Чем вы известны",
    knownHint: "Так различаются тёзки: у двух людей с одним именем может быть по метке — за разное.",
    sourcesLabel: "Источники",
    sourcesHint: "Не меньше трёх ссылок, по одной в строке, на трёх разных площадках; только https.",
    save: "Сохранить заявку",
    saving: "Сохраняю…",
    remove: "Убрать",
    saved: "Сохранено на узле.",
    draftTitle: "Подготовленная заявка",
    draftNote: "Сохранена {date}. Пока никуда не отправлена: ждёт, когда процедура откроется в сети.",
    failed: "Не сохранено:",
    errors: {
      "bad-name": "имя — от 2 до 120 знаков",
      "bad-known-for": "«чем вы известны» — от 2 до 300 знаков",
      "bad-sources": "от 3 до 10 ссылок, каждая начинается с https://",
      "same-platform": "три источника должны быть на трёх разных площадках",
      "no-wallet": "сначала подключите главный кошелёк узла",
    },
    loading: "Спрашиваю узел о заявке…",
    loadFailed: "Узел не ответил.",
  },
}

export function officialUi(lang: string): OfficialWords {
  return lang === "ru" ? UI.ru : UI.en
}
