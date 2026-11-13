# The node's system messages to an agent — the closed list of kinds (step 698)

Every message the node writes to an agent starts with one head — `⟦node · <kind> · <element> · <HH:MM>⟧` — and then its text, as
before. The head is written only by `lib/agent-kit/node-line.cjs` (`head`, `parse`); a new kind is a line there and a row here, in one
commit. Messages to the PERSON have their own closed list (`lib/main-agent-cron/notice.i18n.ts`: ⏰ ⚙️ 🟢 📊 ⚠️).

| Kind | Who sends it | To whom | What the receiver does |
|---|---|---|---|
| `core-back` | the build's return (`lib/deploy/agent-return.cjs`) | the agent the build stopped | goes on from where it stopped; the main agent checks `serve:status`, hands cut work sessions again |
| `held-during-build` | the build's return | the main agent | reads each held line (`npm run state -- <id>`) and reports |
| `update-stopped` | the node update that ended before the core build (`scripts/node-update.mjs` → `scripts/agent-return.mjs --update-stopped`) | the main agent | the node runs as it was; reads `logs/node-update.log`, fixes the cause and starts the update again detached, tells the person — never waits to be asked |
| `build-failed` | the failed build (`scripts/serve.mjs` → `deliverHeld`) | the main agent | the previous build runs; reads the held lines, tells the person the build failed |
| `supervision-done` | an element's «done» under the main agent's lead (`lib/web4-items/supervision.cjs`) | the main agent | `npm run state -- <id>`, answers or gives the next part, reports |
| `job-done` | an element worker's «done» (`lib/web4-items/jobs.cjs`; a batch names every element) | the main agent | reads the reports, answers the person once |
| `first-session-done` | a newborn element's first session closed (`lib/web4-items/first-session.cjs`) | the main agent | closes the birth substep, goes to the next |
| `limit-resume` | the pulse after a stop by the subscription limit (`lib/agent-kit/pulse.cjs`, delivered by the main agent's clock at the reset) | the main agent | `npm run where`, then wakes the element «continue from your record» |
| `context-window` | the window hook on every turn from 55 % (`lib/agent-kit/window.cjs`, the status line writes `data/services/<id>/context.json`) | the agent itself | decides: a small last task first, or the letter to its next session and the reset now (from 85 % — now) |
| `session-lost` | the core's start (`instrumentation.ts` → `lib/agent-kit/resume.cjs` `markLost` → `scripts/agent-return.mjs --lost`, step 708) | the main agent whose session died with the core | the same conversation, continued: `npm run serve:status`, re-reads its state record, goes on and tells the person in one line that it is back after a cut |
| `context-reset` | the bridge after `session clear --continue` (the main agent) or `npm run reset` (an element) | the agent's fresh session | reads its letter in the state record and goes on; asks nobody |
| `ask-core` | an element (`npm run ask-core`, its template) | the main agent | answers from the instruction, skill `answer-element` |
| `tell-core` | an element (`npm run tell-core`) | the main agent | passes the words to the architect, naming the element |
| `need` | an element (`npm run need`) | the main agent | finds who does it or asks the architect, skill `handle-need` |
| `permission` | the core's boundary guard of an element (`scripts/element-boundary-hook.mjs` → `/api/agents/permission`, `lib/agent-kit/permission.cjs`, step 704) | the main agent | judges the command itself, then `npm run permit -- <token> allow\|deny "<why>"`; no answer by the deadline — the element gets a deny by itself (skill `element-permission`) |
| `not-started` | the bridge (step 736): a task of the main agent not delivered in 10 minutes (a question on the element's screen, its session gone), or delivered and not in its conversation `AGENT_START_CHECK_MS` (3 min) later | the main agent | reads the named reason and acts at once: `npm run permit` / `npm run trust -- <id>` / the same task again with `npm run task` — never reports the element as working before this line's silence |
| `trust` | the bridge (step 736): an element agent stands on Claude Code's folder trust question and no Telegram bot carried it | the main agent | confirms it itself — `npm run trust -- <id>` (CLAUDE.md §4, the owner 2026-11-12) |

The elements' words carry the head right after the process word («Build process: ⟦node · need · s8y6x · 18:17⟧ …»): the bridge picks the
session by that word first (step 699).
