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
  step2Points: string[]
  step3Title: string
  checks: string[]
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
    title: "The node's bot factory",
    lead: "One bot you make by hand once. After that the node's main bot and every element's bot are made with one tap in Telegram's own window: no @BotFather, no tokens to copy.",
    why: "The factory talks to nobody: it only receives the keys of the bots it makes, and they stay on this computer.",
    step1Title: "Make the factory bot in @BotFather",
    step1Points: ["Open @BotFather and send /newbot.", "Give it the name and the address below (copy them)."],
    nameLabel: "Name",
    usernameLabel: "Address",
    openBotFather: "Open @BotFather",
    step2Title: "Turn on «Bot Management Mode»",
    step2Points: ["In @BotFather press «Open» (its Mini App) and choose the new bot.", "In the bot's settings turn on «Bot Management Mode».", "Copy the bot's token (in @BotFather: the bot → «API Token»)."],
    step3Title: "Tick what you did and paste the token",
    checks: ["The bot is made in @BotFather", "«Bot Management Mode» is on", "The token is copied"],
    tokenLabel: "The factory's token",
    tokenHint: "The node asks Telegram itself whether the mode is on; the token is kept on this computer only.",
    save: "Check and keep",
    saving: "Asking Telegram…",
    ready: "The factory is ready: @{username} (…{tail}), «Bot Management Mode» confirmed by Telegram.",
    recheck: "Check again",
    replace: "Replace the factory",
    errors: {
      "bad-format": "This is not a bot token. Copy it again from @BotFather.",
      "token-rejected": "Telegram did not accept this token.",
      "telegram-unreachable": "Telegram does not answer right now. Try again in a minute.",
      "management-off": "@{username} is a bot, but «Bot Management Mode» is off. Turn it on in @BotFather's Mini App → the bot's settings, then press «Check and keep» again.",
    },
    missing: "The node has no bot factory yet: without it this bot is made by hand below.",
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
    title: "Бот-фабрика узла",
    lead: "Одного бота вы создаёте руками один раз. Дальше главный бот узла и боты всех элементов создаются одним касанием в окне самого Telegram: без @BotFather и без копирования токенов.",
    why: "Фабрика ни с кем не разговаривает: она только получает ключи созданных ею ботов, и они остаются на этом компьютере.",
    step1Title: "Создайте бота-фабрику в @BotFather",
    step1Points: ["Откройте @BotFather и отправьте /newbot.", "Дайте ему имя и адрес ниже (скопируйте их)."],
    nameLabel: "Имя",
    usernameLabel: "Адрес",
    openBotFather: "Открыть @BotFather",
    step2Title: "Включите «Bot Management Mode»",
    step2Points: ["В @BotFather нажмите «Open» (его мини-приложение) и выберите нового бота.", "В настройках бота включите «Bot Management Mode».", "Скопируйте токен бота (в @BotFather: бот → «API Token»)."],
    step3Title: "Отметьте, что сделали, и вставьте токен",
    checks: ["Бот создан в @BotFather", "«Bot Management Mode» включён", "Токен скопирован"],
    tokenLabel: "Токен фабрики",
    tokenHint: "Узел сам спросит Telegram, включён ли режим; токен хранится только на этом компьютере.",
    save: "Проверить и сохранить",
    saving: "Спрашиваю Telegram…",
    ready: "Фабрика готова: @{username} (…{tail}), «Bot Management Mode» подтверждён Telegram.",
    recheck: "Проверить снова",
    replace: "Заменить фабрику",
    errors: {
      "bad-format": "Это не токен бота. Скопируйте его заново из @BotFather.",
      "token-rejected": "Telegram не принял этот токен.",
      "telegram-unreachable": "Telegram сейчас не отвечает. Попробуйте через минуту.",
      "management-off": "@{username} — бот, но «Bot Management Mode» выключен. Включите его в мини-приложении @BotFather → настройки бота и нажмите «Проверить и сохранить» ещё раз.",
    },
    missing: "У узла пока нет бота-фабрики: без неё этот бот создаётся руками ниже.",
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
