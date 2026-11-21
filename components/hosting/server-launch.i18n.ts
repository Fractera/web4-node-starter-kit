// THE WORDS OF «ЗАПУСТИТЬ СЕРВЕР» (node step 738) — chosen on the server, handed to the island as props (one language reaches the browser,
// `check:lang-delivery`). Russian are the owner's own words where he said them (2026-11-14): «проверка сервера → активация домена (…
// первая проверка) → процесс установки сервера → повторной проверки учётных записей … если не видны то мы не можем перейти к шагу …
// проверка установка и обновления сертификатов безопасности который должен заканчиваться чек листом … Только после этого … сообщаешь
// пользователю о том что его сервер готов».

import { LIVE_EN, LIVE_RU, type LiveWords } from "./server-install-live.i18n"

export type LaunchStep = "server" | "check" | "domain" | "repo" | "install" | "telegram" | "recheck" | "certs" | "ready"
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
  /** 760-1: «Запомнить сервер на 24 часа» — the address, port and access deadline in this browser; the password never. `{time}` the deadline */
  remember: { label: string; on: string; off: string; noPassword: string }
  connect: string
  /** 795: the password field appears only when the server asks for it — its lead and the button that opens the access */
  passwordAsk: string
  openAccess: string
  /** 795: a server busy with another install — its «free» lives in the danger zone at the bottom */
  busyBelow: string
  connecting: string
  /** 769: the access is open, the server is checked by a second call — a new server takes up to two minutes; failed — the access stays */
  checking: string
  checkFailed: string
  doing: Record<string, string>
  another: string
  locked: string
  step: Record<LaunchStep, string>
  /** 744-7: one line of what a done step did, shown while it is closed — `{host}` `{time}` `{head}`, `{ok}` of `{all}` required names */
  summary: { server: string; clean: string; related: string; warn: string; install: string; installing: string; recheck: string; certs: string; since: string; pointed: string; botOn: string; botWaits: string; botLater: string; repoSame: string; repoOwn: string }
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
  /** 760-8: step 3 when the DNS is kept by Cloudflare — the node writes with its key when the key sees the zone; `{zone}` `{name}` `{ip}` `{type}` `{content}` */
  /** 760-9: «Claude сделает это в вашем Chrome» — the card and the ready task for the main agent; `{zone}` `{cabinet}` `{at}` `{star}` `{ip}` `{conflicts}` */
  chrome: { title: string; steps: string[]; note: string; button: string; task: string; cabinetCf: string; cabinetOther: string; none: string }
  cf: { title: string; lead: string; add: string; change: string; remove: string; blocked: string; nothing: string; proceed: string; written: string; write: string; byHand: string; confirmTitle: string; confirmLead: string; confirmRemove: string; confirm: string; cancel: string; noKey: string; notVisible: string; keyLink: string; again: string }
  /** 744-7: `silent` — Fractera stands there, its node does not answer yet (the next step waits for it); `ask` reads the server again */
  install: { text: string; install: string; update: string; again: string; running: string; done: string; failed: string; leave: string; silent: string; ask: string }
  /** 808: step 4 — the server's own GitHub repository: «the same project» (this node's fork) or a clean Fractera from the person's own fork;
   *  `{repo}` an address, `{name}` owner/repo as GitHub names it */
  repo: {
    same: string; own: string; sameText: string; ownText: string; done: string; installed: string
    account: string; accountText: string; accountOpen: string; fork: string; forkText: string; forkOpen: string
    url: string; urlLabel: string; urlNote: string; check: string; checked: string
  }
  stage: Record<string, string>
  /** 806-4: the live install — the server's own log and checklist */
  live: LiveWords
  recheck: { text: string; button: string; gate: string; noDomain: string }
  /** 758: step 5 — the server's own bot while the server installs; `{stage}` the installation's stage, `{tail}` the token's last four, `{bot}` @name */
  telegram: {
    text: string; how: string[]; nameLabel: string; usernameLabel: string; copy: string; copied: string; openBotFather: string; replace: string; cancel: string; found: string; notFound: string; label: string; tokenNote: string; save: string; later: string; laterNote: string; connectNow: string
    pending: string; rejected: string; on: string; activateAt: string; activationTitle: string; admitted: string; link: string; linkNote: string; installing: string; waitNode: string
    /** 761-2/761-14: the bot's own lines — `{site}` `{link}` the site, `{terminal}` `{subscription}` the server panel's pages (or `noPanel`) */
    lines: { active: string; inactive: string; noSubscription: string; noPanel: string }
    /** 761-1: can the server's agent answer */
    agentOn: string; agentOff: string; signIn: string; signInOpen: string; signInWatch: string; greeted: string
    /** 760-10: the bot made by the main agent in the person's Telegram Web — `{server}` `{name}` `{username}`; the token stays the person's */
    agent: { title: string; steps: string[]; note: string; button: string; telegramTask: string; botName: string }
  }
  certs: { budget: string; limit: string; checklist: string; name: string; dns: string; cert: string; https: string; httpsButton: string; off: string; afterOn: string; notDue: string }
  /** 744-6: `done` · `links` · `site` · `panel` · `signin` · `next` and the claim words are drawn only under a passed final check
   *  (`ReadyWords`, `check:ready-words`); `missing` names what the check still lacks — `{host}` */
  ready: { text: string; activate: string; activating: string; signinOk: string; signinFail: string; signinButton: string; signinChecking: string; signinHint: string; signinHintLabel: string; links: string; site: string; panel: string; signin: string; next: string; first: string; done: string; claimLead: string; claimSteps: string[]; claimEmail: string; claimRetry: string; claimSending: string; claimSent: string; claimOpen: string; claimFailed: string; claimLoss: string; claimed: string; missing: { title: string; cert: string; https: string; signin: string } }
  dangerZone: string
  busy: { title: string; text: string; clear: string; clearTitle: string; risks: string[]; agree: string; clearConfirm: string; notNow: string; clearing: string; cleared: string; foreignGone: string; foreignLeft: string; failed: string; nodeTitle: string; nodeText: string; nodeClear: string; nodeRisk: string; freshTitle: string; freshText: string; freshClear: string; freshRisk: string; freshAgree: string; freshDisk: string; copiesNone: string; erasedDone: string }
}

/** 814: the claim words only — the claim island never sees `done`, `links` or the other ready words (744-6, `check:ready-words`) */
export type ClaimWords = Pick<ServerLaunchWords["ready"], "claimLead" | "claimSteps" | "claimEmail" | "claimRetry" | "claimSending" | "claimSent" | "claimOpen" | "claimFailed" | "claimLoss">

const STAGE_EN = {
  launch: "Launch", prepare: "Server preparation", source: "Fractera from your fork", install: "Packages, build and elements", update: "The node's own update",
  mark: "The server node's mark", start: "Start", version: "Version",
  "apt-lock": "Package queue", foreign: "Foreign software erased", swap: "Swap", apt: "System packages", node: "Node.js 22", pm2: "Process manager", certbot: "Certbot", user: "The node's user",
  git: "Git", helper: "Root helper", nginx: "nginx", firewall: "Firewall", resolver: "DNS resolver", "pm2-startup": "Autostart", marks: "Marks",
  deps: "The node's packages", telegram: "Telegram for the agents", eyes: "The agent's eyes", build: "The core's build", elements: "Elements", serve: "Start", save: "Process list saved", "launch-mark": "Install mark",
}
const STAGE_RU = {
  launch: "Запуск", prepare: "Подготовка сервера", source: "Fractera из вашего форка", install: "Пакеты, сборка и элементы", update: "Собственное обновление узла",
  mark: "Метка узла сервера", start: "Старт", version: "Версия",
  "apt-lock": "Очередь пакетов", foreign: "Чужие программы стёрты", swap: "Подкачка", apt: "Системные пакеты", node: "Node.js 22", pm2: "Менеджер процессов", certbot: "Certbot", user: "Пользователь узла",
  git: "Git", helper: "Помощник root", nginx: "nginx", firewall: "Файрвол", resolver: "DNS-резолвер", "pm2-startup": "Автозапуск", marks: "Метки",
  deps: "Пакеты узла", telegram: "Telegram агентов", eyes: "Глаза агента", build: "Сборка ядра", elements: "Элементы", serve: "Запуск", save: "Сохранение списка", "launch-mark": "Отметка установки",
}

