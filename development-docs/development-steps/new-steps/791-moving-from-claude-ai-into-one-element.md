# 791 — moving from claude.ai into one element (the discussion of 2026-11-19, paused)

State: DISCUSSED, NOT APPROVED, no code. Paused at the owner's word («мы возвращаемся к проблеме … переезд на основной домен»).
The conversation: session 4b49a5ce-2683-4b9b-93a5-4085f0b8a858 (2026-11-19, 08:30–09:30 UTC).

## Decided by the owner

- The source is a claude.ai account («А, проект на claude.ai, начинай»), not a local folder.
- One element is one Claude account: the work of a claude.ai account is restored in ONE element the person chooses (first: root);
  never «the node has X», never projects spread over elements (memory `one-element-one-claude-account`).
- The element's «Рабочий процесс» copies claude.ai's interface logic as closely as possible (ideas and layout are allowed; not
  Anthropic's marks — the name Claude on buttons, logo, brand colours; the look is the element's own design).
- Sequence: first the element's architecture and design meet the expectation (the familiar shell, even empty), then the move fills
  it with his chats and artifacts in the same order; the element's Settings get the counterparts of claude.ai's settings.

## Facts measured (primary sources)

- Export (support.claude.com/en/articles/9450526): Settings › Privacy › «Export data», web or Desktop only (not the iOS/Android app),
  a download link by e-mail, expires in 24 h and may work once, the whole account (chats + user data), NO original uploaded files.
  The archive's inner layout is not documented — read it on his real archive (window e8da1817 waits for it in ~/Downloads).
- Connectors (code.claude.com/docs/en/mcp): signed in with a claude.ai subscription, Claude Code gets the account's connectors by
  itself; not with ANTHROPIC_API_KEY / setup-token. Per-folder off switch: `disabledMcpServers` in ~/.claude.json.
  Desktop servers: `claude mcp add-from-claude-desktop`.
- `claude mcp list` from any folder of this computer shows his claude.ai connectors now (Claude Docs, Google Drive, fractera — 502
  at 09:2x): every element agent on the shared subscription sees them today.
- An element's own subscription = its own Claude Code folder (689, `CLAUDE_CONFIG_DIR`, `agent-api/claude-auth`). Unproven: that
  the page's sign-in is a full subscription login (connectors load), not a token — the first check of the step.

## Proposed split, waits his «да»

Core: (1) CLAUDE.md §4 scenario «Переезд из Claude.ai» (one element, its own account, the archive by the page, the element's agent
rebuilds, the core never reads it); (2) §3 — a custom element's «Рабочий процесс» follows claude.ai's logic, «Проектирование
продукта» gets «Переезд из Claude.ai»; (3) core skill `move-from-claude-ai` + its line in §8; (4) the connector boundary — the
account's connectors on only in the chosen element, off in the other folders; (5) core code: the menu item, the hand-over command,
the «Рабочий процесс» tab framing the element's own workspace screen (as the Mini App, 790).
Element (its sealed instruction from `lib/instructions/element/element-instruction.src.md` + template skills): (1) the instruction
line for the element chosen for the move; (2) the move-pass skill — inventory without a model → his choice → the model reads only the
chosen, price said → chats, artifacts (rebuilt), project instructions, repeated requests → buttons and schedule, missing files listed;
the archive never in git; (3) the workspace skill — chat = an agent session, artifact = a file with versions edited on the right,
project = a folder with its instructions and knowledge, schedule = its Cron, plugins = its skills and connectors; (4) template code
built once in the template workshop, rolled out to root first (the core never copies an element into the template, §3).
Open question asked: claude.ai logic in EVERY custom element's «Рабочий процесс» (empty until a move) or only the chosen one — my
pick: every one. The owner's last words lean to «every» («вкладку рабочих процесс мы будем копировать максимально близко»).

Mapping of today's «Рабочий процесс» (proposed): Terminal → Chats (artifacts on the right) · Subscriptions + skills + connectors →
Plugins · Cron automations → Schedule · new: Projects, Artifacts · Mini App stays (the same process from the phone).

## The Web4 switch (proposed by the owner, waits the final «да»)

The owner: remove the Web4 mode switch; it comes back as its own menu item when Lagrix lives. Where it is: Build › «Настройки сайта»,
its last section (`_components/element-web4.client.tsx`, `/api/node/web4`, passport `visibility`). It also decides: the A2A card
answering outside this computer, Messenger › «Настройки» (`network: true`), Build › f2f (`network: true`). My proposal: one fixed
state for all — «Только Web2» (i2i on loopback unaffected), the passport field stays as data; CLAUDE.md §5 line on `npm run web4`
and the glossary «Web4 ready» reworded «comes with the Lagrix network» (owner's word, sealed).
