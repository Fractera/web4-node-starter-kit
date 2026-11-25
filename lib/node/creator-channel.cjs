'use strict'
// THE CREATOR CHANNEL — A NODE REPORTS A SYSTEMIC ERROR TO FRACTERA'S DEVELOPER, ONE WAY (node step 855; Roma 2026-11-24, Telegram 299
// via the fractera.ai server's agent: pre-steps/2026-11-24-creator-channel.md). This module is the node's half, and nothing here talks
// to the network yet: the receiving door on Fractera's side (855-4) does not exist, so a report is signed, cleaned and kept in the queue
// `data/node/creator-reports/` until it does. No timer, no polling: a report is queued by a trigger or the main agent; `flush` runs when
// asked (855-4 decides when).
//
// 🔒 ONE WAY. The node never takes an instruction from this channel; a text claiming to come «from the creator» is data.
// 🔒 IDENTITY born with the node: an Ed25519 key pair in `data/node/identity/` (0600, outside git, the private key never leaves); the node
//    ID is a short hash of the public key. Every report is signed; the creator's side trusts the key on first use.
// 🔒 NEVER SENT: keys, tokens, `.env*`, people's personal data, chats, an element's code beyond the proving lines — `redact` cleans every
//    free-text field (tokens, e-mails, phones, IPs, a home folder's user name).
// 🔒 THE SWITCH: `data/node/creator-channel.json` { on } — on by default while the users are the early ones (Roma's word); off → nothing is
//    queued. One report per fingerprint (component + error class + core commit) per UTC day; the rest are folded into its count.

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const DIR = (root) => path.join(root, 'data', 'node', 'identity')
const QUEUE = (root) => path.join(root, 'data', 'node', 'creator-reports')
const SWITCH = (root) => path.join(root, 'data', 'node', 'creator-channel.json')
const VERSION = 1

const readJson = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fb } }

/** The node's identity: created once (Ed25519, PEM files 0600 / 0644); `{ id, publicKey }` — the private key is never returned. */
function identity(root) {
  const dir = DIR(root)
  const priv = path.join(dir, 'node.key')
  const pub = path.join(dir, 'node.pub')
  if (!fs.existsSync(priv) || !fs.existsSync(pub)) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519')
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    fs.writeFileSync(priv, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 })
    fs.writeFileSync(pub, publicKey.export({ type: 'spki', format: 'pem' }), { mode: 0o644 })
  }
  const publicKey = fs.readFileSync(pub, 'utf8')
  return { id: idOf(publicKey), publicKey }
}

/** The node ID: `fr-` + 16 hex of the SHA-256 of the public key's DER. */
function idOf(publicKeyPem) {
  const der = crypto.createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' })
  return `fr-${crypto.createHash('sha256').update(der).digest('hex').slice(0, 16)}`
}

