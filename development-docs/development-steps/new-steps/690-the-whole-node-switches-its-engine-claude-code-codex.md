# 690 — the whole node switches its engine: Claude Code ↔ Codex (QUEUED, not planned yet)

The owner, 2026-11-08, verbatim: «ok lets' cancel codex, i think better wil create function which will replase all node codex <-> Antropik .
to do fix it for step in feature». Before it — «what about codex ? not now ? later or not need ?» and the question of Codex next to Claude
for elements; that first draft (several engines side by side) is cancelled — `CANCELLED.md`, 2026-11-08.

The shape: ONE engine for the whole node at any moment — the main agent and every element on Claude Code, or all of them on Codex; a function
of the node switches them all at once, both ways. Simpler than a mixed node: every capability is proven on one engine at a time.

## Found in this repository's history (2026-11-08)

- The service «bridges» (`bridges/app/`, `bridges/platforms/server.js`) ran five platforms — `bridges/app/_components/coding-workspace/
  platforms.ts` at `bf3000c5` (2026-05-14): Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code, each with its docs link.
- The sign-in window: `auth-flow-descriptors.ts`, `auth-flow-modal.client.tsx` (same folder), `bridges/app/_components/auth-login-modal.client.tsx`.
  Three flows: **terminal-paste** — Claude Code (`claude.com/cai/oauth/authorize`), Gemini CLI (`accounts.google.com`), the code pasted
  into the terminal; **url-relay** — Codex (`auth.openai.com/oauth/authorize`): the browser fails on `localhost:1455`, the person pastes
  the whole address, `bridges/app/app/api/bridges/codex-auth-relay/route.ts` relays it; **device-code** — Codex device
  (`auth.openai.com/codex/device`) and Kimi Code: a one-time code typed on the provider's page. Qwen Code — an API key (`sk-…`) from
  Alibaba Model Studio.
- Fixes paid for on the way: `256ebd87` (terminal cols 500 — the Claude OAuth address no longer cut), `25e25927` (the address taken whole,
  a precise `state=`), `4151a518` (the Gemini address up to `.apps.googleusercontent.com`).
- Removed in step 500 — `28f7cc49` (2026-08-07, «терминал и служба мостов удалены») as dead code, not as a decision against
  other platforms: «компонент xterm в админке никто не импортировал … а служба под него держала шесть портов». Read any file back: `git show bf3000c5:<path>`.
- Codex 0.125.0 on the owner's Mac: its certificate is revoked (`spctl` — `CSSMERR_TP_CERT_REVOKED`), macOS called it harmful; the owner
  moved it to the Trash (2026-11-08). A fresh install and its signature are checked before the first run.

## What the plan must answer first (not weighed yet)

- **OpenAI's own rules** for Codex on a ChatGPT subscription in a node that wakes agents by itself — read from OpenAI's pages at planning
  time (law: a foreign service only from its primary source).
- **The system part names Claude:** the soul («You are Claude — the captain of this node … working by the person's subscription») and the
  instruction («Development runs on the Claude Code subscription»). A node on Codex needs its own true words — the owner's decision.
- **Everything the node holds on Claude Code** needs its Codex counterpart or an honest «not on Codex»: the bridge's launch flags and
  `--settings`, the hooks (diary, memory, progress, StopFailure of 686), skills, the element boundary, the Telegram channel (a Claude Code
  plugin), session logs, models and effort, `auth status`/`login` (the sign-in flows above), 689's own folder per element (`CODEX_HOME`).
- **Fresh Codex:** the installed 0.125.0 had a revoked certificate; a new install is checked (`spctl -a -vv`) before its first run.

To plan when the owner turns to it: the eight stages of `use-development-steps` §4.
