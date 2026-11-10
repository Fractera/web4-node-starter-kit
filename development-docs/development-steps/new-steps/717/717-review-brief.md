# 717 — a review brief for Fable 5.2 (written by Opus 5.5, 2026-11-10 ~23:40 WET)

You are taking over THIS conversation from Opus 5.5 on the owner's word: «если бы у тебя была возможность попросить модель на два
поколения технологичнее … подготовь файл … это будет твой старший брат, который вышел вчера, Fable 5.2». He wants your judgement
BEFORE the remaining substeps are built — a mistake in the foundation now costs one substep; after 717-8 it costs two templates and a
migration of every element.

## Who and where

- The person: Roman, the creator and owner of Fractera. He reads you in the core's terminal (no Telegram bot); speak Russian to him,
  plainly; commits and development documents in English. Name elements by what they are, never by id.
- You are the core's main agent of his node `/Users/romanbolshiyanov/web4-node-starter-kit`. The work happens in the author workshop
  `~/fractera-dev`: the core `~/fractera-dev/web4-node-starter-kit`, the custom template `~/fractera-dev/fractera-custom-item-starter`.
- Laws that bind you here: the core's `CLAUDE.md` (sealed). Subagents are forbidden (only in a session confirmed as ultracode). Never read
  `.env.local`, never read or edit anything under `WEB4-ITEMS/` (elements build themselves). No core rebuild for this review.
  Nothing is changed in the templates until the owner says yes to your findings.

## What step 717 is

The owner's words, verbatim — `717-main.md`, «The owner's words» (read them first). In short: an element architecture an agent
understands at once, with the fewest instructions, especially working with neighbour elements (his case: an element that publishes to
YouTube needs neighbours for pictures, video, texts and statistics); the word «section» instead of «block»; enough skills for an element;
the custom template first, tested on a fresh element, then the native one; existing elements later, by his word.

Done (summaries in `development-docs/development-steps/completed-steps/` of the core workshop — read 717-2, 717-3, 717-4):
- 717-2 / 717-3 — the word «section», a section is one folder `components/sections/section-<kind>/`, the migration script
  `npm run migrate:sections`, a prototype's own sections until the pin, `check:sections` both ways. Template `c8c1c72`, `d1d8150`, `069311a`.
- 717-4 — the skill list cut from 39,963 to 18,272 characters (design pass 42,111 → 20,420) by hand-written descriptions; six
  node-knowledge skills moved to `.claude/node-knowledge/`; the map of the folder in the instruction's section 2; short `CLAUDE.md` in
  `components/sections/`, `app/api/`, `app/[lang]/(publicLayer)/_pages/`, `DESIGN-CONFIG/`; `check:sections` refuses `cookies()`,
  `force-dynamic`, literal colours; `check-skill-process` holds the heads and the budget. Template `6eeb5d5`, `0eccbe1` (CI three-os green).
Next in the plan (`717-main.md`, «Substeps», and its «Dangerous places» — read them): 717-5 one design for a family (a copy, never a live
link), 717-6 skills `use-ai-generation` + vendored `ai-sdk` and `use-personal-data`, 717-7 a fresh custom element and a cold agent, release,
717-8 the native template, 717-9 the core.

## The facts you need

