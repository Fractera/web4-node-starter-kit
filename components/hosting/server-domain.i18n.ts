// THE WORDS OF THE DOMAIN ON THE SERVER (node step 737-8) — chosen on the server, handed to the island as props (one language reaches the
// browser, `check:lang-delivery`). Russian follows the owner's own words where he said them (2026-11-13).

type Steps = "domain" | "dns" | "certs" | "check" | "active"

export type ServerDomainWords = {
  title: string
  lead: string
  readOnly: string
  loading: string
  locked: string
  step: Record<Steps, string>
  domainLabel: string
  domainHint: string
  domainSave: string
  dnsText: string
  dnsCheck: string
  checkedAt: string
  dnsState: Record<"ok" | "missing" | "elsewhere" | "aaaa" | "unknown" | "unchecked", string>
  table: { zone: string; type: string; name: string; value: string; state: string; optional: string; wildcard: string }
  certsText: string
  certsButton: string
  certsRunning: string
  certState: Record<"ok" | "expiring" | "missing" | "unknown", string>
  daysLeft: string
  own: string
  noHelper: string
  uploadToggle: string
  uploadHost: string
  uploadChain: string
  uploadKey: string
  uploadSend: string
  checkText: string
  checkButton: string
  httpsOk: string
  httpsFail: string
  activeText: string
  activate: string
  activeOn: string
  deactivate: string
  refused: string
  reason: Record<string, string>
}

const en: ServerDomainWords = {
  title: "The domain of the node on its server",
  lead: "The node answers by its IP now. Give it a domain: records at the registrar, a certificate for every name, a check from the internet — then switch it on.",
  readOnly: "Read-only view. The steps are run by the architect: `npm run server -- window` on the computer the node came from, or the main agent in Telegram.",
  loading: "Asking the server…",
  locked: "opens after the step above",
  step: { domain: "The domain", dns: "Records at the registrar", certs: "Certificates", check: "HTTPS from the internet", active: "Switch on" },
  domainLabel: "Domain",
  domainHint: "Without https:// and www — for example example.org. It can be changed until it is switched on.",
  domainSave: "Save",
  dnsText: "Write these records at the registrar of each domain: every name points at the server's IP. Then check — the answer comes from public DNS, not from this server; a new record may take minutes to an hour.",
  dnsCheck: "Check DNS",
  checkedAt: "Checked:",
  dnsState: { ok: "points here", missing: "no record", elsewhere: "points elsewhere", aaaa: "remove the AAAA record", unknown: "DNS did not answer", unchecked: "not checked" },
  table: { zone: "Domain {zone}", type: "Type", name: "Name", value: "Value", state: "State", optional: "optional", wildcard: "Or one line for every subdomain (the @ line is still needed):" },
  certsText: "A free Let's Encrypt certificate for every name whose DNS points here — about a minute per name. A name that fails does not stop the others.",
  certsButton: "Check and add the missing",
  certsRunning: "Issuing certificates…",
  certState: { ok: "certificate", expiring: "expires soon", missing: "no certificate", unknown: "—" },
  daysLeft: "{n} d.",
  own: "own",
  noHelper: "The server's root helper did not answer — its certificates cannot be read.",
  uploadToggle: "Upload my own certificate instead",
  uploadHost: "Name",
  uploadChain: "Certificate chain (fullchain.pem)",
  uploadKey: "Private key (privkey.pem)",
  uploadSend: "Upload",
  checkText: "Every name is opened by HTTPS from the internet with a strict certificate check.",
  checkButton: "Check HTTPS",
  httpsOk: "answers",
  httpsFail: "does not answer",
  activeText: "The panel moves to https://{architect}, sign-in to auth.{zone}, search engines get the permanent address, and the bare IP sends visitors to the domain. Elements that remember old addresses rebuild beside the running ones.",
  activate: "Switch on",
  activeOn: "The domain is on: {url}",
  deactivate: "Back to the IP",
  refused: "Refused:",
  reason: {
    "bad-domain": "that is not a domain name", active: "switch the domain off first", "no-domain": "save the domain first", "check-first": "every name must answer by HTTPS first",
    "nginx-refused": "nginx refused the new site — the previous one stays", "upload-refused": "the key does not match the certificate", "bad-pem": "both parts must be PEM text",
    "unknown-host": "that name is not one of the node's", "public-address": "this address is read-only", "not-on-server": "the node does not live on this server",
  },
}

