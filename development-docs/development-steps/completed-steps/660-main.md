# 660 — every element's home in the look of the new landings, the account drawer as root's (closed)

**The owner, 2026-11-06, verbatim (a voice message):** «Нужно проверить чтобы все существующие кастомные элементы а также элементы которые
пока ещё стартовый шаблоны кастомных и нативных клиентов в своей главной странице Эмили стиль и дизайн как у новых таких как страйп,
голубиная память. Тексты были написаны с помощью наука humanize. Правобережном ящике меню должна иметь такие же вкладки как в элементе root
// go to finish non stop . i go to sleep». Read as: every element and both templates get a home in the look of the Stripe and deep-memory
landings, texts through `humanizer`; the drawer «Личный кабинет» has root's tabs.

**What the step gave.** Landings (a widget `widget-static-<x>-landing` + catalogue blocks, the 650-4 / Stripe sample; en and ru from one
spec; every claim from the element's README) for data (+ `block-access-map`, «Чья это таблица»), auth, config, design, cache, the custom
template (the width ribbon `var(--app-w)`, the hero first — its newer guards) and the native template. The drawer as root's (645-3: «Как
это работает», «Подписка Claude Code», «Терминал», «Активация Telegram», the architect group) in fourteen repositories; natives keep H2A
and the accounts page hidden. Every drawer link goes to the core's address `ARCHITECT_URL` (564), never a relative `/<lang>/architect/...`.
Cache's words fixed after step 619: it starts with the node (the owner 2026-10-30: «… По умолчанию отключены остаются только: – страйп Все
остальные по умолчанию активны»).

| Release | Commits and tags | CI three-os | Core pin |
|---|---|---|---|
| landings and drawer | data `ae197fa` v2.2.8, auth `fc6f40f` v2.4.15, config `46c2a95` v1.2.24, design `2dd666f` v1.1.24, cache `75c5805` v0.1.18, custom `bcb63cd` v0.3.161, native `b8bfa57` v0.1.40, storage `b7f8fe2` v1.1.28, vectors `0138984` v1.2.11, embeddings `8ed73fc` v0.1.9, graph `75bbe5a` v1.2.10, memory `fc441b0` v2.2.28, stripe `181116d` v1.3.18, blocks `d70d4a3` v1.4.21 | 42197943675 … 42198128025, all 14 green | `0d61c113` (42198986546) |
| cache's words | cache `6540c4a` v0.1.19, `bdeaa96` v0.1.20; native `9d0e3a6` v0.1.41 | 42200924607, 42200973935, 42200935395 | `f938c788` (42201422790) |
| the drawer to `ARCHITECT_URL` | root `cad6ea5` v3.0.27, custom `ce65fdc` v0.3.162, native `cac1457` v0.1.42, auth `9c78a7a` v2.4.16, data `fd532e1` v2.2.9, storage `63fd090` v1.1.29, vectors `b6f111b` v1.2.12, embeddings `f479817` v0.1.10, graph `dbd4231` v1.2.11, cache `045e4c2` v0.1.21, memory `6cdc87e` v2.2.29, stripe `6aa8519` v1.3.19, blocks `7251264` v1.4.22 | all 13 green | `76b5ac3f` (42205011513) |

Plan opened `febeb731`. Delivered: `ядро 47c9e936` (the first two releases), then `ядро 8cfa1238` (the drawer pins, with 661).

**Proven.**
1. *The lab* (`next dev` 2565x, en,ru; `~/fractera-dev/_tools/eyes-landing.cjs`): all seven new landings — en and ru, 1440 light and dark,
   390 — console errors 0, no overflow, the drawer's five tabs; `prebuild` 0 and `tsc` 0 in all seven; `check-data-langs` green.
2. *The owner's node* (`~/fractera-dev/_tools/proof-660.sh`): the first run — every landing in place, no overflow, but **10 console errors
   with the drawer open** on root and every element with relative links (negative control: config and design, already on `ARCHITECT_URL`,
   0). After the drawer pins → `===EYES_LANDING_OK===` on all 12 running elements (en and ru, 1440 light and dark, 390, console 0 with the
   drawer open, no overflow; stripe off by the node).

**Mistakes.** (1) The lab was trusted for the drawer: `next dev` does not prefetch, production Next.js prefetches the open drawer's links
and the element answers 307 to the core on another port — CORS errors seen only on the node; root had carried them since 645-3. The node
proof is the real one. (2) The cache landing first repeated its README's stale «off by default» — a README is a source only after it is
checked against later steps (619).

**Evolution of skills.** The laws line of `current-steps.md` records it: production prefetch shows errors `next dev` does not — the
drawer and any cross-element link go to `ARCHITECT_URL`. The tools stay in `~/fractera-dev/_tools/660-landing/`.

**Found, told to the owner, not in it:** the core's `CLAUDE.md` §3 «Stores are on by default, except Redis» contradicts 619 — sealed,
waits for his word. Root keeps its home — the agent's screen.
