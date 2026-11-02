// ССЫЛКИ НА ДОКУМЕНТЫ LAGRIX (531, слово владельца 2026-10-18: «Все вещи которые ты рассказываешь должны ссылаться на соответствующую
// страницу документации Lagrix»). Один справочник на ядро: имя документа (как его называет репозиторий lagrix-dev/lagrix) и подпись.
// Страница документа — на lagrix.dev, на языке страницы ядра (en или ru).

export type LagrixDoc =
  | "04-escrow-contract" | "05-fees-and-reputation" | "06-super-nodes-downtime-and-violations" | "08-account-abstraction-bundler"
  | "09-fee-distribution" | "14-node-hardware-network" | "15-super-node-deployment-flow" | "17-discovery-ranking-feedback"
  | "18-governance-protocols-council" | "19-node-requirements" | "20-f2f-element-exchange" | "23-spam-and-the-price-of-a-first-contact"
  | "24-official-agents" | "26-developer-share"

const LABELS: Record<LagrixDoc, Record<"en" | "ru", string>> = {
  "04-escrow-contract": { en: "Escrow", ru: "Эскроу" },
  "05-fees-and-reputation": { en: "Fees and reputation", ru: "Комиссия и репутация" },
  "06-super-nodes-downtime-and-violations": { en: "Downtime and proven violations", ru: "Простой и доказанные нарушения" },
  "08-account-abstraction-bundler": { en: "Gas and account abstraction", ru: "Газ и абстракция аккаунта" },
  "09-fee-distribution": { en: "The deal fee", ru: "Комиссия сделки" },
  "14-node-hardware-network": { en: "Super-node hardware", ru: "Оборудование супер-узла" },
  "15-super-node-deployment-flow": { en: "A super-node place and the operator API", ru: "Место супер-узла и API оператора" },
  "17-discovery-ranking-feedback": { en: "Discovery, search fee and restrictions", ru: "Обнаружение, плата за поиск и ограничения" },
  "18-governance-protocols-council": { en: "Protocols and declaration", ru: "Протоколы и декларация" },
  "19-node-requirements": { en: "What any node needs: the wallet", ru: "Что нужно узлу: кошелёк" },
  "20-f2f-element-exchange": { en: "F2F element exchange", ru: "Обмен элементами F2F" },
  "23-spam-and-the-price-of-a-first-contact": { en: "The price of a first contact", ru: "Цена первого контакта" },
  "24-official-agents": { en: "The Official mark", ru: "Метка «Официальный»" },
  "26-developer-share": { en: "The developer share", ru: "Доля разработчика" },
}

const L = (lang: string): "en" | "ru" => (lang === "ru" ? "ru" : "en")

export function lagrixDocHref(lang: string, doc: LagrixDoc): string {
  return `https://lagrix.dev/${L(lang)}/docs/${doc}`
}

/** «Документ 26 — Доля разработчика» / «Document 26 — The developer share». */
export function lagrixDocLabel(lang: string, doc: LagrixDoc): string {
  const n = String(Number(doc.slice(0, 2)))
  return `${L(lang) === "ru" ? "Документ" : "Document"} ${n} — ${LABELS[doc][L(lang)]}`
}

/** Пункт с основанием: текст и документы Lagrix, на которые он опирается. */
export type DocItem = { text: string; docs: LagrixDoc[] }
