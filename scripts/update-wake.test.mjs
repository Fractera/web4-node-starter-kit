// 719: the node update that ended before the core build wakes the main agent itself. Run: node scripts/update-wake.test.mjs
// A fake core answers /api/health and /api/agents/wake on a spare port; the waker must call the wake door for the main agent with an
// «update-stopped» line (positive), and must say «not woken» with the core's reason when the core refuses (negative control).
import { createServer } from 'node:http'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const { afterUpdateStopped } = createRequire(import.meta.url)('../lib/deploy/agent-return.cjs')
let answer = { ok: true }
const seen = []
const srv = createServer((req, res) => {
  let b = ''
  req.on('data', (c) => { b += c })
  req.on('end', () => {
    if (req.url === '/api/health') { res.end('{"ok":true}'); return }
    if (req.url === '/api/agents/wake') { seen.push(JSON.parse(b)); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(answer)); return }
    res.statusCode = 404; res.end('{}')
  })
})
await new Promise((r) => srv.listen(0, '127.0.0.1', r))
const root = mkdtempSync(join(tmpdir(), 'update-wake-'))
mkdirSync(join(root, 'logs'), { recursive: true })
writeFileSync(join(root, 'logs', 'runtime.json'), JSON.stringify({ port: srv.address().port }))
process.env.FRACTERA_CORE_URL = `http://127.0.0.1:${srv.address().port}`
let bad = 0
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) bad++ }
const r1 = await afterUpdateStopped(root, 'failed', 'сторожа сборки (npm run prebuild) не прошёл', () => {})
const w = seen[0] ?? {}
ok(r1.woke === true, 'the core accepts: the main agent is woken')
ok(w.service === 'build' && w.reason === 'alarm' && w.from === 'node', 'the wake door is called for the main agent by the node')
ok(/^⟦node · update-stopped · build · \d\d:\d\d⟧ Node: the node update ended before the core build — failed: сторожа/.test(w.text ?? ''), 'the line names the kind, the state and the cause')
answer = { ok: false, reason: 'refused-by-test' }
const r2 = await afterUpdateStopped(root, 'refused', 'x', () => {})
ok(r2.woke === false && r2.reason === 'refused-by-test', 'negative control: a refusing core is reported, not hidden')
srv.close()
console.log(bad ? `===UPDATE_WAKE_FAILED=== ${bad}` : '===UPDATE_WAKE_OK=== the update that stops before the build wakes the main agent')
process.exit(bad ? 1 : 0)
