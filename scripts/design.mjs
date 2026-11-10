#!/usr/bin/env node
// npm run design — ПУТЬ ДИЗАЙНА ЭЛЕМЕНТА ИЗ TELEGRAM (узел, шаг 715-5). Владелец 2026-11-10: «мы ставим целью возможность создания проекта
// прямо из Telegram в том числе и дизайна поэтому существующие навыки должны позволить пройти все процедуры настройки полностью или
// частично … прямо через Telegram». Те же действия, что у вкладки «Строительство → Дизайн», через ту же дверь ядра
// (`/api/node/element-design`, хозяин за клавиатурой проходит её замок по петле): библиотека, выбор навыка для теста, референс — ссылка
// или файл (фото из Telegram ложится в объектное хранилище узла), генерация тестовой главной страницы, её снимки для чата, утверждение.
// Главный агент зовёт это по словам человека (навык `design-and-settings-of-elements`); утверждение — только после его «да».
//
//   npm run design -- <element> state
//   npm run design -- <element> library [words…]
//   npm run design -- <element> choose <mark>            (a mark from «library»)
//   npm run design -- <element> drop <mark>
//   npm run design -- <element> ref <mark> <https://…|file> [--caption "…"]
//   npm run design -- <element> generate <mark> [--scripts-yes]
//   npm run design -- <element> shots <test page id>      (two PNG files for the chat)
//   npm run design -- <element> approve <test page id>    (only after the person's «yes»)
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const ROOT = process.cwd()
const [element, command, ...rest] = process.argv.slice(2)
const flag = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null }
const words = rest.filter((w, i) => !w.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')))
const fail = (msg) => { console.log(`===DESIGN_FAIL=== ${msg}`); process.exit(1) }
if (!element || !command) fail('usage: npm run design -- <element> state|library|choose|drop|ref|generate|shots|approve …')

let port = 24680
try { port = JSON.parse(readFileSync(join(ROOT, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* the core's default port */ }
const CORE = `http://localhost:${port}`
const DOOR = `${CORE}/api/node/element-design`

async function get(query) {
  const r = await fetch(`${DOOR}?item=${encodeURIComponent(element)}${query}`, { cache: 'no-store' }).catch((e) => fail(`the core did not answer: ${e.message}`))
  const j = await r.json().catch(() => null)
  if (!j?.ok) fail(j?.error ?? `the door answered ${r.status}`)
  return j
}
async function act(payload) {
  const r = await fetch(DOOR, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item: element, ...payload }) }).catch((e) => fail(`the core did not answer: ${e.message}`))
  const j = await r.json().catch(() => null)
  if (!j?.ok) fail(`${j?.reason ? `${j.reason}: ` : ''}${j?.error ?? `the door answered ${r.status}`}`)
  return j
}
const pageUrl = (id) => `${CORE}/api/node/element-design?item=${encodeURIComponent(element)}&shot=${encodeURIComponent(id)}&size=desktop`

function printState(s) {
  const live = s.prototypes.filter((p) => !p.archived)
  console.log(`saved for testing: ${s.skills.length} · generating: ${s.pending.length ? s.pending.join(', ') : 'none'} · the element's agent ${s.busy ? 'is busy' : 'is free'}`)
  for (const k of s.skills) {
    const mine = live.filter((p) => p.skill === k.mark)
    const words = mine.length ? mine.map((p) => `${p.id} — ${p.status === 'pinned' ? 'APPROVED' : p.status === 'draft' ? 'being built' : 'generated'}${s.building.includes(p.id) ? ' (the element is being built, 1–2 min)' : ''}`).join('; ') : 'not generated'
    console.log(`- ${k.name} (${k.mark})${k.github ? ` · ${k.github}` : ''}: ${words}; references ${s.refs.filter((r) => r.mark === k.mark).length}`)
  }
  const archived = s.prototypes.filter((p) => p.archived).map((p) => p.id)
  if (archived.length) console.log(`in the archive: ${archived.join(', ')}`)
  console.log(`price of one generation: a design session of the element's agent on ${s.limits.own ? "the element's own" : "the node's"} subscription; used now 5 h ${s.limits.fiveHour ?? '?'} % · 7 d ${s.limits.sevenDay ?? '?'} %`)
}

if (command === 'state') {
  printState(await get(''))
} else if (command === 'library') {
  const j = await get(`&q=${encodeURIComponent(words.join(' '))}`)
  if (typeof j.library === 'number') console.log(`Fractera keeps ${j.library} design skills of third-party developers; the closest first:`)
  for (const [group, list] of [['your collection', j.own], ["the node's base", j.base], ["Fractera's catalog", j.catalog]]) {
    if (!list?.length) continue
    console.log(`\n${group}:`)
    for (const s of list.slice(0, 10)) console.log(`- ${s.name} · ${s.source}${s.github ? ` · ${s.github}` : ''}${s.installs ? ` · ${s.installs} installs` : ''}${s.scripts ? ' · has scripts' : ''}\n  mark: ${s.mark}\n  ${String(s.summary).slice(0, 160)}`)
  }
} else if (command === 'choose') {
  const mark = words[0] ?? fail('which skill? — a mark from «library»')
  const j = await get(`&q=${encodeURIComponent(words.slice(1).join(' '))}`)
  const s = [...j.own, ...j.base, ...j.catalog].find((x) => x.mark === mark) ?? fail(`no skill ${mark} in the library — run «library» with words that find it`)
  await act({ action: 'add-skill', skill: s })
  printState(await act({ action: 'set-test', mark, test: true }))
} else if (command === 'drop') {
  printState(await act({ action: 'remove-skill', mark: words[0] ?? fail('which skill?') }))
} else if (command === 'ref') {
  const [mark, what] = words
  if (!mark || !what) fail('ref <mark> <https://…|file> [--caption "…"]')
  const caption = flag('--caption') ?? ''
  if (/^https?:\/\//.test(what)) printState(await act({ action: 'add-ref', mark, url: what, caption }))
  else {
    const file = resolve(what)
    if (!existsSync(file)) fail(`no file ${file}`)
    const fd = new FormData()
    fd.append('file', new Blob([readFileSync(file)]), basename(file))
    fd.append('title', caption || basename(file))
    const r = await fetch(`${CORE}/api/media/upload`, { method: 'POST', body: fd }).catch((e) => fail(`the core did not answer: ${e.message}`))
    const j = await r.json().catch(() => null)
    if (!j?.ok || !j.item?.id) fail(`the node's storage did not take the picture: ${j?.error ?? r.status}`)
    printState(await act({ action: 'add-ref', mark, url: `/api/media/${j.item.id}/file`, mediaId: j.item.id, caption }))
  }
} else if (command === 'generate') {
  const j = await act({ action: 'generate', mark: words[0] ?? fail('which skill?'), scriptsYes: rest.includes('--scripts-yes') })
  // Started from the main agent's chat: the element's «done» must come back to it (one cycle of supervision), so it sends the pictures.
  spawnSync(process.execPath, [join(ROOT, 'scripts', 'main-agent-cli.mjs'), 'supervise', element, 'main', '--max', '1'], { cwd: ROOT, stdio: 'ignore', timeout: 30_000 })
  console.log(`===DESIGN_STARTED=== ${j.started} — the element's agent builds the test home page (usually about ten minutes); then the core builds the element. Its «done» wakes you (one cycle of supervision): then «shots ${j.started}» gives its pictures for the chat.`)
} else if (command === 'shots') {
  const id = words[0] ?? fail('which test page?')
  const dir = join(ROOT, 'data', 'node', 'design-shots')
  mkdirSync(dir, { recursive: true })
  for (const size of ['desktop', 'mobile']) {
    const r = await fetch(pageUrl(id).replace('size=desktop', `size=${size}`))
    if (!r.ok) { console.log(`${size}: no picture yet`); continue }
    const file = join(dir, `${element}-${id}-${size}.png`)
    writeFileSync(file, Buffer.from(await r.arrayBuffer()))
    console.log(`${size}: ${file}`)
  }
} else if (command === 'approve') {
  const j = await act({ action: 'pin', prototype: words[0] ?? fail('which test page?') })
  console.log(`===DESIGN_APPROVING=== ${j.pinning} — the element's agent makes it the element's design, archives the other test pages and deploys.`)
} else fail(`unknown command ${command}`)
