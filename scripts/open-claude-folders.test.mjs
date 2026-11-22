// 839-3: before a core build each walled element opens its Claude folders to the node's group AS ITSELF (the helper's `run`), so Turbopack's
// walk of data/services and the node's journal readers never meet a 0700 folder (✗ 2026-11-22 18:30, the server's build died on
// data/services/etuf1/claude/projects). Proven with a fake helper that records its calls; negatives: no wall, a native, no Claude folder,
// an element without its user — the helper is never asked; the sign-in files are never named.
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const wall = require('../lib/hosting/element-wall.cjs')
const root = mkdtempSync(join(tmpdir(), 'open-claude-'))
const log = join(root, 'calls.log')
const helper = join(root, 'helper.sh')
writeFileSync(helper, `#!/bin/sh\nprintf '%s\\n' "$*" >> '${log}'\n`)
const opts = { helper, nodeEnv: join(root, 'node.env'), anyPlatform: true, passwd: join(root, 'passwd'), prefix: ['/bin/sh'] }
writeFileSync(opts.nodeEnv, `NODE_DIR=${root}\n`)
writeFileSync(opts.passwd, 'fe-shop:x:1:1::/:/bin/false\nfe-bare:x:2:1::/:/bin/false\n')
mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [
  { id: 'shop', kind: 'user' }, { id: 'bare', kind: 'user' }, { id: 'nouser', kind: 'user' }, { id: 'auth', kind: 'core' },
] }))
for (const id of ['shop', 'nouser', 'auth']) mkdirSync(join(root, 'data', 'services', id, 'claude', 'projects'), { recursive: true })
mkdirSync(join(root, 'data', 'services', 'shop', 'claude', 'sessions'), { recursive: true })
const calls = () => (existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) : [])

let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }
try {
  t('negative: no wall on this machine — nothing is asked', () => {
    const r = wall.openClaudeFolders(root, { ...opts, helper: join(root, 'none') })
    assert.equal(r.skipped, 'no-wall'); assert.equal(calls().length, 0)
  })
  t('a walled element with a Claude folder opens it as itself: folders g+rwx, journals g+r', () => {
    const r = wall.openClaudeFolders(root, opts)
    assert.deepEqual(r.opened, ['shop']); assert.equal(r.ok, true)
    const c = calls()
    assert.equal(c.length, 2)
    assert.match(c[0], /^run shop -- \/usr\/bin\/find \S+\/data\/services\/shop\/claude -type d ! -perm -g=rwx -exec \/bin\/chmod g\+rwx \{\} \+$/)
    assert.match(c[1], /^run shop -- \/usr\/bin\/find \S+\/claude\/projects \S+\/claude\/sessions -type f ! -perm -g=r -exec \/bin\/chmod g\+r \{\} \+$/)
  })
  t('negatives: a native, an element without its user, one without a Claude folder — never asked', () => {
    const c = calls().join('\n')
    assert.doesNotMatch(c, /run auth|run nouser|run bare/)
  })
  t('the sign-in files are never named — only folders, and files under projects/ and sessions/', () => {
    assert.doesNotMatch(calls().join('\n'), /credentials|\.claude\.json/)
  })
} finally { rmSync(root, { recursive: true, force: true }) }
console.log(`===OPEN_CLAUDE_OK=== ${n} passed`)
