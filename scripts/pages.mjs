// THE PAGES OF AN ELEMENT AND WHO OPENS EACH (node step 848-7; the aifa.dev server's letter 2026-11-23, 1.3в: «Страниц, закрытых ролью,
// одной командой не получить»). Model-free:
//   npm run pages -- <id>          one element: its pages with their access (guest or roles) and its Telegram Mini App by kinds
//   npm run pages -- --all         every custom element, a few lines each
//   [--lang ru|en] [--json]
// Asks the element's own door GET /api/pages on loopback with that element's key (`lib/node/element-call-key.cjs`) — the element knows its
// branches and roles; the core never reads its code. An element on an older template has no door: said so, with the way (its Update).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const { keyFor } = require('../lib/node/element-call-key.cjs')
const nameFile = require('../lib/web4-items/name-file.cjs')

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')) } catch { return null } }
const personLang = readJson(join(ROOT, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'))?.lang
const lang = /^[a-z]{2}$/.test(flag('--lang') ?? '') ? flag('--lang') : String(personLang ?? '').startsWith('ru') ? 'ru' : 'en'
const asJson = args.includes('--json')
const services = readJson(join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'))?.services ?? []
const all = args.includes('--all')
const id = all ? null : args.find((a) => !a.startsWith('--') && a !== flag('--lang'))
if (!all && !id) { console.log('npm run pages -- <element id> | --all  [--lang ru|en] [--json]'); process.exit(2) }

/** Ask one element. → { id, name, state, body? } */
async function ask(entry) {
  const name = nameFile.displayName(entry.id, { root: ROOT, address: entry.address ?? entry.id })
  if (!entry.port) return { id: entry.id, name, state: 'no-port' }
  const key = keyFor(entry.id, { root: ROOT })
  if (!key) return { id: entry.id, name, state: 'no-key' }
  try {
    const r = await fetch(`http://127.0.0.1:${entry.port}/api/pages?lang=${lang}`, { headers: { 'X-Node-Key': key }, signal: AbortSignal.timeout(8000) })
    if (r.status === 404) return { id: entry.id, name, state: 'template-older' }
    const body = await r.json().catch(() => null)
    if (!r.ok || !body?.ok) return { id: entry.id, name, state: `refused-${r.status}`, reason: body?.reason ?? body?.error ?? null }
    return { id: entry.id, name, state: 'ok', body }
  } catch {
    return { id: entry.id, name, state: 'not-answering' }
  }
}

const accessWord = (a) => (a === 'guest' ? 'guest' : Array.isArray(a) ? a.join(', ') : 'unknown gate')
const WHY = {
  'template-older': 'its template has no door /api/pages yet — it comes with the Update of the template (v0.3.240+)',
  'not-answering': 'it does not answer on its port now (asleep or off: npm run serve:status)',
  'no-port': 'no port in the registry', 'no-key': 'no key for its doors on this node',
}

function print(res, short) {
  const head = `${res.name}${res.name !== res.id ? ` (${res.id})` : ''}`
  if (res.state !== 'ok') { console.log(`${head} — ${WHY[res.state] ?? `${res.state}${res.reason ? `: ${res.reason}` : ''}`}`); return }
  const { pages = [], miniApp } = res.body
  const pub = pages.filter((p) => p.access === 'guest')
  const closed = pages.filter((p) => p.access !== 'guest')
  console.log(`${head} — pages: ${pub.length} public, ${closed.length} by role`)
  const rows = short ? [] : pages
  for (const p of rows) console.log(`  ${p.path}${p.title ? ` · ${p.title}` : ''} — ${accessWord(p.access)}${p.awaitingDesign ? ' · awaiting its design' : ''}`)
  if (miniApp) console.log(`  Mini App ${miniApp.path} — ${accessWord(miniApp.access)} · ${miniApp.items} items: ${Object.entries(miniApp.kinds ?? {}).map(([k, n]) => `${k} ${n}`).join(', ')}`)
  else console.log('  no Mini App')
}

const targets = all ? services.filter((s) => s.kind === 'user') : services.filter((s) => s.id === id)
if (!targets.length) { console.log(all ? '===PAGES=== no custom elements on this node' : `===PAGES_FAILED=== no element «${id}» in the registry`); process.exit(all ? 0 : 1) }
const results = []
for (const t of targets) results.push(await ask(t))
if (asJson) { console.log(JSON.stringify(results, null, 2)); process.exit(0) }
for (const r of results) print(r, all)
console.log(`===PAGES=== ${results.filter((r) => r.state === 'ok').length} of ${results.length} answered`)