- What a build session of an element loads before its first word: the system-prompt file built by `promptArgs` of the core's
  `lib/agent-kit/modes.cjs` (the soul, the session note, memory, commands, the chat rule, `.claude/modes/build.md`), then `CLAUDE.md`
  (generated: edit only the core's `lib/instructions/element/element-instruction.src.md`, then `node lib/instructions/element/build.mjs
  element ~/fractera-dev/fractera-custom-item-starter`), then Claude Code's skill list of the enabled groups (`build-skills`,
  `own-service-props-skills`, vendored skills of the pass by `SOURCE.md` «Pass:»).
- Claude Code 2.1.322 (read from its binary): the skill list gets 1 % of the window at 4 characters a token — 40,000 at 1M, 8,000 at
  200k; one description at most 1,536; over the budget the lowest-priority descriptions collapse to bare names. Today the main pass is
  18,272 — fits 1M, still over 200k.
- Not proven yet: that a subfolder `CLAUDE.md` is loaded in the node's element sessions (`--settings`, `--append-system-prompt-file`,
  the boundary hook; `claudeMdExcludes` of an element's `settings.local.json` excludes only the core's file). 717-7 must prove it live.
- The measure (model-free) — run with `node <file> ~/fractera-dev/fractera-custom-item-starter [main|design|texts|study] [--rows]`:

```js
const fs = require('fs'), path = require('path'), os = require('os')
const modes = require('/Users/romanbolshiyanov/web4-node-starter-kit/lib/agent-kit/modes.cjs')
const yaml = require('/Users/romanbolshiyanov/web4-node-starter-kit/node_modules/js-yaml')
const dir = path.resolve(process.argv[2]); const pass = process.argv[3] || 'main'
const args = modes.promptArgs(dir, 'build', fs.mkdtempSync(path.join(os.tmpdir(), 'm717-')), 'build', pass)
const sys = args[0] === '--append-system-prompt-file' ? fs.statSync(args[1]).size : Buffer.byteLength(args[1])
const desc = (f) => { const m = /^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')); return String(yaml.load(m[1]).description || '').trim() }
const rows = []
for (const g of modes.visibleGroups('build')) { const b = path.join(dir, '.claude/skills', g, 'skills'); if (fs.existsSync(b)) for (const n of fs.readdirSync(b)) { const f = path.join(b, n, 'SKILL.md'); if (fs.existsSync(f)) rows.push([g, n, desc(f)]) } }
for (const [n, p] of Object.entries(modes.vendoredPasses(dir))) if (!p || p.includes(pass)) { const f = path.join(dir, '.claude/skills', n, 'SKILL.md'); if (fs.existsSync(f)) rows.push(['vendored', n, desc(f)]) }
if (process.argv.includes('--rows')) for (const [g, n, d] of rows.sort((a, b) => b[2].length - a[2].length)) console.log(d.length, g, n)
console.log({ pass, systemPromptFile: sys, claudeMd: fs.statSync(path.join(dir, 'CLAUDE.md')).size, skills: rows.length, skillListChars: rows.reduce((s, [, n, d]) => s + n.length + Math.min(d.length, 1536) + 4, 0) })
```

## The three questions — the owner wants your judgement, not code

1. **Be the cold agent.** Load only what a fresh build session of the custom template loads (the system-prompt file of `promptArgs`,
   `CLAUDE.md`, the skill descriptions — not the skill bodies until you would open them). Task: «I build an element that publishes to
   YouTube; it needs pictures, video, creative texts and statistics from neighbours, and its working pages in the same design as a sibling
   element». Write, step by step, which files and skills you would open, in what order, and every place you would get lost, guess, or be
   misled (a contradiction, a missing path, a rule in the wrong place, a word that still means two things). Then the same for «add a new
   section to the home page».
2. **Is the shape right?** 48 skills, 18,272 characters, against 8,000 at a 200k window. Is a list of skills the right shape at all, or
   should it be fewer, merged skills, or one index skill leading to the rest, or rules in folders instead of skills? What would you merge,
   cut or move, and how do the person's requests still find the right knowledge? Is `.claude/modes/build.md` (21 KB, held word for word by
   three guards) the right size? Say what to change in 717-5…717-8, if anything.
3. **Design the 717-7 test so luck cannot pass it:** the tasks for the cold agent, the negative control (an element of v0.3.185 with the
   same tasks), what to measure besides «done or not» (files read, tokens, wrong turns, the folder rules actually loaded), and its price
   for the owner's subscription said before it runs.

## How to answer

- Write your findings into `development-docs/development-steps/new-steps/717/717-review-answers.md` (English, with file:line where you
  point at text), commit it in the core workshop, then give the owner in Russian: the three answers in plain words, your pick, and one
  question for his yes. Mark every claim you did not check as unchecked.
- Record his decisions verbatim in `717-main.md` and the next action in the node's
  `/Users/romanbolshiyanov/web4-node-starter-kit/development-docs/development-steps/current-steps.md` («Letter to my next session»).
