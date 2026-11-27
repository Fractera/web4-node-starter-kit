// Words of the node ID on the Passport (core step 862-11, Roma 2026-11-27, Telegram 1662). Resolved on the server, passed as a prop.

export type NodeIdentityWords = { title: string; text: string; show: string; loading: string; copy: string; copied: string; failed: string }

const UI: Record<string, NodeIdentityWords> = {
  en: {
    title: "Node ID",
    text: "The fingerprint of the node's public key. The node signs its calls to the marketplace store and its reports with this key, so the store knows the buyer is this node. The ID costs nothing and is not the Web3 wallet: the wallet holds money, this key only signs.",
    show: "Show the node ID",
    loading: "Reading…",
    copy: "Copy",
    copied: "Copied",
    failed: "The core did not answer — try again in a minute.",
  },
  ru: {
    title: "Идентификатор узла",
    text: "Отпечаток открытого ключа узла. Этим ключом узел подписывает запросы в магазин маркетплейса и свои отчёты, поэтому магазин знает, что покупает именно этот узел. Идентификатор бесплатный, и это не кошелёк Web3: на кошельке деньги, а этот ключ только подписывает.",
    show: "Показать идентификатор узла",
    loading: "Читаю…",
    copy: "Скопировать",
    copied: "Скопировано",
    failed: "Ядро не ответило — попробуйте через минуту.",
  },
}

export function nodeIdentityUi(lang: string): NodeIdentityWords {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