const en: ServerLaunchWords = {
  title: "Launch a server",
  readOnly: "This address is read-only: servers are launched from the node's own computer, at its keyboard or by its domain after sign-in.",
  launchedOn: "Your node runs on a server: {url}",
  lead: "Type the server's IP address and press «Check the server»: the node finds out itself whether a password is needed. The same address brings the same server back with everything it is doing now, so several servers can be launched one after another.",
  host: "Server IP address",
  port: "SSH port",
  password: "Root password",
  passwordNote: "Opens access to this server for one day: the server itself closes it at the deadline. The password is used once and kept nowhere; while the access lasts, this browser needs no password for this server.",
  remember: {
    label: "Remember the server for 24 hours",
    on: "The page keeps this server's IP and port while the access lasts, a day at most. The password is kept nowhere: while the access lasts, it is not needed.",
    off: "The page keeps nothing: after a reload it is empty again. Handy when you launch several servers one after another.",
    noPassword: "No password needed until {time}: this browser already has access to the server. Press «Check the server».",
  },
  connect: "Check the server",
  passwordAsk: "This browser has no access to the server yet. Type the root password from your provider's letter — it opens the access for one day.",
  openAccess: "Open the access",
  busyBelow: "The server is busy with another installation — it is freed in the «Danger zone» at the bottom of the page.",
  connecting: "Connecting to the server…",
  checking: "The access is open. Checking the server… up to two minutes on a new server.",
  checkFailed: "The access is open for a day, but the server's check did not finish ({reason}). Press «Check the server» again — no password needed.",
  doing: { "records-plan": "Asking Cloudflare whether the node can write the records itself…", "records-write": "Writing the records into Cloudflare and checking them…", any: "Working on the server…", clear: "Freeing the server… under a minute.", domain: "Checking the domain…", detect: "Looking up where the domain's records live…", way: "Saving the way…", "dns-check": "Asking public DNS for every name…", dns: "Asking public DNS for every name…", certs: "Issuing certificates… about a minute per name.", check: "Checking HTTPS of every name from the internet…", activate: "Switching the domain on… sign-in restarts, up to a minute.", install: "Starting the installation…", state: "Reading the server…", repo: "Checking and saving on the server…" },
  another: "Another server",
  locked: "opens when the step before it is done",
  step: { server: "The server", check: "Check the server", domain: "Domain activation", repo: "The server's GitHub repository", install: "Server installation", telegram: "The server's Telegram bot", recheck: "Second check of the records", certs: "Security certificates", ready: "The server is ready" },
  summary: {
    server: "{host} · access until {time}", clean: "A clean server", related: "Fractera from your fork ({head})", warn: "read the notes",
    install: "Fractera {head} installed, the server's node answers", installing: "the installation runs on the server", recheck: "{ok} of {all} names point to the server", certs: "{ok} of {all} names: a certificate and HTTPS",
    botOn: "bot {bot} connected", botWaits: "the token …{tail} waits for the server's node", botLater: "no bot — later", repoSame: "the same project · {repo}", repoOwn: "your own fork · {repo}",
    since: "recorded {date}",
    pointed: "{ok} of {all} names point to the server now — step 5 checks again",
  },
  connected: "Server {host} is connected. The server's key fingerprint: {fp}.",
  access: { until: "Access until {time} (24 h at most)", close: "Close access", closing: "Closing the access…" },
  window: { open: "Open the server's panel", opening: "Opening an SSH window…", link: "The server's panel: {url}", note: "Through SSH, on this computer only, while the access lasts; «Close access» closes it too." },
  errors: {
    "bad-token": "That is not a BotFather token: digits, a colon and a long code.", "token-refused": "Telegram does not know this token: copy it from @BotFather again (or the whole message).", "telegram-silent": "Telegram did not answer now, the token is not kept — try again in a minute.", "token-rejected": "Telegram did not accept this token: copy it from @BotFather again.", "telegram-unreachable": "The server could not reach Telegram: try again in a minute.", "no-bot": "The bot is not connected yet.", "server-silent": "The server's node did not answer: try again in a minute.",
    "not-ready": "Not every name is ready yet: each needs a certificate, and HTTPS where it is due (step 6).", "check-first": "The server's own node has not counted the names as ready: run «Check HTTPS from the internet» in step 6. If it stays, update the server in step 4 — its version may be older than this computer's.", "auth-not-answering": "Sign-in on the server did not answer after the switch: check again in a minute.", "nginx-refused": "The server's web server did not accept the new settings.", "door-silent": "The server's node gave no answer.", "door-refused": "The server's node refused the step.",
    auth: "The server refused the password.", "bad-email": "This does not look like an e-mail address.", "auth-too-old": "The server's sign-in is older than the e-mail claim — install the server again from zero (the danger zone below).", claimed: "The architect is already registered on this server.", "need-password": "This browser has no open access to this server: type the root password — access lasts a day.", "no-password-login": "This server takes no password login (the provider switched it off). Switch password login for root on in the provider's panel, or reinstall the server with a password — the node never uses a provider's keys.", "key-refused": "The server's SSH does not know an access deadline (OpenSSH older than 8.2): the node gives no access without one. Update the server's system.", "visit-install": "The access could not be written on the server.", unrelated: "This server holds a state not related to this node: delete the previous state first.", "domain-not-ready": "The domain (step 3) is not ready yet: finish it, then install.", unreachable: "The server does not answer on this address and port.",
    timeout: "The server did not answer in time.", "bad-address": "That is not a server address.", "bad-password": "The password cannot contain line breaks.",
    running: "A launch is already running on this server.", "server-unfit": "The node cannot live on this server: see the check.", "no-ip": "The server's IPv4 address is unknown.", "no-fork": "This node has no GitHub fork to install from.",
    "repo-bad-url": "That is not a GitHub repository address: it looks like https://github.com/<login>/<repository>.", "repo-original": "This is Fractera's original itself, not your fork: press «Fork» and enter the address of your copy.", "repo-fork-of-fork": "This is a fork of someone else's fork: only a direct fork of Fractera can be installed.", "repo-not-fork": "This repository is not a fork of Fractera.", "repo-not-found": "GitHub does not know this repository, or it is private.", "repo-github-limit": "GitHub limited the checks for now: try again in an hour.", "repo-github-silent": "GitHub did not answer now: try again in a minute.", "repo-installed": "Fractera already stands on the server: its repository changes only by clearing the server.", "repo-not-chosen": "First the step «The server's GitHub repository»: check your fork or choose «The same project».",
    "le-limit": "Let's Encrypt's weekly limit would be passed: {week} certificates this week, {want} more needed{over}. Wait until the week frees up.", "not-live": "The server's node does not run yet.",
    "not-confirmed": "The address in the dialog does not match.", "public-address": "This address is read-only.", "on-server": "A server node launches nothing.", network: "The node did not answer.", unreadable: "The answer could not be read.",
    "tunnel-record": "A name leads to this computer's own tunnel: move it off the computer first.", "plan-changed": "The zone changed since you looked: read the new list and confirm again.", "cloudflare-read": "Cloudflare did not answer the reading of the zone.", "cloudflare-write": "Cloudflare refused a record: try again in a minute.",
    "bad-domain": "That is not a domain name.", "no-domain": "Choose a domain first.", "no-cloudflare-token": "This node has no Cloudflare key.",
  },
  changed: { title: "The server shows a different key", text: "The key this server shows is not the one this computer remembers. If you reinstalled the system, trust the new key: type the root password and press the button. If you did not, stop here — someone may be in the middle.", seen: "Now:", pinned: "Remembered:", trust: "The server was reinstalled — trust the new key" },
  verdict: { ok: "The server fits.", warn: "The server will do — read the notes.", fail: "The node cannot live on this server:" },
  item: { os: "System", arch: "Processor", memory: "Free memory, MB (a fresh node holds)", disk: "Free disk, GB (needed)", cores: "Cores (recommended)", ram: "Memory, MB (recommended)", ports: "Ports 80/443", address: "Public address", systemd: "Autostart (systemd)", sites: "nginx already serves other sites — the node would break them; free the server first", others: "Programs of another installation run as root (pm2 processes)" },
  fractera: { none: "Fractera is not installed here.", there: "Fractera is installed: version {head}.", behind: "It is {n} commits behind your fork.", latest: "It has everything your fork has.", unknown: "How far behind it is could not be measured (GitHub did not answer).", launching: "A launch is running on this server now." },
  strategy: { install: "Next: install a fresh Fractera from your fork.", update: "Next: update it ({n} behind).", latest: "Next: nothing to install — go on to the domain.", running: "Next: follow the launch below.", clear: "Next: delete the previous state — it is erased for good, a clean disk." },
  relation: { clean: "A clean server: no Fractera, no other sites or programs.", related: "Related to this node: Fractera from your fork.", unrelated: "Not related to this node:" },
  reason: { moved: "a copy moved here from {from} on {date} (the old move, not a launch from your fork)", "other-fork": "a node from another fork: {origin}", "no-origin": "a node without a GitHub source", "other-nodes": "other Fractera nodes: {folders}", "foreign-sites": "nginx sites: {sites}", "root-programs": "programs of root in pm2: {n}" },
  preflight: { ok: "A trial merge on the server passed: the update will go through.", stop: "A trial merge on the server stops on files changed both there and in Fractera: {files}. The update would be refused; the server is untouched.", unknown: "Could not check in advance whether the update will pass." },
  recheckServer: "Check again",
  domainNote: "The installation opens once the domain has a way to write its records and they were checked once. They need not answer yet: DNS wakes up while the server installs, and the second check waits for it.",
  chrome: {
    title: "Claude can write these records in your Chrome",
    steps: [
      "Use Google Chrome with the Claude extension signed in to your account (https://claude.ai/chrome).",
      "In that Chrome, sign in to the place that keeps the records: {cabinet}.",
      "Press the button: the main agent's terminal opens with the task ready. Send it and watch the tab fill in.",
    ],
    note: "Passwords, codes and payments stay yours. A record to delete the agent prepares, and you press «Delete».",
    button: "Hand it to the agent",
    task: "Write the DNS records of {zone} in my Chrome (skill help-in-browser). The records are kept by {cabinet}; I am signed in there in this Chrome. Add: A «{at}» → {ip} and A «{star}» → {ip}, grey cloud (DNS only). Records in the way: {conflicts} — prepare their deletion, I press it. Do not touch mail or any other record. Then come back to «Activate a dedicated server» and press «Check DNS» in step 3.",
    cabinetCf: "Cloudflare (dash.cloudflare.com → {zone} → DNS → Records)",
    cabinetOther: "the cabinet that keeps its DNS (servers {ns}){registrar}",
    none: "none",
  },
  cf: {
    title: "The node writes the records itself",
    lead: "This domain's DNS is in Cloudflare, and the node's Cloudflare key sees the zone {zone}. The node writes the records with a grey cloud (DNS only) and checks them.",
    add: "Add: A {name} → {ip}",
    change: "Switch the proxy off: A {name} → {ip}",
    remove: "Remove: {type} {name} → {content}",
    blocked: "{name} leads to this computer's own tunnel ({content}). Move that name off the computer first: one name has one road.",
    nothing: "The zone already leads every name to the server: nothing to write.", proceed: "The records are already right — go on",
    written: "Written at {time}: {add} records to the server, {remove} removed. Public DNS catches up within minutes — step 6 checks again.",
    write: "Write the records",
    byHand: "Write them by hand instead",
    confirmTitle: "Write the records of {zone}?",
    confirmLead: "The node changes exactly these records in Cloudflare. Mail and every other record stay as they are.",
    confirmRemove: "The removed records stop leading where they lead now: whatever answers on those names today stops answering.",
    confirm: "Write",
    cancel: "Not now",
    noKey: "This domain's DNS is in Cloudflare, but the node has no Cloudflare key. Give it one on «Domain activation» → the Cloudflare key card, and the node writes the records itself. Or write them by hand below.",
    notVisible: "This domain's DNS is in Cloudflare, but the node's key does not see the zone {zone}: it lives in another Cloudflare account. Give the node a key with access to that account on «Domain activation» → the Cloudflare key card, then «Check again». Or write the records by hand below.",
    keyLink: "Open «Domain activation»",
    again: "Check again",
  },
  install: {
    text: "Server preparation, a fresh Fractera from your fork, the build of the core and of every element, the start. About 40–50 minutes on a server with 8 GB. You may close the page and come back: the installation runs on the server.",
    install: "Install", update: "Update", again: "Continue the installation", running: "Installing on the server…", done: "Installed: version {head}.", failed: "The installation stopped at «{stage}».", leave: "You may close this page: the server goes on by itself.",
    silent: "Fractera is installed, but the server's node does not answer yet: the next step waits for it.", ask: "Ask the server again",
  },
  repo: {
    same: "The same project", own: "A clean Fractera",
    sameText: "The server gets your project's code from the same GitHub repository as this computer: {repo}. Updates are shared; the server's data is its own.",
    ownText: "A clean Fractera starter on any VPS: the server installs from your own fork of Fractera.",
    done: "Done", installed: "The server stands on {repo}. Its repository changes only by clearing the server (the danger zone below).",
    account: "Register a GitHub account", accountText: "A free account — the server's own repository lives in it.", accountOpen: "Open GitHub",
    fork: "Fork the Fractera repository", forkText: "Open Fractera's repository and press «Fork» in your account.", forkOpen: "Open the Fractera repository",
    url: "Enter the address of your repository", urlLabel: "Your fork's address", urlNote: "For example https://github.com/<your-login>/web4-node-starter-kit", check: "Check", checked: "GitHub confirmed: {name} is a direct fork of Fractera.",
  },
  stage: STAGE_EN,
  live: LIVE_EN,
  telegram: {
    text: "While the server installs, give it a Telegram bot of its own: from then on you talk to the server's main agent from the phone. You can skip it and connect it later.",
    how: ["In Telegram open @BotFather and send /newbot.", "BotFather asks for a name, then the bot's address. Copy them from here one by one and paste them into the chat:", "BotFather answers with a token like 1234567890:AA… — paste it here, in the field below."],
    nameLabel: "The bot's name", usernameLabel: "The bot's address (ends in «bot»)", copy: "Copy", copied: "Copied", openBotFather: "Open @BotFather", replace: "Replace the bot", cancel: "Cancel", found: "Token found: …{tail}. Telegram checks it before it is kept.", notFound: "No token here: paste it, or BotFather's whole message.",
    label: "The bot's token, or BotFather's whole message",
    tokenNote: "The token goes to the server and is kept only there; this page sees its last four characters.",
    save: "Connect the bot",
    later: "Later",
    laterNote: "No bot for now: the next steps go on without it. It can be connected here or in the server's panel at any time.",
    connectNow: "Connect a bot",
    pending: "The bot {bot}is checked by Telegram, its token …{tail} is kept on the server; the bot switches on by itself when the server's node starts.",
    on: "Bot {bot} is connected to the server's main agent.",
    activateAt: "The bot is activated in the step «Server ready»: the invite link and the server's Claude Code sign-in.",
    activationTitle: "Telegram bot of the server {bot}",
    admitted: "People admitted: {n}. Open the link and press Start — the server's agent greets you.",
    link: "Get the invite link",
    linkNote: "The link admits whoever opens it first: open it yourself, do not forward it.",
    installing: "The installation goes on meanwhile: {stage}.",
    waitNode: "The installation is done; waiting for the server's node to answer.",
    lines: {
      active: "The server's agent is on — write, Claude Code answers.\nServer {site}: {link}",
      inactive: "The server's agent is off — answers come once it is started.\nThe architect starts it after signing in: {terminal}",
      noSubscription: "You will get answers as soon as an active Claude Code subscription is connected.\nConnecting it is open after signing in as the architect: {subscription}",
      noPanel: "the server's panel, opened from the launch page",
    },
    agentOn: "The server's agent is signed in to Claude Code and can answer; the greeting comes to Telegram by itself.",
    agentOff: "Claude Code on the server is not signed in: the bot answers only with the node's line, the agent cannot reply. The sign-in is yours — on the server's own page.",
    signIn: "Sign in on the server",
    signInOpen: "Open the server's subscription page",
    signInWatch: "Waiting for the sign-in: this step checks the server every few seconds.",
    greeted: "The server's agent is signed in, and its greeting has gone to Telegram.",
    agent: {
      title: "Claude can make the bot in your Telegram Web",
      steps: [
        "In the Chrome with the Claude extension, sign in to https://web.telegram.org.",
        "Press the button: the main agent's terminal opens with the task ready. Send it and watch BotFather's chat.",
        "When BotFather answers «Done!», copy the token from its message into the field below and press «Connect the bot». Then tell the agent «done»: it opens the invite link and presses Start.",
        "If Chrome asks «Open Telegram?» — press «Cancel»: the agent works in the Telegram Web tab, it needs no app.",
      ],
      note: "The agent never reads BotFather's answer with the token and never types it: the token goes from you to the server only.",
      button: "Hand it to the agent",
      telegramTask: "Make a Telegram bot for the server {server} in my Telegram Web (skill help-in-browser). I am signed in to https://web.telegram.org in this Chrome. Open @BotFather, send /newbot, the bot's name «{name}», its address @{username}. After you send the address, do not read the page and take no screenshot: ask me what BotFather answered. «Done!» — I paste the token into step 5 of «Activate a dedicated server» myself; «already taken» — offer me another address and wait for my yes. Never type or read the token. When I say «done», press «Get the invite link» in step 5, open the link in Telegram Web, press Start and wait for the server agent's greeting. Never open a t.me address in the tab: Chrome asks «Open Telegram?», a window you neither see nor can press. Open https://t.me/<bot>?start=<code> as https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D<bot>%26start%3D<code>.",
      botName: "{server} server",
    },
    rejected: "Telegram did not accept the token …{tail} when the server's node started: copy it from @BotFather again.",
  },
  recheck: { text: "Every name of the node is asked of two public DNS resolvers. Until every required name points to the server, the certificates cannot start.", button: "Check the records", gate: "Not every required name points to the server yet.", noDomain: "No domain is chosen: the server answers only by its IP." },
  certs: { budget: "This week {week} of 50 Let's Encrypt certificates were issued for {domain}.", limit: "Limits: 50 per domain per week, 5 per name per week (letsencrypt.org).", checklist: "Checklist", name: "Name", dns: "DNS", cert: "Certificate", https: "HTTPS", httpsButton: "Check HTTPS from the internet", off: "switched off", afterOn: "after the domain is on", notDue: "Grey lines are not errors: a switched-off element answers once you switch it on, and sign-in answers once the domain is on. Their certificates are already in place." },
  ready: {
    text: "Switch the domain on: sign-in moves to https://auth.{zone}, the bare IP leads to the panel, the elements learn their addresses.", activate: "Switch the domain on", activating: "Switching on…",
    signinOk: "Checked at {time}: sign-in leads to https://auth.{zone}.", signinFail: "Checked at {time}: sign-in does not lead to https://auth.{zone} yet: {detail}", signinButton: "Check sign-in again", signinChecking: "Checking sign-in…",
    signinHint: "The node opens the server from the internet, like any visitor, and checks that the panel's sign-in leads to https://auth.{zone}. It does not touch your password or account. Press it when the line under the button is red.", signinHintLabel: "What this button does", links: "Links:", site: "Site", panel: "Panel", signin: "Sign-in",
    next: "Next, in the server's own panel: its Claude Code subscription and its Telegram bot.", first: "The first registration on the server becomes its architect for good — and only with the e-mail you give on this step.", done: "Your server is ready.",
    missing: { title: "Not ready yet — the final check still misses:", cert: "{host}: no valid certificate", https: "{host}: HTTPS does not answer from the internet", signin: "sign-in does not lead to https://{host} yet" },
    claimLead: "To get the right to create the architect's account on the new server, we need your e-mail. Attention: only the person with exactly the same e-mail gets the right to become the first superuser, who can create other superusers.",
    claimSteps: ["Type your e-mail address. Write it down and keep it.", "The node passes the address to the server by itself — wait for «The server waits for the architect's registration…» under the field.", "Press «Open the registration on the server» and register with the very same e-mail address; make up a password. Write the password down and keep it."],
    claimEmail: "The architect's e-mail", claimRetry: "Pass it again", claimSending: "Passing your e-mail to the server, this takes up to 15 seconds…", claimSent: "The server waits for the architect's registration with {email}.", claimOpen: "Open the registration on the server", claimFailed: "The server did not take the e-mail: {reason}. Try again.",
    claimLoss: "Attention: if you lose the e-mail address and the password before you create another superuser, you cannot restore access to the server. You would have to install the server again, and all its data would be lost for good.", claimed: "The architect is already registered on this server.",
  },
  dangerZone: "Danger zone",
  busy: {
    freshTitle: "Install again, from zero",
    freshText: "The server already runs this node's earlier install. To start from zero without reinstalling the system: the old node stops and is ERASED for good together with every older copy and the caches — a clean disk, as on a new server — and a fresh node from your fork is installed in its place.",
    freshClear: "Install from zero…",
    freshRisk: "The node on {host} stops at once and is erased for good: its data, keys and history, every older copy in /root/fractera-cleared-… and everything earlier installers left (Fractera Easy Starter in /opt/fractera*, root's caches, Docker's unused) — nothing can be brought back. While the new node installs, its sites answer «the node is updating». The certificates, SSH keys and the server's Claude Code sign-in stay.",
    freshAgree: "I understand: the node on {host} is erased for good and a new one is installed",
    freshDisk: "The disk now: {used} of {total} GB used, {free} GB free; older copies of the node: {copies}.",
    copiesNone: "none",
    foreignGone: "Foreign programs erased: {list}.", foreignLeft: "Still listening and not Fractera's: {list} — erase it before the install.",
    erasedDone: "The server is cleaned: erased for good — {nodes} and {count} older copies and caches; {freed} GB freed, {free} GB free now. The check ran again.",
    nodeTitle: "This server holds a Fractera node that is not this node's",
    nodeText: "Delete the previous state: the node stops and is erased for good with every older copy — a clean disk — and a fresh node from your fork goes in its place.",
    nodeClear: "Delete the previous state…",
    nodeRisk: "The node {nodes} stops at once and is erased for good — its data, keys and history and every older copy in /root/fractera-cleared-…; nothing can be brought back. Its sites stop answering until the new node is installed.",
    title: "The server is taken by another installation",
    text: "Other programs and sites already run on this server. The node can free it for itself — or you simply do not go on.",
    clear: "Free the server…",
    clearTitle: "Free the server {host}?",
    risks: [
      "The sites on this server stop answering at once: {sites}.",
      "The programs of the earlier installation ({n}) stop and do not come back after a reboot.",
      "Nothing is deleted: the programs' folders and databases stay; the list of programs and the sites' files are kept in /root/fractera-cleared-… — everything can be put back by hand.",
      "If something you or other people need runs on this server, take a clean server instead.",
    ],
    agree: "I understand: the sites and programs on {host} stop",
    clearConfirm: "Stop them and free the server",
    notNow: "Not now",
    clearing: "Cleaning the server: the earlier programs stop, a Fractera node and its older copies are erased, the foreign sites move to a backup folder there. Up to a few minutes; the check runs again by itself.",
    cleared: "The server is freed: programs stopped — {n}, everything kept in {backup}. The check ran again.",
    failed: "Freeing failed:",
  },
}

