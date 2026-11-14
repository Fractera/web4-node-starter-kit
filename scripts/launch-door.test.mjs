// TESTS OF THE LAUNCH DOOR'S VISIT COOKIE (node step 744-3). `npm run test:launch-door`, in the prebuild.
// The owner, 2026-11-14: «не думаю что у тебя есть право хранить пароль от сервера … в случае взлома пользователи получит доступ ко всем
// серверам» · «Хрони ключ вокально хранилище браузера с продолжительностью и более 24:00 это нормально?» · «no more then 24».
// The real door (`app/api/node/launch/route.ts`, bundled by esbuild into the system's temp folder) runs in a temporary node root whose
// runner is a stand-in: it answers by what it reads on stdin and writes down what it was given — so the test sees exactly which secret
// crossed which boundary. Negative controls: no cookie, an expired cookie, a closed visit, the key looked for in every answer body.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(ROOT, 'package.json'))
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
let esbuild
try { esbuild = req('esbuild') } catch { esbuild = null }
if (!esbuild) { console.warn('744-3 door skipped: esbuild is not installed (devDependencies) — `npm install`'); process.exit(0) }

const KEY = '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAAstand-in\n-----END OPENSSH PRIVATE KEY-----\n'
const PASSWORD = 'root-password-744-3'
const node = mkdtempSync(join(tmpdir(), 'launch-door-node-'))
const LOG = join(node, 'runner-calls.jsonl')
// The stand-in runner: what a real one would answer, keyed by what it got.
mkdirSync(join(node, 'scripts', 'dedicated-server'), { recursive: true })
writeFileSync(join(node, 'scripts', 'dedicated-server', 'launch.mjs'), `
import { appendFileSync } from 'node:fs'
let text = ''
for await (const c of process.stdin) text += c
const input = JSON.parse(text || '{}')
const verb = process.argv[2]
appendFileSync(${JSON.stringify(LOG)}, JSON.stringify({ argv: process.argv.slice(2), input }) + '\\n')
const say = (o) => console.log('===LAUNCH=== ' + JSON.stringify(o))
const deadline = new Date(Date.now() + 24 * 3600e3).toISOString()
if (verb === 'connect' && input.password) say({ ok: true, fingerprint: 'SHA256:x', visit: { key: ${JSON.stringify(KEY)}, deadline }, state: {} })
else if (verb === 'close') say(input.key === ${JSON.stringify(KEY)} ? { ok: true, closed: true } : { ok: false, reason: 'need-password' })
else say(input.key === ${JSON.stringify(KEY)} ? { ok: true, state: { seen: true } } : { ok: false, reason: 'need-password' })
`)
const calls = () => readFileSync(LOG, 'utf8').trim().split('\n').map((l) => JSON.parse(l))

const built = await esbuild.build({ entryPoints: [join(ROOT, 'app/api/node/launch/route.ts')], bundle: true, platform: 'node', format: 'cjs', target: 'node20', packages: 'external', write: false, absWorkingDir: ROOT, logLevel: 'silent' })
const text = built.outputFiles[0].text.replace(/require\("([^".][^"]*)"\)/g, (all, spec) => (spec.startsWith('node:') ? all : `require(${JSON.stringify(req.resolve(spec))})`))
const doorFile = join(node, 'door.cjs')
writeFileSync(doorFile, text)
process.chdir(node) // the door reads the node's root from the working folder at load, as under `next start`
const { POST } = createRequire(doorFile)(doorFile)
const { NextRequest } = req('next/server')

const NAME = 'fractera-visit-203.0.113.7-22'
const post = (body, { cookie = null, https = false } = {}) => POST(new NextRequest('http://localhost:24680/api/node/launch', {
  method: 'POST',
  headers: { host: 'localhost:24680', 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(https ? { 'x-forwarded-proto': 'https' } : {}) },
  body: JSON.stringify({ host: '203.0.113.7', port: 22, ...body }),
}))
const setCookie = (res) => res.headers.getSetCookie().find((c) => c.startsWith(`${NAME}=`)) ?? null
const pair = (res) => setCookie(res).split(';')[0]

console.log('744-3 the launch door keeps the visit in the browser')
let cookie = null
await t('connect with the password: the key goes into an HttpOnly, SameSite=Strict cookie of this door\'s path, ≤ 24 h; the answer has the deadline, never the key', async () => {
  const res = await post({ action: 'connect', password: PASSWORD })
  const body = await res.text()
  assert.equal(res.status, 200, body)
  assert.ok(!body.includes('PRIVATE KEY') && !body.includes('stand-in'), 'the key is in the answer')
  assert.match(JSON.parse(body).visit.deadline, /^\d{4}-\d\d-\d\dT/)
  const c = setCookie(res)
  assert.ok(c, 'no visit cookie')
  for (const part of ['HttpOnly', 'SameSite=strict', 'Path=/api/node/launch']) assert.ok(c.toLowerCase().includes(part.toLowerCase()), `${part} missing: ${c}`)
  assert.ok(!/;\s*Secure/i.test(c), 'Secure on plain http (localhost) would drop the cookie in some browsers')
  const age = Number(/Max-Age=(\d+)/i.exec(c)[1])
  assert.ok(age > 86_000 && age <= 86_400, `Max-Age ${age}`)
  cookie = pair(res)
})
await t('the password reached the runner by stdin only — not in its argv', async () => {
  const first = calls()[0]
  assert.equal(first.input.password, PASSWORD)
  assert.ok(!first.argv.join(' ').includes(PASSWORD))
})
await t('an act with the cookie gives the runner the key by stdin; the answer still never carries it', async () => {
  const res = await post({ action: 'state' }, { cookie })
  const body = await res.text()
  assert.equal(JSON.parse(body).state.seen, true, body)
  assert.ok(!body.includes('PRIVATE KEY'))
  assert.equal(calls().at(-1).input.key, KEY)
  assert.ok(!calls().at(-1).argv.join(' ').includes('PRIVATE'))
})
await t('negative: no cookie → `need-password`, and the runner got no key', async () => {
  const res = await post({ action: 'state' })
  assert.equal((await res.json()).reason, 'need-password')
  assert.equal(calls().at(-1).input.key, null)
})
await t('negative: a cookie past its deadline is not used', async () => {
  const stale = `${NAME}=${Math.floor(Date.now() / 1000) - 5}.${Buffer.from(KEY).toString('base64url')}`
  const res = await post({ action: 'state' }, { cookie: stale })
  assert.equal((await res.json()).reason, 'need-password')
  assert.equal(calls().at(-1).input.key, null)
  assert.match(setCookie(res), /Max-Age=0/i, 'a refused visit takes the cookie away')
})
await t('close: the runner closes the visit with the key, the cookie is taken away; over https the cookie is Secure', async () => {
  const res = await post({ action: 'close' }, { cookie })
  assert.equal((await res.json()).closed, true)
  assert.match(setCookie(res), /Max-Age=0/i)
  const again = await post({ action: 'connect', password: PASSWORD }, { https: true })
  assert.match(setCookie(again), /;\s*Secure/i)
})
await t('a new password while a visit lives: the runner gets the old key too, to take its line away', async () => {
  await post({ action: 'connect', password: PASSWORD }, { cookie })
  const last = calls().at(-1)
  assert.deepEqual([last.input.password, last.input.key], [PASSWORD, KEY])
})

process.chdir(ROOT)
rmSync(node, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
