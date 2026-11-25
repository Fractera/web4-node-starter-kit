// THE CREATOR CHANNEL FROM THE TERMINAL (node step 855-3; lib/node/creator-channel.cjs). The architect's switch and the main agent's way to
// report a systemic error — one way, node → Fractera's developer; nothing here takes an instruction back.
//
//   npm run creator                          status: on or off, the node ID, the reports waiting
//   npm run creator -- on | off              the architect's switch
//   npm run creator -- report --component <c> --class <error class> --summary "<short>" [--timeline …] [--expected …] [--got …]
//                                            [--why …] [--fix …] [--element <id>]      the main agent's report (by: main-agent)
//   npm run creator -- show                  the text of every waiting report, as the creator's chat will read it
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const cc = createRequire(import.meta.url)('../lib/node/creator-channel.cjs')
const [cmd, ...rest] = process.argv.slice(2)
const arg = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined }

/** What the report says about this node: its site (own domain), its core commit, the pinned templates. */
export function nodeFacts(root = ROOT) {
  let commit = null
  try { commit = execFileSync('git', ['-C', root, 'rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { /* no git */ }
  const read = (f) => { try { return JSON.parse(readFileSync(join(root, f), 'utf8')) } catch { return null } }
  const zone = read('logs/domain.json')?.zone
  return {
    commit,
    site: typeof zone === 'string' && zone ? `https://${zone}` : null,
    templates: { custom: read('WEB4-ITEMS-REGISTRY/item-template.json')?.version ?? null, native: read('WEB4-ITEMS-REGISTRY/native-template.json')?.version ?? null },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!cmd || cmd === 'status') {
    const id = cc.identity(ROOT)
    console.log(`===CREATOR=== ${cc.isOn(ROOT) ? 'on' : 'off'} · node ${id.id} · waiting ${cc.waiting(ROOT).length} · nothing is sent until Fractera's door exists (855-4)`)
  } else if (cmd === 'on' || cmd === 'off') {
    cc.setOn(ROOT, cmd === 'on')
    console.log(`===CREATOR_${cmd.toUpperCase()}===`)
  } else if (cmd === 'report') {
    const r = cc.report(ROOT, { component: arg('component'), errorClass: arg('class'), summary: arg('summary'), timeline: arg('timeline'), expected: arg('expected'), got: arg('got'), why: arg('why'), fix: arg('fix'), element: arg('element'), by: 'main-agent' }, nodeFacts())
    console.log(r.queued ? `===CREATOR_QUEUED=== ${r.fingerprint}` : r.folded ? `===CREATOR_FOLDED=== ${r.folded} (×${r.count} today)` : r.off ? '===CREATOR_OFF=== the architect switched the channel off — nothing queued' : `===CREATOR_REFUSED=== ${r.refused}`)
    if (r.refused) process.exit(1)
  } else if (cmd === 'show') {
    for (const f of cc.waiting(ROOT)) console.log(`── ${f}\n${cc.text(JSON.parse(readFileSync(join(ROOT, 'data', 'node', 'creator-reports', f), 'utf8')).report)}\n`)
  } else {
    console.log('===CREATOR_USAGE=== status | on | off | report --component … --class … --summary … | show')
    process.exit(1)
  }
}
