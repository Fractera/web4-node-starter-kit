// СЛОВА СПИСКА ДОМЕНОВ УЗЛА (324-1). `en` основа, `ru` перевод; строки выбирает сервер (рисовальщик секции `domainLadder`).

export type DomainListWords = {
  /** 775: the section «Основной домен» — its path while the node has none, its own controls once it has one */
  main: {
    title: string; lead: string; empty: string; how: string[]; live: string; unknown: string; openSite: string; openPanel: string
    notice: string; noticeButton: string; disconnect: string; disconnectConfirm: string; disconnectYes: string; disconnecting: string; disconnectFailed: string
  }
  /** 775: the section «Дополнительные домены» — only once the node has its main domain */
  extra: { title: string; lead: string; how: string[] }
  /** 775: the fold of a section's instructions */
  more: string
  loading: string
  addTitle: string
  /** 775: the add rows of the two sections (the owner: «добавить основной домен» / «добавить дополнительный домен») */
  addMainTitle: string
  rowMain: string
  rowExtra: string
  removeYes: string
  removeConfirm: string
  addExtraTitle: string
  addLabel: string
  /** 775: the add field of the main domain's section */
  addMainLabel: string
  add: string
  adding: string
  recheck: string
  rechecking: string
  remove: string
  detachRemove: string
  detachConfirm: string
  detachRemoveYes: string
  detaching: string
  cancel: string
  attachedTo: string
  connected: string
  notConnected: string
  checkedAt: string
  docsAddSite: string
  docsToken: string
  loadFailed: string
  state: Record<string, string>
  pipe: Record<string, string>
  keyPerms: string[]
  key: Record<string, string>
  errors: Record<string, string>
}

