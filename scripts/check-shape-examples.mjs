// npm run check:shape-examples — THE SHAPING PATH HOLDS NO CASE (step 673-2), part of `prebuild`.
//
// The owner, 2026-11-07: «Не надо пытаться решать частный случай путём того что ты навали ж больше правил в него это не решение.
// Решению это научить себя мыслить архитектуру Fractera так чтобы я удалил полностью все твои примеры которые у тебя естьи ты дал мне
// правильный вариант или хотя бы несколько вариантов один из которых правильный». Measured the same day (670-7, run 1): an agent that
// had the forces in its soul matched the nearest case in its skills and, with none to match, took the smallest step. So the main
// agent learns the shape of a need from the forces and the method (`shape-the-need`) — and the cases live only in the exam
// (`development-docs/exams/`), which teaches nothing as long as nothing points to it.
//
// Two checks:
//   1. the shaping path — the skills that decide a shape and the method at the end of every `skills_find` answer — has no case: no line
//      with a quoted request and an arrow (a request with its ready answer), no list item that opens with a quoted request, no «for
//      example» / «e.g.» / «for instance»;
//   2. no skill, no instruction, no soul and no tool text names the exam.
// `--root <folder>` checks a copy (a spoiled one, for the negative control).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const i = process.argv.indexOf('--root')
const ROOT = i > 0 ? resolve(process.argv[i + 1]) : resolve(import.meta.dirname, '..')

// The files that decide which shape a need takes: the method, and (673-3) the skills of a field, which give facts, not shapes.
const METHOD_SKILL = 'shape-the-need'
const FIELD_SKILLS = ['content-factory', 'own-agents', 'integrator', 'research']
const SKILLS = [METHOD_SKILL, ...FIELD_SKILLS]
// A skill of a field never names the shape itself — the method decides it on the node's facts (673-3).
const FIELD_RULES = [
  [/\b(?:an element of its own|one element (?:per|each|for)|each is a(?:n)? (?:custom )?element|is a custom element|no element)\b/i, 'a skill of a field names the shape — the method decides it'],
]
const TOOL = join('lib', 'agent-kit', 'skills', 'catalog-index.mjs')

const RULES = [
  [/«[^»\n]{2,}»[^\n]*→|→[^\n]*«[^»\n]{2,}»/, 'a quoted request with an arrow — a case with its ready answer'],
  [/^\s*(?:[-*]|\d+\.)\s+\**«/, 'a list item that opens with a quoted request — a case'],
  [/\b(?:for example|for instance|e\.g\.)/i, '«for example» — a case'],
]

const problems = []
function check(label, text, rules = RULES) {
  text.split('\n').forEach((line, n) => {
    for (const [rule, why] of rules) if (rule.test(line)) problems.push(`${label}:${n + 1}: ${why} — ${line.trim().slice(0, 90)}`)
  })
}

for (const name of SKILLS) {
  const file = join(ROOT, '.claude', 'skills', name, 'SKILL.md')
  if (!existsSync(file)) { problems.push(`.claude/skills/${name}/SKILL.md: missing`); continue }
  check(`.claude/skills/${name}/SKILL.md`, readFileSync(file, 'utf8'), FIELD_SKILLS.includes(name) ? [...RULES, ...FIELD_RULES] : RULES)
}
const toolFile = join(ROOT, TOOL)
if (!existsSync(toolFile)) problems.push(`${TOOL}: missing`)
else {
  const m = /^const METHOD = '((?:[^'\\]|\\.)*)'$/m.exec(readFileSync(toolFile, 'utf8'))
  if (!m) problems.push(`${TOOL}: no METHOD — the method no longer closes the answer of skills_find`)
  else check(`${TOOL} METHOD`, m[1])
}

// 2. Nothing in the agent's path names the exam.
function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const path = [
  ...walk(join(ROOT, '.claude', 'skills')).filter((f) => f.endsWith('.md')),
  join(ROOT, 'CLAUDE.md'),
  join(ROOT, 'lib', 'agent-kit', 'soul.md'),
  ...walk(join(ROOT, 'lib', 'agent-kit', 'skills')).filter((f) => /\.(mjs|cjs|js|md)$/.test(f)),
].filter((f) => existsSync(f))
for (const f of path) {
  if (/exams\/|shape-of-a-need/.test(readFileSync(f, 'utf8'))) problems.push(`${relative(ROOT, f)}: names the exam — an exam the agent can read teaches`)
}

for (const p of problems) console.log(`  ✗ ${p}`)
console.log(problems.length
  ? `===SHAPE_EXAMPLES_FAIL=== ${problems.length} problem(s): the cases belong to the exam, the shaping path keeps the forces and the method`
  : `===SHAPE_EXAMPLES_OK=== the shaping path holds no case (${SKILLS.length} skill(s) + the method of skills_find); nothing names the exam (${path.length} files)`)
process.exit(problems.length ? 1 : 0)
