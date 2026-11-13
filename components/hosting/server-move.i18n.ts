// THE WORDS OF THE MOVE LADDER (node step 737-7) — chosen on the server, handed to the island as props (one language reaches the browser,
// `check:lang-delivery`). Russian are the owner's own words where he said them (2026-11-13).

export type ServerMoveWords = {
  title: string
  lead: string
  loading: string
  silent: string
  onServer: string
  rung: Record<"connect" | "probe" | "prepare" | "copy" | "claude" | "rehearse" | "start" | "telegram" | "move", { title: string; text: string; button: string }>
  locked: string
  running: string
  failed: string
  again: string
  copyAgain: string
  names: { summary: string; waiting: string; later: string }

  copyAgainNote: string
  host: string
  port: string
  password: string
  passwordNote: string
  fingerprint: string
  verdict: Record<"ok" | "warn" | "fail", string>
  item: Record<string, string>
  claudeOpen: string
  claudeCode: string
  claudeSend: string
  claudeSigned: string
  checks: Record<string, string>
  moveWarn: string
  movedTitle: string
  movedText: string
  rolledBack: string
  road: { title: string; move: string; new: string; moveNote: string; newNote: string }
  plan: { clone: string; fresh: string; cloneNote: string; freshNote: string; data: string; dataYes: string; dataNo: string }
  newDone: { title: string; text: string; forget: string; note: string }
  earlier: { title: string; text: string; restart: string; note: string }
  telegram: { moveBot: string; moveNote: string; newTitle: string; newNote: string; newNoteHome: string; later: string; laterNote: string; doneMove: string; doneNew: string; doneLater: string; change: string; remoteDone: string }
  busy: { title: string; text: string; clear: string; cancel: string; clearTitle: string; risks: string[]; agree: string; clearConfirm: string; cancelTitle: string; cancelText: string; cancelConfirm: string; notNow: string; clearing: string; cleared: string; failed: string }
  stage: Record<string, string>
}

