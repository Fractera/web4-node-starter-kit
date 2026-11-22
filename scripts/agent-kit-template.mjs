// THE AGENT KIT'S PAGES INTO AN ELEMENT TEMPLATE (node step 836-2). `npm run agent-kit:template -- <template workshop folder> [--dry]`.
//
// The owner, 2026-11-22 (Telegram 711, 719, 721): an element's agent pages — Claude subscription, terminal, Telegram bot — live inside
// the element, behind its own sign-in; «пере используй их как есть». So the core's kit stays the ONE master and this command copies its
// client part into a template's workshop clone, unchanged, with every file it imports that the template lacks:
//   core/client/*, core/words/*, core/agent-links.tsx  →  components/agent-kit/…
//   core/client/kit-place.ts                           →  replaced by element/kit-place.ts (the element's doors and socket)
//   anything else it imports from the core (a tool, a voice field, a status card) → the same path in the template
//   (every copy keeps its core path and its text — byte for byte, so the template's parts map sees an unedited copy)
// 🔒 A file the template already has at the same path is NEVER overwritten: identical — fine; different — named, and the run stops
//   (`===AGENT_KIT_TEMPLATE_CONFLICT===`): the template's own file wins until a person decides.
// 🔒 The server half of the kit (the bridge, tickets, sessions) never leaves the core: the element's door calls it with its own key.
// `components/agent-kit/SOURCE.md` names the core commit and every copied file — `--check` compares them (the guard of drift).

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bodyHash } from '../lib/parts/parts-map.mjs'

const CORE = join(dirname(fileURLToPath(import.meta.url)), '..')
const KIT = 'app/[lang]/(architectLayer)/architect/kits/_agent-kit'
const LIVE_LOG = 'app/[lang]/(architectLayer)/_components/live-log.client.tsx'
const TARGET = 'components/agent-kit'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const check = args.includes('--check')
const tpl = args.find((a) => !a.startsWith('--'))
if (!tpl || !existsSync(join(tpl, 'package.json'))) {
  console.log('===AGENT_KIT_TEMPLATE_FAILED=== name the template workshop folder: npm run agent-kit:template -- data/workshop/<template> [--dry|--check]')
  process.exit(1)
}

const read = (root, f) => readFileSync(join(root, f), 'utf8')
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12)
const EXTS = ['', '.ts', '.tsx', '.mjs', '.cjs', '.js', '/index.ts', '/index.tsx']

function resolve(from, spec) {
  let base
  if (spec.startsWith('@/')) base = spec.slice(2)
  else if (spec.startsWith('.')) base = normalize(join(dirname(from), spec))
  else return null
  for (const e of EXTS) {
    const p = join(CORE, base + e)
    if (existsSync(p) && statSync(p).isFile()) return base + e
  }
  return null
}

/** Where a core file goes in the template. */
function placeOf(f) {
  if (f === `${KIT}/core/client/kit-place.ts`) return `${TARGET}/client/kit-place.ts`
  if (f.startsWith(`${KIT}/core/`)) return `${TARGET}/${f.slice(`${KIT}/core/`.length)}`
  return f
}

/** The text a core file gets in the template. */
function textOf(f) {
  if (f === `${KIT}/core/client/kit-place.ts`) return read(CORE, `${KIT}/element/kit-place.ts`)
  return read(CORE, f)
}

