// THE WORDS OF THE DOMAIN LADDER OF THE SERVER (node step 737-19) — chosen on the server, handed to the island as props (one language
// reaches the browser, `check:lang-delivery`). The owner, 2026-11-13: a quick way and an alternative, each «с короткими комментариями и
// примерами». 759: one way — the records by hand at the registrar; Cloudflare is named only as a fact (where the DNS lives, a proxy).

export type LadderStepId = "domain" | "where" | "who" | "records" | "ready"
export type LadderWay = "dns" | "none"

export type ServerLadderWords = {
  title: string
  lead: string
  locked: string
  step: Record<LadderStepId, string>
  domain: { label: string; placeholder: string; hint: string; submit: string; change: string; cancel: string; own: string; line: string; errors: Record<string, string> }
  run: Record<"saved" | "starting" | "running" | "failed", string>
  where: {
    checking: string; bought: string; paid: string; unknown: string; dns: string; cloudflare: string; none: string; changing: string
    leads: string; aKind: Record<"server" | "cloudflare" | "elsewhere" | "none" | "unknown", string>; mail: string; mailYes: string; mailNo: string
    live: string; sub: string; again: string
  }
  /** 759: one question — access to the registrar (`lib/hosting/launch-domain.mjs`) */
  who: { registrar: string; yes: string; no: string; option: Record<LadderWay, string>; note: Record<LadderWay, string>; copy: string; copied: string; instruction: string }
  records: {
    hereDns: string
    quick: { title: string; badge: string; stepsDns: string[]; at: string; star: string; conflicts: string }
    full: { title: string; text: string; example: string }
    table: { type: string; name: string; value: string; state: string; optional: string; copy: string; copied: string }
    state: Record<"ok" | "missing" | "elsewhere" | "aaaa" | "unknown" | "unchecked", string>
    check: string
    checkedAt: string
  }
  ready: { summary: string; certs: string; unchecked: string; issue: string; waiting: string }
}

