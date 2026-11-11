// 722-1: the menu's elements with their state, instantly. Run: node scripts/menu-state.test.mjs
// A scratch node of 1000 custom elements (half named by the core, half only by their passport; every 7th asleep by the load rule, every
// 11th turned off by the person, 20 drafts not born) — the reader must give each the right name and state, a portion of 12 under 20 ms (a name search reads every name — a button press).
// Negative control: an entry with `off.byRule` is never «running», a draft is never «running».
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const { menuElements, menuPage, stateOf } = createRequire(import.meta.url)('../lib/web4-items/menu-state.cjs')
const root = mkdtempSync(join(tmpdir(), 'menu-state-'))
const put = (p, o) => { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), JSON.stringify(o)) }
const N = 1000
const services = [{ id: 'root', kind: 'user', port: 24683 }]
const drafts = []
for (let i = 0; i < N; i++) {
  const id = `e${String(i).padStart(4, '0')}`
  const born = i >= 20
  drafts.push({ id, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString() })
  if (!born) continue
  const off = i % 7 === 0 ? { reason: 'load', at: 'x', byRule: true } : i % 11 === 0 ? { reason: 'person', at: 'x' } : undefined
  services.push({ id, kind: 'user', port: 24700 + i, ...(off ? { off } : {}) })
  if (i % 2 === 0) put(`data/services/${id}/name.json`, { name: `Элемент ${i}` })
  else put(`WEB4-ITEMS/user/${id}/OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`, { name: `Passport ${i}` })
}
put('WEB4-ITEMS-REGISTRY/web4-items.json', { services })
put('data/web4-drafts.json', { drafts })

let bad = 0
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) bad++ }
const t0 = performance.now()
let rows = menuElements(root)
const cold = performance.now() - t0
const runs = []
for (let k = 0; k < 5; k++) { const t = performance.now(); rows = menuElements(root); runs.push(performance.now() - t) }
const warm = Math.min(...runs)
const by = new Map(rows.map((r) => [r.id, r]))
ok(rows.length === N + 1 && rows[0].id === 'root', `${rows.length} rows, root first`)
ok(by.get('e0022').name === 'Элемент 22' && by.get('e0023').name === 'Passport 23', 'the name: the core\'s name first, else the passport\'s')
ok(by.get('e0021').state === 'asleep' && by.get('e0033').state === 'off' && by.get('e0024').state === 'running', 'the state: asleep by the rule, off by the person, running')
ok(by.get('e0005').state === 'draft', 'a draft not born is «draft»')
ok(stateOf({ off: { reason: 'x', byRule: true } }) !== 'running' && stateOf(undefined) !== 'running', 'negative control: asleep and draft are never «running»')
ok(rows.filter((r) => r.state === 'running').length === rows.length - rows.filter((r) => r.state !== 'running').length, 'every row has one state')
console.log(`  measured: all names — cold ${cold.toFixed(1)} ms, warm ${warm.toFixed(1)} ms for ${rows.length} elements`)
const page = (o) => { const t = performance.now(); const r = menuPage(root, o); return { r, ms: performance.now() - t } }
menuPage(root)
const p1 = page({})
ok(p1.r.rows.length === 12 && p1.r.total === N + 1 && p1.r.next === 12 && p1.r.rows[0].id === 'root', 'the first portion: 12 of 1001, next from 12')
const p2 = page({ from: 12 })
ok(p2.r.rows[0].id !== p1.r.rows[0].id && p2.r.next === 24, 'the next portion starts where the first ended')
const act = page({ active: true })
ok(act.r.rows.every((r) => r.state === 'running') && act.r.total < N, `only active: ${act.r.total} running of ${N + 1}`)
const q = page({ q: 'элемент 22' })
ok(q.r.rows.some((r) => r.id === 'e0022') && q.r.total >= 1, `name search «элемент 22»: ${q.r.total} found`)
ok(page({ q: 'нет такого' }).r.total === 0, 'negative control: a name nobody has finds nothing')
console.log(`  measured: a portion of 12 — ${p1.ms.toFixed(1)} ms, only active — ${act.ms.toFixed(1)} ms, a name search over all — ${q.ms.toFixed(1)} ms`)
ok(p1.ms < 20 && act.ms < 20, `a portion of 12 under 20 ms (${p1.ms.toFixed(1)} ms)`)
rmSync(root, { recursive: true, force: true })
console.log(bad ? `===MENU_STATE_FAILED=== ${bad}` : `===MENU_STATE_OK=== a portion of 12 of ${rows.length} elements with name and state in ${p1.ms.toFixed(1)} ms`)
process.exit(bad ? 1 : 0)
