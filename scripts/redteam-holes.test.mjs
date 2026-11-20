// THE RED TEAM'S HOLES STAY CLOSED (node step 818; the holes measured by 817 on the server 109.199.105.213, 2026-11-20).
// `node scripts/redteam-holes.test.mjs`, in the prebuild. Each check names its hole; the live proof is `scripts/dedicated-server/redteam.sh`
// on a server and a curl from the internet.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
let passed = 0
let failed = 0
function t(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n    ${String(e.message ?? e).split('\n').slice(0, 4).join('\n    ')}`) }
}
const code = (src) => src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n') // comments may name the header

console.log('818 the red team holes')
t('H1 the API gate opens nothing for a self-written x-agent-identity (817: «outsider@agent» from the internet)', () => {
  assert.doesNotMatch(code(read('proxy/common.ts')), /x-agent-identity/i)
})
t('H1 getSession believes the label only from the owner at this machine (negative: never unconditionally)', () => {
  const src = code(read('lib/auth/get-session.ts'))
  assert.match(src, /isOwnerAtMachine\(req\)\s*\?\s*req\.headers\.get\('x-agent-identity'\)/)
  assert.doesNotMatch(src, /const agentId = req\?\.headers\.get\('x-agent-identity'\)/)
})
t('H1 requireAdmin and requireRole let no label in', () => {
  for (const p of ['lib/auth/require-admin.ts', 'lib/auth/require-role.ts']) assert.doesNotMatch(code(read(p)), /x-agent-identity/i, p)
})

{
  const { transcriptRefusal, runRelayed } = createRequire(import.meta.url)(join(ROOT, 'lib/agent-kit/hook-relay-run.cjs'))
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'h2-')))
  const node = join(base, 'node'), el = join(node, 'WEB4-ITEMS', 'user', 'root'), shop = join(node, 'WEB4-ITEMS', 'user', 'root-shop')
  const proj = (d) => d.replace(/[^a-zA-Z0-9]/g, '-')
  const home = join(base, 'home', '.claude', 'projects')
  const put = (f) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, '{"type":"user"}\n') }
  for (const d of [el, shop]) mkdirSync(d, { recursive: true })
  const mine = join(home, proj(el), 'a.jsonl'), main = join(home, proj(node), 'main.jsonl'), neighbour = join(home, proj(shop), 's.jsonl')
  const ownHome = join(node, 'data', 'services', 'root', 'claude', 'projects', proj(el), 'b.jsonl')
  for (const f of [mine, main, neighbour, ownHome]) put(f)
  const planted = join(home, proj(el), 'planted.jsonl')
  symlinkSync(main, planted)
  const ask = (p) => transcriptRefusal(el, JSON.stringify({ transcript_path: p }))
  t('H2 record: the element\'s own session is read — in the node\'s Claude home and in its own', () => {
    assert.equal(ask(mine), null)
    assert.equal(ask(ownHome), null)
    assert.equal(transcriptRefusal(el, '{}'), null)
  })
  t('H2 negative: the main agent\'s transcript, a neighbour with a longer name, a link planted in its own folder, a non-transcript', () => {
    assert.match(ask(main), /not this element/)
    assert.match(ask(neighbour), /not this element/)
    assert.match(ask(planted), /not this element/)
    assert.ok(ask(join(node, 'nothing.jsonl')))
    put(join(home, proj(el), 'x.txt'))
    assert.match(ask(join(home, proj(el), 'x.txt')), /not a transcript/)
  })
  const r = await runRelayed({ root: ROOT, id: 'root', dir: el, name: 'record', stdin: JSON.stringify({ transcript_path: main }), timeoutMs: 5000 })
  t('H2 the relay refuses before any script runs', () => {
    assert.equal(r.ok, false)
    assert.match(r.error, /record refused/)
  })
  rmSync(base, { recursive: true, force: true })
}

t('F1 the gate lets in the two doors that name their caller by its own key; never a door of the node key (817 H6)', () => {
  const src = read('proxy/common.ts')
  const list = src.slice(src.indexOf('const PUBLIC_API_PREFIXES = ['), src.indexOf('];', src.indexOf('const PUBLIC_API_PREFIXES = [')))
  for (const d of ['/api/node/hook-relay', '/api/node/tools/take']) assert.ok(list.includes(`"${d}"`), d)
  for (const d of ['/api/agents/wake', '/api/agents/done', '/api/agents/session', '/api/node/notice', '/api/node/needs', '/api/node/launch']) assert.ok(!list.includes(`"${d}"`), `${d} must stay behind the gate`)
})
t('F1 both let-in doors check the element key and refuse the internet themselves', () => {
  for (const p of ['app/api/node/hook-relay/route.ts', 'app/api/node/tools/take/route.ts']) {
    const src = code(read(p))
    assert.match(src, /elementOf\(req\.headers\.get\("x-element-key"\)/, p)
    assert.match(src, /cf-connecting-ip[\s\S]*EDGE_HEADER[\s\S]*loopback only/, p)
  }
})
t('F1 the relay\'s client calls where the core listens (localhost), never a fixed 127.0.0.1', () => {
  const src = code(read('lib/agent-kit/hook-relay.cjs'))
  assert.doesNotMatch(src, /host: '127\.0\.0\.1'/)
  assert.match(src, /FRACTERA_CORE_HOST \|\| 'localhost'/)
})

if (failed) { console.log(`===REDTEAM_HOLES_FAILED=== ${failed} failed, ${passed} passed`); process.exit(1) }
console.log(`===REDTEAM_HOLES_OK=== ${passed} passed`)