const en: ServerMoveWords = {
  title: "Move the project to a dedicated server",
  lead: "Choose the road, then the node takes the steps itself, one at a time: each opens when the one before it is done.",
  loading: "Asking the node…",
  silent: "This copy rehearses on its server: it is silent — no bots, no agents — while your computer still runs the node.",
  onServer: "This node lives on its dedicated server.",
  rung: {
    connect: { title: "The server", text: "Its IP address and the root password. The password is used once to install this node's own key, and is never kept. A few seconds.", button: "Connect" },
    probe: { title: "Check the server", text: "Its system, memory, disk and ports, against what this node holds today. A few seconds.", button: "Check" },
    prepare: { title: "Prepare the server", text: "Packages, Node 22, a user for the node, nginx, the firewall (only SSH, 80 and 443), autostart. Under a minute where the packages are already there (measured: 27 s), a few minutes on a fresh server.", button: "Prepare" },
    copy: { title: "Copy and build", text: "The node is copied without its bots' tokens and built for Linux: packages, the core, every element. About 35–40 minutes on a server with 8 GB (measured: 36 min — the core 11, the elements 25); a repeat copies only the changes.", button: "Copy and build" },
    claude: { title: "Claude Code on the server", text: "Sign the server in to your Claude subscription: open the link, approve, paste the code here. A couple of minutes — the link waits 20 minutes.", button: "Get the sign-in link" },
    rehearse: { title: "Rehearsal", text: "The server's copy starts silent and is checked from outside and from inside. About 1–2 minutes (measured: 1 min 17 s). Your computer keeps working.", button: "Start the rehearsal" },
    start: { title: "Start", text: "The new server starts its own node at once and is checked from outside and inside. This computer keeps working.", button: "Start the server" },
    telegram: { title: "Telegram", text: "Who answers you in Telegram once the node lives on the server: your bot moves with the node, or the server gets a bot of its own (three steps in Telegram, a few minutes). Until the move the server's bot only admits you and answers one line.", button: "Choose" },
    move: { title: "Move", text: "This computer stops the node, the last changes are copied, the server starts whole and takes Telegram. Any failure brings the node back here by itself.", button: "Move now" },
  },
  locked: "Opens after the step above.",
  running: "Working…",
  failed: "Stopped:",
  again: "Try again",
  copyAgain: "Copy again",
  names: { summary: "Domain {zone}: {p} of {n} names point to the server, {c} have a certificate.", waiting: "The move waits for certificates of:", later: "Still on the old address (the tunnel comes to the server with the node, so they keep working):" },
  copyAgainNote: "After this node was updated, the server needs the same code: only the changes travel, the core is rebuilt (about 11 minutes on 8 GB).",
  host: "Server IP address",
  port: "SSH port",
  password: "Root password",
  passwordNote: "Proof you can check yourself: change the server's password after the move — the node keeps working, it uses its own key.",
  fingerprint: "Server key",
  verdict: { ok: "The server fits.", warn: "The server will do — read the notes.", fail: "The node cannot live on this server:" },
  item: { os: "System", arch: "Processor", memory: "Free memory, MB (the node holds)", disk: "Free disk, GB (needed)", cores: "Cores", ports: "Ports 80/443", address: "Public address", systemd: "Autostart (systemd)", earlier: "A copy of an earlier attempt is there — it will be updated", sites: "nginx already serves other sites — the node would break them; free the server first", others: "Programs of another installation run as root (pm2 processes)" },
  claudeOpen: "Open the sign-in page",
  claudeCode: "Code from the page",
  claudeSend: "Send the code",
  claudeSigned: "Signed in:",
  checks: { health: "The server answers by IP", commit: "The same version as here", edge: "A request posing as this computer is refused", firewall: "The node's ports are closed to the internet", dry: "Dry run" },
  moveWarn: "Your agents' conversations here end at the move; on the server they start fresh from their records. The panel on this computer stops — this tab shows the progress.",
  movedTitle: "The node lives on its server",
  movedText: "Open it by IP: {url}. Telegram answers from the server. Your domain and its certificates are set up on the server's own tab.",
  rolledBack: "The move did not finish — the node is back on this computer:",
  road: {
    title: "What the server is for",
    move: "Move this node",
    new: "A new independent server",
    moveNote: "This node moves whole: after the move it lives on the server, and this computer keeps a cold copy and the road back.",
    newNote: "A separate node of yours on the server: this computer keeps working and keeps its bot, the server gets a bot of its own.",
  },
  plan: {
    clone: "A copy of this node",
    fresh: "A fresh node",
    cloneNote: "The same core and elements as here, built for the server. Bots, wallets, this node's identity and the template workshop never travel.",
    freshNote: "Your fork cloned on the server as a new install: the core and the native elements, nothing of this node.",
    data: "Move this node's data",
    dataYes: "Accounts, the elements' stores, the agents' memory and the diary travel too.",
    dataNo: "Accounts, stores, memory and the diary stay here: the server starts empty, and its first registration is its architect.",
  },
  earlier: {
    title: "An earlier run is on this page",
    text: "Server {host}: it stopped at step {n} «{step}», {at}. Go on from that step, or start again from the road choice.",
    restart: "Start again",
    note: "Nothing on the server is touched: the record of this run goes to the archive, and you start from the first step with the password.",
  },
  newDone: {
    title: "The independent server runs",
    text: "Its address: {url}. From here you talk to it in Telegram: the server's bot leads to its own main agent (its domain, its first registration).",
    forget: "Connect another server",
    note: "The server keeps running on its own; this tab is freed for the next one.",
  },
  telegram: {
    moveBot: "Move the bot {bot} to the server",
    moveNote: "It goes with the node at the move: a bot has one reader at a time, so it answers from the server once this computer stops.",
    newTitle: "A new bot for the server",
    newNote: "The server gets a bot of its own: the three steps below.",
    newNoteHome: "The server gets a bot of its own, and {bot} stays with this computer.",
    later: "Without Telegram for now",
    laterNote: "A bot can be connected later in the server's panel — the main agent's «Telegram» page.",
    doneMove: "The bot {bot} moves with the node and answers from the server after the move.",
    doneNew: "The server's own bot {bot} is connected, people admitted: {n}. After the move the main agent greets you there.",
    doneLater: "No Telegram on the server for now.",
    change: "Change the choice",
    remoteDone: "The bot is connected to the server. Until the move it answers one line; after the move the main agent writes to you here.",
  },
  busy: {
    title: "The server is taken by another installation",
    text: "Other programs and sites already run on this server. The node can free it for itself — or cancel the installation and leave without touching anything.",
    clear: "Free the server…",
    cancel: "Cancel the installation…",
    clearTitle: "Free the server {host}?",
    risks: [
      "The sites on this server stop answering at once: {sites}.",
      "{n} programs of the earlier installation (pm2 processes) stop and do not come back after a reboot.",
      "Nothing is deleted: the programs' folders and databases stay; the list of programs and the sites' files are kept in /root/fractera-cleared-… — everything can be put back by hand.",
      "If something you or other people need runs on this server, cancel and take a clean server instead.",
    ],
    agree: "I understand: the sites and programs on {host} stop",
    clearConfirm: "Stop them and free the server",
    cancelTitle: "Cancel the installation on {host}?",
    cancelText: "The node removes its key from the server and forgets it. Nothing else on the server changes; what the preparation already installed stays. You can start again from step 1.",
    cancelConfirm: "Cancel the installation",
    notNow: "Not now",
    clearing: "Freeing the server: the earlier programs stop, the foreign sites move to a backup folder there. Under a minute; the check runs again by itself.",
    cleared: "The server is freed: programs stopped — {n}, everything kept in {backup}. The check ran again; the next step is open.",
    failed: "Freeing failed:",
  },
  stage: { "apt-lock": "Package queue", swap: "Swap", apt: "System packages", node: "Node.js 22", pm2: "Process manager", certbot: "Certbot", user: "The node's user", git: "Git", helper: "Root helper", nginx: "nginx", firewall: "Firewall", resolver: "DNS resolver", "pm2-startup": "Autostart", prepare: "Preparation", copy: "Copy", marks: "Marks", deps: "The node's packages", eyes: "The agent's eyes", build: "The core's build", elements: "Elements", install: "Install", serve: "Start", save: "Process list saved", "launch-mark": "Install mark", start: "Start" },
}

