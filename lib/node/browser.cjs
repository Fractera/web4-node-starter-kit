'use strict'
// THE PERSON'S BROWSER FROM TELEGRAM (node step 767). The owner, 2026-11-16: «нам нужно в инструкцию основного агента добавить описание
// его возможностей при которых пользователь может с помощью Telegram управлять вкладками браузера»; measured with him 17:30–17:43:
// the Claude extension acts only in its connected browser and its «selected tab» is the agent's own, never the person's screen — while
// macOS AppleScript drives every Chrome window and profile with no extension: the list of tabs, a tab brought before their eyes, a page
// opened in a chosen profile (once the person pressed OK on «Терминал wants access to control Google Chrome»).
// Model-free: the main agent's `npm run browser` and the elements' door `/api/node/browser` call this file.
// 🔒 A full address never leaves this file towards a chat: the list gives titles and hosts (an address may carry a token).
// 🔒 macOS only; anywhere else every call says so (Windows and Linux are not measured).
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const FS = '\u001f'
const RS = '\u001e'
const here = () => process.platform === 'darwin'
const notHere = () => ({ ok: false, reason: 'not-mac', detail: process.platform })

/** AppleScript as a string literal. */
const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

/** Run AppleScript. The first call may wait for the person's OK in macOS's Automation window — a timeout says exactly that. */
function osa(script, timeoutMs = 20000) {
  return new Promise((resolve) => {
    let done = false
    const finish = (v) => { if (!done) { done = true; resolve(v) } }
    let out = ''
    let err = ''
    let p
    try { p = spawn('osascript', ['-'], { stdio: ['pipe', 'pipe', 'pipe'] }) } catch (e) { return finish({ ok: false, reason: 'no-osascript', err: String(e) }) }
    const timer = setTimeout(() => { try { p.kill() } catch { /* gone */ } finish({ ok: false, reason: 'automation-pending', err: 'timeout' }) }, timeoutMs)
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('error', (e) => { clearTimeout(timer); finish({ ok: false, reason: 'no-osascript', err: e.message }) })
    p.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) return finish({ ok: true, out: out.replace(/\n$/, '') })
      const reason = /-1743|not authori[sz]ed/i.test(err) ? 'automation-denied' : /-600|isn.t running/i.test(err) ? 'not-running' : 'osascript'
      finish({ ok: false, reason, err: err.trim().slice(0, 300) })
    })
    p.stdin.end(script)
  })
}

const LIST = `if application "Google Chrome" is not running then return "NOT_RUNNING"
tell application "Google Chrome"
  set fs to character id 31
  set rs to character id 30
  set out to ""
  repeat with w from 1 to count of windows
    try
      set ai to active tab index of window w
      repeat with t from 1 to count of tabs of window w
        set out to out & w & fs & t & fs & (t = ai) & fs & (URL of tab t of window w) & fs & (title of tab t of window w) & rs
      end repeat
    end try
  end repeat
  return out
end tell`

/** The rows of the AppleScript list. */
function parseList(out) {
  return String(out ?? '').split(RS).filter(Boolean).map((row) => {
    const [w, t, active, url, ...title] = row.split(FS)
    return { w: Number(w), t: Number(t), active: active === 'true', url: url ?? '', title: title.join(' ').trim() }
  }).filter((r) => Number.isInteger(r.w) && Number.isInteger(r.t))
}

/** The host of an address (the scheme for chrome:// and the like). */
function hostOf(url) {
  try { const u = new URL(url); return u.host || `${u.protocol.replace(/:$/, '')}:` } catch { return '' }
}

/** Only http(s), re-serialised by the URL parser. */
function cleanUrl(v) {
  if (typeof v !== 'string' || v.length > 2000) return null
  try { const u = new URL(v.trim()); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null } catch { return null }
}

const isHost = (s) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s)

/** How well a tab answers the query: 4 the same address, 3 an address that starts with it or the same host, 1 every word in the title
 * or the address, 0 none. */
function rank(row, query) {
  const ql = String(query).trim().toLowerCase()
  if (!ql) return 0
  if (/^https?:\/\//.test(ql)) {
    const nq = ql.replace(/\/+$/, '')
    const nu = row.url.toLowerCase().replace(/\/+$/, '')
    return nu === nq ? 4 : nu.startsWith(nq) ? 3 : 0
  }
  if (isHost(ql)) {
    const h = hostOf(row.url).toLowerCase()
    if (h === ql || h.endsWith(`.${ql}`)) return 3
  }
  const hay = `${row.title} ${row.url}`.toLowerCase()
  return ql.split(/\s+/).filter(Boolean).every((word) => hay.includes(word)) ? 1 : 0
}

/** The best tab: the highest rank, then the front window, then the leftmost tab. */
function pick(rows, query) {
  return rows.map((r) => [rank(r, query), r]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0] || a[1].w - b[1].w || a[1].t - b[1].t)[0]?.[1] ?? null
}

/** Every window and tab of Chrome on this Mac, every profile. */
async function tabs() {
  if (!here()) return notHere()
  const r = await osa(LIST)
  if (!r.ok) return r
  if (r.out === 'NOT_RUNNING') return { ok: false, reason: 'not-running' }
  return { ok: true, rows: parseList(r.out) }
}