// The kit's client part and everything it imports, followed through the core's own files.
const start = [
  ...readdirSync(join(CORE, KIT, 'core/client')).map((f) => `${KIT}/core/client/${f}`),
  ...readdirSync(join(CORE, KIT, 'core/words')).map((f) => `${KIT}/core/words/${f}`),
  `${KIT}/core/agent-links.tsx`,
]
// the files an earlier run copied are the kit's, not the template's own — followed and compared again
const SOURCE = join(tpl, TARGET, 'SOURCE.md')
const copied = new Set(existsSync(SOURCE) ? [...readFileSync(SOURCE, 'utf8').matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]) : [])
const files = new Set()
function walk(f) {
  if (files.has(f)) return
  files.add(f)
  if (f === `${KIT}/core/client/kit-place.ts`) return
  for (const m of read(CORE, f).matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
    const r = resolve(f, m[1])
    if (!r) continue
    const inKit = r.startsWith(`${KIT}/core/`)
    // a part the template already holds at the same path is the template's — not followed, not copied
    if (!inKit && r !== LIVE_LOG && existsSync(join(tpl, r)) && !copied.has(r)) continue
    walk(r)
  }
}
start.forEach(walk)
// a tool comes whole enough to stand: its entry (its card names it) with what the entry imports — the template's tools map checks it
for (const id of new Set([...files].map((f) => /^_tools\/([^/]+)\//.exec(f)?.[1]).filter(Boolean))) {
  const card = join(CORE, '_tools', id, 'tool.json')
  const entry = existsSync(card) ? JSON.parse(readFileSync(card, 'utf8')).entry : null
  if (entry && existsSync(join(CORE, '_tools', id, entry))) walk(`_tools/${id}/${entry}`)
}

const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: CORE, encoding: 'utf8' }).trim()
const plan = [...files].sort().map((f) => ({ from: f, to: placeOf(f), text: textOf(f) }))

if (check) {
  let drift = 0
  for (const p of plan) {
    const there = existsSync(join(tpl, p.to)) ? read(tpl, p.to) : null
    if (there !== p.text) { drift++; console.log(`  drift: ${p.to}${there === null ? ' (missing)' : ''}`) }
  }
  console.log(drift ? `===AGENT_KIT_TEMPLATE_DRIFT=== ${drift} file(s) differ from the core's kit — npm run agent-kit:template -- ${tpl}` : `===AGENT_KIT_TEMPLATE_OK=== ${plan.length} files match the core's kit`)
  process.exit(drift ? 1 : 0)
}

const conflicts = plan.filter((p) => !p.to.startsWith(`${TARGET}/`) && !copied.has(p.to) && existsSync(join(tpl, p.to)) && read(tpl, p.to) !== p.text)
if (conflicts.length) {
  console.log('===AGENT_KIT_TEMPLATE_CONFLICT=== the template already has its own version of:')
  for (const c of conflicts) console.log(`  ${c.to}`)
  process.exit(1)
}

