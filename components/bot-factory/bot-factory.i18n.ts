// The words of the node's bot factory step (node step 798-2). The server picks the language and passes the words as a prop.

export type BotFactoryWords = {
  title: string
  lead: string
  why: string
  step1Title: string
  step1Points: string[]
  nameLabel: string
  usernameLabel: string
  openBotFather: string
  step2Title: string
  step3Title: string
  /** the owner's own three points of step 3 (2026-11-18 ~20:00) */
  step3Points: string[]
  /** the person's own tick on rung 1 («подтвердит чеклист», Telegram 788) */
  did1: string
  sum1: string
  /** rung 2 done: `{username}` `{tail}` */
  sum2: string
  /** in view inside step 2 once a token is kept: `{username}` `{tail}` (the owner's «зелёная галочка», 20:32) */
  kept: string
  /** the token field — the server's own phrases (`server-launch.i18n.ts` telegram): `{tail}` */
  found: string
  notFound: string
  check: string
  checking: string
  more: string
  locked: string
  tokenLabel: string
  tokenHint: string
  save: string
  saving: string
  ready: string
  recheck: string
  replace: string
  errors: Record<string, string>
  missing: string
  missingLink: string
  createTitle: string
  createText: string
  create: string
  waiting: string
  openAgain: string
  done: string
  timeout: string
  failed: string
  copy: string
  copied: string
}

