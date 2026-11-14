// GUARD: STAGE 0 OF THE UPDATE IS FROZEN (node step 743-2, D43). `scripts/node-update-stage0.mjs` is the one piece of update code that
// old nodes run forever (every later fix lives in the target's own updater), so it changes only by the owner's word: its text is sealed
// in `scripts/node-update-stage0.seal`; `--seal` rewrites the seal and is run only after that word. Also held here: it stays ≤ 60 lines,
// the updater carries the contract mark `// @handoff v1`, and every start of an update goes through stage 0 (the button's runner and
// the npm script, and the launch page's update of a server — 743-5).
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STAGE0 = join(ROOT, 'scripts', 'node-update-stage0.mjs')
const SEAL = join(ROOT, 'scripts', 'node-update-stage0.seal')
const text = readFileSync(STAGE0, 'utf8').replace(/\r\n/g, '\n') // a Windows checkout reads the same text
const hash = createHash('sha256').update(text).digest('hex')

if (process.argv.includes('--seal')) {
  writeFileSync(SEAL, `${hash}\n`)
  console.log(`===STAGE0_SEALED=== ${hash.slice(0, 16)}`)
  process.exit(0)
}

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '')
const problems = []
const sealed = existsSync(SEAL) ? readFileSync(SEAL, 'utf8').trim() : ''
if (sealed !== hash) problems.push('scripts/node-update-stage0.mjs changed without its seal: stage 0 is frozen (D43) — changed only by the owner\'s word, then node scripts/check-stage0.mjs --seal')
const lines = text.trimEnd().split('\n').length
if (lines > 60) problems.push(`scripts/node-update-stage0.mjs has ${lines} lines — at most 60: anything more belongs in the target's updater`)
if (!/^\/\/ @handoff v1$/m.test(read('scripts/node-update.mjs'))) problems.push('scripts/node-update.mjs lost its mark «// @handoff v1» — stage 0 would run every node\'s own old updater again')
if (!read('scripts/node-update-run.mjs').includes("'node-update-stage0.mjs'")) problems.push('scripts/node-update-run.mjs (the update button) does not start stage 0')
if (!/"node:update":\s*"node scripts\/node-update-stage0\.mjs"/.test(read('package.json'))) problems.push('npm run node:update does not start stage 0')
if (!/node \$s0 --root \$NODE_DIR/.test(read('scripts/dedicated-server/launch.sh'))) problems.push('scripts/dedicated-server/launch.sh updates a server without stage 0 — the server would run its own old updater (743-5)')
if (!read('scripts/dedicated-server/launch.mjs').includes("'node-update-stage0.mjs'")) problems.push('scripts/dedicated-server/launch.mjs no longer uploads stage 0 to the server (743-5)')

if (problems.length) {
  console.error(`===STAGE0_REFUSED=== ${problems.length}\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`===STAGE0_OK=== sealed ${hash.slice(0, 16)}, ${lines} lines, every update start goes through it`)
