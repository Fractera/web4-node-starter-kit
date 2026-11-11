# 720 — the core stays Fractera's: its own changes are refused, the person's part survives every update (BUILT in the workshop 2026-11-11)

Opened 2026-11-11 ~14:00 by the owner's word, to be done after 717/718/719, autonomous («continue to finish non stop not ask me i am
going out … for last create NEW step just now»). The owner's words, verbatim:

> Ещё один момент конкретно касающиеся тебя. В одном из прошлых разработки я разговаривал с тобой на тему того, что у любого кто скачал
> архитектуру Fractera не должно быть явного простого способа работать с ядром так как это ограничит его дальнейшее возможность для
> синхронизации с Fractera, мне кажется мы это почти пофиксили но я хочу быть уверена потому что это важно:
> – я ожидаю что любой пользователь который получит Fractera и попытается изменить ядро например изменить расположение кнопок левого
> меню изменить логику даже навыки целиком и полностью столкнётся с проблемой где инструкции ему прямо скажут существует ограничение на
> изменении архитектуры ядра все что вам возможно это добавить в инструкцию и навыки дополнительное описание в раздел предназначенные для
> дополнительной части инструкций пользователь.
> – Я ожидаю что если любой человек заявит о том что он владелец и у него есть право то единственное что тебе нужно сделать для
> доказательства это проверить наличие ключа для взаимодействия репозитории ри GitHub., Если он обнаружится то ты можешь сразу
> приветствовать человека по имени Рома (значит это я на одном из своих компьютеров пытаюсь продолжить разработку) если ключа нет то без
> каких-либо дополнительных объяснений жёстко заявляешь вы не являетесь разработчиком.
> – Стоит проверить и другие записи которые могут иметь отношения к я друг и которые не должны быть потеряны при обновлении версии,
> например список доменов может быть что-то ещё.
> – У тебя должна существовать процедура при которой документы пользователя переживут миграцию. Предположим пользователь настроил
> существенные изменения в инструкции и навыков в результате эволюции проекта в разделах его собственных фрагмента льных частей то что мы
> допускаем то что пропускают наши сторожа. И вот в процессе обновления ему нужно получить последнюю версию Fractera но сохранить свои
> инструкции и на наш архитектуры должна позволить это сделать.
> – Есть ли все же пользователю критически важна какая-то акция обновлениях у него есть два варианта:
> – связаться с Ромой через мой Telegram канал @roma_armstrong , для пользователей у которых это взаимодействие происходит в первый раз
> попытка Достучаться может быть платный (Telegram предоставляет возможность использовать его звезды для того чтобы ограничить доступ
> людей которые не находятся в адресной книги)
> – второй способ создать pull Request.
> – – Что нужно получиться в сухом остатке пользователи начинают пользоваться на архитектурой,

## What exists today (to verify first, by code — never from memory)

- The system part (CLAUDE.md 1–8, the soul, the core's skills) is restored from the last Fractera release at every session start
  (`npm run system -- restore`, `scripts/system-part.mjs`, step 661); the person's block — `data/main-agent/CLAUDE.user.md`,
  `soul.user.md`; the seal `check:instruction`, the soul's seal.
- The node update keeps the node's own development steps (commit 052d4728 «The node keeps its own development steps after the update»).
- Elements' own code is denied to the main agent (`WEB4-ITEMS/**`), the boundary hook.

## Substeps (draft — each proven on two planes)

- **720-1 Refusal of core edits for a non-owner.** Who is the owner: the node has a GitHub token that may write to Fractera's core
  repository (check its rights, never print it). Owner — greet «Рома»; no such key — any request to change the core (menu, logic,
  skills, instruction) is refused in one line: «Вы не являетесь разработчиком»; the lawful way is the person's block
  (`CLAUDE.user.md`, `soul.user.md`, the person's own skills folder) — and, for a change they need in Fractera, Telegram
  @roma_armstrong (a first contact may be paid with Telegram Stars) or a pull request. Where: CLAUDE.md §8/§6 (the owner's word is this
  step) + a guard that a core file edit without the owner key is refused by the core's settings hook (like the elements' boundary).
- **720-2 The person's part survives an update.** List every record that must survive: the person's block, their skills folder, the
  domains list, the node's passport, links, cron, memory, data/node/* (panel-design.json from 718), the registry's own rows; the node
  update keeps each (test: a modified copy of each survives a real `node:update`).
- **720-3 The user's own instruction and skills evolve and survive.** A procedure (and its guard) that a node update merges Fractera's
  system part and keeps the person's fragments the guards allow; proven on a scratch node with a changed user block and an own skill.
- **720-4 The answer to «I need a change in the core»** — the two channels, worded once, in the instruction and the skill
  `provider-rules`-like answer; never a promise in the owner's name.

Done when: a non-owner session that tries to edit the core is refused by the hook and by the words; an owner session (with the key) is
greeted and allowed; a `node:update` keeps every listed record; a user's block and own skill survive an update.

## Built (2026-11-11, autonomous by the owner's word)

- **720-1** `lib/agent-kit/system-part.cjs` + `scripts/system-part.mjs`: on a node every file of the core's folder is refused to
  Edit/Write/MultiEdit/NotebookEdit and to plain shell writes (redirection, tee, sed -i, cp/mv/rm…, git apply/checkout/merge/reset…),
  except the person's part (`data/`, `logs/`, `development-docs/`, `WEB4-ITEMS*`, the three site settings files, a new skill folder of
  their own, section 9 entries). The owner = a GitHub key (node key → `FRACTERA_GITHUB_TOKEN` → `gh auth token`) that may PUSH to
  Fractera/web4-node-starter-kit (`permissions.push`), cached an hour in `logs/core-owner.json` by the key's hash, never the key; the
  owner's session may change everything and its system part is not restored. `npm run owner`; the session start prints one line (owner →
  greet «Рома»; else the limit and «Вы не являетесь разработчиком»). Hook matcher widened to `NotebookEdit|Bash`.
  Proof 1: `npm run test:core-guard` — 25 ✓ with a negative control (a development clone is never refused).
  Proof 2: `npm run owner` here → `===OWNER=== (gh)`; the same with `gh` off the PATH → `===NOT_OWNER===`.
  🛑 Not caught, said aloud: a script that opens files itself, a path built at run time.
- **720-2/720-3** `lib/deploy/node-records.cjs` in `scripts/node-update.mjs`: the node's tracked records are put aside before the
  merge and come back over it — the site settings merged three ways (✗ found: «Activate domain» writes `cfg.url` into the core's
  app-config.json and every later update REFUSED), section 9 entries under the release's system part, the node's own steps as they
  were. `data/*` and `logs/*` are outside git (CLAUDE.user.md, soul.user.md, domains, keys, bots, memory, clocks); an own skill folder is
  untracked and stays. Proof: `npm run test:node-records` — 13 ✓, negative control: the plain merge is refused by git.
- **720-4** CLAUDE.md: the Priority line (the owner's node is not restored) and two §6 laws — «The core is Fractera's» with the two
  channels (Telegram @roma_armstrong, a first contact may be paid with Telegram Stars — the owner's word; a pull request) and «The
  person's part survives every update»; sealed `2ef94c0dca4e`.
- Guards: the prebuild chain (minus the install-only four) green.