const FOCUS = (w, t, url) => `tell application "Google Chrome"
  if (count of windows) < ${w} then return "MOVED"
  if (count of tabs of window ${w}) < ${t} then return "MOVED"
  if URL of tab ${t} of window ${w} is not ${q(url)} then return "MOVED"
  set active tab index of window ${w} to ${t}
  set index of window ${w} to 1
  activate
  return "OK"
end tell`

/** Bring the tab that answers the query before the person's eyes. Nothing found — nothing is opened. */
async function focus(query) {
  if (!here()) return notHere()
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const list = await tabs()
    if (!list.ok) return list
    const row = pick(list.rows, query)
    if (!row) return { ok: false, reason: 'not-found' }
    const r = await osa(FOCUS(row.w, row.t, row.url))
    if (!r.ok) return r
    if (r.out === 'OK') return { ok: true, tab: { w: row.w, t: row.t, title: row.title, host: hostOf(row.url) } }
  }
  return { ok: false, reason: 'moved' }
}

const localState = () => path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'Local State')

/** Chrome's profiles: folder, name, account. */
function profiles(file = localState()) {
  try {
    const cache = JSON.parse(fs.readFileSync(file, 'utf8'))?.profile?.info_cache ?? {}
    return Object.entries(cache).map(([dir, v]) => ({ dir, name: String(v?.name ?? ''), email: String(v?.user_name ?? '') }))
  } catch { return [] }
}

/** A name or an account to one profile folder: the folder, the exact name or account, then a unique part of them. */
function resolveProfile(query, list) {
  const ql = String(query ?? '').trim().toLowerCase()
  if (!ql) return { ok: false, reason: 'no-profile' }
  const exact = list.filter((p) => p.dir.toLowerCase() === ql || p.name.toLowerCase() === ql || p.email.toLowerCase() === ql)
  if (exact.length === 1) return { ok: true, profile: exact[0] }
  // «fractera.ai» and «Fractera.ai» both live on this Mac (measured 17:55): the letter case decides between them
  const cased = exact.filter((p) => p.name === String(query).trim())
  if (cased.length === 1) return { ok: true, profile: cased[0] }
  const part = list.filter((p) => p.name.toLowerCase().includes(ql) || p.email.toLowerCase().includes(ql))
  if (part.length === 1) return { ok: true, profile: part[0] }
  return { ok: false, reason: part.length || exact.length ? 'profile-ambiguous' : 'no-profile', names: (exact.length ? exact : part.length ? part : list).map((p) => p.name) }
}

/** r672442251@gmail.com → r6…@gmail.com */
const maskEmail = (e) => (/^[^@]+@/.test(e) ? `${e.slice(0, 2)}…${e.slice(e.indexOf('@'))}` : e)

const OPEN = (url) => `tell application "Google Chrome"
  activate
  if (count of windows) = 0 then make new window
  tell window 1 to make new tab with properties {URL:${q(url)}}
  set active tab index of window 1 to (count of tabs of window 1)
  set index of window 1 to 1
  return "OK"
end tell`

const chromeBin = () => [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  path.join(os.homedir(), 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
].find((f) => fs.existsSync(f)) ?? null

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Open an address before the person's eyes: in the front window, or in a named profile of Chrome.
 * @param {unknown} address
 * @param {{ profile?: string | null }} [opts] */
async function open(address, { profile = null } = {}) {
  if (!here()) return notHere()
  const url = cleanUrl(address)
  if (!url) return { ok: false, reason: 'bad-address' }
  if (!profile) {
    const r = await osa(OPEN(url))
    return r.ok ? { ok: true, host: hostOf(url) } : r
  }
  const found = resolveProfile(profile, profiles())
  if (!found.ok) return found
  const bin = chromeBin()
  if (!bin) return { ok: false, reason: 'no-chrome' }
  // Chrome hands the address to its running process, opens it in that profile's window and raises it (measured 17:42). Checked, never
  // re-focused by address: the same page may be open in another profile, and a focus would pick the wrong one.
  const child = spawn(bin, [`--profile-directory=${found.profile.dir}`, url], { detached: true, stdio: 'ignore' })
  child.unref()
  for (const ms of [1500, 2000]) {
    await wait(ms)
    const list = await tabs()
    const front = list.ok ? list.rows.find((r) => r.w === 1 && r.active) : null
    if (front && hostOf(front.url) === hostOf(url)) return { ok: true, host: hostOf(url), profile: found.profile.name }
  }
  return { ok: true, host: hostOf(url), profile: found.profile.name, front: 'unconfirmed' }
}

/** May this element drive the browser of this computer? null — yes; else the reason. The browser is the architect's: an element on
 * its own person's subscription (689) or an app of its own (804-3: another owner's app, `element-app.cjs`) does not drive it. */
function elementMay(root, id) {
  let app = 'project'
  try { app = require('../web4-items/element-app.cjs').appOf(String(id), root) } catch { /* the default */ }
  if (app === 'own') return 'own-app'
  if (fs.existsSync(path.join(root, 'data', 'services', String(id), 'claude'))) return 'own-subscription'
  return null
}

module.exports = { tabs, focus, open, profiles, resolveProfile, maskEmail, parseList, hostOf, cleanUrl, rank, pick, elementMay, here, FS, RS }
