// THE WORDS OF «ЗАПУСТИТЬ СЕРВЕР» (node step 738) — chosen on the server, handed to the island as props (one language reaches the browser,
// `check:lang-delivery`). Russian are the owner's own words where he said them (2026-11-14): «проверка сервера → активация домена (…
// первая проверка) → процесс установки сервера → повторной проверки учётных записей … если не видны то мы не можем перейти к шагу …
// проверка установка и обновления сертификатов безопасности который должен заканчиваться чек листом … Только после этого … сообщаешь
// пользователю о том что его сервер готов».

export type LaunchStep = "server" | "check" | "domain" | "install" | "recheck" | "certs" | "ready"
type Verdict = "ok" | "warn" | "fail"

export type ServerLaunchWords = {
  title: string
  lead: string
  readOnly: string
  /** 741-6, D36: a live server this computer launched — `{url}` is its address */
  launchedOn: string
  host: string
  port: string
  password: string
  passwordNote: string
  connect: string
  connecting: string
  another: string
  locked: string
  step: Record<LaunchStep, string>
  /** 744-7: one line of what a done step did, shown while it is closed — `{host}` `{time}` `{head}`, `{ok}` of `{all}` required names */
  summary: { server: string; clean: string; related: string; warn: string; install: string; recheck: string; certs: string }
  connected: string
  /** 744-3: access for one day — `{time}` the deadline in the person's own clock */
  access: { until: string; close: string; closing: string }
  /** 744-3, D45: the server's own panel through an SSH window opened from this page while the access lasts — `{url}` its address */
  window: { open: string; opening: string; link: string; note: string }
  errors: Record<string, string>
  changed: { title: string; text: string; seen: string; pinned: string; trust: string }
  verdict: Record<Verdict, string>
  item: Record<string, string>
  fractera: { none: string; there: string; behind: string; latest: string; unknown: string; launching: string }
  strategy: { install: string; update: string; latest: string; running: string; clear: string }
  /** 744-4 (D49): what the server is to this node, and why */
  relation: { clean: string; related: string; unrelated: string }
  reason: Record<"moved" | "other-fork" | "no-origin" | "other-nodes" | "foreign-sites" | "root-programs", string>
  /** 743-4: the trial merge of the update on the server, before the button. `{files}` — where it would stop. */
  preflight: { ok: string; stop: string; unknown: string }
  recheckServer: string
  domainNote: string
  /** 744-7: `silent` — Fractera stands there, its node does not answer yet (the next step waits for it); `ask` reads the server again */
  install: { text: string; install: string; update: string; again: string; running: string; done: string; failed: string; leave: string; silent: string; ask: string }
  stage: Record<string, string>
  recheck: { text: string; button: string; gate: string; noDomain: string }
  certs: { budget: string; limit: string; checklist: string; name: string; dns: string; cert: string; https: string; httpsButton: string }
  ready: { text: string; activate: string; activating: string; signinOk: string; signinFail: string; signinButton: string; links: string; site: string; panel: string; signin: string; next: string; first: string; done: string; claimButton: string; claimNew: string; claimText: string; claimed: string }
  busy: { title: string; text: string; clear: string; clearTitle: string; risks: string[]; agree: string; clearConfirm: string; notNow: string; clearing: string; cleared: string; failed: string; nodeTitle: string; nodeText: string; nodeClear: string; nodeRisk: string }
}

const STAGE_EN = {
  launch: "Launch", prepare: "Server preparation", source: "Fractera from your fork", install: "Packages, build and elements", update: "The node's own update",
  mark: "The server node's mark", start: "Start", version: "Version",
  "apt-lock": "Package queue", swap: "Swap", apt: "System packages", node: "Node.js 22", pm2: "Process manager", certbot: "Certbot", user: "The node's user",
  git: "Git", helper: "Root helper", nginx: "nginx", firewall: "Firewall", resolver: "DNS resolver", "pm2-startup": "Autostart", marks: "Marks",
  deps: "The node's packages", eyes: "The agent's eyes", build: "The core's build", elements: "Elements", serve: "Start", save: "Process list saved", "launch-mark": "Install mark",
}
const STAGE_RU = {
  launch: "Запуск", prepare: "Подготовка сервера", source: "Fractera из вашего форка", install: "Пакеты, сборка и элементы", update: "Собственное обновление узла",
  mark: "Метка узла сервера", start: "Старт", version: "Версия",
  "apt-lock": "Очередь пакетов", swap: "Подкачка", apt: "Системные пакеты", node: "Node.js 22", pm2: "Менеджер процессов", certbot: "Certbot", user: "Пользователь узла",
  git: "Git", helper: "Помощник root", nginx: "nginx", firewall: "Файрвол", resolver: "DNS-резолвер", "pm2-startup": "Автозапуск", marks: "Метки",
  deps: "Пакеты узла", eyes: "Глаза агента", build: "Сборка ядра", elements: "Элементы", serve: "Запуск", save: "Сохранение списка", "launch-mark": "Отметка установки",
}

