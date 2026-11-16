'use strict'
// THE PERSON'S SECRET IN THE NODE'S WINDOW (node step 768). The owner, 2026-11-16: «Было бы законным или нет чтобы ты показал мне прямо
// в этом всплывающем окне область для ввода данных в данном случае пароля?»; «для самого узла и для элемента … если элемент требует от
// меня везти например API для условно говоря exa.ai то я могу сделать этот ввод в этом окне». Two kinds, both typed by the person in a
// masked field of the action window (`components/architect/person-ask-secret.client.tsx`):
//   env          — a key of the asking ELEMENT's own account: written into that element's key file (`.env.local`), its process restarted;
//   openai       — the node's own OpenAI key (768-6): the main agent asks it, a live check with OpenAI, then the core's key file;
//   server-root  — the root password of a server on «Активация выделенного сервера»: the browser posts it to the launch door itself
//                  (`/api/node/launch` connect — a visit of a day in an HttpOnly cookie, nothing stored), exactly like the page's form.
// 🔒 A value never reaches an agent, a chat, Telegram, a log or `data/node/person-asks.json`: this file checks names and values and makes
// the line; the request keeps only the name. The asker hears «saved, ends …a1b2» (a tail only for a long value).
// 🔒 What protects: (1) a key goes only into the asker's own file; (2) the node's and the sign-in's keys are never-names; Stripe and
// OpenAI keys have their own screens with a live check; (3) `NEXT_PUBLIC_*` is baked into a build — «saved» without a rebuild would lie.
// A secret of SOMEONE ELSE's site (a LinkedIn, Google or bank sign-in) is never asked here: the site's own page.

const NAME = /^[A-Z][A-Z0-9_]{2,63}$/
// the node's identity and wiring of every element, the sign-in's secrets, the provider rule (no Anthropic API key for the project)
const NEVER = new Set(['SETTINGS_SECRET', 'ELEMENT_KEY', 'DATA_SECRET', 'ITEM_ID', 'PORT', 'HOSTNAME', 'HOST', 'PATH', 'HOME', 'NODE_ENV',
  'ARCHITECT_URL', 'ARCHITECT_TOKEN', 'SERVICE_DATA_DIR', 'NODE_DOMAIN_FILE', 'SITE_URL', 'PUBLIC_URL'])
const NEVER_PREFIX = ['NODE_', 'AUTH_', 'NEXTAUTH_', 'NEXT_', 'DATA_', 'SETTINGS_', 'ELEMENT_', 'X_', 'CLAUDE_', 'ANTHROPIC_', 'PM2_']

/** Why a name may not be asked for, or null. */
function nameRefusal(name) {
  if (typeof name !== 'string' || !NAME.test(name)) return 'bad-name'
  if (name.startsWith('NEXT_PUBLIC_')) return 'baked-into-build'
  if (name === 'OPENAI_API_KEY') return 'own-screen-openai'
  if (name.startsWith('STRIPE_')) return 'own-screen-stripe'
  if (NEVER.has(name) || NEVER_PREFIX.some((p) => name.startsWith(p))) return 'node-key'
  return null
}

/** Why a value may not be written, or null: one line of printable ASCII with no spaces or quotes, at most 4096 characters. */
function valueRefusal(value) {
  if (typeof value !== 'string' || value.length === 0) return 'empty'
  if (value.length > 4096) return 'too-long'
  if (/[\r\n]/.test(value)) return 'line-break'
  if (/\s/.test(value)) return 'space'
  if (/["'`\\]/.test(value)) return 'quote'
  if (/[^\x21-\x7e]/.test(value)) return 'not-ascii'
  return null
}

/** The value as it stands in `.env.local`: a `#` would start a comment for some readers — then quoted. */
const envValue = (value) => (value.includes('#') ? `"${value}"` : value)

/** The last four characters, only for a long value (a short password keeps no tail). */
const tail = (value) => (typeof value === 'string' && value.length >= 16 ? value.slice(-4) : null)

/** A request's secret as stored with the request — the name and the place, never a value. Throws on a refused one.
 * @param {unknown} s @param {string} by */
function describe(s, by) {
  if (s == null) return null
  if (typeof s !== 'object') throw new Error('person-asks: secret is { kind, … }')
  const o = /** @type {Record<string, unknown>} */ (s)
  if (o.kind === 'server-root') {
    if (by !== 'build') throw new Error('person-asks: a server root password is asked only by the main agent')
    const host = typeof o.host === 'string' ? o.host.trim() : ''
    const port = Number.isInteger(Number(o.port)) && Number(o.port) > 0 && Number(o.port) < 65536 ? Number(o.port) : 22
    if (!/^(\d{1,3}\.){3}\d{1,3}$|^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host)) throw new Error('person-asks: secret server-root needs a host (an IP or a name)')
    return { kind: 'server-root', host, port }
  }
  // 768-6 (the owner, 2026-11-16: «Где же наши возможности в реальной жизни поработать с реальными инструментами передачи ключа»): the
  // node's own OpenAI key — asked only by the main agent, checked live with OpenAI before it is written into the core's key file
  if (o.kind === 'openai') {
    if (by !== 'build') throw new Error('person-asks: the node\'s OpenAI key is asked only by the main agent')
    return { kind: 'openai', name: 'OPENAI_API_KEY' }
  }
  if (o.kind === 'env' || o.kind == null) {
    if (by === 'build') throw new Error('person-asks: the core asks no keys here — its keys have their own screens (OpenAI, Stripe, Cloudflare, GitHub)')
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const why = nameRefusal(name)
    if (why) throw new Error(`person-asks: the key ${name || '(no name)'} may not be asked for — ${why}`)
    let where = null
    if (typeof o.where === 'string' && o.where.trim()) {
      try { const u = new URL(o.where.trim()); if (u.protocol === 'https:') where = u.href } catch { /* dropped */ }
      if (!where) throw new Error('person-asks: secret where is an https address where the key is taken')
    }
    return { kind: 'env', name, where }
  }
  throw new Error('person-asks: secret kind is env, openai or server-root')
}

module.exports = { nameRefusal, valueRefusal, envValue, tail, describe }
