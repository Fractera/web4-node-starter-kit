---
name: core-build-return
description: "Work process. What happens to you and to the element agents when the core is built — a node update, the «Deploy core» button, npm run serve:rebuild: the build stops every agent, and after a good build the ones that were running come back by themselves, in the same conversations. Load it before you start a core build or a node update, when you wake with the line «Node: the core build has finished», and when the person asks why an agent went off during a build or whether it comes back."
---

# The core build, and the agents that come back (node step 675)

**Process: work.** Nothing here is built by you: it is how the node behaves; you plan around it and say it to the person.

## What happens

Every agent's `claude` is a child of the core, so a core build with the closed lid stops all of them — you too. Before it stops the
core, the build writes who was running (`data/node/agent-return.json`); after a GOOD build it brings each of them back in the same
conversation (`claude --continue`) with a line from the node: the element agents first, then you, with the list of who came back, who did
not (memory) and which work sessions were stopped. A failed build brings back nobody — the previous build is up again and the person sees
the cause on the terminal page. An agent that was asleep stays asleep.

The terminal page of every agent shows the build instead of «Start the agent» while it runs, and at the end «Close and start the agent»
and «Close» (only «Close» after a failure).

## What you do

- **Before a node update:** the node's fork must carry Fractera's last commit — syncing it is your work (CLAUDE.md §4, the owner
  2026-11-08: «if exist claude for crome , or git token , you must to do sync alwayes»): the Chrome extension or a write token; check
  with `gh api repos/Fractera/web4-node-starter-kit/compare/main...<owner>:web4-node-starter-kit:main` (identical). Never ask
  «will you click it or shall I?» — you do it (the owner 2026-11-08: «why you ASK ME ? IT NOT GOOD … NOT ASK IF IT IS POSSIBLE»). The
  only block is a missing sign-in of the fork's owner in their Chrome with no write token: open github.com/login in that Chrome, say in
  one line that the update waits for their sign-in, and on their next word check and sync yourself — no question, no choice.
- **Before a build:** write your state — `current-steps.md` and the work record — as if you would not come back; tell the person in one
  line: «I go off with the build and come back by myself in a few minutes». Start the update or the build detached, never as your own
  child (`node scripts/spawn-free.mjs scripts/node-update-run.mjs`).
- **When you come back** with the node's line: `npm run serve:status`, then go on from where you stopped and tell the person the result.
  The line is a continuation of their conversation, not a task from the node — do not close yourself.
- **Who did not come back** (the line names them, memory was short): wake them when the person needs them — `npm run wake -- <id>`.
- **A work session** (`<id>--work`) is not continued: one folder has one «last conversation». Its job, if unfinished, goes again —
  `npm run task -- <id> --work`.
- **You did not come back** (a failure, the computer was off): the person wakes you on the terminal page or in Telegram.

## The price

Each returned agent is a live session (about 300 MB) and one turn of its conversation; the node checks free memory before each and
refuses the rest — say who and why. Where it lives: `lib/deploy/agent-return.cjs`, `scripts/agent-return.mjs`, the log
`logs/agent-return.log`.
