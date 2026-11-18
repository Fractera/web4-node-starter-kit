// Words of the red band «the main agent's Telegram does not hear you» on top of every page of the core panel (node step 781-4).
// Resolved on the server, passed as a prop.

export type MainChannelBandUi = {
  deafTitle: string; deafText: string
  healingTitle: string; healingText: string
  failedTitle: string; failedText: string
  reconnect: string; reconnectNote: string; wake: string
  terminal: string; working: string; done: string; failed: string
}

const UI: Record<string, MainChannelBandUi> = {
  en: {
    deafTitle: "The main agent's Telegram does not hear you",
    deafText: "The agent runs, but its bot gets no messages: the Telegram plugin did not come up. The node reconnects it by itself when the agent ends its turn; your messages wait in Telegram and are not lost.",
    healingTitle: "The main agent's Telegram is reconnecting",
    healingText: "The Telegram plugin dropped. The node restarts the same conversation as soon as the agent ends its turn; your messages wait in Telegram.",
    failedTitle: "The main agent's Telegram did not come up twice",
    failedText: "The node closed the session and reads the bot itself: a message in Telegram gets the «Start» button. Press «Wake» to turn the agent on now.",
    reconnect: "Reconnect now", reconnectNote: "the agent stops its current turn", wake: "Wake the agent",
    terminal: "Or in the agent's terminal: /mcp → telegram → Reconnect.",
    working: "Reconnecting…", done: "Done — the agent comes back in a few seconds", failed: "Did not work: {reason}",
  },
  ru: {
    deafTitle: "Telegram главного агента вас не слышит",
    deafText: "Агент работает, но его бот не получает сообщения: плагин Telegram не поднялся. Узел переподключит его сам, когда агент закончит ход; ваши сообщения ждут в Telegram и не потеряются.",
    healingTitle: "Telegram главного агента переподключается",
    healingText: "Плагин Telegram пропал. Узел перезапустит тот же разговор, как только агент закончит ход; ваши сообщения ждут в Telegram.",
    failedTitle: "Telegram главного агента не поднялся дважды",
    failedText: "Узел закрыл сессию и сам читает бота: на сообщение в Telegram придёт кнопка «Запустить». Нажмите «Разбудить», чтобы включить агента сейчас.",
    reconnect: "Переподключить сейчас", reconnectNote: "агент прервёт текущий ход", wake: "Разбудить агента",
    terminal: "Или в терминале агента: /mcp → telegram → Reconnect.",
    working: "Переподключаю…", done: "Готово — агент вернётся через несколько секунд", failed: "Не получилось: {reason}",
  },
}

export function mainChannelBandUi(lang: string): MainChannelBandUi {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
