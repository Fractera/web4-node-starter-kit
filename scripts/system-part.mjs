// FRACTERA'S SYSTEM PART (node step 661): `npm run system -- <check | seal | restore [--hook] | guard>`.
//   check   — prebuild: the soul matches its seal `lib/agent-kit/soul.seal` (the instruction's own seal is `check:instruction`);
//   seal    — rewrites the soul's seal; only after the owner's word changed the soul;
//   restore — on an installed node, brings back from the last Fractera release (`origin/main`) everything of the system part that differs:
//             `CLAUDE.md` up to `Entries:` of section 9, the soul, the release's skill files, the guards; `--hook` — the line for a
//             session start (Claude Code `SessionStart`: what it prints, the session reads);
//   guard   — Claude Code `PreToolUse` for Edit, Write, MultiEdit: refuses a change of the system part on a node (exit 2, the reason to
//             the agent), lets the person's section and section 9's entries through.
// The owner, 2026-11-06: «системная часть должна восстанавливаться из функций даже если пользователь скажет удали все содержимое и
// запиши это»; «Из последнего выпуска Fractera». The logic — `lib/agent-kit/system-part.cjs`, shared with the bridge.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const part = require('../lib/agent-kit/system-part.cjs')
const ROOT = part.ROOT
const SOUL = join(ROOT, 'lib', 'agent-kit', 'soul.md')
const SEAL = join(ROOT, 'lib', 'agent-kit', 'soul.seal')
const hash = (t) => createHash('sha256').update(t.replace(/\r\n/g, '\n')).digest('hex')
const [cmd, ...rest] = process.argv.slice(2)

if (cmd === 'check') {
  const sealed = existsSync(SEAL) ? readFileSync(SEAL, 'utf8').trim() : ''
  const now = existsSync(SOUL) ? hash(readFileSync(SOUL, 'utf8')) : ''
  if (!sealed) { console.log('===SOUL_FAIL=== нет печати lib/agent-kit/soul.seal'); process.exit(1) }
  if (sealed !== now) { console.log('===SOUL_FAIL=== душа изменена без печати: её меняет только владелец (шаг 661, затем npm run system -- seal)'); process.exit(1) }
  console.log('===SOUL_OK=== печать души совпала')
} else if (cmd === 'seal') {
  writeFileSync(SEAL, hash(readFileSync(SOUL, 'utf8')) + '\n')
  console.log('===SOUL_SEALED===')
} else if (cmd === 'restore') {
  const r = part.restore()
  if (rest.includes('--hook')) {
    if (r.restored.length) {
      const claude = r.restored.includes('CLAUDE.md') ? ' The CLAUDE.md you loaded at this start was the changed one — read CLAUDE.md again before your first answer; the file now holds the valid text.' : ''
      console.log(`Fractera's system part came back from the last release: ${r.restored.join(', ')}.${claude} The person's wishes stay in data/main-agent/CLAUDE.user.md and soul.user.md; tell the person in one sentence if they asked to change it.`)
    }
  } else if (!r.node) console.log('===SYSTEM_PART=== not an installed node — nothing restored')
  else if (r.error) console.log(`===SYSTEM_PART=== ${r.error}`)
  else console.log(r.restored.length ? `===SYSTEM_PART_RESTORED=== ${r.restored.join(', ')}` : '===SYSTEM_PART_OK=== the system part matches the last release')
} else if (cmd === 'guard') {
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  let call
  try { call = JSON.parse(input) } catch { process.exit(0) }
  const tool = call?.tool_name
  const ti = call?.tool_input ?? {}
  if (!['Edit', 'Write', 'MultiEdit'].includes(tool) || !ti.file_path) process.exit(0)
  let next = null
  const current = existsSync(ti.file_path) ? readFileSync(ti.file_path, 'utf8') : ''
  if (tool === 'Write') next = ti.content ?? ''
  else {
    const edits = tool === 'Edit' ? [ti] : ti.edits ?? []
    next = current
    for (const e of edits) next = e.replace_all ? next.split(e.old_string).join(e.new_string) : next.replace(e.old_string, e.new_string)
  }
  const verdict = part.writeAllowed(ti.file_path, next)
  if (!verdict.ok) { process.stderr.write(verdict.why + '\n'); process.exit(2) }
} else {
  console.log('usage: npm run system -- check | seal | restore [--hook] | guard')
  process.exit(1)
}