for (const p of plan) {
  console.log(`${dry ? 'would copy' : 'copy'}  ${p.to}`)
  if (dry) continue
  mkdirSync(dirname(join(tpl, p.to)), { recursive: true })
  writeFileSync(join(tpl, p.to), p.text)
}
if (!dry) {
  // a tool's card travels with its files, with its provenance — as `npm run tool:take` writes it (733-9): the template's tools map
  // needs the card, and a changed body is then visibly a fork
  const tools = new Map()
  for (const p of plan) {
    const m = /^_tools\/([^/]+)\//.exec(p.to)
    if (m) tools.set(m[1], [...(tools.get(m[1]) ?? []), p.from])
  }
  for (const [id, body] of tools) {
    const cardFile = join(CORE, '_tools', id, 'tool.json')
    if (!existsSync(cardFile)) continue
    const card = JSON.parse(readFileSync(cardFile, 'utf8'))
    // the provenance names the tool by the core MAP's id (`tool-<folder>`) and its measured body — what `tool:take` and the template
    // protocol of a pin look for (✗ 836, v0.3.232: `tool: "voice-input"` read as «not the core's tool» and the pin refused)
    const mapCard = (JSON.parse(readFileSync(join(CORE, 'lib/parts/PARTS.json'), 'utf8')).parts ?? []).find((c) => c.dir === `_tools/${id}`)
    const source = { from: 'core', tool: mapCard?.id ?? `tool-${id}`, version: card.version, bodyHash: bodyHash(CORE, (mapCard?.body ?? body).filter((f) => existsSync(join(CORE, f)) && existsSync(join(tpl, f))).sort()) }
    // a recipe part the template holds as ITS OWN non-tool (both templates carry the one modal as their own composite, 735 A4) is not
    // a part of the copy here — the template's parts map would read it as «named but not used»
    const own = new Map((existsSync(join(tpl, 'lib/parts/PARTS.json')) ? JSON.parse(readFileSync(join(tpl, 'lib/parts/PARTS.json'), 'utf8')).parts ?? [] : []).map((c) => [c.id, c]))
    const parts = (card.parts ?? []).filter((x) => !(own.has(x.id) && own.get(x.id).kind !== 'tool' && !own.get(x.id).source))
    writeFileSync(join(tpl, '_tools', id, 'tool.json'), `${JSON.stringify({ ...card, parts, source }, null, 2)}\n`)
    console.log(`card  _tools/${id}/tool.json`)
  }
  // a copied file that has a card in its core folder's parts.json takes the card along (with its provenance) — the template's parts
  // map needs it; the kit's own shared piece (agent-links, imported by several widgets) gets its card here
  const coreBodies = new Map((JSON.parse(readFileSync(join(CORE, 'lib/parts/PARTS.json'), 'utf8')).parts ?? []).map((c) => [c.id, c.body]))
  const cardsByFolder = new Map()
  for (const p of plan) {
    if (p.to.startsWith('_tools/')) continue
    const folderCards = join(CORE, dirname(p.from), 'parts.json')
    if (!existsSync(folderCards)) continue
    for (const c of JSON.parse(readFileSync(folderCards, 'utf8')).parts ?? []) {
      if (c.path !== p.from) continue
      const { usedBy, body, requires, where, score, ...card } = c
      const dest = dirname(p.to)
      cardsByFolder.set(dest, [...(cardsByFolder.get(dest) ?? []), { ...card, path: p.to, source: { from: 'core', tool: c.id, version: c.version, bodyHash: bodyHash(CORE, coreBodies.get(c.id) ?? [p.from]) } }])
    }
  }
  cardsByFolder.set(TARGET, [...(cardsByFolder.get(TARGET) ?? []), {
    id: 'agent-kit-links', kind: 'composite', title: { en: 'Agent pages: next steps', ru: 'Страницы агента: дальше' },
    path: `${TARGET}/agent-links.tsx`, export: 'AgentNextLinks',
    what: { en: 'The links between this element\'s agent pages (terminal, Telegram) and the «install Telegram» note — the core\'s kit, copied.', ru: 'Ссылки между страницами агента этого элемента (терминал, Telegram) и заметка «нужен Telegram» — копия комплекта ядра.' },
    how: '<AgentNextLinks links={{ terminal, telegram }} words={agentLinksWords(lang)} /> · <TelegramAppNeeded words={agentLinksWords(lang)} />',
    words: { en: ['agent', 'terminal', 'telegram', 'links'], ru: ['агент', 'терминал', 'телеграм', 'ссылки'] },
  }])
  for (const [folder, cards] of cardsByFolder) {
    const file = join(tpl, folder, 'parts.json')
    const data = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { _: 'Cards of the reusable parts of this folder. One card per part; the map is lib/parts/PARTS.json.', parts: [] }
    const ids = new Set(cards.map((c) => c.id))
    data.parts = [...(data.parts ?? []).filter((c) => !ids.has(c.id)), ...cards]
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
    console.log(`cards ${folder}/parts.json (${cards.map((c) => c.id).join(', ')})`)
  }
  const lines = [
    '# The agent kit — a copy of the core\'s (node step 836)',
    '',
    `Copied by \`npm run agent-kit:template\` from the core of Fractera/web4-node-starter-kit at \`${commit}\`. Never edit these files`,
    'here: a fix goes into the core\'s kit (`app/[lang]/(architectLayer)/architect/kits/_agent-kit`) and comes back by the same command.',
    'Only `client/kit-place.ts` is the element\'s own (the core\'s `element/kit-place.ts`): the doors of this element and the socket.',
    '',
    '| file | from the core | sha |',
    '|---|---|---|',
    ...plan.map((p) => `| \`${p.to}\` | \`${p.from}\` | ${sha(p.text)} |`),
    '',
  ]
  writeFileSync(join(tpl, TARGET, 'SOURCE.md'), lines.join('\n'))
}
console.log(`===AGENT_KIT_TEMPLATE_OK=== ${plan.length} files ${dry ? 'would be copied' : 'copied'} into ${relative(CORE, tpl) || tpl} from the core at ${commit}`)