const en: ServerLaunchWords = {
  title: "Launch a server",
  readOnly: "This address is read-only: servers are launched from the node's own computer, at its keyboard or by its domain after sign-in.",
  launchedOn: "Your node runs on a server: {url}",
  lead: "Type the server's address and the root password from your provider's letter. The page keeps nothing: after a reload it is empty again, and the same address brings the same server back with everything it is doing now. Several servers can be launched one after another.",
  host: "Server IP address",
  port: "SSH port",
  password: "Root password",
  passwordNote: "Opens access to this server for one day: the server itself closes it at the deadline. The password is used once and kept nowhere; while the access lasts, this browser needs no password for this server.",
  connect: "Check the server",
  connecting: "Connecting and checking the server… up to a minute.",
  another: "Another server",
  locked: "opens when the step before it is done",
  step: { server: "The server", check: "Check the server", domain: "Domain activation", install: "Server installation", recheck: "Second check of the records", certs: "Security certificates", ready: "The server is ready" },
  summary: {
    server: "{host} · access until {time}", clean: "A clean server", related: "Fractera from your fork ({head})", warn: "read the notes",
    install: "Fractera {head} installed, the server's node answers", recheck: "{ok} of {all} names point to the server", certs: "{ok} of {all} names: a certificate and HTTPS",
  },
  connected: "Server {host} is connected. The server's key fingerprint: {fp}.",
  access: { until: "Access until {time} (24 h at most)", close: "Close access", closing: "Closing the access…" },
  window: { open: "Open the server's panel", opening: "Opening an SSH window…", link: "The server's panel: {url}", note: "Through SSH, on this computer only, while the access lasts; «Close access» closes it too." },
  errors: {
    auth: "The server refused the password.", "need-password": "This browser has no open access to this server: type the root password — access lasts a day.", "no-password-login": "This server takes no password login (the provider switched it off). Switch password login for root on in the provider's panel, or reinstall the server with a password — the node never uses a provider's keys.", "key-refused": "The server's SSH does not know an access deadline (OpenSSH older than 8.2): the node gives no access without one. Update the server's system.", "visit-install": "The access could not be written on the server.", unrelated: "This server holds a state not related to this node: delete the previous state first.", unreachable: "The server does not answer on this address and port.",
    timeout: "The server did not answer in time.", "bad-address": "That is not a server address.", "bad-password": "The password cannot contain line breaks.",
    running: "A launch is already running on this server.", "server-unfit": "The node cannot live on this server: see the check.", "no-ip": "The server's IPv4 address is unknown.", "no-fork": "This node has no GitHub fork to install from.",
    "le-limit": "Let's Encrypt's weekly limit would be passed: {week} certificates this week, {want} more needed{over}. Wait until the week frees up.", "not-live": "The server's node does not run yet.",
    "not-confirmed": "The address in the dialog does not match.", "public-address": "This address is read-only.", "on-server": "A server node launches nothing.", network: "The node did not answer.", unreadable: "The answer could not be read.",
    "bad-domain": "That is not a domain name.", "no-domain": "Choose a domain first.", "no-cloudflare-token": "This node has no Cloudflare key.",
  },
  changed: { title: "The server shows a different key", text: "The key this server shows is not the one this computer remembers. If you reinstalled the system, trust the new key: type the root password and press the button. If you did not, stop here — someone may be in the middle.", seen: "Now:", pinned: "Remembered:", trust: "The server was reinstalled — trust the new key" },
  verdict: { ok: "The server fits.", warn: "The server will do — read the notes.", fail: "The node cannot live on this server:" },
  item: { os: "System", arch: "Processor", memory: "Free memory, MB (a fresh node holds)", disk: "Free disk, GB (needed)", cores: "Cores (recommended)", ram: "Memory, MB (recommended)", ports: "Ports 80/443", address: "Public address", systemd: "Autostart (systemd)", sites: "nginx already serves other sites — the node would break them; free the server first", others: "Programs of another installation run as root (pm2 processes)" },
  fractera: { none: "Fractera is not installed here.", there: "Fractera is installed: version {head}.", behind: "It is {n} commits behind your fork.", latest: "It has everything your fork has.", unknown: "How far behind it is could not be measured (GitHub did not answer).", launching: "A launch is running on this server now." },
  strategy: { install: "Next: install a fresh Fractera from your fork.", update: "Next: update it ({n} behind).", latest: "Next: nothing to install — go on to the domain.", running: "Next: follow the launch below.", clear: "Next: delete the previous state — a copy of it stays on the server." },
  relation: { clean: "A clean server: no Fractera, no other sites or programs.", related: "Related to this node: Fractera from your fork.", unrelated: "Not related to this node:" },
  reason: { moved: "a copy moved here from {from} on {date} (the old move, not a launch from your fork)", "other-fork": "a node from another fork: {origin}", "no-origin": "a node without a GitHub source", "other-nodes": "other Fractera nodes: {folders}", "foreign-sites": "nginx sites: {sites}", "root-programs": "programs of root in pm2: {n}" },
  preflight: { ok: "A trial merge on the server passed: the update will go through.", stop: "A trial merge on the server stops on files changed both there and in Fractera: {files}. The update would be refused; the server is untouched.", unknown: "Could not check in advance whether the update will pass." },
  recheckServer: "Check again",
  domainNote: "The installation opens once the domain has a way to write its records and they were checked once. They need not answer yet: DNS wakes up while the server installs, and the second check waits for it.",
  install: {
    text: "Server preparation, a fresh Fractera from your fork, the build of the core and of every element, the start. About 40–50 minutes on a server with 8 GB. You may close the page and come back: the installation runs on the server.",
    install: "Install", update: "Update", again: "Continue the installation", running: "Installing on the server…", done: "Installed: version {head}.", failed: "The installation stopped at «{stage}».", leave: "You may close this page: the server goes on by itself.",
    silent: "Fractera is installed, but the server's node does not answer yet: the next step waits for it.", ask: "Ask the server again",
  },
  stage: STAGE_EN,
  recheck: { text: "Every name of the node is asked of two public DNS resolvers. Until every required name points to the server, the certificates cannot start.", button: "Check the records", gate: "Not every required name points to the server yet.", noDomain: "No domain is chosen: the server answers only by its IP." },
  certs: { budget: "This week {week} of 50 Let's Encrypt certificates were issued for {domain}.", limit: "Limits: 50 per domain per week, 5 per name per week (letsencrypt.org).", checklist: "Checklist", name: "Name", dns: "DNS", cert: "Certificate", https: "HTTPS", httpsButton: "Check HTTPS from the internet" },
  ready: {
    text: "Switch the domain on: sign-in moves to https://auth.{zone}, the bare IP leads to the panel, the elements learn their addresses.", activate: "Switch the domain on", activating: "Switching on…",
    signinOk: "Sign-in leads to https://auth.{zone}.", signinFail: "Sign-in does not lead to https://auth.{zone} yet: {detail}", signinButton: "Check sign-in again", links: "Links:", site: "Site", panel: "Panel", signin: "Sign-in",
    next: "Next, in the server's own panel: its Claude Code subscription and its Telegram bot.", first: "The first registration on the server becomes its architect for good — and only with the architect code from this step.", done: "Your server is ready.",
    claimButton: "Get the architect code", claimNew: "Get a new code", claimText: "Register at {url} with this code — you become the server's architect. The code is shown once: after a reload get a new one (the old one stops working).", claimed: "The architect is already registered on this server.",
  },
  busy: {
    nodeTitle: "This server holds a Fractera node that is not this node's",
    nodeText: "Delete the previous state: the node stops and is set aside whole — nothing is erased — and a fresh node from your fork goes in its place.",
    nodeClear: "Delete the previous state…",
    nodeRisk: "The node {nodes} stops at once and its folder moves whole into /root/fractera-cleared-… — its data, keys and history stay there; its sites stop answering until the new node is installed.",
    title: "The server is taken by another installation",
    text: "Other programs and sites already run on this server. The node can free it for itself — or you simply do not go on.",
    clear: "Free the server…",
    clearTitle: "Free the server {host}?",
    risks: [
      "The sites on this server stop answering at once: {sites}.",
      "{n} programs of the earlier installation (pm2 processes) stop and do not come back after a reboot.",
      "Nothing is deleted: the programs' folders and databases stay; the list of programs and the sites' files are kept in /root/fractera-cleared-… — everything can be put back by hand.",
      "If something you or other people need runs on this server, take a clean server instead.",
    ],
    agree: "I understand: the sites and programs on {host} stop",
    clearConfirm: "Stop them and free the server",
    notNow: "Not now",
    clearing: "Freeing the server: the earlier programs stop, the foreign sites move to a backup folder there. Under a minute; the check runs again by itself.",
    cleared: "The server is freed: programs stopped — {n}, everything kept in {backup}. The check ran again.",
    failed: "Freeing failed:",
  },
}

