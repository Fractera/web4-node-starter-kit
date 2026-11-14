// TESTS OF «NEVER AVAILABLE BEFORE EVERY CERTIFICATE AND THE FINAL CHECK» (node step 744-6). `npm run test:final-check`, in the prebuild.
// The owner, 2026-11-14: «мы не должны говорить пользу о том что сервер доступен если все сертификаты безопасности не установлены и на
// последнем этапе заключительной проверки перед разрешением использовать сервер мы эти проверки не завершили».
// Three planes, each with its negative control:
//   the check (`lib/hosting/final-check.mjs`) — every required name with a certificate and HTTPS, the domain on, sign-in at auth.<zone>;
//   the guard (`scripts/check-ready-words.mjs`) — planted: a ready word before the check, the check removed, another file reading them;
//   the DOM of the last step, rendered on the server — «Your server is ready», the links and the code only when the check passed.
// The runner (activate refused before the names are ready; no «launched» mark without the final check): `test:hosting-launch`, by hand.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { finalCheck, httpsDue, namesReady } from '../lib/hosting/final-check.mjs'
import { END, readyWordsProblems } from './check-ready-words.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(ROOT, 'package.json'))
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const row = (host, over = {}) => ({ host, zone: 'example.org', label: host, kind: host.startsWith('architect') ? 'architect' : 'apex', optional: false, dns: 'ok', cert: 'ok', daysLeft: 80, certSource: 'letsencrypt', https: true, status: 200, ...over })
const rows = () => [row('example.org'), row('www.example.org', { optional: true, cert: 'missing', https: null }), row('architect.example.org'), row('auth.example.org')]
const state = ({ core = {}, signin = { ok: true, providers: 200, location: 'https://auth.example.org/login' } } = {}) => ({
  host: '203.0.113.7', probe: null, relation: null, launch: null, progress: [], sub: [], update: null, mark: { phase: 'live', domain: 'example.org', domainActive: true },
  domain: { domain: 'example.org', way: 'dns', signin }, verdict: null, records: [], week: null,
  core: { zone: 'example.org', rows: rows(), steps: { domain: true, dns: true, certs: true, check: true, active: true }, certsRun: null, helper: true, checkAt: null, dnsAt: null, ...core },
})

console.log('744-6 never «available» before every certificate and the final check')

await t('every required name with a certificate and HTTPS, the domain on, sign-in at auth.<zone> → ready; an optional name never holds it', () => {
  assert.deepEqual(finalCheck(state()), { ok: true, missing: [] })
})
await t('negative: one name without a valid certificate, one without HTTPS — not ready, each named; «expiring» is still valid', () => {
  const s = state({ core: { rows: [row('example.org', { cert: 'missing' }), row('architect.example.org', { https: false }), row('auth.example.org', { cert: 'expiring' })] } })
  assert.deepEqual(finalCheck(s).missing, [{ host: 'example.org', what: 'cert' }, { host: 'architect.example.org', what: 'https' }])
  assert.equal(namesReady(s).ok, false)
})
await t('negative: the names ready but the domain off or sign-in elsewhere — the names are ready, the server is not', () => {
  assert.deepEqual(finalCheck(state({ signin: { ok: false, providers: 200, location: 'http://127.0.0.1:24681/login' } })).missing, [{ host: 'auth.example.org', what: 'signin' }])
  const off = state({ core: { steps: { domain: true, dns: true, certs: true, check: true, active: false } } })
  assert.deepEqual([namesReady(off).ok, finalCheck(off).ok], [true, false])
  assert.equal(finalCheck(null).ok, false)
  assert.equal(finalCheck({ core: { zone: 'example.org', rows: [] } }).ok, false, 'nothing measured is not ready')
})

await t('744-9: a fresh server before the domain is on — auth 503, cache and stripe off by the registry: the names are ready, the server is not', () => {
  // measured 2026-11-14 on the test server: auth «Sign-in is not switched on yet» 503, cache and stripe nginx 503 — activation never came
  const fresh = state({
    signin: null,
    core: {
      rows: [row('example.org'), row('architect.example.org'), row('auth.example.org', { kind: 'auth', https: false, status: 503 }),
        row('cache.example.org', { kind: 'element', https: false, status: 503, off: true }), row('stripe.example.org', { kind: 'element', https: false, status: 503, off: true })],
      steps: { domain: true, dns: true, certs: true, check: false, active: false },
    },
  })
  assert.deepEqual(namesReady(fresh), { ok: true, missing: [] })
  assert.deepEqual(finalCheck(fresh).missing, [{ host: 'auth.example.org', what: 'signin' }])
  assert.deepEqual([httpsDue({ kind: 'auth' }), httpsDue({ kind: 'element', off: true }), httpsDue({ kind: 'element' }), httpsDue({ kind: 'www', optional: true })], [false, false, true, false])
})
await t('744-9 negative: a running element with 503 still holds the names; an off element without a certificate still holds them', () => {
  const s = state({ core: { rows: [row('example.org'), row('data.example.org', { kind: 'element', https: false, status: 503 }), row('stripe.example.org', { kind: 'element', cert: 'missing', https: false, off: true })] } })
  assert.deepEqual(namesReady(s).missing, [{ host: 'data.example.org', what: 'https' }, { host: 'stripe.example.org', what: 'cert' }])
})

