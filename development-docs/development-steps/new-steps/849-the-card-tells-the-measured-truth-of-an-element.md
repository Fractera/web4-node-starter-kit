# 849 — The card tells the measured truth of an element

## 1. Retelling and decisions

Roma, 2026-11-24 10:38 UTC (Telegram 1285), forwarded the report of the main agent of the server fractera.ai (core e638fed7, element
lidt5 «f2f-marketplace»): asked «какой доступ к репозиторию у элемента?», it answered from the conversation's memory — its own fault —
and found that even by the law («Know yourself… npm run card, never from memory») the answer would be wrong:
- `npm run card -- lidt5` says nothing of GitHub, while `GET /api/architect/items/lidt5/github` gives repo Fractera/f2f-marketpalce,
  tokenSource element, tail 4p2L, expires 2026-11-30, lastPushedAt 2026-11-23T11:48Z, lastCommit 9b5c671, commit fe9d4d7 not pushed;
- `npm run state -- lidt5` shows only the element's own stale decision «the GitHub part is cancelled — no repository, no push»: the token
  was saved on its page at 11:45 UTC and the node pushed, but the element's agent got not a line;
- the card is wrong twice: «Its data: keeps none of its own here» (it has data/services/lidt5/catalogue.json and
  marketplace/search-log.jsonl) and «reachable only inside this node, never from the internet» (POST
  https://f2f-marketplace.fractera.ai/api/marketplace/search → 200, a public prefix in its proxy.ts).
Its proposal: (a) card and state take the GitHub line from elementGithubState, measured; (b) a token saved or forgotten and a push on
the element's page leave one line to the element's agent; (c) «Its data» and «reachable» computed. Proof with a repository and without.

Checked in the core's code (2026-11-24):
- `lib/a2a/self-description.cjs` `cardText` — no GitHub; `dataOf(dir)` reads only `<element folder>/data`, never the element's space
  `data/services/<id>/`; «reachable only inside this node» is printed for passport `visibility: "node"`, which is the Web4 visibility
  (`lib/a2a/element-passport.ts`: `"node" | "network"` — seen by agents of this node only, or by the network), not internet reachability.
- `lib/web4-items/element-github.ts` `elementGithubState(id)` — stored repo, login, expiry, last push and commit, token source and tail,
  uncommitted files, HEAD — local, no network. The door `GET /api/architect/items/<id>/github` returns it.
- `lib/agent-kit/node-line.cjs` — the closed list of node line kinds; `came-from` is the precedent of the node telling an element's agent a
  fact of its own field.

My decisions:
- One source of truth: card and state ask the core's door on loopback, never a copy of the logic in the CLI.
- No GitHub network call in a card: the write right is the one checked at connection; `action: check` stays the page's button.
- The element learns at every session start (its prompt carries the measured line) — no queue; a live line only while its session runs.
- The element's own documents stay its agent's: the node gives the fact, the agent rewrites its decision.

## 2. Reused

`elementGithubState` and its door · `dataOf`, `scanDoors` · `modes.cjs` `surfacesText` (848: a measured card in element prompts) ·
`node-line.cjs` `head()` · the template's `proxy.ts` `PUBLIC_API_PREFIXES` (read in the workshop clone, `data/workshop/…`).

## 3. Limits

Never read an element's code with my tools (the core's code may scan it as `scanDoors` does) · the node's keys never printed — a token's
last four characters only, as the page shows · a door added to the core needs the core build (asked first, rides the next one) ·
the server wall (skill `server-wall`): the CLI runs as the core's user, the same as the door that already answers there.

## 4. Observable results

- `npm run card -- <id>` has a line «GitHub: …» equal to the door's answer; «not connected» for an element without one.
- `npm run state -- <id>` opens with the same measured line, above the element's own words.
- «Its data» names the element's own files in `data/services/<id>/`; «Where it lives» says the Web4 visibility as such and what
  answers from the internet.
- An element's session prompt carries its GitHub line; after the next core build, saving or forgetting a token or a push from its page
  sends its running session `⟦node · github · <id> · HH:MM⟧`.

## 5–7. Substeps (core, branch main)

**849-1 · GitHub in card and state, measured.** `self-description.cjs` gets the door's state (loopback, the node key, 3 s; the core
silent → «GitHub: the core did not answer»); `cardText` prints repo · whose token, …tail, until · last push and its commit · commits not
pushed (`rev-list lastCommit..HEAD`) · uncommitted files; `state` prints it first. Done: card and state of an element say what its
door says. Proof: plane 1 — card of an element with a repository vs `curl` of its door, field by field; negative — fc4vk «not
connected». Plane 2 — on the server after its update, lidt5's card names Fractera/f2f-marketpalce and fe9d4d7 not pushed. No build.

**849-2 · «Its data» measured.** The element's own entries in `data/services/<id>/` besides the node's bookkeeping (one list of the
node's names, in one module: links, name, project-settings, static-copy, address, session, channel, context, core-report, memory,
pulse, session-mode …) and `<folder>/data` as before. Done: lidt5's card names catalogue.json and marketplace/. Proof: plane 1 — fc4vk
«keeps none» (negative), a test file put into `data/services/fc4vk/` → named → removed; plane 2 — lidt5 on the server. No build.

**849-3 · «Where it lives» honest.** `visibility` said as «Web4: seen by agents of this node only / of the network»; internet: a custom
element's public address and the doors under its proxy's public prefixes (parsed from its `proxy.ts`), a native element «doors closed to
the internet». Done: lidt5 says /api/marketplace/search answers from the internet. Proof: plane 1 — fc4vk's card vs `curl` of its public
address (200) and of a closed door (refused); plane 2 — a native element (auth) «closed», and lidt5 on the server. No build.

**849-4 · The element's agent learns its repository.** (a) `modes.cjs` adds the measured GitHub line to an element's session prompt,
beside `surfacesText`; (b) a new kind `github` in `node-line.cjs` and `NODE-LINES.md`, sent by the doors that save or forget a token and
push (`app/api/architect/items/[id]/github/…`) to the element's session while it runs. Done: the agent knows at start, and in the moment.
Proof: plane 1 — a test element's prompt says «not connected», then «connected» after a token is saved (negative control); plane 2 —
after the core build, a token saved while its agent runs → the session gets the line. (b) needs the core build — rides the next one.

**Tasks this needs:** none on an interface — text lines of the CLI and the prompt. **Parts born here:** none.

**Not in it:** rewriting an element's development documents; the template; the `action: check` network call in the card.

## 8–9. Acceptance and the owner's word

Waits Roma's yes (asked in Telegram 2026-11-24).
