// THE GUARD OF ONE READER OF «WHERE THE NODE LIVES» (node step 741-7; the owner approved 2026-11-14: «да, утверждаю 741 и D31–D37 -> go»).
// Where the node lives — a person's computer or a dedicated server — has ONE answer: the record its installation wrote
// (`lib/hosting/place.mjs`, 741-2), asked by the browser through `/api/node/place` (`components/node-state/use-node-place.client.ts`).
// ✗ Before 741 each widget decided by itself: the hosting page read a quick-tunnel name as «server» (measured 2026-11-14), and an SSH
// window to a server said «localhost» — «this computer» — on a server. This guard refuses a NEW file that decides it on its own:
//   A. reading `data/node/server.json` for its `phase` / `independent` (the server's launch mark) outside the reader;
//   B. asking `isTemporaryHostname` / `isLoopbackHostname` about `window.location.hostname` (or a `host` taken from it);
//   C. (744-1) a place check in `proxy/common.ts` — the proxy is two files, `proxy/computer.ts` and `proxy/server.ts`, chosen once by the
//      entry `proxy.ts`; what both do may not ask where it runs (the place, the place-aware temporary address), its comments aside.
// The files below may keep doing it — each says WHY: they name the ADDRESS the person came by, or decide something about the BROWSER
// itself, never where the node lives. A new entry is a decision with its reason, not a way around the guard.
// `node scripts/check-place-readers.mjs [--root <folder>]` → `===PLACE_READERS_OK===` or `===PLACE_READERS_FAILED=== <n>`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const at = args.indexOf('--root')
const ROOT = at >= 0 && args[at + 1] ? args[at + 1] : process.cwd()

const ALLOW_A = new Map([
  ['lib/hosting/phase.cjs', 'the phase reader itself (live · silent) — read before Next starts'],
  ['lib/hosting/place.mjs', 'the place reader itself — the launch mark is its second source'],
  ['scripts/dedicated-server/launch.sh', 'the server side writes the mark'],
])
const KIT_TELEGRAM = /\/_agent-kit\/(core\/)?server\/telegram\.cjs$/ // the agent kits ask the PHASE `silent` (a rehearsal), not the place

const ALLOW_B = new Map([
  ['app/[lang]/(architectLayer)/_components/menu-mode-switch.client.tsx', 'names the address: the menu mode is read-only on a temporary address'],
  ['app/[lang]/(architectLayer)/_components/owner-band.client.tsx', 'names the address the person came by; the place picks the words (741-6)'],
  ['components/domain/domain-ladder.client.tsx', 'names the address: the ladder is read-only on a temporary address'],
  ['components/domain/static-copy.client.tsx', 'names the address: the copy button is read-only on a temporary address'],
  ['components/element-design/use-design-state.client.ts', 'decides about the browser: previews open on this machine'],
  ['components/element-settings/site-settings.client.tsx', 'decides about the browser: links to this machine'],
  ['components/node-state/dead-address-alarm.client.tsx', 'names the address; the place hides it on a server (741-6)'],
  ['components/node-state/local-tab-mark.client.tsx', 'decides about the browser: marks the tab opened on this machine'],
  ['components/node-state/online-bar.client.tsx', 'decides about the browser (its own loopback); the place hides it on a server (741-6)'],
  ['components/node-state/open-on-this-computer.client.tsx', 'decides about the browser; the place stops it on a server (741-6)'],
  ['components/node-state/origin-notice.client.tsx', 'names the address: the update banner is read-only on a temporary address'],
  ['components/node-state/temporary-address-alarm.client.tsx', 'names the address; the place hides it on a server (741-6)'],
  ['components/preview/element-preview.client.tsx', 'decides about the browser: the preview frame on this machine'],
  ['components/pwa/install-prompt.client.tsx', 'decides about the browser: no install prompt on a temporary or loopback address'],
  ['components/shell/shell-account.client.tsx', 'names the address: sign-in is closed on a temporary address (the shell kit)'],
])

const SCAN = ['app', 'lib', 'components', 'scripts', '_tools', 'sections', 'proxy']
const EXT = /\.(ts|tsx|mjs|cjs|js|sh)$/
const files = []
const walk = (dir) => {
  let names = []
  try { names = readdirSync(dir) } catch { return }
  for (const n of names) {
    if (n === 'node_modules' || n.startsWith('.')) continue
    const p = join(dir, n)
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p)
    else if (EXT.test(n) && !/\.test\.|\.tpl$/.test(n)) files.push(p)
  }
}
for (const d of SCAN) walk(join(ROOT, d))
for (const f of ['proxy.ts', 'server.js']) { try { statSync(join(ROOT, f)); files.push(join(ROOT, f)) } catch { /* absent */ } }

const SELF = 'scripts/check-place-readers.mjs'
const RULE_B = /is(Temporary|Loopback)Hostname\((window\.location\.hostname|host)\)/
const COMMON = 'proxy/common.ts'
const RULE_C = /\b(placeKind|nodePlace|measurePlace|isTemporaryPublicAddress|temporaryFor|isTemporaryHostname|isBareIpHostname)\b|hosting\/place\.mjs|auth\/temporary-address/
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
const bad = []
let commonSeen = false
for (const file of files) {
  const rel = relative(ROOT, file).split('\\').join('/')
  if (rel === SELF) continue
  const text = readFileSync(file, 'utf8')
  if (/server\.json/.test(text) && /\.phase\b|phase ===|\bindependent\b/.test(text) && !ALLOW_A.has(rel) && !KIT_TELEGRAM.test(`/${rel}`)) {
    bad.push(`  ✗ ${rel}: reads the server's launch mark for its phase — ask lib/hosting/place.mjs (placeKind / nodePlace) or phase.cjs`)
  }
  if (RULE_B.test(text) && !ALLOW_B.has(rel)) {
    bad.push(`  ✗ ${rel}: decides from the address bar — where the node lives comes from useNodePlace() (components/node-state/use-node-place.client.ts)`)
  }
  if (rel === COMMON) {
    commonSeen = true
    const hit = code(text).match(RULE_C)
    if (hit) bad.push(`  ✗ ${rel}: asks where the node lives («${hit[0]}») — a rule of one place goes to proxy/computer.ts or proxy/server.ts`)
  }
}
if (existsSync(join(ROOT, 'proxy.ts')) && existsSync(join(ROOT, 'proxy')) && !commonSeen) bad.push(`  ✗ ${COMMON}: not found — the proxy's common half moved?`)
console.log('check-place-readers — one reader of «where the node lives» (741-7)')
if (bad.length) {
  console.log(bad.join('\n'))
  console.log(`===PLACE_READERS_FAILED=== ${bad.length}`)
  process.exit(1)
}
console.log(`  ✓ ${files.length} files: no new place guess outside the reader (${ALLOW_A.size + ALLOW_B.size} named exceptions, each with its reason)`)
console.log('===PLACE_READERS_OK===')
