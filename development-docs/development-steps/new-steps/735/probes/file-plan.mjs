// For the native template's changes between <base> (the commit before 725-5) and v0.1.67: classify every changed path for each native
// source at its pin. A — the template added it; D — the template deleted it; M — modified. For M and D: is the native's file byte-equal
// to the template's file at <base> (safe to replace / delete), absent, or its own variant (needs a look)? Reads git objects only.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
const T = process.env.TEMPLATE ?? (process.env.CORE ?? process.cwd()) + '/data/workshop/fractera-native-item-starter' // the native template's clone
const base = process.argv[2], tip = process.argv[3] ?? 'v0.1.67'
const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 })
const blob = (dir, rev, p) => { try { return createHash('sha1').update(git(dir, ['show', `${rev}:${p}`])).digest('hex') } catch { return null } }
const changes = git(T, ['diff', '--name-status', '--no-renames', base, tip]).toString().trim().split('\n').map((l) => l.split('\t'))
const natives = ['auth', 'data', 'storage', 'embeddings', 'config', 'redis-cache', 'memory', 'stripe']
const out = { A: [], M: [], D: [] }
for (const [st, p] of changes) {
  const row = { p, per: {} }
  for (const n of natives) {
    const dir = `${process.env.SOURCES ?? process.env.HOME + '/fractera-dev'}/fractera-${n}-starter`
    const mine = blob(dir, 'HEAD', p)
    if (st === 'A') row.per[n] = mine === null ? 'absent' : (mine === blob(T, tip, p) ? 'same-as-new' : 'OWN')
    else { const old = blob(T, base, p); row.per[n] = mine === null ? 'absent' : (mine === old ? 'same-as-old' : (mine === blob(T, tip, p) ? 'same-as-new' : 'OWN')) }
  }
  out[st].push(row)
}
const summarize = (rows, label) => {
  console.log(`\n== ${label}: ${rows.length} path(s)`)
  const uniform = rows.filter((r) => new Set(Object.values(r.per)).size === 1)
  const byState = {}
  for (const r of uniform) (byState[Object.values(r.per)[0]] ??= []).push(r.p)
  for (const [s, ps] of Object.entries(byState)) console.log(`  all 8 natives ${s}: ${ps.length}` + (ps.length <= 14 ? `\n     ${ps.join('\n     ')}` : `  (e.g. ${ps.slice(0, 4).join(', ')} …)`))
  for (const r of rows.filter((r) => !uniform.includes(r))) console.log(`  MIXED ${r.p}: ${natives.map((n) => `${n}=${r.per[n]}`).join(' ')}`)
}
summarize(out.A, 'ADDED by the template'); summarize(out.M, 'MODIFIED by the template'); summarize(out.D, 'DELETED by the template')