const ru: ServerLaunchWords = {
  title: "Запустить сервер",
  readOnly: "Этот адрес только для чтения: серверы запускаются с компьютера самого узла, за его клавиатурой или по его домену после входа.",
  launchedOn: "Ваш узел работает на сервере: {url}",
  lead: "Введите адрес сервера и пароль root из письма провайдера. Страница ничего не хранит: после перезагрузки она снова пустая, а тот же адрес возвращает тот же сервер со всем, что он сейчас делает. Можно запускать несколько серверов по очереди.",
  host: "IP-адрес сервера",
  port: "Порт SSH",
  password: "Пароль root",
  passwordNote: "Открывает доступ к этому серверу на сутки: в срок его закрывает сам сервер. Пароль нужен один раз и нигде не хранится; пока доступ открыт, этому браузеру пароль для этого сервера не нужен.",
  connect: "Проверить сервер",
  connecting: "Подключаюсь и проверяю сервер… до минуты.",
  another: "Другой сервер",
  locked: "откроется, когда будет готов предыдущий шаг",
  step: { server: "Сервер", check: "Проверка сервера", domain: "Активация домена", install: "Установка сервера", recheck: "Повторная проверка записей", certs: "Сертификаты безопасности", ready: "Сервер готов" },
  summary: {
    server: "{host} · доступ до {time}", clean: "Чистый сервер", related: "Fractera из вашего форка ({head})", warn: "есть замечания",
    install: "Fractera {head} установлена, узел сервера отвечает", recheck: "{ok} из {all} имён ведут на сервер", certs: "{ok} из {all} имён: сертификат и HTTPS",
  },
  connected: "Сервер {host} подключён. Отпечаток ключа сервера: {fp}.",
  access: { until: "Доступ до {time} (не больше 24 ч)", close: "Закрыть доступ", closing: "Закрываю доступ…" },
  window: { open: "Открыть пульт сервера", opening: "Открываю окно SSH…", link: "Пульт сервера: {url}", note: "Через SSH, только на этом компьютере, пока открыт доступ; «Закрыть доступ» закрывает и его." },
  errors: {
    auth: "Сервер не принял пароль.", "need-password": "У этого браузера нет открытого доступа к этому серверу: введите пароль root — доступ откроется на сутки.", "no-password-login": "Этот сервер не принимает вход по паролю (провайдер его выключил). Включите вход по паролю для root в панели провайдера или переустановите сервер с паролем — ключи провайдера узел не использует.", "key-refused": "SSH сервера не знает срока доступа (OpenSSH старше 8.2): без срока узел доступа не даёт. Обновите систему сервера.", "visit-install": "Не удалось записать доступ на сервер.", unrelated: "На сервере состояние, не связанное с этим узлом: сначала удалите прежнее состояние.", unreachable: "Сервер не отвечает на этом адресе и порту.",
    timeout: "Сервер не ответил вовремя.", "bad-address": "Это не адрес сервера.", "bad-password": "В пароле не может быть переносов строки.",
    running: "На этом сервере уже идёт запуск.", "server-unfit": "Узел не сможет жить на этом сервере: смотрите проверку.", "no-ip": "IPv4-адрес сервера неизвестен.", "no-fork": "У этого узла нет форка на GitHub, из которого ставить.",
    "le-limit": "Будет превышен недельный лимит Let's Encrypt: за неделю {week} сертификатов, нужно ещё {want}{over}. Дождитесь, пока неделя освободится.", "not-live": "Узел на сервере ещё не работает.",
    "not-confirmed": "Адрес в диалоге не совпадает.", "public-address": "Этот адрес только для чтения.", "on-server": "Узел на сервере ничего не запускает.", network: "Узел не ответил.", unreadable: "Ответ не удалось прочитать.",
    "bad-domain": "Это не имя домена.", "no-domain": "Сначала выберите домен.", "no-cloudflare-token": "У этого узла нет ключа Cloudflare.",
  },
  changed: { title: "Сервер показывает другой ключ", text: "Ключ, который показывает сервер, не тот, что помнит этот компьютер. Если вы переустановили систему, доверьтесь новому ключу: введите пароль root и нажмите кнопку. Если не переустанавливали, остановитесь: посередине может быть кто-то чужой.", seen: "Сейчас:", pinned: "Помню:", trust: "Сервер переустановлен — доверять новому ключу" },
  verdict: { ok: "Сервер подходит.", warn: "Сервер подойдёт — прочитайте замечания.", fail: "Узел не сможет жить на этом сервере:" },
  item: { os: "Система", arch: "Процессор", memory: "Свободная память, МБ (свежий узел держит)", disk: "Свободный диск, ГБ (нужно)", cores: "Ядра (рекомендуется)", ram: "Память, МБ (рекомендуется)", ports: "Порты 80/443", address: "Публичный адрес", systemd: "Автозапуск (systemd)", sites: "nginx уже обслуживает другие сайты — узел их сломает; сначала освободите сервер", others: "Работают программы другой установки от root (процессы pm2)" },
  fractera: { none: "Fractera здесь не установлена.", there: "Fractera установлена: версия {head}.", behind: "Отстаёт от вашего форка на {n} коммитов.", latest: "В нём всё, что есть в вашем форке.", unknown: "Насколько отстаёт, измерить не удалось (GitHub не ответил).", launching: "На этом сервере сейчас идёт запуск." },
  strategy: { install: "Дальше: установить свежую Fractera из вашего форка.", update: "Дальше: обновить (отстаёт на {n}).", latest: "Дальше: ставить нечего, переходите к домену.", running: "Дальше: следите за запуском ниже.", clear: "Дальше: удалить прежнее состояние — его копия останется на сервере." },
  relation: { clean: "Чистый сервер: ни Fractera, ни других сайтов и программ.", related: "Связан с этим узлом: Fractera из вашего форка.", unrelated: "Не связан с этим узлом:" },
  reason: { moved: "копия, перенесённая сюда с {from} {date} (старый переезд, а не запуск из вашего форка)", "other-fork": "узел из другого форка: {origin}", "no-origin": "узел без источника на GitHub", "other-nodes": "другие узлы Fractera: {folders}", "foreign-sites": "сайты nginx: {sites}", "root-programs": "программ root в pm2: {n}" },
  preflight: { ok: "Пробное слияние на сервере прошло: обновление пройдёт.", stop: "Пробное слияние на сервере останавливается на файлах, изменённых и там, и в Fractera: {files}. Обновление было бы отклонено; сервер не тронут.", unknown: "Заранее проверить, пройдёт ли обновление, не удалось." },
  recheckServer: "Проверить ещё раз",
  domainNote: "Установка откроется, когда у домена будет выбран способ внести записи и они проверены один раз. Отвечать им пока не обязательно: DNS просыпается, пока сервер ставится, а повторная проверка их дождётся.",
  install: {
    text: "Подготовка сервера, свежая Fractera из вашего форка, сборка ядра и всех элементов, запуск. Около 40–50 минут на сервере с 8 ГБ. Страницу можно закрыть и вернуться: установка идёт на самом сервере.",
    install: "Установить", update: "Обновить", again: "Продолжить установку", running: "Идёт установка на сервере…", done: "Установлено: версия {head}.", failed: "Установка остановилась на этапе «{stage}».", leave: "Эту страницу можно закрыть: сервер продолжит сам.",
    silent: "Fractera установлена, но узел сервера пока не отвечает: следующий шаг его ждёт.", ask: "Спросить сервер ещё раз",
  },
  stage: STAGE_RU,
  recheck: { text: "Каждое имя узла спрашивается у двух публичных DNS. Пока хоть одно обязательное имя не ведёт на сервер, к сертификатам перейти нельзя.", button: "Проверить записи", gate: "Ещё не все обязательные имена ведут на сервер.", noDomain: "Домен не выбран: сервер отвечает только по своему IP." },
  certs: { budget: "На этой неделе для {domain} выпущено {week} из 50 сертификатов Let's Encrypt.", limit: "Лимиты: 50 на домен в неделю, 5 на одно имя в неделю (letsencrypt.org).", checklist: "Чек-лист", name: "Имя", dns: "DNS", cert: "Сертификат", https: "HTTPS", httpsButton: "Проверить HTTPS из интернета" },
  ready: {
    text: "Включите домен: вход переедет на https://auth.{zone}, голый IP поведёт в панель, элементы узнают свои адреса.", activate: "Включить домен", activating: "Включаю…",
    signinOk: "Вход ведёт на https://auth.{zone}.", signinFail: "Вход ещё не ведёт на https://auth.{zone}: {detail}", signinButton: "Проверить вход ещё раз", links: "Ссылки:", site: "Сайт", panel: "Панель", signin: "Вход",
    next: "Дальше — в панели самого сервера: подписка Claude Code и Telegram-бот сервера.", first: "Первая регистрация на сервере навсегда становится его архитектором — и только с кодом архитектора с этого шага.", done: "Ваш сервер готов.",
    claimButton: "Получить код архитектора", claimNew: "Выдать новый код", claimText: "Зарегистрируйтесь на {url} с этим кодом — вы станете архитектором сервера. Код показывается один раз: после перезагрузки страницы выдайте новый (старый перестанет действовать).", claimed: "Архитектор на этом сервере уже зарегистрирован.",
  },
  busy: {
    nodeTitle: "На сервере узел Fractera, не связанный с этим узлом",
    nodeText: "Удалить прежнее состояние: узел остановится и целиком уйдёт в копию на сервере — ничего не стирается, — а на его место встанет свежий узел из вашего форка.",
    nodeClear: "Удалить прежнее состояние…",
    nodeRisk: "Узел {nodes} сразу остановится, его папка целиком уйдёт в /root/fractera-cleared-… — данные, ключи и история останутся там; его сайты перестанут отвечать, пока не встанет новый узел.",
    title: "Сервер занят другой установкой",
    text: "На сервере уже работают другие программы и сайты. Узел может освободить сервер для себя — или вы просто не продолжаете.",
    clear: "Очистить сервер…",
    clearTitle: "Очистить сервер {host}?",
    risks: [
      "Сразу перестанут отвечать сайты на этом сервере: {sites}.",
      "Остановятся программы прежней установки ({n} процессов pm2) и не запустятся после перезагрузки.",
      "Ничего не удаляется: папки программ и базы данных остаются; список программ и файлы сайтов сохраняются в /root/fractera-cleared-… — по ним всё можно вернуть руками.",
      "Если на этом сервере работает что-то нужное вам или другим людям — возьмите чистый сервер.",
    ],
    agree: "Я понимаю: сайты и программы на {host} остановятся",
    clearConfirm: "Остановить и освободить",
    notNow: "Не сейчас",
    clearing: "Освобождаю сервер: прежние программы останавливаются, чужие сайты уходят в резервную папку там же. Меньше минуты; проверка повторится сама.",
    cleared: "Сервер освобождён: остановлено программ — {n}, всё сохранено в {backup}. Проверка повторена.",
    failed: "Очистка не прошла:",
  },
}

export function serverLaunchWords(lang: string): ServerLaunchWords {
  return lang === "ru" ? ru : en
}
