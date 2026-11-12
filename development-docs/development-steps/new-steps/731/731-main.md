# 731 — the main agent's own reset always wakes it

**The owner, 2026-11-12 ~09:55:** «Ты сбросил контекст и должен был проснуться но я обнаруживаю абсолютно чёрный экран … это проблема
возникла опять уже в четвёртый раз … попробуй отследить почему сейчас ты не проснулся». After the diagnosis: «Да, сначала закрой дыру,
потом 727-2, Ну и конечно помню что этот механизм должен работать во всех элементах не так ли?»

## The defect (traced on the node, core `6fd025fe`)

- 09:48:28 the main agent's own reset ran `npm run session -- clear` WITHOUT `--continue` (`logs/web4-out.log`: `build clear → scheduled
  clear`; the three good resets of 2026-11-11 say `clear-continue`). `/clear` took effect (pulse `session-end reason=clear` 09:48:38);
  the bridge rightly pasted no letter; the agent had promised «новая сессия начнёт 727-2». Black terminal until the owner typed.
- Cause: one command, two meanings. The hard-command row «очисти контекст» (`lib/agent-kit/commands.json`, always in the main agent's
  prompt) shows bare `clear` — right when the PERSON asks (they write next), wrong for the agent's own reset. The right form lives only in
  `use-development-steps` §2 and the window line (≥55 %); at a low window after a core-back the agent took the row in front of it.
- Elements cannot make this mistake: their own reset is `npm run reset` (custom and native templates), which always sends
  `continue: true`; `clear` is marked the main agent's command in their prompt. The bridge is one for all (12 copies of the master) and
  `test:reset-wake` drives both the main agent's copy and an element's.

## Substeps

- **731-1** — the row «очисти контекст» names both cases: the person asks → bare `clear`; your own reset → `clear --continue`, never
  bare. `npm run session -- clear` from the CLI without `--continue` says aloud that nobody wakes the fresh session and how to make it
  your own reset. The bridge keeps ONE pending clear per live session: a second call in the same turn joins it (`--continue` upgrades
  it), never types `/clear` twice. Master `kits/_agent-kit/core` → the 12 copies (`agent-kit:update`).
- **731-2** — proof. `test:reset-wake` gets F (bare clear: cleared, no letter) and G (bare clear, then `clear --continue` in the same
  turn: one `/clear`, the letter in the new conversation) — G red on the old code. `check:node-lines` holds the words: the commands row
  and the window line name `clear --continue` for the main agent's own reset. Live: after the node update my own reset wakes me
  (`clear-continue` in the bridge's log and the letter as the first message of the new conversation).