const en: ServerLadderWords = {
  title: "Your domain for the server",
  lead: "The domain brings visitors straight to the server {ip}. The node finds out where the domain's records are kept and shows what to write and where.",
  locked: "Opens after the step above.",
  step: { domain: "The domain", where: "Where the domain's records live", who: "Who writes the records", records: "The records", ready: "Check and certificates" },
  domain: {
    label: "A domain or a subdomain",
    placeholder: "example.com",
    hint: "A subdomain works too, for example node.example.com: the site on the main domain then stays as it is.",
    submit: "Connect the domain",
    change: "Another domain",
    cancel: "Cancel",
    own: "This is the node's own domain.",
    line: "{zone} → server {ip}",
    errors: { "bad-domain": "That does not look like a domain: for example, example.com.", order: "Not now: a step is running on the server. Try again when it ends.", "node-has-domain": "This node already has its own domain.", active: "The domain is switched on: switch it off first.", network: "The node did not answer." },
  },
  run: {
    saved: "The domain is kept: the copy brings it to the server.",
    starting: "The server is taking the domain, up to a few minutes…",
    running: "The server is taking the domain, up to a few minutes…",
    failed: "The server did not take the domain:",
  },
  where: {
    checking: "The node is finding out where the domain's records live…",
    bought: "Bought at",
    paid: "paid until {date}",
    unknown: "this zone's registry does not name the seller",
    dns: "Its DNS records are kept by",
    cloudflare: "Cloudflare",
    none: "the domain has no name servers: it may be unpaid or not bought",
    changing: "The name servers are changing right now, and part of the internet still sees the old ones. This passes within {hours} h.",
    leads: "{name} now leads",
    aKind: { server: "to your server", cloudflare: "through Cloudflare's proxy (the orange cloud)", elsewhere: "to another address: {a}", none: "nowhere, no records yet", unknown: "DNS did not answer" },
    mail: "Mail",
    mailYes: "yes, {n} MX records. The site's records do not touch it.",
    mailNo: "none",
    live: "A site opens on {name} now: «{title}». After the switch it stops opening.",
    sub: "Take a subdomain instead",
    again: "Check again",
  },
  who: {
    registrar: "Do you have access to the domain's registrar?",
    yes: "Yes",
    no: "No",
    option: { dns: "At the registrar or the hosting", none: "I have no access" },
    note: {
      dns: "You write the records where the domain's DNS is kept.",
      none: "Without access to where DNS is kept the domain cannot be connected. Send the instruction to whoever has it: a couple of minutes for them.",
    },
    copy: "Copy the instruction",
    copied: "Copied",
    instruction: "Domain {zone}. In its DNS settings add two A records: name «{at}» with the value {ip}, and name «{star}» with the value {ip}. If a name of this domain already has an A or AAAA record, change its address to {ip} or delete it.",
  },
  records: {
    hereDns: "This domain's DNS is kept by {ns}. Usually that is the registrar's account{registrar}: a section called «DNS», «DNS records» or «Manage DNS».",
    quick: {
      title: "Quick way: two records",
      badge: "recommended",
      stepsDns: ["Open the domain's DNS section.", "Add the two records below and save. If the panel offers a proxy for a record, switch it off.", "Come back and press «Check DNS». A new record usually shows within minutes."],
      at: "is {name} itself",
      star: "is any address inside it: {example}, and every element that appears later",
      conflicts: "Separate records already lead elsewhere: {names}. Change their address to {ip} or delete them: a separate record beats the star.",
    },
    full: {
      title: "Alternative: every name as its own record",
      text: "If the registrar does not accept «*», add a record for every name. They are all alike: type A, value {ip}.",
      example: "For example: type A, name auth, value {ip} opens auth.{name}.",
    },
    table: { type: "Type", name: "Name", value: "Value", state: "Now", optional: "optional", copy: "Copy", copied: "Copied" },
    state: { ok: "points here", missing: "no record", elsewhere: "points elsewhere", aaaa: "remove the AAAA record", unknown: "DNS did not answer", unchecked: "not checked" },
    check: "Check DNS",
    checkedAt: "checked {time}",
  },
  ready: {
    summary: "Point at the server: {p} of {n} names.",
    certs: "Certificates: {c} of {p}. The server issues one itself as soon as a name points here.",
    unchecked: "Once the records are written, press «Check DNS».",
    issue: "Issue certificates",
    waiting: "Waiting for a certificate: {names}.",
  },
}

