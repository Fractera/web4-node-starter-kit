// TESTS OF THE ONE RULE OF EVERY LADDER (node step 744-7, D46, D47). `npm run test:ladder-rule`, in the prebuild.
// The owner, 2026-11-14: «каждый следующий шаг заблокирован до предыдущего … только один шаг должен быть открыты все остальные должны быть
// скрыты»; and on step 3: «ты конечно имел право показать мне что домен к серверу уже подключён и какой именно режим выбрали и только тогда
// открыть четвёртый шаг».
// Three planes, each with its negative control:
//   the rule (`lib/hosting/ladder-rule.mjs`) — a rung after an undone one stays locked, the ladder stands on the first undone rung;
//   the pages — no file of `components/hosting/` decides which rung is open (planted copies of the 738 table and the 737-19 idiom are
//   refused), and the older single rung has no user left there (D47: only the computer's domain ladder keeps it until 745);
//   the launch's facts (D46) — the installation stays locked until step 3 has a domain, a way and its first check, the second check until
//   the server's node answers; each case is turned by the one fact that opens it;
//   the part's DOM — rendered on the server: one rung open (the current), a done rung one line, a locked rung disabled with its line and
//   no body, a closed rung's body not mounted.
// The launch's rungs and the part are bundled by esbuild into the system's temp folder (never inside the project).
import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { currentOf, openOf } from '../lib/hosting/ladder-rule.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(ROOT, 'package.json'))
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const rungs = (...done) => done.map((d, i) => ({ id: `r${i + 1}`, done: d }))

console.log('744-7 one rule for every ladder, one rung open')

await t('nothing done: only the first rung is open, and the ladder stands on it', () => {
  assert.deepEqual(openOf(rungs(false, false, false)), [true, false, false])
  assert.equal(currentOf(rungs(false, false, false)), 'r1')
})
await t('a rung after an undone one is locked even when it is done itself; negative: the rung before it done → it opens', () => {
  assert.deepEqual(openOf(rungs(true, false, true, false)), [true, true, false, false])
  assert.equal(currentOf(rungs(true, false, true, false)), 'r2')
  assert.deepEqual(openOf(rungs(true, true, true, false)), [true, true, true, true])
  assert.equal(currentOf(rungs(true, true, true, false)), 'r4')
})
await t('every rung done: every rung open, the ladder stands on the last; no rungs: nothing', () => {
  assert.deepEqual(openOf(rungs(true, true, true)), [true, true, true])
  assert.equal(currentOf(rungs(true, true, true)), 'r3')
  assert.deepEqual(openOf([]), [])
  assert.equal(currentOf([]), null)
})

// A page that decides which rung is open: the 738 table, the 737-19 idiom, an `open` of its own (the part's `openOf(…)` is the rule itself).
const OWN = [
  [/\bopens\s*[:=]/, 'a table of which step opens'],
  [/\.slice\(\s*0\s*,\s*\w+\s*\)\s*\.every\(/, '«every rung before it is done» computed by the page'],
  [/\b(?:const|let|var)\s+open\s*=(?!=)(?!\s*openOf\()/, 'an «open» of its own'],
]
const owners = (files) => files.flatMap(([rel, text]) => OWN.filter(([re]) => re.test(text)).map(([, what]) => `${rel}: ${what}`))
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs)$/.test(n) ? [p] : []
})
const read = (dir) => walk(join(ROOT, dir)).map((p) => [relative(ROOT, p), readFileSync(p, 'utf8')])

await t('no file of components/hosting decides which rung is open; negative: the 738 table and the 737-19 idiom planted there are refused', () => {
  const hosting = read('components/hosting').filter(([rel]) => !rel.endsWith('.i18n.ts'))
  assert.deepEqual(owners(hosting), [])
  const planted = [
    ['components/hosting/planted-738.client.tsx', 'const opens: Record<LaunchStep, boolean> = { server: true, check: true, domain: done.check, install: done.check }'],
    ['components/hosting/planted-737-19.client.tsx', 'const open = order.slice(0, i).every((p) => (p === "records" ? done.who : done[p]))'],
  ]
  const found = owners([...hosting, ...planted])
  assert.ok(found.some((f) => f.startsWith('components/hosting/planted-738.client.tsx: a table')), found.join('; '))
  assert.ok(found.some((f) => f.startsWith('components/hosting/planted-737-19.client.tsx: «every rung')), found.join('; '))
  assert.ok(found.some((f) => f.startsWith('components/hosting/planted-737-19.client.tsx: an «open»')), found.join('; '))
})
// A table under another name (the 737-8 end steps had `prev[id] ? <LadderStep … : <LadderLocked …`) is caught here: the older pieces are
// the only way a page could draw a rung open or closed by itself, and they are left to the computer's domain ladder alone.
const oldUsers = (files) => files.filter(([rel, text]) => rel !== 'components/hosting/ladder-step.tsx' && /\bLadder(?:Step|Locked)\b/.test(text)).map(([rel]) => rel)
await t('the older single rung and grey line: no user in components/ but the computer\'s domain ladder (D47, until 745); negative: the 737-8 table planted', () => {
  const files = read('components')
  assert.deepEqual(oldUsers(files), ['components/domain/domain-ladder.client.tsx'])
  const planted = ['components/hosting/planted-737-8.client.tsx', 'order.map((id, i) => (prev[id] ? <LadderStep done={end.steps[id]} n={first + i} /> : <LadderLocked n={first + i} />))']
  assert.deepEqual(oldUsers([...files, planted]), ['components/domain/domain-ladder.client.tsx', 'components/hosting/planted-737-8.client.tsx'])
})

