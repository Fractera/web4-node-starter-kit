# 731 — the main agent's own reset always wakes it — summary (2026-11-12, tandem)

Opened 2026-11-12 ~09:55 by the owner after the 4th dark terminal following a reset. His words, verbatim:

> Ты сбросил контекст и должен был проснуться но я обнаруживаю абсолютно чёрный экран … это проблема возникла опять уже в четвёртый
> раз … попробуй отследить почему сейчас ты не проснулся

After the diagnosis: «Да, сначала закрой дыру, потом 727-2, Ну и конечно помню что этот механизм должен работать во всех элементах не
так ли?»

## The defect

- 09:48:28 my own reset ran `npm run session -- clear` WITHOUT `--continue` (`logs/web4-out.log`: `build clear → scheduled clear`).
  `/clear` took effect, the bridge rightly pasted no letter, the terminal stayed black until the owner typed.
- Cause: one command, two meanings. The hard-command row «очисти контекст» (`lib/agent-kit/commands.json`, always in the main agent's
  prompt) showed bare `clear` — right when the PERSON asks, wrong for the agent's own reset; the right form lived only in
  `use-development-steps` §2 and the window line.
- A second, latent harm found by the red test: bare `clear` then `clear --continue` in one turn typed `/clear` twice — the late second
  one wiped the freshly woken session.
- Elements were never exposed: their own reset is `npm run reset` (custom and native templates), which always sends `continue: true`.

## What was built — `4b0f0303`

- The row «clear» names both cases: the person asks → bare `clear`, the fresh session waits for their words; your own reset →
  `session clear --continue`, never bare.
- Bare `npm run session -- clear` from the CLI says aloud that nobody wakes the fresh session and how to make it your own reset.
- The bridge keeps ONE pending clear per live session: a second ask in the same turn joins it, `--continue` upgrades it, `/clear` is
  typed once. Master `kits/_agent-kit/core` → all twelve copies (`check:agent-kits` 12 legal).
- `test:reset-wake` F (bare: cleared, no letter), G (bare then `--continue` in one turn: one `/clear`, the letter in the new
  conversation), H (the words) — red on the old code (G typed `/clear` twice), green now. `check:node-lines` holds the words. The full
  prebuild chain green; CI green.

## Proofs (two planes)

1. **The wire, with a negative control** — `test:reset-wake` G red on the old code, green on `4b0f0303`.
2. **Live on the node** (core `0e72b76b`, after the fork sync and the node update): at 10:26 my own reset ran exactly scenario G —
   bare `clear`, then `clear --continue` in the same turn. `logs/web4-out.log`:
   `10:26:33 build clear → scheduled clear` · `10:26:34 build clear --continue → scheduled clear-continue` (joined) ·
   `10:26:43 /clear — контекст очищен` (ONE) · `10:26:45 после сброса — разговор e7abca3b… записан` ·
   `10:26:47 пробуждён письмом после сброса`. The next session (`e7abca3b`) received the letter as its first message and went on
   from it with nobody typing.

## Next

727-2 — the stub in the custom template that asks the core's shell kit, and the note how an element drops the stub to draw its own tool.