const ru: ServerDomainWords = {
  title: "Домен узла на его сервере",
  lead: "Сейчас узел отвечает по IP. Дайте ему домен: записи у регистратора, сертификат на каждое имя, проверка из интернета — и включение.",
  readOnly: "Только просмотр. Шаги выполняет архитектор: `npm run server -- window` на компьютере, откуда узел переехал, или главный агент в Telegram.",
  loading: "Спрашиваю сервер…",
  locked: "откроется после шага выше",
  step: { domain: "Домен", dns: "Записи у регистратора", certs: "Сертификаты", check: "HTTPS из интернета", active: "Включение" },
  domainLabel: "Домен",
  domainHint: "Без https:// и www — например example.org. Его можно сменить, пока он не включён.",
  domainSave: "Сохранить",
  dnsText: "Пропишите эти записи у регистратора каждого домена: каждое имя ведёт на IP сервера. Потом проверьте — ответ берётся из публичного DNS, а не с этого сервера; новая запись расходится от минут до часа.",
  dnsCheck: "Проверить DNS",
  checkedAt: "Проверено:",
  dnsState: { ok: "ведёт сюда", missing: "нет записи", elsewhere: "ведёт в другое место", aaaa: "уберите запись AAAA", unknown: "DNS не ответил", unchecked: "не проверено" },
  table: { zone: "Домен {zone}", type: "Тип", name: "Имя", value: "Значение", state: "Состояние", optional: "по желанию", wildcard: "Или одной строкой для всех поддоменов (строка @ всё равно нужна):" },
  certsText: "Бесплатный сертификат Let's Encrypt на каждое имя, чей DNS ведёт сюда, — около минуты на имя. Имя со сбоем не останавливает остальные.",
  certsButton: "Проверить и дополнить",
  certsRunning: "Выпускаю сертификаты…",
  certState: { ok: "сертификат", expiring: "скоро истекает", missing: "нет сертификата", unknown: "—" },
  daysLeft: "{n} дн.",
  own: "свой",
  noHelper: "Помощник root на сервере не ответил — сертификаты не прочитать.",
  uploadToggle: "Загрузить свой сертификат",
  uploadHost: "Имя",
  uploadChain: "Цепочка сертификата (fullchain.pem)",
  uploadKey: "Закрытый ключ (privkey.pem)",
  uploadSend: "Загрузить",
  checkText: "Каждое имя открывается по HTTPS из интернета, со строгой проверкой сертификата.",
  checkButton: "Проверить HTTPS",
  httpsOk: "отвечает",
  httpsFail: "не отвечает",
  activeText: "Панель переедет на https://{architect}, вход — на auth.{zone}, поисковики получат постоянный адрес, а голый IP будет отправлять на домен. Элементы, помнящие старые адреса, пересоберутся рядом с работающими.",
  activate: "Включить",
  activeOn: "Домен включён: {url}",
  deactivate: "Вернуться на IP",
  refused: "Отказ:",
  reason: {
    "bad-domain": "это не имя домена", active: "сначала выключите домен", "no-domain": "сначала сохраните домен", "check-first": "сначала каждое имя должно ответить по HTTPS",
    "nginx-refused": "nginx отверг новый сайт — остался прежний", "upload-refused": "ключ не подходит к сертификату", "bad-pem": "обе части — текст PEM",
    "unknown-host": "такого имени у узла нет", "public-address": "этот адрес только для чтения", "not-on-server": "узел не живёт на этом сервере",
  },
}

export function serverDomainWords(lang: string): ServerDomainWords {
  return lang === "ru" ? ru : en
}