const ru: ServerLadderWords = {
  title: "Свой домен для сервера",
  lead: "Домен приведёт посетителей прямо на сервер {ip}. Узел сам выяснит, где хранятся записи домена, и покажет, что и куда вписать.",
  locked: "Откроется после шага выше.",
  step: { domain: "Домен", where: "Где живут записи домена", who: "Кто внесёт записи", records: "Записи", ready: "Проверка и сертификаты" },
  domain: {
    label: "Домен или поддомен",
    placeholder: "example.com",
    hint: "Подойдёт и поддомен, например node.example.com: тогда сайт на основном домене останется как есть.",
    submit: "Подключить домен",
    change: "Другой домен",
    cancel: "Отмена",
    own: "Это собственный домен узла.",
    line: "{zone} → сервер {ip}",
    errors: { "bad-domain": "Это не похоже на домен: например, example.com.", order: "Сейчас нельзя: на сервере идёт шаг. Попробуйте, когда он закончится.", "node-has-domain": "У этого узла уже есть свой домен.", active: "Домен включён: сначала выключите его.", network: "Узел не ответил." },
  },
  run: {
    saved: "Домен сохранён: копия передаст его серверу.",
    starting: "Сервер принимает домен, это займёт до нескольких минут…",
    running: "Сервер принимает домен, это займёт до нескольких минут…",
    failed: "Сервер не принял домен:",
  },
  where: {
    checking: "Узел выясняет, где живут записи домена…",
    bought: "Куплен у",
    paid: "оплачен до {date}",
    unknown: "реестр этой зоны не называет продавца",
    dns: "DNS-записи ведёт",
    cloudflare: "Cloudflare",
    none: "у домена нет серверов имён: возможно, он не оплачен или не куплен",
    changing: "Серверы имён сейчас меняются, и часть интернета ещё видит прежние. Это проходит за {hours} ч.",
    leads: "Сейчас {name} ведёт",
    aKind: { server: "на ваш сервер", cloudflare: "через прокси Cloudflare (оранжевое облако)", elsewhere: "на другой адрес: {a}", none: "никуда, записей пока нет", unknown: "DNS не ответил" },
    mail: "Почта",
    mailYes: "есть, записей MX: {n}. Записи сайта её не трогают.",
    mailNo: "нет",
    live: "По {name} сейчас открывается сайт «{title}». После переключения он перестанет открываться.",
    sub: "Взять поддомен",
    again: "Проверить ещё раз",
  },
  who: {
    registrar: "Есть ли у вас доступ к регистратору домена?",
    yes: "Да",
    no: "Нет",
    option: { dns: "У регистратора или хостинга", none: "Нет доступа" },
    note: {
      dns: "Записи внесёте там, где ведётся DNS домена.",
      none: "Без доступа туда, где ведётся DNS, домен не подключить. Отправьте инструкцию тому, у кого доступ: ему хватит пары минут.",
    },
    copy: "Скопировать инструкцию",
    copied: "Скопировано",
    instruction: "Домен {zone}. В настройках DNS добавьте две записи типа A: имя «{at}» со значением {ip} и имя «{star}» со значением {ip}. Если у какого-то имени этого домена уже есть запись A или AAAA, поменяйте её адрес на {ip} или удалите.",
  },
  records: {
    hereDns: "DNS этого домена ведут серверы {ns}. Обычно это кабинет регистратора{registrar}: раздел «DNS», «DNS-записи» или «Управление DNS».",
    quick: {
      title: "Быстрый способ: две записи",
      badge: "рекомендуем",
      stepsDns: ["Откройте раздел DNS домена.", "Добавьте две записи ниже и сохраните. Если панель предлагает прокси для записи, выключите его.", "Вернитесь сюда и нажмите «Проверить DNS». Новая запись обычно видна через несколько минут."],
      at: "это сам {name}",
      star: "любой адрес внутри: {example} и каждый элемент, который появится потом",
      conflicts: "Отдельные записи уже ведут в другое место: {names}. Поменяйте их адрес на {ip} или удалите: отдельная запись сильнее звёздочки.",
    },
    full: {
      title: "Альтернатива: каждое имя отдельной записью",
      text: "Если регистратор не принимает «*», внесите запись на каждое имя. Все они одинаковые: тип A, значение {ip}.",
      example: "Например, тип A, имя auth, значение {ip}: так откроется auth.{name}.",
    },
    table: { type: "Тип", name: "Имя", value: "Значение", state: "Сейчас", optional: "по желанию", copy: "Скопировать", copied: "Скопировано" },
    state: { ok: "ведёт сюда", missing: "нет записи", elsewhere: "ведёт в другое место", aaaa: "уберите запись AAAA", unknown: "DNS не ответил", unchecked: "не проверено" },
    check: "Проверить DNS",
    checkedAt: "проверено {time}",
  },
  ready: {
    summary: "Ведут на сервер: {p} из {n} имён.",
    certs: "Сертификаты: {c} из {p}. Сервер выпускает сертификат сам, как только имя ведёт сюда.",
    unchecked: "Когда записи будут внесены, нажмите «Проверить DNS».",
    issue: "Выпустить сертификаты",
    waiting: "Ждут сертификата: {names}.",
  },
}

export function serverLadderWords(lang: string): ServerLadderWords {
  return lang === "ru" ? ru : en
}
