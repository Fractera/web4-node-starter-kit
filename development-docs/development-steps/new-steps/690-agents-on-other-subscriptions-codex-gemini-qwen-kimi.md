# 690 — element agents on other subscriptions: Codex, Gemini CLI, Qwen Code, Kimi Code (QUEUED, not planned yet)

The owner, 2026-11-08, verbatim: «Станет ли это решение значительно сложнее если ты сразу сделаешь для элементов вход в подписку через и
Codex? Стоит ли это дело сейчас или завершить основную задачу?» — answered: after the main task, a group of steps of its own. Then:
«Я хочу тебе сказать что в ранних версиях архитектуры это примерно комиты от апреля у нас была реализована авторизация через: – Клот –
Gemini – OpenAI – qwen -Kimi логика входа у каждого несколько отличается поэтому я тебе рекомендую как минимум в истории исследований
записать что у нас есть работающее окно авторизации в истории можно найти?»

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
- Removed in step 500 — `28f7cc49` (2026-08-07, «терминал и служба мостов удалены»). Read any file back: `git show bf3000c5:<path>`.
- Codex 0.125.0 on the owner's Mac: its certificate is revoked (`spctl` — `CSSMERR_TP_CERT_REVOKED`), macOS called it harmful; the owner
  moved it to the Trash (2026-11-08). A fresh install and its signature are checked before the first run.

## What a step would need (not weighed yet)

Each platform is a second agent runtime, not a login: the node's hooks (diary, memory, progress), settings and the element boundary,
skills, the Telegram channel (a Claude Code plugin), session logs, models and effort. Each provider's own rules are read from its own
pages first (law: a foreign service only from its primary source). Rests on 689: the login folder of an element named by its provider
(`data/services/<id>/claude/`, then `codex/`, `gemini/` …).

To plan when the owner turns to it: the eight stages of `use-development-steps` §4.