const DICT: Record<string, DomainListWords> = {
  en: {
    main: {
      title: "Main domain activation",
      lead: "The node's permanent address: the site on the domain itself, the panel on architect., sign-in on auth.",
      empty: "The node has no main domain yet. Enter your domain — the node takes it through its steps, and when the zone is active you make it the main one right here.",
      how: [
        "1. Enter the domain under «+ Add a domain» — the root, without www.",
        "2. The node creates the zone in Cloudflare itself with its key. If a key is needed, the key card appears above.",
        "3. At your domain's registrar, set the two name servers the domain's card names. This is the only step outside the node; it usually takes minutes, sometimes up to a day.",
        "4. When the zone is active, press «Make it the node's main domain»: the node creates the tunnel, the DNS records, sign-in on auth.<domain> and the site's address itself.",
        "5. The node must have its architect first — your account: without it the button stays closed, otherwise sign-up on the domain would be open to everyone.",
      ],
      live: "live",
      unknown: "state unknown",
      openSite: "Site",
      openPanel: "Panel",
      notice: "You have just connected your own domain, which means the secure web protocol (SSL) is now in force. It requires you to sign in as the architect. You will be given the fullest access to this application. Attention: if you do not, you may lose access to the application from the internet.",
      noticeButton: "Sign in as the architect",
      disconnect: "Disconnect the main domain",
      disconnectConfirm: "Disconnect {domain} from the node? The node stops the domain's tunnel, brings sign-in and the elements back to this computer and rebuilds them. The zone in Cloudflare is not touched.",
      disconnectYes: "Yes, disconnect",
      disconnecting: "Disconnecting…",
      disconnectFailed: "Could not disconnect:",
    },
    extra: {
      title: "Additional domains",
      lead: "Domains of their own for separate elements of the node.",
      how: [
        "Every element of the node already opens on a subdomain of the main domain. Any of them can also get a domain of its own.",
        "Enter the domain under «+ Add a domain» and take it to «active» through the steps of its card.",
        "Then connect it to an element: open the element → «Settings» → «Domain».",
      ],
    },
    more: "More",
    loading: "Reading the node's domains…",
    addTitle: "Add a domain",
    addMainTitle: "Add the main domain",
    rowMain: "Main domain:",
    rowExtra: "Additional domain:",
    removeYes: "Remove",
    removeConfirm: "Remove {domain} from the node's list? Its zone in Cloudflare is not touched; you can add the domain again.",
    addExtraTitle: "Add an additional domain",
    addLabel: "Another domain of yours (the root, without www)",
    addMainLabel: "Your domain (the root, without www)",
    add: "Add",
    adding: "Adding…",
    recheck: "Check again",
    rechecking: "Checking…",
    remove: "Remove from the list",
    detachRemove: "Disconnect from the element and remove",
    detachConfirm: "{domain} is connected to the element {element}. The node removes it from its tunnel and from its own DNS records, the element answers again on its subdomain, and the domain leaves this list. Records in a zone the node's key no longer sees are not touched.",
    detachRemoveYes: "Disconnect and remove",
    detaching: "Disconnecting…",
    cancel: "Cancel",
    attachedTo: "Connected to the element",
    connected: "Connected",
    notConnected: "Not connected",
    checkedAt: "Checked:",
    docsAddSite: "How to add a domain to Cloudflare",
    docsToken: "How to give the node's key access to one more zone",
    loadFailed: "The list of domains did not load.",
    state: {
      active: "Ready: the zone is active in Cloudflare and the node's key sees it. It can be connected to an element (open the element → Settings → Domain).",
      pending: "The zone is in Cloudflare but not active yet (status: {status}). At your registrar, set these name servers, wait (minutes to a day) and check again:",
      "not-visible": "There is no zone for this domain in the node's Cloudflare account yet — the node creates it at step 1.",
      unknown: "Not checked yet.",
    },
    pipe: {
      step1: "1. Zone in Cloudflare",
      step1Done: "The zone exists in the node's Cloudflare account.",
      step1Todo: "The node creates the domain's zone in its Cloudflare account itself.",
      step3DoneMain: "The zone is active — the domain can become the node's main domain.",
      createZone: "Create the zone",
      creating: "Creating…",
      noPermission: "The node's Cloudflare key has no right to add domains. Create a key with this right by the button below and paste it — the node will create the zone right after.",
      keySaveAndCreate: "Save the key and create the zone",
      accountHint: "The node could not tell from its key which Cloudflare account to create the zone in. Paste the Account ID (32 characters). Cloudflare docs «Find account and zone IDs»: in the dashboard open Search (CMD/CTRL + K), type «Copy account ID» and select the result.",
      accountLabel: "Cloudflare Account ID",
      accountRetry: "Try again",
      registrar: "Domain registrar:",
      makePrimary: "Make it the node's main domain",
      makingPrimary: "Connecting…",
      lockedNoArchitect: "First create your account — the node's architect. Until the node has one, the domain cannot become the main one: sign-up on it would be open to everyone, and the first to register would become the node's owner for good.",
      lockedNoSignIn: "The node's sign-in does not answer, so the node cannot check that it has its architect. Start the sign-in element and press «Check again».",
      lockedButton: "Create the architect's account",
      makePrimaryNote: "The node has no main domain yet. This one can become it: the node creates its tunnel, the DNS records, sign-in on auth.<domain> and the site address — in one press.",
      makePrimaryFailed: "The domain did not become main:",
      checkAgain: "Check again",
      conflictsTitle: "These records in your Cloudflare zone point the names the node needs elsewhere, so the tunnel cannot take them:",
      conflictsNote: "Only these A and AAAA records will be removed. Mail and verification records (MX, TXT — Google, Resend and others) are not touched.",
      removeAndConnect: "Remove these records and make it the main domain",
      keyLabel: "New Cloudflare key",
      keySave: "Save the key and create the zone",
      keySaving: "Saving…",
      keyOpen: "Open the Cloudflare dashboard",
      keyDocs: "How to create an API token (Cloudflare docs)",
      step2: "2. Name servers at your registrar",
      step2Wait: "Opens after step 1.",
      step2Text: "This is the only step outside the node: at your registrar, replace the name servers of the domain with these two.",
      assigned: "Set these:",
      atRegistrar: "Now the internet sees:",
      nothingYet: "nothing (not measured yet)",
      match: "They match.",
      noMatch: "They do not match yet. After changing them at the registrar, the internet sees the new ones in minutes to a day.",
      check: "Check",
      checkLocked: "«Check» opens after step 1: once the node's key can create the zone and the zone exists.",
      checking: "Checking…",
      step3: "3. Active",
      step3Wait: "Opens when the name servers match.",
      step3Asked: "The node asked Cloudflare to re-check the zone. Press «Check» again in a few minutes.",
      step3Done: "The zone is active — the domain is ready to be connected to an element (open the element → Settings → Domain).",
      openMirror: "Connect it to {item}: Settings → Domain",
      lastCheck: "Checked at {time}: {what}",
      // 775: the ladder of the page «Сервер» (titles without numbers — the ladder numbers them; summaries of a passed rung; the locked line)
      t1: "Zone in Cloudflare", t2: "Name servers at the registrar", t3main: "Make it the node's main domain", t3extra: "Zone active",
      t4main: "Elements' subdomains", t4extra: "Connect to an element", locked: "opens when the previous step is done",
      s1: "the zone is in the node's Cloudflare account", s2: "the name servers match", s3main: "the node's main domain", s3extra: "the zone is active",
      s4extra: "connected to {element}", connectHow: "Open the element → «Settings» → «Domain» and choose this domain.",
      subsCheck: "Check the subdomains", subsChecking: "Checking…", subsAnswers: "answers", subsSilent: "does not answer",
      subsHint: "An element that does not answer: open it → «Settings» → «Domain» and connect its address.", subsFailed: "Could not check:",
    },
    keyPerms: ["Zone Edit (Zone Write)", "DNS Write", "Cloudflare Tunnel Edit", "Workers Scripts Edit", "Workers Routes Edit"],
    key: {
      title: "The node's Cloudflare key needs attention",
      none: "The node has no Cloudflare key: it cannot connect or manage domains. Create one key for your Cloudflare account and paste it here.",
      disabled: "Cloudflare says the node's key …{tail} is disabled: the node cannot manage its domains. Create a new key and paste it here.",
      expired: "Cloudflare says the node's key …{tail} has expired: the node cannot manage its domains. Create a new key and paste it here.",
      unverified: "Cloudflare did not confirm the node's key …{tail} just now. If it keeps saying so, create a new key and paste it here.",
      workersTitle: "The key cannot keep your site online while the computer is off",
      tunnelTitle: "The key cannot connect new addresses",
      noTunnel: "The node's key …{tail} works, but it cannot manage this node's Cloudflare Tunnel (Account · Cloudflare Tunnel · Edit is missing, or the key belongs to another account). Addresses that already work keep working, but a new one — a new element's subdomain — cannot be connected. Create a new key with the button below — the form opens with Account · Cloudflare Tunnel · Edit already ticked — and paste it here: the new key replaces the old one.",
      noWorkers: "The node's key …{tail} works, but it has no rights to Cloudflare Workers ({missing}). With them the node keeps a copy of your public pages in your own Cloudflare account, and visitors see the site even when this computer is off. Everything else works as it does now. Create a new key with the button below — the form opens with these rights already ticked — and paste it here: the new key replaces the old one.",
      label: "Cloudflare key",
      save: "Save",
      saving: "Checking and saving…",
      failed: "The key was not accepted:",
    },
    errors: {
      "bad-shape": "Not a domain name: labels of Latin letters, digits and hyphens joined by dots, for example mybrand.com.",
      "with-www": "Type the root of the domain without www.",
      "main-exists": "The node already has its main domain — add this one as an additional domain.",
      primary: "This is the node's main domain or its subdomain — it is already here.",
      exists: "This domain is already in the list.",
      "no-key": "The node has no Cloudflare key yet — paste it below and the node creates the zone at once.",
      attached: "The domain is connected to an element — disconnect it there first.",
      "no-tunnel": "The node has no tunnel of its main domain, so it cannot take the domain off the element.",
      "tunnel-failed": "Cloudflare did not accept the change of the node's tunnel — nothing was removed. Try again.",
      "cloudflare-error": "Cloudflare did not answer — nothing was removed. Try again.",
      "write-failed": "The list could not be saved.",
      "not-found": "The domain is not in the list.",
      "no-zone-permission": "The key has no right to create zones — see step 1.",
      "no-primary": "A domain can be connected to an element once the node's main domain works.",
      "primary-not-visible": "The node's key does not see the main domain — the key is wrong for this node.",
      "no-account": "The key did not name one Cloudflare account — paste the Account ID below and try again.",
      "bad-account-id": "An Account ID is 32 characters: digits and letters a–f.",
      unknown: "It did not work:",
    },
  },
  ru: {
    main: {
      title: "Активация основного домена",
      lead: "Постоянный адрес узла: сайт на самом домене, пульт на architect., вход на auth.",
      empty: "У узла ещё нет основного домена. Впишите свой домен — узел проведёт его по ступеням, а когда зона станет активной, сделайте его основным здесь же.",
      how: [
        "1. Впишите домен в «+ Добавить домен» — корень, без www.",
        "2. Узел сам создаёт зону в Cloudflare своим ключом. Если нужен ключ, его карточка появится выше.",
        "3. У регистратора домена поставьте два сервера имён, которые назовёт карточка домена. Это единственный шаг вне узла; обычно он занимает минуты, иногда до суток.",
        "4. Когда зона станет активной, нажмите «Сделать основным доменом узла»: узел сам создаст туннель, записи DNS, вход на auth.<домен> и адрес сайта.",
        "5. Сначала у узла должен быть архитектор — ваша учётная запись: без неё кнопка закрыта, иначе регистрация на домене открылась бы всем.",
      ],
      live: "работает",
      unknown: "состояние неизвестно",
      openSite: "Сайт",
      openPanel: "Пульт",
      notice: "Вы только что подключили собственный домен, а это значит, что началась работа по защищённому web-протоколу SSL. Это требует, чтобы вы прошли авторизацию как архитектор. Вам будет предоставлен максимальный доступ к этому приложению. Внимание: если вы этого не сделаете, вы можете потерять доступ к приложению из интернета.",
      noticeButton: "Пройти авторизацию",
      disconnect: "Отключить основной домен",
      disconnectConfirm: "Отключить {domain} от узла? Узел остановит туннель домена, вернёт вход и элементы на этот компьютер и пересоберёт их. Зону в Cloudflare узел не трогает.",
      disconnectYes: "Да, отключить",
      disconnecting: "Отключаю…",
      disconnectFailed: "Не удалось отключить:",
    },
    extra: {
      title: "Дополнительные домены",
      lead: "Собственные адреса для отдельных элементов узла.",
      how: [
        "Каждый элемент узла уже открывается на поддомене основного домена. Любому из них можно дать и собственный домен.",
        "Впишите домен в «+ Добавить домен» и доведите его до «active» по ступеням его карточки.",
        "Затем подключите его к элементу: откройте элемент → «Настройки» → «Домен».",
      ],
    },
    more: "Подробнее",
    loading: "Читаю домены узла…",
    addTitle: "Добавить домен",
    addMainTitle: "Добавить основной домен",
    rowMain: "Основной домен:",
    rowExtra: "Дополнительный домен:",
    removeYes: "Убрать",
    removeConfirm: "Убрать {domain} из списка узла? Зону в Cloudflare узел не трогает, домен можно добавить снова.",
    addExtraTitle: "Добавить дополнительный домен",
    addLabel: "Ещё один ваш домен (корень, без www)",
    addMainLabel: "Ваш домен (корень, без www)",
    add: "Добавить",
    adding: "Добавляю…",
    recheck: "Проверить снова",
    rechecking: "Проверяю…",
    remove: "Убрать из списка",
    detachRemove: "Отключить от элемента и удалить",
    detachConfirm: "{domain} подключён к элементу {element}. Узел уберёт его из своего туннеля и своих записей DNS, элемент снова будет отвечать на своём поддомене, а домен уйдёт из этого списка. Записи в зоне, которую ключ узла больше не видит, не трогаются.",
    detachRemoveYes: "Отключить и удалить",
    detaching: "Отключаю…",
    cancel: "Отмена",
    attachedTo: "Подключён к элементу",
    connected: "Подключён",
    notConnected: "Не подключён",
    checkedAt: "Проверено:",
    docsAddSite: "Как добавить домен в Cloudflare",
    docsToken: "Как дать ключу узла доступ ещё к одной зоне",
    loadFailed: "Список доменов не загрузился.",
    state: {
      active: "Готов: зона активна в Cloudflare, и ключ узла её видит. Можно подключать к элементу (откройте элемент → «Настройки» → «Домен»).",
      pending: "Зона есть в Cloudflare, но ещё не активна (статус: {status}). У регистратора поставьте эти серверы имён, подождите (от минут до суток) и проверьте снова:",
      "not-visible": "Зоны этого домена в аккаунте Cloudflare узла пока нет — её создаёт узел на ступени 1.",
      unknown: "Ещё не проверялся.",
    },
    pipe: {
      step1: "1. Зона в Cloudflare",
      step1Done: "Зона есть в аккаунте Cloudflare узла.",
      step1Todo: "Узел сам создаёт зону домена в своём аккаунте Cloudflare.",
      step3DoneMain: "Зона активна — домен может стать основным доменом узла.",
      createZone: "Создать зону",
      creating: "Создаю…",
      noPermission: "У ключа Cloudflare узла нет права добавлять домены. Создайте ключ с этим правом кнопкой ниже и вставьте его — узел сразу создаст зону.",
      keySaveAndCreate: "Сохранить ключ и создать зону",
      accountHint: "По ключу узел не понял, в каком аккаунте Cloudflare создать зону. Вставьте Account ID (32 знака). По документации Cloudflare («Find account and zone IDs»): в панели откройте поиск (CMD/CTRL + K), наберите «Copy account ID» и выберите результат.",
      accountLabel: "Account ID в Cloudflare",
      accountRetry: "Попробовать снова",
      registrar: "Регистратор домена:",
      makePrimary: "Сделать основным доменом узла",
      makingPrimary: "Подключаю…",
      lockedNoArchitect: "Сначала создайте свою учётную запись — архитектора узла. Пока её нет, домен нельзя сделать основным: регистрация на нём открылась бы всем, и первый зарегистрировавшийся навсегда стал бы хозяином узла.",
      lockedNoSignIn: "Вход узла не отвечает, поэтому узел не может проверить, что у него есть архитектор. Включите элемент входа и нажмите «Проверить снова».",
      lockedButton: "Создать учётную запись архитектора",
      makePrimaryNote: "У узла пока нет основного домена. Этот может им стать: узел одним нажатием создаст туннель, записи DNS, вход на auth.<домен> и адрес сайта.",
      makePrimaryFailed: "Домен не стал основным:",
      checkAgain: "Проверить снова",
      conflictsTitle: "Эти записи в вашей зоне Cloudflare ведут нужные узлу имена в другое место, поэтому туннель не может их занять:",
      conflictsNote: "Будут удалены только эти записи A и AAAA. Записи почты и проверок (MX, TXT — Google, Resend и другие) не трогаются.",
      removeAndConnect: "Удалить эти записи и сделать основным доменом",
      keyLabel: "Новый ключ Cloudflare",
      keySave: "Сохранить ключ и создать зону",
      keySaving: "Сохраняю…",
      keyOpen: "Открыть панель Cloudflare",
      keyDocs: "Как создать API-токен (документация Cloudflare)",
      step2: "2. Серверы имён у регистратора",
      step2Wait: "Откроется после ступени 1.",
      step2Text: "Это единственный шаг вне узла: у регистратора замените серверы имён домена на эти два.",
      assigned: "Поставьте эти:",
      atRegistrar: "Сейчас интернет видит:",
      nothingYet: "ничего (ещё не замерено)",
      match: "Совпадают.",
      noMatch: "Пока не совпадают. После замены у регистратора интернет видит новые серверы через время от минут до суток.",
      check: "Проверить",
      checkLocked: "«Проверить» откроется после ступени 1 — когда ключ узла создаст зону.",
      checking: "Проверяю…",
      step3: "3. Активна",
      step3Wait: "Откроется, когда серверы имён совпадут.",
      step3Asked: "Узел попросил Cloudflare перепроверить зону. Нажмите «Проверить» ещё раз через несколько минут.",
      step3Done: "Зона активна — домен готов к подключению к элементу (откройте элемент → «Настройки» → «Домен»).",
      openMirror: "Подключить к {item}: «Настройки» → «Домен»",
      lastCheck: "Проверено в {time}: {what}",
      t1: "Зона в Cloudflare", t2: "Серверы имён у регистратора", t3main: "Сделать основным доменом узла", t3extra: "Зона активна",
      t4main: "Поддомены элементов", t4extra: "Подключение к элементу", locked: "откроется, когда будет готов предыдущий шаг",
      s1: "зона есть в аккаунте Cloudflare узла", s2: "серверы имён совпадают", s3main: "основной домен узла", s3extra: "зона активна",
      s4extra: "подключён к элементу {element}", connectHow: "Откройте элемент → «Настройки» → «Домен» и выберите этот домен.",
      subsCheck: "Проверить поддомены", subsChecking: "Проверяю…", subsAnswers: "отвечает", subsSilent: "не отвечает",
      subsHint: "Элемент не отвечает: откройте его → «Настройки» → «Домен» и подключите его адрес.", subsFailed: "Не удалось проверить:",
    },
    keyPerms: ["Zone Edit (Zone Write)", "DNS Write", "Cloudflare Tunnel Edit", "Workers Scripts Edit", "Workers Routes Edit"],
    key: {
      title: "Ключ Cloudflare узла требует внимания",
      none: "У узла нет ключа Cloudflare: подключать домены и управлять ими он не может. Создайте один ключ для своего аккаунта Cloudflare и вставьте его сюда.",
      disabled: "Cloudflare говорит, что ключ узла …{tail} отключён: узел не может управлять своими доменами. Создайте новый ключ и вставьте его сюда.",
      expired: "Cloudflare говорит, что срок ключа узла …{tail} истёк: узел не может управлять своими доменами. Создайте новый ключ и вставьте его сюда.",
      unverified: "Cloudflare сейчас не подтвердил ключ узла …{tail}. Если так и останется — создайте новый ключ и вставьте его сюда.",
      workersTitle: "Ключ не может держать сайт в сети, когда компьютер выключен",
      tunnelTitle: "Ключ не может подключать новые адреса",
      noTunnel: "Ключ узла …{tail} работает, но не может управлять туннелем Cloudflare этого узла (нет права Account · Cloudflare Tunnel · Edit или ключ от другого аккаунта). Уже работающие адреса продолжают работать, а новый — поддомен нового элемента — подключить нельзя. Создайте новый ключ кнопкой ниже — форма откроется с уже отмеченной строкой Account · Cloudflare Tunnel · Edit — и вставьте ключ сюда: новый ключ заменит прежний.",
      noWorkers: "Ключ узла …{tail} работает, но у него нет прав на Cloudflare Workers ({missing}). С ними узел хранит копию ваших публичных страниц в вашем собственном аккаунте Cloudflare, и посетители видят сайт, даже когда этот компьютер выключен. Всё остальное работает как сейчас. Создайте новый ключ кнопкой ниже — форма откроется с уже отмеченными правами — и вставьте его сюда: новый ключ заменит прежний.",
      label: "Ключ Cloudflare",
      save: "Сохранить",
      saving: "Проверяю и сохраняю…",
      failed: "Ключ не принят:",
    },
    errors: {
      "bad-shape": "Это не имя домена: метки из латинских букв, цифр и дефисов через точку, например mybrand.com.",
      "with-www": "Введите корень домена без www.",
      "main-exists": "Основной домен у узла уже есть — добавьте этот как дополнительный.",
      primary: "Это основной домен узла или его поддомен — он уже здесь.",
      exists: "Этот домен уже в списке.",
      "no-key": "У узла ещё нет ключа Cloudflare — вставьте его ниже, и узел сразу создаст зону.",
      attached: "Домен подключён к элементу — сначала отключите его там.",
      "no-tunnel": "У узла нет туннеля основного домена — снять домен с элемента нечем.",
      "tunnel-failed": "Cloudflare не принял правку туннеля узла — ничего не удалено. Попробуйте ещё раз.",
      "cloudflare-error": "Cloudflare не ответил — ничего не удалено. Попробуйте ещё раз.",
      "write-failed": "Не удалось сохранить список.",
      "not-found": "Этого домена нет в списке.",
      "no-zone-permission": "У ключа нет права создавать зоны — см. ступень 1.",
      "no-primary": "Подключить домен к элементу можно, когда у узла работает основной домен.",
      "primary-not-visible": "Ключ узла не видит основной домен — ключ не подходит этому узлу.",
      "no-account": "Ключ не назвал один аккаунт Cloudflare — вставьте Account ID ниже и попробуйте снова.",
      "bad-account-id": "Account ID — это 32 знака: цифры и буквы a–f.",
      unknown: "Не получилось:",
    },
  },
}

export function domainListWords(lang: string): DomainListWords {
  return DICT[lang] ?? DICT.en
}
