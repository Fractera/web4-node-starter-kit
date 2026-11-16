// TESTS OF THE READY TASK FOR THE MAIN AGENT IN THE PERSON'S CHROME (node step 760-9). `npm run test:chrome-task`, in the prebuild.
import assert from 'node:assert/strict'
import { chromeTask } from '../lib/hosting/chrome-task.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const words = {
  task: 'Domain {zone}; cabinet {cabinet}; A «{at}» → {ip}; A «{star}» → {ip}; in the way: {conflicts}.',
  cabinetCf: 'Cloudflare ({zone} → DNS → Records)',
  cabinetOther: 'the DNS cabinet (servers {ns}){registrar}',
  none: 'none',
}
const base = { zone: 'fractera.ai', ns: ['ignacio.ns.cloudflare.com', 'kay.ns.cloudflare.com'], registrar: 'GoDaddy.com, LLC', at: '@', star: '*', ip: '109.199.105.213' }

console.log('760-9 the ready task names the cabinet by the name servers and every record')

t('fractera.ai: the cabinet is Cloudflare, never the registrar; both records and the one in the way', () => {
  const c = chromeTask(words, { ...base, dnsHost: 'cloudflare', conflicts: ['www'] })
  assert.equal(c.cabinet, 'Cloudflare (fractera.ai → DNS → Records)')
  assert.equal(c.task.includes('GoDaddy'), false)
  assert.equal(c.task, 'Domain fractera.ai; cabinet Cloudflare (fractera.ai → DNS → Records); A «@» → 109.199.105.213; A «*» → 109.199.105.213; in the way: www.')
})

t('a domain on other name servers: their cabinet with the registrar named', () => {
  const c = chromeTask(words, { ...base, dnsHost: 'other', ns: ['ns1.porkbun.com'], registrar: 'Porkbun LLC', conflicts: [] })
  assert.equal(c.cabinet, 'the DNS cabinet (servers ns1.porkbun.com) (Porkbun LLC)')
  assert.ok(c.task.endsWith('in the way: none.'))
})

t('negative control: no domain or no server address — no task, no button', () => {
  assert.equal(chromeTask(words, { ...base, zone: '' }), null)
  assert.equal(chromeTask(words, { ...base, ip: '' }), null)
  assert.equal(chromeTask(words, { ...base, ip: 'not-an-ip' }), null)
})

t('negative control: the real words never ask for a password, a code or a token', async () => {
  const src = await import('node:fs').then((fs) => fs.readFileSync(new URL('../components/hosting/server-launch.i18n.ts', import.meta.url), 'utf8'))
  const tasks = [...src.matchAll(/\n    task: "([^"]+)"/g)].map((m) => m[1])
  assert.equal(tasks.length, 2, 'both languages carry the task')
  for (const x of tasks) assert.equal(/password|пароль|token|токен|code |код /i.test(x), false, x)
})

console.log(process.exitCode ? `✗ chrome-task: failed (${passed} passed)` : `✓ chrome-task: ${passed} cases`)
