# 673 — Thinking Fractera without examples: forces, the closed set of shapes, the method of variants; examples become the exam

**State: APPROVED 2026-11-07 («да, утверждаю, начинай»).** Substep files `673-1.md` … `673-5.md`.

## 1. Retelling and decisions

### The owner, 2026-11-07, verbatim (after 670-7's run 1 and 670-9)
«Я хочу получить ответ на вопрос что заставят тебя думать архитектуру Fractera так как думаю ей я почему я болван который не может три
строчки кода написать могу держать в памяти всю цель и возможности а ты не можешь что сделать чтобы ты мог»
«Потому что речь не идёт просто о сцена с контент заводом вообще не об этом понимаешь вообще не об этом речь вообще. Не надо пытаться
решать частный случай путём того что ты навали ж больше правил в него это не решение. Решению это научить себя мыслить архитектуру
Fractera так чтобы я удалил полностью все твои примеры которые у тебя естьи ты дал мне правильный вариант или хотя бы несколько
вариантов один из которых правильный. То есть будь готов что я от тестировать буду решение таким образом что я удалю все примеры какие
у нас есть»
On the direction (forces, the closed set of shapes, the method; examples into an exam): «Вот это мне уже начинает нравиться».
On the model, the same evening, verbatim: «На соннет не будем работать по дефолту устанавливай opus effort high» → step 674; the exam runs
on that default.

### Read as
- The forces of the architecture are already written — the soul's «A thousand hands» names the shapes and the questions — and run 1's
  agent had them and did not apply them. Beside them lie dozens of cases with ready answers; a model matches the nearest case, and
  where none fits it falls to its own default — the smallest safe step. Cases teach recognition, not thinking.
- The answer: **principles teach, examples examine.** The agent holds three things — the forces (why the architecture is so), the
  closed set of shapes (an answer · a route in an existing hand · a new hand · a boundary of control · the network, and their
  combinations), and the method of variants. Every case leaves the teaching path and becomes the exam: the request, the variants, the
  right one, why.
- Why it meets the owner's test: the set of shapes is closed. Any request, known or new, has the same shapes; when the agent tests each
  against the forces on the node's facts and keeps those that survive, the right one is among the variants by construction.
- I assume that «all examples» means the shaping path: every concrete request with its ready shape or answer in the skills the main
  agent loads for a goal, a wish or a need, the end of `skills_find`'s answer, and the sealed lines that carry such a case. A reason of
  a rule (the owner's «why», quoted) is not an example and stays. How-to skills (deploy, sections, design) are not the shaping path.
- 670-9 was a patch on one case (content-factory «First — which hand» even added one); its case lines go, its general lines become
  the method. 670-7's run 2 is this step's exam — one live run serves both.

## 2. What is reused (paths that open)
- The forces: `lib/agent-kit/soul.md` «A thousand hands» (the shapes, the questions, «the lightest that holds it»); CLAUDE.md §2–§4.
- The method's home: `.claude/skills/shape-the-need/SKILL.md` (§1 the shapes, §2 the questions, §2a the order of 670, §4 the fork);
  the end of `skills_find`'s answer — `lib/agent-kit/skills/catalog-index.mjs` `catalogFileText` (read by the main agent and the build
  sessions of elements, `lib/agent-kit/skills/mcp.mjs`).
- The node's facts: `npm run find` (reasons: skill / area / only description), `npm run card` (area, may grow into), `npm run lagrix`
  (simulated), `skills_find`.
- The cases to move: `shape-the-need` (the creator's examples, the chains, §2a's two walked questions, §3), `content-factory`,
  `own-agents`, `integrator` (their shape prescriptions), CLAUDE.md §4 «A request comes» (its cases in brackets), the soul's line «Every
  example of the creator, with its chain of reasoning — skill `shape-the-need`».
- Guards to copy the form of: `scripts/check-skill-headers.mjs` (`--dir` for a spoiled copy), `scripts/check-instruction-skills.mjs`.
- 670-9's proof script and the MCP method (`SKILLS_MCP_ROOT` over the owner's node data).

## 3. Known limits
- CLAUDE.md §1–8 and the soul change only by the owner's word: shown verbatim, then sealed (`check:instruction -- --seal`, `npm run
  system -- seal`); otherwise `check:instruction` / `system -- check` fail the prebuild.
- On a node the system part comes back from the release at every session start and `system -- guard` refuses its edits: the cases are
  removed HERE, in the original, and reach the node with the release — deleting them on the node would undo itself.
- The exam must stay outside the agent's path: no skill and no instruction names it (else the exam teaches).
- No resident process, no timer, no polling; the element boundary holds — the method names no neighbour to an element's session.
- The command words of `lib/agent-kit/commands.json` are recognition, not shaping — out of scope (the owner's rule on direct matching
  stays).

## 4. Observable results
1. `shape-the-need` holds the forces and the method, with zero case lines; the end of `skills_find`'s answer carries the method (673-1).
2. `development-docs/exams/shape-of-a-need.md` holds every moved case with its variants and the right one; `check:shape-examples` in
   the prebuild passes on the release and fails on a spoiled copy with one case put back (673-2).
3. `content-factory`, `own-agents`, `integrator` give facts the forces act on, no shape prescriptions; 670-9's case lines are gone (673-3).
4. The sealed lines without cases, resealed after the owner's word (673-4).
5. The owner's exam on the node's default (Opus, effort high — step 674), blind: in every case the right shape is among the variants, and the method is visible (673-5).

## 5–6. Substeps, order, address
Address: this clone, `Fractera/web4-node-starter-kit` main; push + CI per substep; the exam on the owner's node after his fork sync →
`npm run node:update`.

| # | Result | Rests on |
|---|---|---|
| 673-1 ✅ | the forces and the method in `shape-the-need`, and in short at the end of every `skills_find` answer; the exam set seeded | 670 |
| 673-2 | every case into the exam set; `check:shape-examples` keeps the shaping path case-free | 673-1 |
| 673-3 | the domain skills give facts, not shapes; 670-9's case lines out | 673-1, 673-2 |
| 673-4 | the sealed lines without cases — shown verbatim, sealed after the owner's word | 673-2 |
| 673-5 | the exam: the owner's cold questions on the node's default (Opus, effort high), from the set and his own | 673-1..4, 674, the release on his node |

Not in 673: the element templates (671); how-to skills; the commands list; a per-message model switch.

## 7. Price
The edits — this session. The exam — short live sessions on the owner's subscription, one fresh session per question (reference: 545,
one run of 39 turns = 176 463 new tokens and 5 823 749 from cache; a short question costs far less).

## 8. Acceptance of the plan
Every substep has its file: what is built, what counts as done, two proof planes with a negative control, what it rests on, what is not
in it; one result per substep; the address is named; the live runs are priced.

## 9. The owner's approval
2026-11-07, verbatim: «да, утверждаю, начинай» — to the window with the five substeps, my decisions (all examples = the shaping path,
the owner's «why» stays, how-to skills out; the exam named by nothing; §1's description of what a node is built for stays unless he
says otherwise; 670-9 not synced), what is not included, the price, and the question «Утверждаешь 673 вместе с коммитами и пушем в
Fractera на весь шаг?» — so commits and pushes to Fractera are allowed for the whole of 673.
