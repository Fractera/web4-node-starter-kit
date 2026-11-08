# The node's system messages to an agent — the closed list of kinds (step 698)

Every message the node writes to an agent starts with one head — `⟦node · <kind> · <element> · <HH:MM>⟧` — and then its text, as
before. The head is written only by `lib/agent-kit/node-line.cjs` (`head`, `parse`); a new kind is a line there and a row here, in one
commit. Messages to the PERSON have their own closed list (`lib/main-agent-cron/notice.i18n.ts`: ⏰ ⚙️ 🟢 📊 ⚠️).

| Kind | Who sends it | To whom | What the receiver does |
|---|---|---|---|
| `core-back` | the build's return (`lib/deploy/agent-return.cjs`) | the agent the build stopped | goes on from where it stopped; the main agent checks `serve:status`, hands cut work sessions again |
| `held-during-build` | the build's return | the main agent | reads each held line (`npm run state -- <id>`) and reports |
| `build-failed` | the failed build (`scripts/serve.mjs` → `deliverHeld`) | the main agent | the previous build runs; reads the held lines, tells the person the build failed |
| `supervision-done` | an element's «done» under the main agent's lead (`lib/web4-items/supervision.cjs`) | the main agent | `npm run state -- <id>`, answers or gives the next part, reports |
| `job-done` | an element worker's «done» (`lib/web4-items/jobs.cjs`; a batch names every element) | the main agent | reads the reports, answers the person once |
| `first-session-done` | a newborn element's first session closed (`lib/web4-items/first-session.cjs`) | the main agent | closes the birth substep, goes to the next |
| `limit-resume` | the pulse after a stop by the subscription limit (`lib/agent-kit/pulse.cjs`, delivered by the main agent's clock at the reset) | the main agent | `npm run where`, then wakes the element «continue from your record» |

Not in the list yet: the words an element sends the core itself — a question (`ask-core`), words for the architect (`tell-core`), a
need (`need`) — they are written by the elements' templates; their heads come with the next template release.