const ru: ServerLaunchWords = {
  title: "Запустить сервер",
  readOnly: "Этот адрес только для чтения: серверы запускаются с компьютера самого узла, за его клавиатурой или по его домену после входа.",
  launchedOn: "Ваш узел работает на сервере: {url}",
  lead: "Введите IP-адрес сервера и нажмите «Проверить сервер»: узел сам узнает, нужен ли пароль. Тот же адрес возвращает тот же сервер со всем, что он сейчас делает, поэтому несколько серверов можно запускать по очереди.",
  host: "IP-адрес сервера",
  port: "Порт SSH",
  password: "Пароль root",
  passwordNote: "Открывает доступ к этому серверу на сутки: в срок его закрывает сам сервер. Пароль нужен один раз и нигде не хранится; пока доступ открыт, этому браузеру пароль для этого сервера не нужен.",
  remember: {
    label: "Запомнить сервер на 24 часа",
    on: "Страница помнит IP и порт этого сервера, пока открыт доступ, но не больше суток. Пароль не хранится нигде: пока доступ открыт, он не нужен.",
    off: "Страница ничего не хранит: после перезагрузки она снова пустая. Так удобно запускать несколько серверов по очереди.",
    noPassword: "Пароль не нужен до {time}: у этого браузера уже есть доступ к серверу. Нажмите «Проверить сервер».",
  },
  connect: "Проверить сервер",
  passwordAsk: "У этого браузера ещё нет доступа к серверу. Введите пароль root из письма провайдера — он откроет доступ на сутки.",
  openAccess: "Открыть доступ",
  busyBelow: "Сервер занят другой установкой — освободить его можно в «Опасной зоне» внизу страницы.",
  connecting: "Подключаюсь к серверу…",
  checking: "Доступ открыт. Проверяю сервер… на новом сервере до двух минут.",
  checkFailed: "Доступ открыт на сутки, но проверка сервера не закончилась ({reason}). Нажмите «Проверить сервер» ещё раз — пароль не нужен.",
  doing: { "records-plan": "Спрашиваю Cloudflare, может ли узел вписать записи сам…", "records-write": "Вписываю записи в Cloudflare и проверяю их…", any: "Выполняю шаг на сервере…", clear: "Освобождаю сервер… меньше минуты.", domain: "Проверяю домен…", detect: "Ищу, где живут записи домена…", way: "Сохраняю способ…", "dns-check": "Спрашиваю публичные DNS о каждом имени…", dns: "Спрашиваю публичные DNS о каждом имени…", certs: "Выпускаю сертификаты… около минуты на имя.", check: "Проверяю HTTPS каждого имени из интернета…", activate: "Включаю домен… вход перезапускается, до минуты.", install: "Запускаю установку…", state: "Читаю состояние сервера…", repo: "Проверяю и сохраняю на сервере…" },
  another: "Другой сервер",
  locked: "откроется, когда будет готов предыдущий шаг",
  step: { server: "Сервер", check: "Проверка сервера", domain: "Активация домена", repo: "GitHub-репозиторий сервера", install: "Установка сервера", telegram: "Telegram-бот сервера", recheck: "Повторная проверка записей", certs: "Сертификаты безопасности", ready: "Сервер готов" },
  summary: {
    server: "{host} · доступ до {time}", clean: "Чистый сервер", related: "Fractera из вашего форка ({head})", warn: "есть замечания",
    install: "Fractera {head} установлена, узел сервера отвечает", installing: "на сервере идёт установка", recheck: "{ok} из {all} имён ведут на сервер", certs: "{ok} из {all} имён: сертификат и HTTPS",
    botOn: "бот {bot} подключён", botWaits: "токен …{tail} ждёт узел сервера", botLater: "без бота — позже", repoSame: "тот же проект · {repo}", repoOwn: "свой форк · {repo}",
    since: "записано {date}",
    pointed: "сейчас на сервер ведут {ok} из {all} имён — шаг 5 проверит ещё раз",
  },
  connected: "Сервер {host} подключён. Отпечаток ключа сервера: {fp}.",
  access: { until: "Доступ до {time} (не больше 24 ч)", close: "Закрыть доступ", closing: "Закрываю доступ…" },
  window: { open: "Открыть пульт сервера", opening: "Открываю окно SSH…", link: "Пульт сервера: {url}", note: "Через SSH, только на этом компьютере, пока открыт доступ; «Закрыть доступ» закрывает и его." },
  errors: {
    "bad-token": "Это не токен BotFather: цифры, двоеточие и длинный код.", "token-refused": "Telegram не знает такого токена: скопируйте его из @BotFather ещё раз (или всё сообщение целиком).", "telegram-silent": "Telegram сейчас не ответил, токен не сохранён — попробуйте ещё раз через минуту.", "token-rejected": "Telegram не принял этот токен: скопируйте его из @BotFather ещё раз.", "telegram-unreachable": "Сервер не достучался до Telegram: попробуйте через минуту.", "no-bot": "Бот ещё не подключён.", "server-silent": "Узел сервера не ответил: попробуйте через минуту.",
    "not-ready": "Ещё не все имена готовы: каждому нужен сертификат, а где положено — HTTPS (шаг 6).", "check-first": "Узел сервера ещё не считает имена готовыми: нажмите «Проверить HTTPS из интернета» в шаге 6. Если не помогло, обновите сервер в шаге 4 — его версия может быть старше, чем у этого компьютера.", "auth-not-answering": "Вход на сервере не ответил после включения: проверьте ещё раз через минуту.", "nginx-refused": "Веб-сервер на сервере не принял новые настройки.", "door-silent": "Узел сервера ничего не ответил.", "door-refused": "Узел сервера отказал в этом шаге.",
    auth: "Сервер не принял пароль.", "bad-email": "Это не похоже на адрес электронной почты.", "auth-too-old": "Вход на сервере старше, чем вход по e-mail архитектора — установите сервер заново, с нуля (опасная зона внизу).", claimed: "Архитектор на этом сервере уже зарегистрирован.", "need-password": "У этого браузера нет открытого доступа к этому серверу: введите пароль root — доступ откроется на сутки.", "no-password-login": "Этот сервер не принимает вход по паролю (провайдер его выключил). Включите вход по паролю для root в панели провайдера или переустановите сервер с паролем — ключи провайдера узел не использует.", "key-refused": "SSH сервера не знает срока доступа (OpenSSH старше 8.2): без срока узел доступа не даёт. Обновите систему сервера.", "visit-install": "Не удалось записать доступ на сервер.", unrelated: "На сервере состояние, не связанное с этим узлом: сначала удалите прежнее состояние.", "domain-not-ready": "Домен (шаг 3) ещё не готов: закончите его, затем установка.", unreachable: "Сервер не отвечает на этом адресе и порту.",
    timeout: "Сервер не ответил вовремя.", "bad-address": "Это не адрес сервера.", "bad-password": "В пароле не может быть переносов строки.",
    running: "На этом сервере уже идёт запуск.", "server-unfit": "Узел не сможет жить на этом сервере: смотрите проверку.", "no-ip": "IPv4-адрес сервера неизвестен.", "no-fork": "У этого узла нет форка на GitHub, из которого ставить.",
    "repo-bad-url": "Это не адрес репозитория GitHub: он выглядит так — https://github.com/<логин>/<репозиторий>.", "repo-original": "Это сам оригинал Fractera, а не ваш форк: нажмите «Fork» и введите адрес своей копии.", "repo-fork-of-fork": "Это форк чужого форка: ставится только прямой форк Fractera.", "repo-not-fork": "Этот репозиторий — не форк Fractera.", "repo-not-found": "GitHub не знает такого репозитория, или он закрыт.", "repo-github-limit": "GitHub временно ограничил проверки: повторите через час.", "repo-github-silent": "GitHub сейчас не ответил: попробуйте ещё раз через минуту.", "repo-installed": "На сервере уже стоит Fractera: репозиторий меняется только очисткой сервера.", "repo-not-chosen": "Сначала шаг «GitHub-репозиторий сервера»: проверьте свой форк или выберите «Тот же проект».",
    "le-limit": "Будет превышен недельный лимит Let's Encrypt: за неделю {week} сертификатов, нужно ещё {want}{over}. Дождитесь, пока неделя освободится.", "not-live": "Узел на сервере ещё не работает.",
    "not-confirmed": "Адрес в диалоге не совпадает.", "public-address": "Этот адрес только для чтения.", "on-server": "Узел на сервере ничего не запускает.", network: "Узел не ответил.", unreadable: "Ответ не удалось прочитать.",
    "tunnel-record": "Имя ведёт на туннель этого компьютера: сначала уберите его с компьютера.", "plan-changed": "Зона изменилась, пока вы смотрели: прочитайте новый список и подтвердите снова.", "cloudflare-read": "Cloudflare не ответил на чтение зоны.", "cloudflare-write": "Cloudflare не принял запись: попробуйте через минуту.",
    "bad-domain": "Это не имя домена.", "no-domain": "Сначала выберите домен.", "no-cloudflare-token": "У этого узла нет ключа Cloudflare.",
  },
  changed: { title: "Сервер показывает другой ключ", text: "Ключ, который показывает сервер, не тот, что помнит этот компьютер. Если вы переустановили систему, доверьтесь новому ключу: введите пароль root и нажмите кнопку. Если не переустанавливали, остановитесь: посередине может быть кто-то чужой.", seen: "Сейчас:", pinned: "Помню:", trust: "Сервер переустановлен — доверять новому ключу" },
  verdict: { ok: "Сервер подходит.", warn: "Сервер подойдёт — прочитайте замечания.", fail: "Узел не сможет жить на этом сервере:" },
  item: { os: "Система", arch: "Процессор", memory: "Свободная память, МБ (свежий узел держит)", disk: "Свободный диск, ГБ (нужно)", cores: "Ядра (рекомендуется)", ram: "Память, МБ (рекомендуется)", ports: "Порты 80/443", address: "Публичный адрес", systemd: "Автозапуск (systemd)", sites: "nginx уже обслуживает другие сайты — узел их сломает; сначала освободите сервер", others: "Работают программы другой установки от root (процессы pm2)" },
  fractera: { none: "Fractera здесь не установлена.", there: "Fractera установлена: версия {head}.", behind: "Отстаёт от вашего форка на {n} коммитов.", latest: "В нём всё, что есть в вашем форке.", unknown: "Насколько отстаёт, измерить не удалось (GitHub не ответил).", launching: "На этом сервере сейчас идёт запуск." },
  strategy: { install: "Дальше: установить свежую Fractera из вашего форка.", update: "Дальше: обновить (отстаёт на {n}).", latest: "Дальше: ставить нечего, переходите к домену.", running: "Дальше: следите за запуском ниже.", clear: "Дальше: удалить прежнее состояние — оно стирается навсегда, диск чистый." },
  relation: { clean: "Чистый сервер: ни Fractera, ни других сайтов и программ.", related: "Связан с этим узлом: Fractera из вашего форка.", unrelated: "Не связан с этим узлом:" },
  reason: { moved: "копия, перенесённая сюда с {from} {date} (старый переезд, а не запуск из вашего форка)", "other-fork": "узел из другого форка: {origin}", "no-origin": "узел без источника на GitHub", "other-nodes": "другие узлы Fractera: {folders}", "foreign-sites": "сайты nginx: {sites}", "root-programs": "программ root в pm2: {n}" },
  preflight: { ok: "Пробное слияние на сервере прошло: обновление пройдёт.", stop: "Пробное слияние на сервере останавливается на файлах, изменённых и там, и в Fractera: {files}. Обновление было бы отклонено; сервер не тронут.", unknown: "Заранее проверить, пройдёт ли обновление, не удалось." },
  recheckServer: "Проверить ещё раз",
  domainNote: "Установка откроется, когда у домена будет выбран способ внести записи и они проверены один раз. Отвечать им пока не обязательно: DNS просыпается, пока сервер ставится, а повторная проверка их дождётся.",
  chrome: {
    title: "Claude впишет эти записи в вашем Chrome",
    steps: [
      "Откройте Google Chrome с расширением Claude, вошедшим в ваш аккаунт (https://claude.ai/chrome).",
      "В этом же Chrome войдите туда, где хранятся записи: {cabinet}.",
      "Нажмите кнопку: откроется терминал главного агента с готовой задачей. Отправьте её и смотрите, как заполняется вкладка.",
    ],
    note: "Пароли, коды и оплата остаются за вами. Запись, которую нужно удалить, агент подготовит, а «Delete» нажмёте вы.",
    button: "Отдать агенту",
    task: "Впиши записи DNS домена {zone} в моём Chrome (навык help-in-browser). Записи хранит {cabinet}, я уже вошёл туда в этом Chrome. Добавь: A «{at}» → {ip} и A «{star}» → {ip}, облако серое (DNS only). Мешающие записи: {conflicts}. Подготовь их удаление, нажму я. Почту и прочие записи не трогай. Потом вернись на страницу «Активация выделенного сервера» и нажми «Проверить DNS» в шаге 3.",
    cabinetCf: "Cloudflare (dash.cloudflare.com → {zone} → DNS → Records)",
    cabinetOther: "кабинет, где ведётся DNS домена (серверы {ns}){registrar}",
    none: "нет",
  },
  cf: {
    title: "Узел впишет записи сам",
    lead: "DNS этого домена в Cloudflare, и ключ Cloudflare узла видит зону {zone}. Узел впишет записи с серым облаком (DNS only) и сам их проверит.",
    add: "Добавлю: A {name} → {ip}",
    change: "Выключу прокси: A {name} → {ip}",
    remove: "Удалю: {type} {name} → {content}",
    blocked: "{name} ведёт на туннель этого компьютера ({content}). Сначала уберите это имя с компьютера: у имени одна дорога.",
    nothing: "Зона уже ведёт все имена на сервер, вписывать нечего.", proceed: "Записи уже верны — дальше",
    written: "Вписано в {time}: записей на сервер — {add}, удалено — {remove}. Публичные DNS догонят за несколько минут — шаг 6 проверит ещё раз.",
    write: "Вписать записи",
    byHand: "Вписать вручную",
    confirmTitle: "Вписать записи {zone}?",
    confirmLead: "Узел изменит в Cloudflare ровно эти записи. Почта и все прочие записи останутся как есть.",
    confirmRemove: "Удалённые записи перестанут вести туда, куда ведут сейчас: то, что сегодня открывается по этим именам, перестанет открываться.",
    confirm: "Вписать",
    cancel: "Не сейчас",
    noKey: "DNS этого домена в Cloudflare, но у узла нет ключа Cloudflare. Дайте его на странице «Активация домена» в карточке ключа Cloudflare, и узел впишет записи сам. Или впишите их вручную ниже.",
    notVisible: "DNS этого домена в Cloudflare, но ключ узла не видит зону {zone}: она в другом аккаунте Cloudflare. Дайте узлу ключ с доступом к этому аккаунту на странице «Активация домена» в карточке ключа Cloudflare и нажмите «Проверить снова». Или впишите записи вручную ниже.",
    keyLink: "Открыть «Активацию домена»",
    again: "Проверить снова",
  },
  install: {
    text: "Подготовка сервера, свежая Fractera из вашего форка, сборка ядра и всех элементов, запуск. Около 40–50 минут на сервере с 8 ГБ. Страницу можно закрыть и вернуться: установка идёт на самом сервере.",
    install: "Установить", update: "Обновить", again: "Продолжить установку", running: "Идёт установка на сервере…", done: "Установлено: версия {head}.", failed: "Установка остановилась на этапе «{stage}».", leave: "Эту страницу можно закрыть: сервер продолжит сам.",
    silent: "Fractera установлена, но узел сервера пока не отвечает: следующий шаг его ждёт.", ask: "Спросить сервер ещё раз",
  },
  repo: {
    same: "Тот же проект", own: "Чистый Fractera",
    sameText: "Сервер получит код вашего проекта из того же репозитория GitHub, что и этот компьютер: {repo}. Обновления общие, данные у сервера свои.",
    ownText: "Чистый стартер Fractera на любом VPS: сервер ставится из вашего собственного форка Fractera.",
    done: "Сделано", installed: "Сервер стоит на {repo}. Сменить репозиторий можно только очисткой сервера (опасная зона внизу).",
    account: "Зарегистрируйте аккаунт GitHub", accountText: "Аккаунт бесплатный — в нём будет жить собственный репозиторий сервера.", accountOpen: "Открыть GitHub",
    fork: "Сделайте форк репозитория Fractera", forkText: "Откройте репозиторий Fractera и нажмите «Fork» в своём аккаунте.", forkOpen: "Открыть репозиторий Fractera",
    url: "Введите ссылку на свой репозиторий", urlLabel: "Адрес вашего форка", urlNote: "Например https://github.com/<ваш-логин>/web4-node-starter-kit", check: "Проверить", checked: "GitHub подтвердил: {name} — прямой форк Fractera.",
  },
  stage: STAGE_RU,
  live: LIVE_RU,
  telegram: {
    text: "Пока сервер ставится, подключите ему собственного Telegram-бота: дальше с главным агентом сервера можно говорить с телефона. Шаг можно пропустить и вернуться к нему позже.",
    how: ["В Telegram откройте @BotFather и отправьте /newbot.", "BotFather попросит имя, затем адрес бота. Скопируйте их отсюда по очереди и вставьте в чат:", "BotFather пришлёт токен вида 1234567890:AA… — вставьте его сюда, в поле ниже."],
    nameLabel: "Имя бота", usernameLabel: "Адрес бота (кончается на «bot»)", copy: "Скопировать", copied: "Скопировано", openBotFather: "Открыть @BotFather", replace: "Заменить бота", cancel: "Отмена", found: "Токен найден: …{tail}. Перед сохранением его проверит Telegram.", notFound: "Токена здесь не видно: вставьте его или всё сообщение BotFather целиком.",
    label: "Токен бота или всё сообщение от @BotFather",
    tokenNote: "Токен уходит на сервер и хранится только там; эта страница видит лишь четыре последних знака.",
    save: "Подключить бота",
    later: "Позже",
    laterNote: "Пока без бота: следующие шаги идут и так. Подключить его можно здесь или в панели сервера в любой момент.",
    connectNow: "Подключить бота",
    pending: "Бот {bot}проверен Telegram, его токен …{tail} хранится на сервере; бот включится сам, когда запустится узел сервера.",
    on: "Бот {bot} подключён к главному агенту сервера.",
    activateAt: "Активация бота — в шаге «Сервер готов»: ссылка-приглашение и вход Claude Code на сервере.",
    activationTitle: "Telegram-бот сервера {bot}",
    admitted: "Допущено людей: {n}. Откройте ссылку и нажмите «Старт» — агент сервера поздоровается.",
    link: "Получить ссылку-приглашение",
    linkNote: "Ссылка допускает того, кто откроет её первым: откройте сами, не пересылайте.",
    installing: "Установка тем временем идёт: {stage}.",
    waitNode: "Установка закончилась; ждём, когда ответит узел сервера.",
    lines: {
      active: "Агент сервера на связи — пишите, Claude Code ответит.\nСервер {site}: {link}",
      inactive: "Агент сервера сейчас выключен — ответы появятся, когда его включат.\nВключить его может архитектор после входа: {terminal}",
      noSubscription: "Вы начнёте получать ответы сразу после подключения активной подписки Claude Code.\nПодключение доступно после входа с ролью архитектора: {subscription}",
      noPanel: "пульт сервера на странице запуска",
    },
    agentOn: "Агент сервера вошёл в Claude Code и может отвечать; приветствие придёт в Telegram само.",
    agentOff: "Claude Code на сервере не вошёл в подписку: бот отвечает только строкой узла, агент ответить не может. Войти — ваше действие, на странице самого сервера.",
    signIn: "Войти на сервере",
    signInOpen: "Открыть страницу подписки сервера",
    signInWatch: "Ждём входа: шаг сам спрашивает сервер каждые несколько секунд.",
    greeted: "Агент сервера вошёл в подписку, его приветствие ушло в Telegram.",
    agent: {
      title: "Claude создаст бота в вашем Telegram Web",
      steps: [
        "В Chrome с расширением Claude войдите в https://web.telegram.org.",
        "Нажмите кнопку: откроется терминал главного агента с готовой задачей. Отправьте её и смотрите на чат с BotFather.",
        "Когда BotFather ответит «Done!», скопируйте токен из его сообщения в поле ниже и нажмите «Подключить бота». Потом скажите агенту «готово»: он откроет ссылку-приглашение и нажмёт «Старт».",
        "Если Chrome спросит «Открыть приложение \"Telegram\"?» — нажмите «Отмена»: агент работает во вкладке Telegram Web, приложение ему не нужно.",
      ],
      note: "Агент не читает ответ BotFather с токеном и не вводит токен: токен идёт от вас только на сервер.",
      button: "Отдать агенту",
      telegramTask: "Создай Telegram-бота для сервера {server} в моём Telegram Web (навык help-in-browser). Я уже вошёл в https://web.telegram.org в этом Chrome. Открой @BotFather, отправь /newbot, имя бота «{name}», адрес @{username}. После отправки адреса не читай страницу и не делай снимков экрана: спроси меня, что ответил BotFather. «Done!» — токен в шаг 5 страницы «Активация выделенного сервера» вставлю я сам; «already taken» — предложи мне другой адрес и жди моего «да». Токен никогда не читай и не вводи. Когда я скажу «готово», нажми в шаге 5 «Получить ссылку-приглашение», открой ссылку в Telegram Web, нажми «Старт» и дождись приветствия агента сервера. Адрес t.me во вкладке не открывай никогда: Chrome спросит «Открыть приложение Telegram?», а это окно ты не видишь и не нажмёшь. Ссылку https://t.me/<бот>?start=<код> открывай как https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D<бот>%26start%3D<код>.",
      botName: "Сервер {server}",
    },
    rejected: "Telegram не принял токен …{tail}, когда запустился узел сервера: скопируйте его из @BotFather ещё раз.",
  },
  recheck: { text: "Каждое имя узла спрашивается у двух публичных DNS. Пока хоть одно обязательное имя не ведёт на сервер, к сертификатам перейти нельзя.", button: "Проверить записи", gate: "Ещё не все обязательные имена ведут на сервер.", noDomain: "Домен не выбран: сервер отвечает только по своему IP." },
  certs: { budget: "На этой неделе для {domain} выпущено {week} из 50 сертификатов Let's Encrypt.", limit: "Лимиты: 50 на домен в неделю, 5 на одно имя в неделю (letsencrypt.org).", checklist: "Чек-лист", name: "Имя", dns: "DNS", cert: "Сертификат", https: "HTTPS", httpsButton: "Проверить HTTPS из интернета", off: "выключен", afterOn: "после включения домена", notDue: "Серые строки — не ошибка: выключенный элемент ответит, когда вы его включите, а вход — после включения домена. Сертификаты у них уже есть." },
  ready: {
    text: "Включите домен: вход переедет на https://auth.{zone}, голый IP поведёт в панель, элементы узнают свои адреса.", activate: "Включить домен", activating: "Включаю…",
    signinOk: "Проверено в {time}: вход ведёт на https://auth.{zone}.", signinFail: "Проверено в {time}: вход пока ведёт не туда: {detail}", signinButton: "Проверить вход ещё раз", signinChecking: "Проверяю вход…",
    signinHint: "Узел заходит на сервер из интернета, как обычный посетитель, и проверяет, что вход в панель ведёт на https://auth.{zone}. Ваш пароль и аккаунт эта проверка не трогает. Нажимайте, если под кнопкой красным написано, что вход ведёт не туда.", signinHintLabel: "Что делает эта кнопка", links: "Ссылки:", site: "Сайт", panel: "Панель", signin: "Вход",
    next: "Дальше — в панели самого сервера: подписка Claude Code и Telegram-бот сервера.", first: "Первая регистрация на сервере навсегда становится его архитектором — и только с тем e-mail, который вы укажете на этом шаге.", done: "Ваш сервер готов.",
    missing: { title: "Пока не готов — финальной проверке не хватает:", cert: "{host}: нет действующего сертификата", https: "{host}: HTTPS не отвечает из интернета", signin: "вход пока не ведёт на https://{host}" },
    claimLead: "Чтобы вы получили право создать учётную запись архитектора на новом сервере, нам понадобится ваш e-mail. Внимание: только пользователь с точно таким же e-mail получит право стать первым суперпользователем, который может создавать других суперпользователей.",
    claimSteps: ["Введите электронный адрес. Запишите и сохраните его.", "Узел сам передаст адрес серверу — дождитесь под полем строки «Сервер ждёт регистрации архитектора…».", "Нажмите «Открыть регистрацию на сервере» и зарегистрируйтесь с тем же самым адресом, придумайте пароль. Запишите и сохраните пароль."],
    claimEmail: "E-mail архитектора", claimRetry: "Передать ещё раз", claimSending: "Передаю ваш e-mail серверу, это займёт до 15 секунд…", claimSent: "Сервер ждёт регистрации архитектора с адресом {email}.", claimOpen: "Открыть регистрацию на сервере", claimFailed: "Сервер не принял e-mail: {reason}. Попробуйте ещё раз.",
    claimLoss: "Внимание: если вы потеряете электронный адрес и пароль прежде, чем создадите нового суперпользователя, вы не сможете восстановить доступ к серверу. Вам придётся заново установить сервер, все данные будут потеряны безвозвратно.", claimed: "Архитектор на этом сервере уже зарегистрирован.",
  },
  dangerZone: "Опасная зона",
  busy: {
    freshTitle: "Установить заново, с нуля",
    freshText: "На сервере уже стоит прежняя установка этого узла. Чтобы начать с нуля без переустановки системы: старый узел остановится и будет СТЁРТ навсегда вместе со всеми старыми копиями и кэшами — чистый диск, как на новом сервере, — а на его место встанет свежий узел из вашего форка.",
    freshClear: "Установить с нуля…",
    freshRisk: "Узел на {host} сразу остановится и будет стёрт навсегда: его данные, ключи и история все старые копии в /root/fractera-cleared-… и всё, что оставили прежние установщики (Fractera Easy Starter в /opt/fractera*, кэши root, неиспользуемое Docker), — вернуть это будет нельзя. Пока ставится новый узел, его сайты отвечают «узел обновляется». Сертификаты, ключи SSH и вход Claude Code на сервере остаются.",
    freshAgree: "Я понимаю: узел на {host} будет стёрт навсегда и установлен новый",
    freshDisk: "Диск сейчас: занято {used} из {total} ГБ, свободно {free} ГБ; старые копии узла: {copies}.",
    copiesNone: "нет",
    foreignGone: "Чужие программы стёрты: {list}.", foreignLeft: "Всё ещё слушает порт и не Fractera: {list} — сотрите до установки.",
    erasedDone: "Сервер очищен: стёрто навсегда — {nodes}, а также старые копии и кэши ({count}); освобождено {freed} ГБ, свободно {free} ГБ. Проверка повторена.",
    nodeTitle: "На сервере узел Fractera, не связанный с этим узлом",
    nodeText: "Удалить прежнее состояние: узел остановится и будет стёрт навсегда со всеми старыми копиями — чистый диск, — а на его место встанет свежий узел из вашего форка.",
    nodeClear: "Удалить прежнее состояние…",
    nodeRisk: "Узел {nodes} сразу остановится и будет стёрт навсегда — его данные, ключи и история и все старые копии в /root/fractera-cleared-…; вернуть их будет нельзя. Его сайты перестанут отвечать, пока не встанет новый узел.",
    title: "Сервер занят другой установкой",
    text: "На сервере уже работают другие программы и сайты. Узел может освободить сервер для себя — или вы просто не продолжаете.",
    clear: "Очистить сервер…",
    clearTitle: "Очистить сервер {host}?",
    risks: [
      "Сразу перестанут отвечать сайты на этом сервере: {sites}.",
      "Остановятся программы прежней установки (их {n}) и не запустятся после перезагрузки.",
      "Ничего не удаляется: папки программ и базы данных остаются; список программ и файлы сайтов сохраняются в /root/fractera-cleared-… — по ним всё можно вернуть руками.",
      "Если на этом сервере работает что-то нужное вам или другим людям — возьмите чистый сервер.",
    ],
    agree: "Я понимаю: сайты и программы на {host} остановятся",
    clearConfirm: "Остановить и освободить",
    notNow: "Не сейчас",
    clearing: "Очищаю сервер: прежние программы останавливаются, узел Fractera и его старые копии стираются, чужие сайты уходят в резервную папку там же. До нескольких минут; проверка повторится сама.",
    cleared: "Сервер освобождён: остановлено программ — {n}, всё сохранено в {backup}. Проверка повторена.",
    failed: "Очистка не прошла:",
  },
}

export function serverLaunchWords(lang: string): ServerLaunchWords {
  return lang === "ru" ? ru : en
}