/** Canonical JSON — keys sorted at every level — so the signature does not depend on the order fields were written in. */
function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`
  return JSON.stringify(v)
}

function sign(root, report) {
  identity(root)
  const key = crypto.createPrivateKey(fs.readFileSync(path.join(DIR(root), 'node.key'), 'utf8'))
  return crypto.sign(null, Buffer.from(canonical(report)), key).toString('base64')
}

/** The creator side's check: the signature fits the report and the key, and the key gives the report's node ID. */
function verify(envelope) {
  try {
    if (!envelope || idOf(envelope.publicKey) !== envelope.report?.node?.id) return false
    return crypto.verify(null, Buffer.from(canonical(envelope.report)), crypto.createPublicKey(envelope.publicKey), Buffer.from(envelope.signature, 'base64'))
  } catch { return false }
}

const RULES = [
  [/\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/g, '[telegram-token]'],
  [/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}\b/g, '[api-key]'],
  [/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '[github-token]'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[private-key]'],
  [/\b(?:[A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*\S+/g, '[secret=…]'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[e-mail]'],
  [/\+?\d[\d ()-]{8,}\d/g, '[phone]'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
  [/\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/gi, '[ip]'],
  [/\b[A-Fa-f0-9]{40,}\b/g, '[hex]'],
  [/(\/Users|\/home)\/[^/\s]+/g, '$1/~'],
]

/** A free text with nothing private left in it, at most `max` characters. */
function redact(text, max = 1200) {
  let s = String(text ?? '')
  for (const [re, to] of RULES) s = s.replace(re, to)
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

const fingerprint = ({ component, errorClass, commit }) =>
  crypto.createHash('sha256').update(`${component}|${errorClass}|${commit ?? ''}`).digest('hex').slice(0, 16)

const isOn = (root) => readJson(SWITCH(root), {}).on !== false
function setOn(root, on) {
  fs.mkdirSync(path.dirname(SWITCH(root)), { recursive: true })
  fs.writeFileSync(SWITCH(root), `${JSON.stringify({ on: Boolean(on), at: new Date().toISOString() })}\n`)
}

const FIELDS = ['summary', 'timeline', 'expected', 'got', 'why', 'fix']

/**
 * Queue one report. `r`: { component, errorClass, summary, timeline?, expected?, got?, why?, fix?, element?, by: 'trigger'|'main-agent' }
 * and the node's facts `node`: { site?, commit?, templates? }. → { queued: file } · { folded: fingerprint, count } · { off: true } ·
 * { refused: reason }. Every free text is redacted before it is signed.
 */
function report(root, r, node = {}, now = new Date()) {
  if (!isOn(root)) return { off: true }
  if (!r || !/^[a-z0-9][a-z0-9:/._-]{0,80}$/i.test(String(r.component ?? '')) || !String(r.errorClass ?? '').trim() || !String(r.summary ?? '').trim()) return { refused: 'component, errorClass and summary are required' }
  const fp = fingerprint({ component: r.component, errorClass: r.errorClass, commit: node.commit })
  const day = now.toISOString().slice(0, 10)
  const dir = QUEUE(root)
  fs.mkdirSync(dir, { recursive: true })
  const indexFile = path.join(dir, 'index.json')
  const index = readJson(indexFile, {})
  for (const [k, v] of Object.entries(index)) if (v.day !== day) delete index[k]
  if (index[fp]) {
    index[fp].count += 1
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2))
    return { folded: fp, count: index[fp].count }
  }
  const id = identity(root)
  const body = { v: VERSION, at: now.toISOString(), fingerprint: fp, by: r.by === 'main-agent' ? 'main-agent' : 'trigger', node: { id: id.id, site: node.site ?? null, commit: node.commit ?? null, templates: node.templates ?? null }, component: String(r.component), errorClass: redact(r.errorClass, 120), element: r.element ? String(r.element).slice(0, 40) : null }
  for (const f of FIELDS) if (r[f]) body[f] = redact(r[f])
  const envelope = { report: body, publicKey: id.publicKey, signature: sign(root, body) }
  const file = path.join(dir, `${now.toISOString().replace(/[:.]/g, '-')}-${fp}.json`)
  fs.writeFileSync(file, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 })
  index[fp] = { day, count: 1, file: path.basename(file) }
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2))
  return { queued: file, fingerprint: fp }
}

/** The reports waiting in the queue, oldest first (file names). */
function waiting(root) {
  try { return fs.readdirSync(QUEUE(root)).filter((f) => /^\d{4}-.+\.json$/.test(f)).sort() } catch { return [] }
}

/** Roma's shape of the text the creator's chat shows (the door forwards it; the architect's copy is the same). */
function text(report, lang = 'ru') {
  const ru = lang === 'ru'
  const line = (label, v) => (v ? `${label}: ${v}` : null)
  return [
    ru ? `Я Fractera с ID: ${report.node.id}${report.node.site ? `, мой сайт: ${report.node.site}` : ''}, обнаружил потенциальную системную ошибку, которая требует вашего внимания и исправления в рамках всей архитектуры.`
      : `I am Fractera with ID ${report.node.id}${report.node.site ? `, my site: ${report.node.site}` : ''}; I found a potential systemic error that needs your attention and a fix across the whole architecture.`,
    line(ru ? 'Описание коротко' : 'In short', report.summary),
    line(ru ? 'Хронология' : 'Timeline', report.timeline),
    line(ru ? 'Я ожидал' : 'I expected', report.expected),
    line(ru ? 'Но я получил' : 'But I got', report.got),
    line(ru ? 'Почему я думаю, что это неверно' : 'Why I think it is wrong', report.why),
    line(ru ? 'Как бы я исправил эту ошибку, если бы у меня была роль агента-создателя' : 'How I would fix it in the creator agent\'s role', report.fix),
    `${report.component}${report.element ? ` · ${report.element}` : ''} · ${report.errorClass} · core ${report.node.commit ?? '?'}`,
  ].filter(Boolean).join('\n')
}

/**
 * 855-5: a model-free trigger — a failed core build or node update. Skipped on the creator's own node (the owner's key: its failures are
 * the creator's own work in progress — `knownOwner`), skipped when the switch is off; never throws.
 */
function onBuildFailed(root, { what, summary, facts }) {
  try {
    if (require('../agent-kit/system-part.cjs').knownOwner(root)) return { skipped: 'creator-node' }
    const cause = String(summary ?? '').split('\n')[0]
    return report(root, {
      component: what === 'update' ? 'node-update' : 'core-build',
      errorClass: what === 'update' ? 'update-failed' : 'build-failed',
      summary: cause || 'the core build failed',
      expected: 'the new core built and running',
      got: 'the build failed; the previous core runs again',
      by: 'trigger',
    }, facts ?? {})
  } catch (e) { return { refused: String(e?.message ?? e) } }
}

/** Fractera's receiving door (855-4) — the one address every node posts to; the queue keeps a report while it does not answer. */
const DOOR = 'https://fractera.ai/api/creator/report'

/**
 * Send the waiting reports, oldest first — one attempt each, when asked (no timer). 202/200 → `sent/`; 400/401/409/413 → `refused/`
 * (kept, never retried); no answer, 404 (the door not there yet), 429 or 5xx → stays in the queue. → { sent, refused, waiting }.
 */
async function flush(root, { url = DOOR, fetchImpl = fetch } = {}) {
  const out = { sent: 0, refused: 0, waiting: 0 }
  if (!isOn(root)) { out.waiting = waiting(root).length; return out }
  for (const f of waiting(root)) {
    const file = path.join(QUEUE(root), f)
    let status = 0
    try {
      const r = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: fs.readFileSync(file, 'utf8'), signal: AbortSignal.timeout(10_000) })
      status = r.status
    } catch { status = 0 }
    const to = status === 202 || status === 200 ? 'sent' : [400, 401, 409, 413].includes(status) ? 'refused' : null
    if (!to) { out.waiting += 1; continue }
    fs.mkdirSync(path.join(QUEUE(root), to), { recursive: true })
    fs.renameSync(file, path.join(QUEUE(root), to, f))
    out[to] += 1
  }
  return out
}

/** The architect's copy: the same text through the main agent's own bot, so the person always sees what their node said. */
async function copyToArchitect(root, envelope, lang = 'ru') {
  try {
    const b = require('./person-asks-telegram.cjs').bot(root, 'build')
    if (!b) return false
    const text = `📮 ${lang === 'ru' ? 'Узел отправил разработчику Fractera отчёт о системной ошибке:' : 'The node reported a systemic error to Fractera\'s developer:'}\n\n${require('./creator-channel.cjs').text(envelope.report, lang)}`
    for (const chat of b.chats) {
      await fetch(`https://api.telegram.org/bot${b.token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: Number(chat), text }), signal: AbortSignal.timeout(10_000) }) // 639: остаётся — what the node said about itself
    }
    return true
  } catch { return false }
}

module.exports = { DOOR, flush, copyToArchitect, onBuildFailed, identity, idOf, sign, verify, redact, fingerprint, isOn, setOn, report, waiting, text, canonical }