let esbuild
try { esbuild = req('esbuild') } catch { esbuild = null }
if (!esbuild) {
  console.warn('  ! the launch\'s facts (D46) skipped: esbuild is not installed (devDependencies) — `npm install`')
} else {
  /** A module of the core, bundled into the temp folder and loaded there; every package it needs is the project's own (absolute paths). */
  const load = async (build) => {
    const built = await esbuild.build({ bundle: true, platform: 'node', format: 'cjs', target: 'node20', packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent', jsx: 'automatic', ...build })
    const dir = mkdtempSync(join(tmpdir(), 'ladder-rule-'))
    const file = join(dir, 'module.cjs')
    writeFileSync(file, built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`)))
    try { return req(file) } finally { rmSync(dir, { recursive: true, force: true }) }
  }
  const R = await load({ entryPoints: [join(ROOT, 'components/hosting/server-launch-rungs.ts')] })

  const AT = '2026-11-14T12:00:00Z'
  const detect = { name: 'example.com', zone: 'example.com', sub: '', ns: ['ns1.registrar.example'], nsTtl: 3600, dnsHost: 'other', changing: false, a: [], aKind: 'none', mx: [], txt: [], ds: false, registrar: null, expires: null, site: null, at: AT }
  const checked = { at: AT, results: [{ host: 'example.com', state: 'missing' }] }
  const core = (dns = false) => ({ zone: 'example.com', rows: [], steps: { domain: true, dns, certs: false, check: false, active: false }, certsRun: null, helper: true, checkAt: null, dnsAt: null })
  const server = (over = {}) => ({
    host: '203.0.113.7', probe: { publicIp: '203.0.113.7', fractera: null }, relation: { kind: 'clean', nodeUnrelated: false, reasons: [] },
    verdict: { level: 'ok', items: [] }, launch: null, progress: [], sub: [], update: null, domain: null, mark: null, core: null, records: [], week: null, ...over,
  })
  /** which of the seven steps are open on this state — the launch's own facts through the one rule */
  const open = (s, strategy = 'install') => {
    const done = R.launchDone(s, strategy, false)
    const o = openOf(R.LAUNCH_ORDER.map((id) => ({ id, done: done[id] })))
    return Object.fromEntries(R.LAUNCH_ORDER.map((id, i) => [id, o[i]]))
  }

  await t('the order: the domain stands before the installation, the installation before the second check (D46)', () => {
    assert.deepEqual(R.LAUNCH_ORDER, ['server', 'check', 'domain', 'install', 'recheck', 'certs', 'ready'])
  })
  await t('a checked clean server without a domain: step 3 open, the installation locked (✗ 738 opened it here)', () => {
    const o = open(server())
    assert.deepEqual([o.check, o.domain, o.install], [true, true, false])
  })
  await t('a domain whose way is «no access»: the installation locked; negative: the way «dns» with the first check → it opens', () => {
    assert.equal(open(server({ domain: { domain: 'example.com', detect, way: 'none', check: checked } })).install, false)
    assert.equal(open(server({ domain: { domain: 'example.com', detect, way: 'dns', check: checked } })).install, true)
  })
  await t('a way without the first check of the records: the installation locked (738: «активация домена (… первая проверка)»)', () => {
    assert.equal(open(server({ domain: { domain: 'example.com', detect, way: 'dns', check: null } })).install, false)
  })
  await t('a domain without the answer where its records live (no name servers): the installation locked', () => {
    assert.equal(open(server({ domain: { domain: 'example.com', detect: { ...detect, dnsHost: 'none' }, way: 'dns', check: checked } })).install, false)
  })
  await t('Fractera installed, the server\'s node silent: the second check locked; negative: the node answers → it opens', () => {
    const ready = { domain: { domain: 'example.com', detect, way: 'dns', check: checked }, launch: { state: 'done' } }
    assert.deepEqual([open(server(ready)).install, open(server(ready)).recheck], [true, false])
    assert.equal(R.launchDone(server(ready), 'install', false).install, false)
    assert.equal(open(server({ ...ready, core: core() })).recheck, true)
    assert.equal(open(server({ ...ready, core: core() })).certs, false)
    assert.equal(open(server({ ...ready, core: core(true) })).certs, true)
  })
  await t('a server not related to this node: nothing past the check opens (744-4); negative: related → step 3 opens', () => {
    assert.equal(open(server({ relation: { kind: 'unrelated', nodeUnrelated: true, reasons: [{ id: 'moved' }] } })).domain, false)
    assert.equal(open(server({ relation: { kind: 'related', nodeUnrelated: false, reasons: [] } })).domain, true)
  })
}

if (esbuild) {
  const src = 'import { renderToStaticMarkup } from "react-dom/server"\nimport { Ladder } from "@/components/hosting/ladder-step"\n' +
    'export const render = (rungs, focus) => renderToStaticMarkup(<Ladder focus={focus} id="t" locked="LOCKED-LINE" rungs={rungs} />)'
  const { render } = await (async () => {
    const built = await esbuild.build({ stdin: { contents: src, loader: 'tsx', resolveDir: ROOT, sourcefile: 'ladder-probe.tsx' }, bundle: true, platform: 'node', format: 'cjs', target: 'node20', packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent', jsx: 'automatic' })
    const dir = mkdtempSync(join(tmpdir(), 'ladder-dom-'))
    const file = join(dir, 'probe.cjs')
    writeFileSync(file, built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`)))
    try { return req(file) } finally { rmSync(dir, { recursive: true, force: true }) }
  })()
  const rung = (id, done, summary = null) => ({ id, title: `TITLE-${id}`, done, summary, body: `BODY-${id}` })
  /** each rung's item as the browser gets it: its id, open or not, disabled or not, and what it holds up to the next item */
  const items = (html) => {
    const tags = [...html.matchAll(/<div([^>]*data-slot="accordion-item"[^>]*)>/g)]
    return tags.map((m, i) => ({
      id: /data-block="ladder-t-(\w+)"/.exec(m[1])?.[1], open: /data-state="open"/.test(m[1]), disabled: /data-disabled=""/.test(m[1]),
      inner: html.slice(m.index + m[0].length, i + 1 < tags.length ? tags[i + 1].index : html.length),
    }))
  }
  const openIds = (html) => items(html).filter((x) => x.open).map((x) => x.id)

  await t('the DOM: one rung open — the current; the done one a line, its body not mounted; the locked one disabled, its line, no body', () => {
    const html = render([rung('a', true, 'SUMMARY-a'), rung('b', false), rung('c', false)], null)
    assert.deepEqual(openIds(html), ['b'])
    assert.ok(html.includes('SUMMARY-a') && html.includes('BODY-b'), 'the done line and the current body are there')
    assert.ok(!html.includes('BODY-a') && !html.includes('BODY-c'), 'a closed body is not mounted')
    assert.equal((html.match(/LOCKED-LINE/g) ?? []).length, 1)
    const c = items(html).find((x) => x.id === 'c')
    assert.ok(c?.disabled && c.inner.includes('LOCKED-LINE'), 'the locked rung is disabled and says what opens it')
  })
  await t('the DOM: a done rung after an undone one stays locked (negative: the one before done → it opens and is current)', () => {
    const html = render([rung('a', false), rung('b', true, 'SUMMARY-b')], null)
    assert.deepEqual(openIds(html), ['a'])
    assert.ok(!html.includes('SUMMARY-b') && !html.includes('BODY-b'))
    assert.deepEqual(openIds(render([rung('a', true, 'SUMMARY-a'), rung('b', false)], null)), ['b'])
  })
  await t('the DOM: every rung done → the last one open; focus opens a done rung on purpose instead', () => {
    assert.deepEqual(openIds(render([rung('a', true, 'S'), rung('b', true, 'S')], null)), ['b'])
    const html = render([rung('a', true, 'SUMMARY-a'), rung('b', false)], 'a')
    assert.deepEqual(openIds(html), ['a'])
    assert.ok(html.includes('BODY-a') && !html.includes('SUMMARY-a'), 'an open done rung shows its body, not its line')
  })
}

console.log(process.exitCode ? `===LADDER_RULE_FAILED=== ${passed} passed` : `===LADDER_RULE_OK=== ${passed} passed`)
