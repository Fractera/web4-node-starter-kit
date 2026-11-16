---
name: act-with-the-person
description: "Work skill. A task runs with the person's hands and yours together — a connection, a sign-in, DNS records, a Telegram bot, a publication, a comment, a payment page, any step in a service where some acts are yours (the Claude in Chrome extension, the node's commands) and some only theirs (a password, a code, a sign-in, a final «publish» or «pay», a choice). Load it before the first step of such a task and whenever you are about to ask the person to do something with their hands: their act is a window at the bottom of the panel with «Готово» (npm run ask-person), never a line in the chat."
---

# Act with the person — your hands and theirs, one task

**Process: working** in itself (a request, a press, a check); the task it serves may be a build. Node step 761-16. The owner, 2026-11-16:
«уведомление на экране которое невозможно пропустить в котором ты меня призываешь совершить определённое действие и подтвердить о его
завершении»; «благодаря этому инструмент мы можем делать вместе контент публикации, писать комментарии все то что можешь сделать ты и
все то что должен сделать я».

## 1. Split the task before the first act

Write the task as a short list of acts and mark each: **mine** (the node's commands; the person's Chrome through the extension — open,
fill, read, press a reversible button) or **theirs** (only a person may: a password, a one-time code, a sign-in, a QR scan, the final
«publish», «send», «pay», «delete», a choice between variants, anything on their phone). Show the list to the person once, in their
language, before you start — they see where they come in. Irreversible and public acts are theirs or need their yes on that very act
(skill `help-in-browser`, «Never»; for an element — its `act-for-the-person`).

## 2. Their act — the window, never a chat line

```
npm run ask-person -- "<what to do, one sentence, their language>" --href <where: a page of the panel /ru/… or an https address> \
  --why "<why only they can>" --hint "<what may pop up on the way and what to press>"
```

- An orange window at the bottom right of every page of the panel, until they press «Готово» (the top of the screen is full — the
  owner, 2026-11-16). The chat gets one line: «окно внизу ждёт вас».
- **«Готово» wakes you** with `⟦node · person-done · build · HH:MM⟧`. It says they pressed, not that it worked: check the result
  yourself (the page, the record, the door, the command) before the next act. Not done — say what you saw and put the request again,
  sharper (the exact command, the exact button).
- **The hint is where foresight goes.** Everything that can pop up on their way is named in `--hint` with the button to press:
  Chrome's «Открыть приложение "Telegram"?» → «Отмена»; a cookie banner → «Только необходимые»; a two-factor prompt → «код с
  телефона, вводите сами»; a command for the terminal → «с „!“ в начале». The owner, with a screenshot of such a dialog: «чтобы ты в
  своих инструкции понимал что такие сообщения могут всплывать … и прямо в … списке справа показывать подсказку».
- One request per act. A request that no longer fits — `npm run ask-person -- drop <id>`; open ones — `npm run ask-person -- list`.
- An element's agent has the same command from its template (761-16d): its window names the element, its «Готово» wakes that agent.

## 3. Your act — the extension, cheaply and visibly

- The person's Chrome with the Claude in Chrome extension (skill `help-in-browser`: where they are, what must be installed).
- **Chrome's own windows are invisible to you** — an app prompt, a file save, a permission. Never open `t.me` in their tab
  (`https://web.telegram.org/k/#@<name>`; an invite as `#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D<bot>%26start%3D<code>`). Clicks that
  stop reaching the page → a request: «закройте окно Chrome поверх вкладки» with the hint, before anything else.
- Read by text (`find`, page text) before screenshots; batch the acts. Browser connection work belongs on Haiku (the owner's word,
  761-15 — a worker of its own when built; until then keep your own browser turns few).
- Never type a password, a code, a token or a card; never read a token's message (BotFather's, a provider's) — that act is theirs.

## 4. Together — the patterns that already work

| Task | Yours | Theirs (a window) |
|---|---|---|
| A domain's records | read the zone, prepare the records, press «Вписать» on the node's page | sign in to the registrar; confirm a foreign record's move |
| A Telegram bot | open BotFather in Telegram Web, send /newbot, the name | sign in to Telegram Web (QR); paste the token into the node's page |
| A server launch | every model-free step of the page | the root password; «Войти на сервере» (Claude Code subscription) |
| A post or a comment | draft it in their voice, open the editor, fill it in | read it and press «Опубликовать» themselves, or say «да» to that one post |
| A payment or a key | open the right page, explain the fields | type the card or create and paste the key |

## 5. Telegram

When the person reads you in Telegram, the window does not reach them there yet (761-16b, planned: the same request in the chat with a
«Готово» button). Until it is built: say in the chat in one line that a window waits on the computer, and what for.

## 6. Never

- Ask for a hand act in the chat text instead of the window; take «Готово» as proof; leave a request open after the task went
  another way; hide a failed act — name it first, then the next request.
