// npm run ask-person -- "<what to do, in the person's language>" [--href </ru/…|https://…>] [--why "<why only the person>"]
//   [--hint "<what may pop up on the way and what to press>"] [--copy "<a command the person pastes — the window gives it a copy button>"]
// npm run ask-person -- list | drop <id>
// Node step 761-16: a step needs the person's own hands — the request shows at the bottom of every page of the panel until «Готово»,
// and that press wakes you with the node line `person-done`. Never a chat line instead (the owner, 2026-11-16).
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const asks = createRequire(import.meta.url)(join(ROOT, 'lib', 'node', 'person-asks.cjs'))
const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v ?? null }

if (args[0] === 'list') {
  const open = asks.open(ROOT)
  console.log(open.length ? open.map((a) => `${a.id} · ${a.at.slice(11, 16)} UTC · ${a.text}${a.href ? ` → ${a.href}` : ''}`).join('\n') : 'no open requests')
} else if (args[0] === 'drop') {
  const a = asks.drop(ROOT, args[1] ?? '')
  console.log(a ? `===ASK_DROPPED=== ${a.id}` : '===ASK_NOT_FOUND===')
  if (!a) process.exitCode = 1
} else {
  const href = flag('--href')
  const why = flag('--why')
  const hint = flag('--hint')
  const copy = flag('--copy')
  try {
    const a = asks.add(ROOT, { text: args.join(' '), href, why, hint, copy })
    console.log(`===ASK_PUT=== ${a.id} — shown at the bottom of every panel page until «Готово»; the press wakes you (person-done). Say one line to the person that the window waits for them.`)
  } catch (e) {
    console.log(`===ASK_REFUSED=== ${e instanceof Error ? e.message : e}`)
    process.exitCode = 1
  }
}
