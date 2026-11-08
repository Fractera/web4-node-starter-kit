# 689 — an element signs in to Claude Code with its own person's subscription

**State: APPROVED 2026-11-08** — the owner: «да, утверждаю, начинай 689». Substep files `689-1.md` … `689-4.md`.

## 1. Retelling and decisions

The owner, 2026-11-08, verbatim:
- «but neet rool - if user need personal claude subscribtion , then can add to own element , check is it was builded before and work now ?»
- «i have another acc for test , i go to root , no ?»
- «да, утверждаю, начинай 689» — to the window with 689-1…4, the decisions below and what is not included.
- In the same message: «Станет ли это решение значительно сложнее если ты сразу сделаешь для элементов вход в подписку через и Codex? Стоит
  ли это дело сейчас или завершить основную задачу?» — answered: not in 689 (a second agent runtime, a group of steps); the folder of the
  login is named by its provider, so a Codex step can stand beside it later. The installed Codex 0.125.0 is blocked by macOS
  (`CSSMERR_TP_CERT_REVOKED`, measured 2026-11-08) — the owner moved it to the Trash on the main agent's advice.

What was there before (checked 2026-11-08): every element has the page «Подписка Claude Code», but it signs in the whole computer — its
own words «Одна подписка обслуживает всё … Лимит у них общий», the kit README «One per computer», the bridge «one login terminal per node».
The core sets `CLAUDE_CONFIG_DIR` nowhere. CLAUDE.md §4 already says «on their own Claude subscription» for the integrator — no mechanism.

The main agent's decisions (in the approval window):
- an element without its own login stays on the node's login, as today;
- the person signs in themselves, in their own browser; the node never sees the password or the code;
- `~/claude-test` (the owner's test account) stays for the proof of 689-1, then the owner decides.

Not included: buying subscriptions; an Anthropic API key (forbidden in the project); switching an element to another subscription when a
limit runs out (getting around limits); Codex.

I assume that: the element's own folder is `data/services/<id>/claude/` — the node's data, outside git and outside the element's folder;
its existence is the switch; the node's own agent (`build`) never gets one.

## 2. Reused — paths that open

- The kit master `app/[lang]/(architectLayer)/architect/kits/_agent-kit/`: `core/server/bridge.cjs` (`startAgent` spawns with `env`; the
  login terminal `MODES.login`, one per node), `core/server/claude-cli.cjs` (`claudeAuthState`), `core/server/workspace.cjs` (folders,
  `isBornItem`), `core/server/telegram.cjs` (the bot's «not signed in» answer), `core/client/claude-subscription.client.tsx` (the page
  island), `core/words/`, `api/claude-auth/route.ts.tpl` (the state door).
- `npm run agent-kit:update -- <group>` copies the master into every installed group; `npm run check:agent-kits` guards the copies.
- Claude Code: a separate `CLAUDE_CONFIG_DIR` is a separate login — measured 2026-11-08: the node ad…@fractera.ai and `~/claude-test`
  bo…@gmail.com at the same time; an empty folder gets its own `.claude.json`.

## 3. Known limits

- The kit README law «One per computer: every service shows the same state» — this step changes it; the README says the new law.
- `ANTI-PATTERNS.md` «All systems» before the core build; a core build ends every session (skill `core-build-return`).
- A component up to 250 lines — the page island has 321 already: the new part is an island of its own.
- Provider rules: the login is for one person; several subscriptions of one person to get around limits — never.

## 4. Observable results

- root's page «Подписка Claude Code» shows its own login (bo…@gmail.com, masked); every other element and the main agent — ad…@fractera.ai.
- A session of root runs with `CLAUDE_CONFIG_DIR` of its folder and its log lands there; a session of Клип does not.
- How it works 7.4 says it works.

## 5–6. Substeps, order, address

689-1 → 689-2 → 689-3 → 689-4. Code in `~/fractera-dev/web4-node-starter-kit` (Fractera/web4-node-starter-kit, main); shipped in ONE node
update together with 687 and 688; the live proofs on the owner's node after that update.
