# 767 — the person's browser from Telegram (plan, waits for the owner's yes)

The owner, 2026-11-16 ~17:50 UTC (Telegram): «в инструкцию основного агента добавить описание его возможностей при которых пользователь
может с помощью Telegram управлять вкладками браузера что требует установки расширения Chrome во все соответствующие аккаунты … в том числе
со связкой с глубокой памятью … когда пользователь к тебе говорит о какой-то ссылке это может быть прямо связано с одним из его элементов
… давай посмотрим мой профиль LinkedIn мне хочется написать пост … проверить существуют ли такой элемент если существуют значит
переключаемся на тот элемент … если порядок общий например найди в новостях и покажи мне в браузере полёт Starship … откроешь пользователю
Google … или есть у тебя глубокая память хранит … предпочтения … руут должна быть немного другая инструкция … если нет то агент руут должен
прямо передать эту команду к тебе … Это ветвистая схема … требует написания обновления инструкции как к тебе агенту ядра так и элементов.
Пожалуйста исследуй это в первую очередь». The LinkedIn element (hrutb) is paused, not supervised.

## Measured (17:30–17:50, live with the owner)
- The extension acts only in the connected browser (`list_connected_browsers`: one, «Browser 1»); its `selectedTabId` is the agent's tab,
  never the person's screen — there is no «activate tab» in it.
- macOS AppleScript drives every Chrome window and profile without the extension: list windows/tabs, `set active tab index` + `set index
  of window` + `activate` (Gmail, LinkedIn, Telegram Web brought forward — the owner confirmed each), once the person pressed OK on
  «Терминал wants access to control Google Chrome».
- A page in another profile: `Google Chrome --profile-directory=<dir> <url>`; profiles and their accounts from Chrome's `Local State`.
- `~/.claude.json` has `claudeInChromeDefaultEnabled: true` → every Claude Code session on this Mac, an element's too, gets the Chrome
  tools when the extension answers. Custom elements already carry `act-for-the-person` (the person's browser, with their yes).
- The deep memory keeps a link as text («запомни …»); `npm run remind` answers from it — the link then opens like any address.
- Windows/Linux: not measured; the extension should work, a tab cannot be activated by the system (only a window).

## The scheme (who does what)
1. A browser wish comes (Telegram or terminal) to the main agent:
   a. it names a field of an element («мой профиль LinkedIn, хочу пост») → `npm run find`; an element holds it → the task goes to that
      element's agent (`npm run task`), which acts in the browser itself; none → the order of `shape-the-need`.
   b. it names a remembered thing («ссылку про электровелосипеды, что я просил запомнить») → `npm run remind` → open and focus.
   c. general («найди новости о полёте Starship и покажи») → the deep memory first for the person's preference (a source they named),
      else a search; open and focus.
2. The same wish to an element's agent: its field → it acts (`act-for-the-person`) and brings the tab forward through the core's door;
   not its field → `npm run tell-core` with the person's words, nothing else; the main agent decides or routes (1a–1c).
3. Every act the person's hands must do stays a window (`ask-person`, its link) — sign-ins, passwords, the final press.

## Substeps
- [x] 767-1 core command `npm run browser -- tabs | focus <words or address> | open <url> [--profile <name or email>]` — model-free;
  `tabs` prints titles and hosts only (never full addresses: tokens); `focus` finds by address or title in every window; Mac only,
  elsewhere it says so; the first run names the macOS Automation window (an `ask-person` hint).
- [x] 767-2 core door `/api/node/browser` (loopback, `X-Node-Key` + element id, `// @api`) with the same `focus` / `open` / `tabs` for
  elements; a journal line per call.
- [x] 767-3 CLAUDE.md §4 — one scenario line «The person's browser from Telegram» (the routing 1a–1c and 2 in one sentence, the extension
  in each profile the person wants acted in, details in `help-in-browser`); resealed at the owner's word.
- [x] 767-4 skill `help-in-browser` — section «Driving the browser from Telegram»: the map A (AppleScript, any profile) / B (extension,
  connected browser) / C (the node's window), the routing, the deep memory link, what stays the person's, Windows/Linux unmeasured.
- [ ] 767-5 element instruction (sealed source) — one line in `act-for-the-person`: a browser wish outside your field goes to the core
  with `tell-core`, inside it — act and bring the tab forward with the core's browser door; templates released, rolled to every element.
- [x] 767-6 the main agent's «Telegram-бот» settings page — a separate closed accordion (shadcn Accordion) «Управление браузером через
  Telegram»: how it works, what it needs (the extension in each profile, the macOS Automation OK once), what the person gets (the owner,
  2026-11-16 ~17:52: «отдельный раздел управления браузером через Telegram. Показывай его как информационный блок аккордеон закрытым при
  раскрытии опиши как именно происходит управление браузером через Telegram что для этого нужно и что пользователь может из этого
  извлечь»). Texts through translations, ru + en; seen with eyes closed and open, both themes.
Tests: B1 Telegram «покажи мой профиль LinkedIn» → the element holding LinkedIn is named and gets the task (or none → said) · B2 «найди
новости о Starship и покажи» → a tab opened AND in front (the owner confirms) · B3 a test link remembered, then «какую ссылку … я просил
запомнить» → remind finds it, the tab opens in front · B4 root gets a browser wish outside its field → `tell-core` reaches the main agent ·
B5 negatives: `focus` with no matching tab says so and opens nothing; `tabs` never prints a full address; the door refuses without the node
key · unit tests for the command and the door; B6 the accordion closed by default, opens with the keyboard, no console errors; check:instruction, the element instruction seal, templates' prebuild.
Price: CLAUDE.md +1 line, the element instruction +1 line (paid in every element session), the rest in a skill loaded by need.

## Done in code (2026-11-16 ~18:00–18:20)
- 767-1 `lib/node/browser.cjs` + `scripts/browser.mjs` (`npm run browser`); unit `scripts/browser.test.mjs` 6/6 in the prebuild. Live, no
  tab switched: `tabs` 2 windows / 18 tabs, hosts only; `focus "starship flight 15 zzz"` → NOT_FOUND, nothing opened; `profiles` 10, accounts
  masked; `open javascript:` refused; an unknown profile refused with the names. «fractera.ai» and «Fractera.ai» are twins on this Mac —
  the letter case decides.
- 767-2 `app/api/node/browser/route.ts`: node key, a known element, `elementMay` (own subscription, app factory → 403), focus by address or
  host only, nothing of the person's tabs returned; journal `[node/browser]`.
- 767-3 CLAUDE.md §4 «The person's browser from Telegram» — resealed d64e6436722f (FAIL before the seal — the negative).
- 767-4 `help-in-browser` «Driving the browser from Telegram».
- 767-6 `lib/content/bot-page-notes(.i18n).ts`; the template `kits/_agent-kit/pages/telegram/_components/index.ts.tpl` and its 11 copies
  ask `botPageNotes('<service>', lang)` — only `build` (the core's main agent) carries the closed accordion; copies equal the template.
Guards: tsc 0, api, agent kits 12, page-composition, content, sections, static, shadcn-parts, typography, parts-map, lang-delivery,
architect-routes, skill headers, instruction skills, shape-examples OK; check:i18n red 40 before and after (pre-existing).