const ru: ServerMoveWords = {
  title: "Переезд проекта на выделенный сервер",
  lead: "Выберите дорогу, дальше узел проходит шаги сам, по одному: каждый открывается, когда готов предыдущий.",
  loading: "Спрашиваю узел…",
  silent: "Эта копия репетирует на своём сервере: она молчит — ни ботов, ни агентов, — пока узел работает на вашем компьютере.",
  onServer: "Этот узел живёт на своём выделенном сервере.",
  rung: {
    connect: { title: "Сервер", text: "IP-адрес и пароль root. Пароль нужен один раз — поставить на сервер собственный ключ узла; он нигде не хранится. Несколько секунд.", button: "Подключить" },
    probe: { title: "Проверка сервера", text: "Система, память, диск и порты — против того, что узел держит сегодня. Несколько секунд.", button: "Проверить" },
    prepare: { title: "Подготовка сервера", text: "Пакеты, Node 22, пользователь узла, nginx, файрвол (только SSH, 80 и 443), автозапуск. Меньше минуты, если пакеты уже стоят (замер: 27 с), несколько минут на чистом сервере.", button: "Подготовить" },
    copy: { title: "Копия и сборка", text: "Узел копируется без токенов ботов и собирается под Linux: пакеты, ядро, каждый элемент. Около 35–40 минут на сервере с 8 ГБ (замер: 36 мин — ядро 11, элементы 25); повтор копирует только изменения.", button: "Скопировать и собрать" },
    claude: { title: "Claude Code на сервере", text: "Подключите сервер к своей подписке Claude: откройте ссылку, подтвердите, вставьте код сюда. Пара минут — ссылка ждёт 20 минут.", button: "Получить ссылку входа" },
    rehearse: { title: "Репетиция", text: "Копия на сервере запускается молча и проверяется снаружи и изнутри. Около 1–2 минут (замер: 1 мин 17 с). Ваш компьютер продолжает работать.", button: "Начать репетицию" },
    start: { title: "Запуск", text: "Новый сервер сразу запускает свой узел и проверяется снаружи и изнутри. Этот компьютер продолжает работать.", button: "Запустить сервер" },
    telegram: { title: "Telegram", text: "Кто ответит вам в Telegram, когда узел будет жить на сервере: ваш бот переедет вместе с узлом, или у сервера будет свой (три шага в Telegram, несколько минут). До переезда бот сервера только впускает вас и отвечает одной строкой.", button: "Выбрать" },
    move: { title: "Переезд", text: "Этот компьютер останавливает узел, последние изменения копируются, сервер запускается целиком и берёт Telegram. При любом сбое узел сам возвращается сюда.", button: "Переехать" },
  },
  locked: "Откроется после шага выше.",
  running: "Идёт работа…",
  failed: "Остановлено:",
  again: "Повторить",
  copyAgain: "Скопировать заново",
  names: { summary: "Домен {zone}: на сервер ведут {p} из {n} имён, с сертификатом — {c}.", waiting: "Переезд ждёт сертификатов для:", later: "Ещё на старом адресе (туннель переедет на сервер вместе с узлом, они продолжат работать):" },
  copyAgainNote: "После обновления этого узла серверу нужен тот же код: переносятся только изменения, ядро пересобирается (около 11 минут на 8 ГБ).",
  host: "IP-адрес сервера",
  port: "Порт SSH",
  password: "Пароль root",
  passwordNote: "Проверьте сами: смените пароль сервера после переезда — узел продолжит работать, он ходит своим ключом.",
  fingerprint: "Ключ сервера",
  verdict: { ok: "Сервер подходит.", warn: "Сервер подойдёт — прочитайте замечания.", fail: "Узел не сможет жить на этом сервере:" },
  item: { os: "Система", arch: "Процессор", memory: "Свободная память, МБ (узел держит)", disk: "Свободный диск, ГБ (нужно)", cores: "Ядра", ports: "Порты 80/443", address: "Публичный адрес", systemd: "Автозапуск (systemd)", earlier: "Там копия прошлой попытки — она будет обновлена", sites: "nginx уже обслуживает другие сайты — узел их сломает; сначала освободите сервер", others: "Работают программы другой установки от root (процессы pm2)" },
  claudeOpen: "Открыть страницу входа",
  claudeCode: "Код со страницы",
  claudeSend: "Отправить код",
  claudeSigned: "Вход выполнен:",
  checks: { health: "Сервер отвечает по IP", commit: "Та же версия, что здесь", edge: "Запрос, выдающий себя за этот компьютер, отбит", firewall: "Порты узла закрыты от интернета", dry: "Сухой прогон" },
  moveWarn: "Разговоры агентов здесь закончатся при переезде; на сервере они начнутся заново со своих записей. Панель на этом компьютере остановится — ход переезда покажет эта вкладка.",
  movedTitle: "Узел живёт на своём сервере",
  movedText: "Откройте его по IP: {url}. Telegram отвечает уже с сервера. Домен и его сертификаты подключаются на этой же вкладке сервера.",
  rolledBack: "Переезд не завершился — узел вернулся на этот компьютер:",
  road: {
    title: "Для чего этот сервер",
    move: "Переезд этого узла",
    new: "Новый независимый сервер",
    moveNote: "Узел переезжает целиком: после переезда он живёт на сервере, а этот компьютер хранит холодную копию и дорогу обратно.",
    newNote: "Отдельный ваш узел на сервере: этот компьютер продолжает работать и оставляет себе свой бот, у сервера будет свой.",
  },
  plan: {
    clone: "Копия этого узла",
    fresh: "Свежий узел",
    cloneNote: "То же ядро и те же элементы, что здесь, собранные для сервера. Боты, кошельки, код этого узла и мастерская шаблонов не переезжают никогда.",
    freshNote: "Ваш форк, склонированный на сервер как новая установка: ядро и нативные элементы, ничего от этого узла.",
    data: "Перенести данные этого узла",
    dataYes: "Учётные записи, хранилища элементов, память агентов и дневник тоже переедут.",
    dataNo: "Учётные записи, хранилища, память и дневник останутся здесь: сервер начнёт пустым, его первая регистрация — его архитектор.",
  },
  earlier: {
    title: "На странице прошлый прогон",
    text: "Сервер {host}: он остановился на шаге {n} «{step}», {at}. Продолжите с этого шага или начните заново с выбора дороги.",
    restart: "Начать заново",
    note: "На сервере ничего не трогается: запись этого прогона уходит в архив, и вы начинаете с первого шага с паролем.",
  },
  newDone: {
    title: "Независимый сервер работает",
    text: "Его адрес: {url}. Дальше с ним говорят из Telegram: бот сервера ведёт к его собственному главному агенту (свой домен, первая регистрация).",
    forget: "Подключить другой сервер",
    note: "Сервер продолжит работать сам, а вкладка освободится для следующего.",
  },
  telegram: {
    moveBot: "Перенести бот {bot} на сервер",
    moveNote: "Он переедет вместе с узлом: у бота один читатель, поэтому с сервера он заговорит, когда остановится этот компьютер.",
    newTitle: "Новый бот для сервера",
    newNote: "У сервера будет свой бот — три шага ниже.",
    newNoteHome: "У сервера будет свой бот, а {bot} останется у этого компьютера.",
    later: "Пока без Telegram",
    laterNote: "Бота можно подключить позже в панели сервера — страница «Telegram» главного агента.",
    doneMove: "Бот {bot} переедет вместе с узлом и ответит с сервера после переезда.",
    doneNew: "Свой бот сервера {bot} подключён, допущено: {n}. После переезда главный агент поприветствует вас там.",
    doneLater: "На сервере пока без Telegram.",
    change: "Изменить выбор",
    remoteDone: "Бот подключён к серверу. До переезда он отвечает одной строкой, после переезда здесь напишет главный агент.",
  },
  busy: {
    title: "Сервер занят другой установкой",
    text: "На сервере уже работают другие программы и сайты. Узел может освободить сервер для себя — или отменить установку и уйти, ничего не трогая.",
    clear: "Очистить сервер…",
    cancel: "Отменить установку…",
    clearTitle: "Очистить сервер {host}?",
    risks: [
      "Сразу перестанут отвечать сайты на этом сервере: {sites}.",
      "Остановятся программы прежней установки ({n} процессов pm2) и не запустятся после перезагрузки.",
      "Ничего не удаляется: папки программ и базы данных остаются; список программ и файлы сайтов сохраняются в /root/fractera-cleared-… — по ним всё можно вернуть руками.",
      "Если на этом сервере работает что-то нужное вам или другим людям — отмените установку и возьмите чистый сервер.",
    ],
    agree: "Я понимаю: сайты и программы на {host} остановятся",
    clearConfirm: "Остановить и освободить",
    cancelTitle: "Отменить установку на {host}?",
    cancelText: "Узел уберёт свой ключ с сервера и забудет его. На сервере больше ничего не меняется; то, что уже поставила подготовка, остаётся. Начать заново можно с первого шага.",
    cancelConfirm: "Отменить установку",
    notNow: "Не сейчас",
    clearing: "Освобождаю сервер: прежние программы останавливаются, чужие сайты уходят в резервную папку там же. Меньше минуты; проверка повторится сама.",
    cleared: "Сервер освобождён: остановлено программ — {n}, всё сохранено в {backup}. Проверка повторена, следующий шаг открыт.",
    failed: "Очистка не прошла:",
  },
  stage: { "apt-lock": "Очередь пакетов", swap: "Подкачка", apt: "Системные пакеты", node: "Node.js 22", pm2: "Менеджер процессов", certbot: "Certbot", user: "Пользователь узла", git: "Git", helper: "Помощник root", nginx: "nginx", firewall: "Файрвол", resolver: "DNS-резолвер", "pm2-startup": "Автозапуск", prepare: "Подготовка", copy: "Копия", marks: "Метки", deps: "Пакеты узла", eyes: "Глаза агента", build: "Сборка ядра", elements: "Элементы", install: "Установка", serve: "Запуск", save: "Сохранение списка", "launch-mark": "Отметка установки", start: "Старт" },
}

export function serverMoveWords(lang: string): ServerMoveWords {
  return lang === "ru" ? ru : en
}
