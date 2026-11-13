// THE WORDS OF THE MOVE LADDER (node step 737-7) — chosen on the server, handed to the island as props (one language reaches the browser,
// `check:lang-delivery`). Russian are the owner's own words where he said them (2026-11-13).

export type ServerMoveWords = {
  title: string
  lead: string
  loading: string
  silent: string
  onServer: string
  rung: Record<"connect" | "probe" | "prepare" | "copy" | "claude" | "rehearse" | "move", { title: string; text: string; button: string }>
  locked: string
  running: string
  failed: string
  again: string
  copyAgain: string
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
  busy: { title: string; text: string; clear: string; cancel: string; clearTitle: string; risks: string[]; agree: string; clearConfirm: string; cancelTitle: string; cancelText: string; cancelConfirm: string; notNow: string; clearing: string; cleared: string; failed: string }
  stage: Record<string, string>
}

const en: ServerMoveWords = {
  title: "Move the project to a dedicated server",
  lead: "The node moves whole — elements, data, bots, memory — to your Ubuntu server, step by step and without a model. It answers there by the server's IP first; your domain comes later, with a certificate for every name.",
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
    move: { title: "Move", text: "This computer stops the node, the last changes are copied, the server starts whole and takes Telegram. Any failure brings the node back here by itself.", button: "Move now" },
  },
  locked: "Opens after the step above.",
  running: "Working…",
  failed: "Stopped:",
  again: "Try again",
  copyAgain: "Copy again",
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
    clearing: "Freeing the server…",
    cleared: "Freed: {n} programs stopped, the sites moved to {backup}. The server check runs again.",
    failed: "Freeing failed:",
  },
  stage: { "apt-lock": "Package queue", swap: "Swap", apt: "System packages", node: "Node.js 22", pm2: "Process manager", certbot: "Certbot", user: "The node's user", git: "Git", helper: "Root helper", nginx: "nginx", firewall: "Firewall", resolver: "DNS resolver", "pm2-startup": "Autostart", prepare: "Preparation", copy: "Copy", marks: "Marks", deps: "The node's packages", eyes: "The agent's eyes", build: "The core's build", elements: "Elements", install: "Install", serve: "Start", save: "Process list saved", "launch-mark": "Install mark", start: "Start" },
}

const ru: ServerMoveWords = {
  title: "Переезд проекта на выделенный сервер",
  lead: "Узел переезжает целиком — элементы, данные, боты, память — на ваш сервер Ubuntu, шаг за шагом и без искусственного интеллекта. Сначала он отвечает там по IP-адресу; домен подключается позже, с сертификатом на каждое имя.",
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
    move: { title: "Переезд", text: "Этот компьютер останавливает узел, последние изменения копируются, сервер запускается целиком и берёт Telegram. При любом сбое узел сам возвращается сюда.", button: "Переехать" },
  },
  locked: "Откроется после шага выше.",
  running: "Идёт работа…",
  failed: "Остановлено:",
  again: "Повторить",
  copyAgain: "Скопировать заново",
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
    clearing: "Освобождаю сервер…",
    cleared: "Освобождено: остановлено программ — {n}, сайты перенесены в {backup}. Проверка сервера идёт заново.",
    failed: "Очистка не прошла:",
  },
  stage: { "apt-lock": "Очередь пакетов", swap: "Подкачка", apt: "Системные пакеты", node: "Node.js 22", pm2: "Менеджер процессов", certbot: "Certbot", user: "Пользователь узла", git: "Git", helper: "Помощник root", nginx: "nginx", firewall: "Файрвол", resolver: "DNS-резолвер", "pm2-startup": "Автозапуск", prepare: "Подготовка", copy: "Копия", marks: "Метки", deps: "Пакеты узла", eyes: "Глаза агента", build: "Сборка ядра", elements: "Элементы", install: "Установка", serve: "Запуск", save: "Сохранение списка", "launch-mark": "Отметка установки", start: "Старт" },
}

export function serverMoveWords(lang: string): ServerMoveWords {
  return lang === "ru" ? ru : en
}