const DICT: Record<string, BotFactoryWords> = {
  en: {
    title: "The Telegram bot factory",
    lead: "A node may have many elements, and each is best given its own Telegram bot. The factory makes any number of them with one tap. You make the factory itself by hand once; first it makes the node's main bot, then the elements' bots.",
    why: "The way Telegram hands out the tokens of new bots does not let the main agent take them automatically.",
    step1Title: "First make a Telegram bot the classic way",
    step1Points: ["Open @BotFather and send /newbot.", "Give it the name and the address below (copy them)."],
    nameLabel: "Name",
    usernameLabel: "Address",
    openBotFather: "Open @BotFather",
    step2Title: "Add the token or @BotFather's whole message",
    step3Title: "Switch the Telegram bot to the «Telegram bot factory» mode",
    step3Points: ["In the @BotFather chat press «Open» in the bottom left corner.", "Go to the «Bot Settings» tab.", "Set the «Bot Management Mode» switch to on."],
    did1: "Done, the bot is made",
    sum1: "The bot is made in @BotFather",
    sum2: "The token of @{username} is kept (…{tail})",
    kept: "The token of @{username} is kept: …{tail}",
    found: "Token found: …{tail}. Telegram checks it before it is kept.",
    notFound: "No token here: paste it or BotFather's whole message.",
    check: "Check",
    checking: "Asking Telegram…",
    more: "More",
    locked: "Opens after the step before",
    tokenLabel: "The bot's token or @BotFather's whole message",
    tokenHint: "The token is kept on this computer only; this page sees just its last four characters.",
    save: "Keep the token",
    saving: "Asking Telegram…",
    ready: "The factory is ready: @{username} (…{tail}), «Bot Management Mode» confirmed by Telegram.",
    recheck: "Check again",
    replace: "Replace the factory",
    errors: {
      "bad-format": "This is not a bot token. Copy it again from @BotFather.",
      "token-rejected": "Telegram did not accept this token.",
      "telegram-unreachable": "Telegram does not answer right now. Try again in a minute.",
      "management-off": "@{username}: Telegram answers that «Bot Management Mode» is off. If the switch is already on, wait a minute and press «Check» again.",
    },
    missing: "The node has no bot factory yet, so this bot is made by hand.",
    missingLink: "Set up the factory",
    createTitle: "Make this bot with one tap",
    createText: "Telegram opens its own window with the name and the address filled in; press «Create» there. If a bot is already connected, the new one replaces it (the old bot stays in your Telegram; delete it in @BotFather if you wish).",
    create: "Make the bot",
    waiting: "Waiting for your «Create» in Telegram (up to 10 minutes)…",
    openAgain: "Open the window again",
    done: "Done: @{username} is connected (…{tail}).",
    timeout: "Nobody pressed «Create» in 10 minutes. Press «Make the bot» again.",
    failed: "The bot was not connected: {error}.",
    copy: "Copy",
    copied: "Copied",
  },
  ru: {
    title: "Telegram-бот фабрика",
    lead: "У узла может быть много элементов, и каждому рекомендуется свой Telegram-бот. Фабрика создаёт любое их количество одним касанием. Саму фабрику вы создаёте руками один раз; первым она создаст главного бота узла, потом ботов элементов.",
    why: "Автоматизация выдачи токенов для Telegram-ботов не позволяет главному агенту получать их содержимое автоматически.",
    step1Title: "Сначала создайте Telegram-бота классическим способом",
    step1Points: ["Откройте @BotFather и отправьте /newbot.", "Дайте ему имя и адрес ниже (скопируйте их)."],
    nameLabel: "Имя",
    usernameLabel: "Адрес",
    openBotFather: "Открыть @BotFather",
    step2Title: "Добавьте токен или сообщение @BotFather целиком",
    step3Title: "Переключите Telegram-бота в режим «Telegram-бот фабрика»",
    step3Points: ["В чате @BotFather нажмите кнопку «Open» в левом нижнем углу.", "Перейдите на вкладку «Bot Settings».", "Поставьте переключатель «Bot Management Mode» в положение «включено»."],
    did1: "Сделал, бот создан",
    sum1: "Бот создан в @BotFather",
    sum2: "Токен бота @{username} сохранён (…{tail})",
    kept: "Токен бота @{username} сохранён: …{tail}",
    found: "Токен найден: …{tail}. Перед сохранением его проверит Telegram.",
    notFound: "Токена здесь не видно: вставьте его или всё сообщение BotFather целиком.",
    check: "Проверить",
    checking: "Спрашиваю Telegram…",
    more: "Подробнее",
    locked: "Откроется после предыдущего шага",
    tokenLabel: "Токен бота или всё сообщение от @BotFather",
    tokenHint: "Токен хранится только на этом компьютере; эта страница видит лишь четыре последних знака.",
    save: "Сохранить токен",
    saving: "Спрашиваю Telegram…",
    ready: "Фабрика готова: @{username} (…{tail}), «Bot Management Mode» подтверждён Telegram.",
    recheck: "Проверить снова",
    replace: "Заменить фабрику",
    errors: {
      "bad-format": "Это не токен бота. Скопируйте его заново из @BotFather.",
      "token-rejected": "Telegram не принял этот токен.",
      "telegram-unreachable": "Telegram сейчас не отвечает. Попробуйте через минуту.",
      "management-off": "@{username}: Telegram отвечает, что «Bot Management Mode» выключен. Если переключатель уже включён, подождите минуту и нажмите «Проверить» ещё раз.",
    },
    missing: "У узла пока нет бота-фабрики, поэтому этот бот создаётся вручную.",
    missingLink: "Настроить фабрику",
    createTitle: "Создать этого бота одним касанием",
    createText: "Telegram откроет своё окно с готовыми именем и адресом — нажмите там «Создать». Если бот уже подключён, новый заменит его (старый останется в вашем Telegram, удалить его можно в @BotFather).",
    create: "Создать бота",
    waiting: "Жду вашего «Создать» в Telegram (до 10 минут)…",
    openAgain: "Открыть окно ещё раз",
    done: "Готово: @{username} подключён (…{tail}).",
    timeout: "За 10 минут «Создать» не нажали. Нажмите «Создать бота» ещё раз.",
    failed: "Бот не подключился: {error}.",
    copy: "Скопировать",
    copied: "Скопировано",
  },
}

/** Words in the page's language; an unknown language falls back to English. */
export function botFactoryWords(lang: string): BotFactoryWords {
  return DICT[lang] ?? DICT.en
}
