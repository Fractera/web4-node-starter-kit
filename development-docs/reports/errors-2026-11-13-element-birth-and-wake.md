# Errors 2026-11-12/13 — the birth and the wake of «Хранилище картинок» (step 736)

The owner, 2026-11-13: «И так почни свою работу с анализа собственных инструкций почему ты так плохо сработал во время взаимодействия с
элементом и его рождением локализуя эту проблему затем пробу и отслеживаем в тесте работу элемента генератор картинок».

## What happened (the core's log, `logs/web4-out.log`)

```
23:42:39 [agents/wake] s3v6y reason=main-agent-on → started          ← npm run wake after create --no-wake
23:42:40 [agents/wake] s3v6y reason=main-agent-task → already        ← npm run task printed «pasted into the live session»
23:44:40 [agents/wake] s3v6y: поручение не вставлено — 120 с на экране стоит вопрос
23:49:53 [agents/trust] s3v6y → trusted                              ← only after the owner pointed at the screen
(no conversation of s3v6y on disk until 01:04 — the task was gone)
```

## Causes, each localized

| # | Defect | Where | Fixed by |
|---|---|---|---|
| 1 | I born the element with `--no-wake` and woke it by `npm run wake` — the path that does not carry the folder consent (`create` does, 548-6) | my sequence; skill create-element did not forbid it | skill create-element: never `--no-wake` + `wake` for the first work |
| 2 | `npm run wake` (reason `main-agent-on`) left the folder trust question to the main agent's Telegram bot; this node has none — the question went nowhere | `app/api/agents/wake/route.ts` (`confirmed`), bridge `askTrust` | every `main-agent-*` wake carries the consent (no own bot of the element); `askTrust` without Telegram tells the main agent (`⟦node · trust⟧`) |
| 3 | A task pasted into a live session while a question stood was dropped after 120 s, logged only; the command said «pasted» | bridge `wake` → `pasteWhenReady` | `deliver`: the trust question of a main-agent task is pressed at once; other questions — 10 min; not delivered — `⟦node · not-started⟧` to the main agent; `task` says «queued … tells you in 3 minutes» |
| 4 | Nothing checked whether the work started; I reported «the test is running» from `where` = «session alive» | no watchdog (§6 forbade timers without the architect's word — he gave it 2026-11-13) | `watchStart`: 3 min after a delivered task the element's conversation file must have moved; if not — `⟦node · not-started⟧` with the reason |
| 5 | The newborn had no product quiz and «Active step: none»; its role lived only in the core's `roles.json` | `create` | `--quiz-file` (required): the main agent's draft → `development-docs/product/quiz.json`; step 1 «analyse the product quiz»; `current-step.md`; the passport's development fragment; the element's `check:product` and `check:dev-docs` run at birth |
| 6 | Two vendored design skills (`impeccable`, `design-taste-frontend`) in every newborn — the architect picks one of 108 | both templates | removed (custom v0.3.202, native v0.1.70); `frontend-design` stays — the default of 706-4 |
| 7 | My first birth failed: the starting vector in Russian (its CLAUDE.md guard refuses Cyrillic outside quotes) | `create` | refused before the birth (`de001192`) |

## The live test itself (after the task was given again, 01:04)

The agent built the service in 5 minutes — and WROTE ITS OWN CROPPER (`_tools/tool-image-crop/`), while the core holds
`tool-image-crop`. Its transcript shows it followed the protocol and the instruments failed it:

- `npm run parts -- image crop` → «Nothing ready … close to «crop»» — **D14**: the element's terminal command searched only its own map
  (the session's MCP `parts_find` asks the node; the terminal did not). Fixed: `lib/parts/node-tools.mjs` in both templates — the same
  answer as `parts_find`. Proof: with the node's NODE_DOMAIN_FILE the template's `parts image crop` answers «Image cropping … Lives in the
  core … npm run tool:take -- tool-image-crop»; without it — «the node's core is not known here» (negative control).
- `npm run tool:take -- image-crop --dry` → «no tool «image-crop» in core» — **D15**: the folder's name is not the map id. Fixed in the
  core's `lib/parts/take.mjs`: found by id, by `tool-<name>`, by its folder; nothing found — «did you mean …». Test: take.test +2.

## Not done by this report

The second birth of «Хранилище картинок» after the node update is the proof of all seven together (the owner: «удали этот элемент и
повтори создание»). Its record goes into `development-docs/development-steps/new-steps/736/`.
