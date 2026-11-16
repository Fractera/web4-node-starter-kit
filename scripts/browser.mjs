// THE PERSON'S BROWSER FROM TELEGRAM — the main agent's command (node step 767), model-free:
//   npm run browser -- tabs                                  every window and tab of Chrome, every profile (titles and hosts only)
//   npm run browser -- focus <address, host or words>        bring that tab before the person's eyes; nothing found — nothing opened
//   npm run browser -- open <https://…> [--profile <name or account>]   open a page before their eyes (in that Chrome profile)
//   npm run browser -- profiles                              Chrome's profiles: their names and masked accounts
// Showing a page needs no extension and no model; acting INSIDE a page (read, click, type) is the Claude extension in that profile.
// macOS only (AppleScript); the first call may wait for the person's OK in macOS's window «… wants access to control Google Chrome».
// Skill help-in-browser, «Driving the browser from Telegram».
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const b = createRequire(import.meta.url)(join(ROOT, 'lib', 'node', 'browser.cjs'))
const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v ?? null }

/** One line per refusal, with what to do next. */
function refused(r, query = '') {
  const lines = {
    'not-mac': `===BROWSER_NOT_HERE=== this computer runs ${r.detail}: the browser from Telegram is built for macOS so far (Windows and Linux are not measured)`,
    'automation-pending': '===BROWSER_WAITING=== macOS is asking on the screen whether the node may control Google Chrome — the person presses OK once (npm run ask-person -- "Разрешите узлу управлять Chrome" --hint "macOS спросит: «… wants access to control Google Chrome» — нажмите OK"), then run this again',
    'automation-denied': '===BROWSER_NO_PERMISSION=== macOS refused the node control of Chrome: the person turns it on once — System Settings → Privacy & Security → Automation → the app that runs the node → Google Chrome (put it as their window: npm run ask-person)',
    'not-running': '===BROWSER_NOT_RUNNING=== Google Chrome is not open on this computer — open a page with: npm run browser -- open <address>',
    'not-found': `===BROWSER_NOT_FOUND=== no open tab answers «${query}»: nothing was opened — say so, or open it: npm run browser -- open <address>`,
    moved: '===BROWSER_REFUSED=== the tabs moved while I looked (the person is working in Chrome) — run again',
    'bad-address': '===BROWSER_REFUSED=== an address must start with https:// or http://',
    'no-chrome': '===BROWSER_REFUSED=== Google Chrome is not installed in /Applications',
    'no-profile': `===BROWSER_REFUSED=== no Chrome profile answers «${query}»${r.names?.length ? ` — profiles: ${r.names.join(', ')}` : ''}`,
    'profile-ambiguous': `===BROWSER_REFUSED=== «${query}» answers several profiles: ${r.names?.join(', ')} — name one exactly`,
  }
  console.log(lines[r.reason] ?? `===BROWSER_REFUSED=== ${r.reason}${r.err ? `: ${r.err}` : ''}`)
  process.exitCode = 1
}

const cut = (s, n = 80) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

if (args[0] === 'tabs') {
  const r = await b.tabs()
  if (!r.ok) refused(r)
  else {
    const windows = [...new Set(r.rows.map((x) => x.w))]
    console.log(`===BROWSER_TABS=== ${windows.length} window(s), ${r.rows.length} tab(s); ● — the tab each window shows; full addresses are never printed`)
    for (const w of windows) {
      console.log(`window ${w}${w === 1 ? ' (in front)' : ''}`)
      for (const x of r.rows.filter((y) => y.w === w)) console.log(`  ${x.active ? '●' : ' '} ${x.w}.${x.t} · ${cut(x.title || '(no title)')} · ${b.hostOf(x.url)}`)
    }
  }
} else if (args[0] === 'focus') {
  const query = args.slice(1).join(' ').trim()
  if (!query) refused({ reason: 'not-found' }, '')
  else {
    const r = await b.focus(query)
    if (!r.ok) refused(r, query)
    else console.log(`===BROWSER_FOCUSED=== window ${r.tab.w}, tab ${r.tab.t} · ${cut(r.tab.title)} · ${r.tab.host} — Chrome is in front; ask the person whether they see it`)
  }
} else if (args[0] === 'open') {
  const profile = flag('--profile')
  const address = args[1] ?? ''
  const r = await b.open(address, { profile })
  if (!r.ok) refused(r, profile ?? address)
  else console.log(`===BROWSER_OPENED=== ${r.host}${r.profile ? ` in the profile «${r.profile}»` : ' in the front window'}${r.front === 'unconfirmed' ? ' — Chrome took it, but its tab in front was not confirmed: ask the person' : ' — in front'}`)
} else if (args[0] === 'profiles') {
  if (!b.here()) refused({ reason: 'not-mac', detail: process.platform })
  else {
    const list = b.profiles()
    console.log(`===BROWSER_PROFILES=== ${list.length} Chrome profile(s): name · account (masked) · folder`)
    for (const p of list) console.log(`  ${p.name || '(no name)'} · ${p.email ? b.maskEmail(p.email) : '—'} · ${p.dir}`)
  }
} else {
  console.log('===BROWSER_USAGE=== npm run browser -- tabs | focus <address, host or words> | open <https://…> [--profile <name or account>] | profiles')
  process.exitCode = 1
}
