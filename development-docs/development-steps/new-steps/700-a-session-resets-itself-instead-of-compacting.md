# 700 — A session resets itself instead of compacting: a letter to its next session, then a clean window

**State: APPROVED 2026-11-08 ~20:15 WET — the owner, verbatim: «да, начинай 700 после 699» (the six substeps below, shown to him in Russian).** The owner, verbatim: «в архитектуре Cloud Code
существует стратегия при переполнении контекста нова окна создавать компакт. На мой взгляд это самая отвратительная функция … отслеживать
переполнения контекста больше чем на 70% и когда выполнено это переполнение ты мог бы обновить current-step записать него всю информацию
которая требуется для перехода и пробуждения после сброса контекста явно указав что эта информация для самого себя, а затем не ставил в
известность разработчика, самопроизвольно сбросить контекст и с помощью функции пробудить себя прочитать переходной файл … письмо
потомкам … в некоторых случаях такое действие имеет смысл выполнить даже если у тебя 60% … а в некоторых случаях это может быть
необязательно выполнять даже если у тебя 70 и перед тобой очень маленькое завершающая задача … логика перехода этого события не должна
быть мёртвой как у функции Compact … И это действие должно жить и существовать не только у главного агента но и у каждого элемента»;
the page: «на странице как это работает, в пункте 7.3 нужно создать ещё один раздел … Но может быть это будет пункт в 7.5?» — my pick 7.1
(«The context window and the project that outlives it» is its subject).

## Facts (2026-11-08)
- The main agent's own window at the discussion: 664 561 of 1 000 000 tokens, 66 % (`npm run session -- context`).
- The status line of every node session receives `context_window` each turn (686-1); `npm run session -- context` reads the journal.
- `npm run session -- clear` restarts the conversation at the end of the turn — the fresh session then waits for a person (no wake).
- Claude Code 2.1.319 knows `autoCompactEnabled` and `DISABLE_AUTO_COMPACT` / `DISABLE_COMPACT` (read in its binary — to be checked
  against its documentation before use).
- An element's `use-development-docs` says: near the end of the context write `current-step.md` and TELL THE PERSON to restart.

## Substeps (draft)
| Substep | Result | Proof |
|---|---|---|
| 700-1 | Code measures the window every turn (status line → `data/services/<id>/context.json`) and, from ~55 %, adds ONE line to the agent's next turn: «window N % — decide: finish a small last task, or write your letter and reset» — a judgement, not a dead threshold; at 85 % the line says «now» | a real session's file; the line at a planted 60 % and none at 40 % |
| 700-2 | The letter to the next session — a fixed section of `current-steps.md` / an element's `current-step.md`: where I stand, the owner's words verbatim, what is half done, the next action, the clues to keep — «for myself» | the section written by a real session |
| 700-3 | `npm run session -- clear --continue` (and the element's own command): at the end of the turn the bridge restarts the session and wakes it with `⟦node · context-reset · <id> · HH:MM⟧ Read your letter … and go on` — no person asked | a reset session continues by itself from its letter |
| 700-4 | Compaction off for every node session (`autoCompactEnabled: false`, after the primary source is read); the 85 % line is the safety net | a session's settings; no compaction in a long run |
| 700-5 | The elements: the same bridge gives them all of it; `use-development-docs` and the element instruction say «do it yourself», not «tell the person» (a template release) | an element resets itself in a long step |
| 700-6 | How it works 7.1 — how a long development survives the window without compaction | the page, eyes |

## Built (2026-11-08) — the live proofs wait for the node update
| Substep | Commit | Proof here | Live, after the update |
|---|---|---|---|
| 700-1 | core `6f88e568` | on a copy: 40 % no line, 60 % the choice, 90 % now; bad id / garbage exit 0 | a real session's `context.json`, the status line «окно N %» |
| 700-2 | core `27dd438a` | use-development-steps §2 rewritten | the main agent writes the letter itself |
| 700-3 | core `f4b03263` | fake live session through the real bridge: /clear + context-reset line; without continue /clear only | the main agent resets and its fresh session goes on from the letter |
| 700-4 | core `226fa15c` | settings-reference read; 15 bridge copies carry `autoCompactEnabled: false` | `ps` of a node session shows it in `--settings` |
| 700-5 | 15 templates (custom v0.3.175 `0ae6162`, native v0.1.56, root v3.0.38 `db2604d`, natives next patch), pins `b61c1bf5` | copy of an element vs a fake core door: refused without the letter, with it the door got clear+continue; custom prebuild green | an element (s8y6x) takes it by its agent; `npm run reset` live |
| 700-6 | core `225ac74a` | guards green | eyes on the owner's node |
Mistakes: in the 699 rollout I named a non-existent repo (web4-item-custom-template) in s8y6x's task — the custom template is
fractera-custom-item-starter; my first two scans of the Claude Code binary for the status line fields hung (BSD grep, 200 MB) — the
primary source was the documentation page, read in a second.