// LF whatever the checkout (a Windows one gives CRLF), so the planted copies below find their lines
const lf = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
const realFiles = () => [[END, lf(join(ROOT, END))], ...['server-launch.client.tsx', 'server-launch-check.client.tsx', 'server-launch-rungs.ts', 'server-busy.client.tsx', 'server-place.client.tsx'].map((f) => [`components/hosting/${f}`, lf(join(ROOT, 'components/hosting', f))])]
await t('the guard: the real files are clean; negatives — a ready word before the check, the check removed, another launch file reading the ready words', () => {
  const files = realFiles()
  assert.deepEqual(readyWordsProblems(files), [])
  const end = files[0][1]
  const plant = (text) => [[END, text], ...files.slice(1)]
  const before = end.replace('  const final = finalCheck(state)\n', '  const final = finalCheck(state)\n  const early = <p>{w.done}</p>\n')
  assert.ok(readyWordsProblems(plant(before)).some((p) => p.includes('draws a ready word')), 'a ready word planted before the check')
  const always = end.replace('{final.ok ? <ReadyWords', '{true ? <ReadyWords')
  assert.ok(readyWordsProblems(plant(always)).some((p) => p.includes('under {final.ok ?')), 'the check removed')
  const other = [...files, ['components/hosting/server-launch-x.client.tsx', 'import type { ServerLaunchWords } from "x"\nconst a = (words: ServerLaunchWords) => words.ready.done']]
  assert.ok(readyWordsProblems(other).some((p) => p.startsWith('components/hosting/server-launch-x.client.tsx')), 'another file reading them')
})

let esbuild
try { esbuild = req('esbuild') } catch { esbuild = null }
if (!esbuild) {
  console.warn('  ! the DOM of the last step skipped: esbuild is not installed (devDependencies) — `npm install`')
} else {
  const src = 'import { renderToStaticMarkup } from "react-dom/server"\nimport { ReadyStep } from "@/components/hosting/server-launch-end.client"\n' +
    'import { serverLaunchWords } from "@/components/hosting/server-launch.i18n"\nexport const words = serverLaunchWords("en")\n' +
    'export const render = (state) => renderToStaticMarkup(<ReadyStep busy={false} claim={{ code: null, claimed: false }} onAct={async () => null} onClaim={() => {}} state={state} words={words} />)'
  const built = await esbuild.build({ stdin: { contents: src, loader: 'tsx', resolveDir: ROOT, sourcefile: 'ready-probe.tsx' }, bundle: true, platform: 'node', format: 'cjs', target: 'node20', packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent', jsx: 'automatic' })
  const dir = mkdtempSync(join(tmpdir(), 'final-check-'))
  const file = join(dir, 'probe.cjs')
  writeFileSync(file, built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`)))
  const { render, words } = req(file)
  rmSync(dir, { recursive: true, force: true })
  const has = (html, text) => html.includes(text)

  await t('the DOM: the check passed → «Your server is ready», the links and the code; no list of what is missing', () => {
    const html = render(state())
    assert.ok(has(html, words.ready.done) && has(html, 'href="https://architect.example.org/"') && has(html, words.ready.claimButton))
    assert.ok(!has(html, words.ready.missing.title) && has(html, 'data-ready="1"'))
  })
  await t('the DOM, negative: sign-in elsewhere → none of the ready words, the links or the code; what is missing is named', () => {
    const html = render(state({ signin: { ok: false, providers: 200, location: 'http://127.0.0.1:24681/login' } }))
    assert.ok(!has(html, words.ready.done) && !has(html, 'href="https://architect.example.org/"') && !has(html, words.ready.claimButton))
    assert.ok(has(html, words.ready.missing.title) && has(html, words.ready.missing.signin.replace('{host}', 'auth.example.org')) && has(html, 'data-ready="0"'))
  })
  await t('the DOM: the domain not switched on yet → only «switch the domain on», no ready word', () => {
    const html = render(state({ core: { steps: { domain: true, dns: true, certs: true, check: true, active: false } } }))
    assert.ok(has(html, words.ready.activate) && !has(html, words.ready.done))
  })
}

console.log(process.exitCode ? `===FINAL_CHECK_FAILED=== ${passed} passed` : `===FINAL_CHECK_OK=== ${passed} passed`)
