// САМООПИСАНИЕ ЭЛЕМЕНТА — что главный агент знает о каждом элементе узла (узел, шаг 603-1).
//
// 🎯 Владелец 2026-10-26, после разговора с главным агентом в Telegram: «модель совершенно не понимает ни себя ни свою возможности. А как тогда
// она … может проектировать … в 62-й раз она будет строить память». Разбор того дня (федеральный отчёт «main agent does not know its node»):
// паспорта элементов верные и подробные, а команды агента показывали голую карточку A2A (служебные
// навыки шаблона, двери только из app/api) и строку роли.
//
// 🔒 Всё, что узел может измерить, узел вычисляет сам (не устаревает и не лжёт): порт, папка, вкл/выкл, двери из маршрутов кода, файлы данных
// на диске, память процессов, кто от кого зависит. Смысл — из паспорта элемента (`OWN-SERVICE-PROPS.json`: name, shortDescription,
// longDescription, accepts, returns, calls) и его роли в узле. Общее для шаблона — навык или дверь у большинства элементов — показывается одной
// строкой, а не как «умение» каждого: по данным, без ручного списка.
//
// Поиск по смыслу (`findByMeaning`): текст самоописания каждого элемента — вектором в коллекции `node-elements` элемента vectors (векторы считает
// ядро своим ключом OpenAI, как базовая память, `lib/agent-kit/memory/embed.cjs`); пересчитывается только изменившийся текст. Нет ключа, нет
// vectors или data — null, и зовущий ищет по словам, как прежде.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..', '..')
const COLLECTION = 'node-elements'
const INDEX_LEDGER = path.join(ROOT, 'data', 'node', 'self-index.json')
const COMMON_SHARE = 0.6

const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')) } catch { return fallback } }

// Папка элемента — от корня узла, а не от текущей папки (главный агент зовёт команды из data/main-agent): по адресу элемента, иначе по id —
// то же правило, что `itemDir` в `scripts/main-agent-cli.mjs` (lagrix живёт в user/lagrix под id rtyhh).
function dirOf(root, s) {
  const base = path.join(root, 'WEB4-ITEMS', s.kind === 'user' ? 'user' : 'core')
  const a = readJson(path.join(root, 'data', 'services', s.id, 'address.json'), null)?.address
  const byAddress = typeof a === 'string' && /^[a-z0-9-]{1,40}$/.test(a) ? path.join(base, a) : null
  if (byAddress && fs.existsSync(byAddress)) return byAddress
  const byId = path.join(base, s.id)
  return fs.existsSync(byId) ? byId : null
}

/** Память процессов узла, МБ: имя pm2 → МБ (один `pm2 jlist` на вызов). */
function pm2Memory() {
  const win = process.platform === 'win32'
  const r = spawnSync(win ? 'pm2.cmd' : 'pm2', ['jlist'], { cwd: ROOT, shell: win, windowsHide: true, encoding: 'utf8', timeout: 20000 })
  const out = new Map()
  try { for (const a of JSON.parse(r.stdout)) out.set(a.name, { mb: Math.round((a.monit?.memory ?? 0) / 1048576), status: a.pm2_env?.status }) } catch { /* pm2 не ответил */ }
  return out
}

const METHODS = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g

// Двери элемента — из его маршрутов (файлы route.ts в папке app), а не из записи о них. Страницы под [lang] — не двери для соседей.
function scanDoors(dir, privatePrefixes) {
  const app = path.join(dir, 'app')
  const doors = []
  const walk = (d, segs) => {
    let names
    try { names = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const n of names) {
      if (n.isDirectory()) {
        if (n.name === 'node_modules' || n.name.startsWith('.') || n.name === '[lang]') continue
        walk(path.join(d, n.name), [...segs, n.name])
      } else if (/^route\.(ts|tsx|js|mjs)$/.test(n.name)) {
        // [[...x]] и [...x] — «всё дальше» (*), [x] — параметр (:x), (группа) — не часть адреса.
        const p = '/' + segs.filter((s) => !/^\(.*\)$/.test(s)).map((s) => (/^\[\[?\.\.\..+\]\]?$/.test(s) ? '*' : s.replace(/^\[(.+)\]$/, ':$1'))).join('/')
        if (privatePrefixes.some((x) => p === x || p.startsWith(`${x}/`))) continue
        let src = ''
        try { src = fs.readFileSync(path.join(d, n.name), 'utf8') } catch { /* нечитаемый — без методов */ }
        const methods = [...new Set([...src.matchAll(METHODS)].map((m) => m[1] || m[2]))]
        doors.push({ path: p === '/' ? '/' : p, methods: methods.length ? methods : ['?'] })
      }
    }
  }
  walk(app, [])
  return doors.sort((a, b) => a.path.localeCompare(b.path))
}

/** Файлы данных элемента на диске этого компьютера: базы (*.db, *.sqlite) и общий объём папки `data`. */
function dataOf(dir) {
  const base = path.join(dir, 'data')
  const dbs = []
  let bytes = 0
  let files = 0
  const walk = (d, depth) => {
    let names
    try { names = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const n of names) {
      const p = path.join(d, n.name)
      if (n.isDirectory()) { if (depth < 6 && files < 50000) walk(p, depth + 1); continue }
      let size = 0
      try { size = fs.statSync(p).size } catch { /* исчез */ }
      bytes += size
      files++
      if (/\.(db|sqlite|sqlite3)$/.test(n.name)) {
        let wal = 0
        try { wal = fs.statSync(`${p}-wal`).size } catch { /* нет журнала */ }
        dbs.push({ rel: path.relative(dir, p).split(path.sep).join('/'), bytes: size, walBytes: wal })
      }
    }
  }
  walk(base, 0)
  return { exists: fs.existsSync(base), dbs, bytes, files }
}

const human = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`)

/**
 * Паспорт элемента: папкой `OWN-SERVICE-PROPS/` (шаблоны), иначе файлом в корне — так его несёт элемент из чужого репозитория (367-4).
 * 407: без второго пути такой элемент для поиска узла был безымянным: имя и описание есть только в корневом файле (`summary` — его
 * прежнее поле описания).
 */
function passportOf(dir) {
  const own = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), null)
  if (own) return own
  const old = readJson(path.join(dir, 'OWN-SERVICE-PROPS.json'), null)
  return old ? { ...old, shortDescription: old.shortDescription || old.summary || '' } : {}
}

/** Самоописания всех элементов реестра (одно чтение диска и один pm2 на вызов). */
// 670-3: `areas` — карта главного агента: `{ <id>: { area, growsInto[] } }` (`WEB4-ITEMS-REGISTRY/areas.json` + `data/node/areas.json`).
function describeAll({ root = ROOT, roles = {}, areas = {}, addressOf = (id) => id, withMemory = true } = {}) {
  const reg = readJson(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), { services: [] })
  const services = reg.services ?? []
  const mem = withMemory ? pm2Memory() : new Map()
  const raw = services.map((s) => {
    const dir = dirOf(root, s)
    const passport = dir ? passportOf(dir) : {}
    const card = dir ? readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'A2A-CARD.json'), {}) : {}
    const ext = (card.capabilities?.extensions ?? []).find((x) => String(x?.uri ?? '').includes('/a2a/ext/node/'))?.params ?? {}
    const privatePrefixes = Array.isArray(ext.private) ? ext.private : []
    const off = s.off && typeof s.off === 'object' ? (typeof s.off.reason === 'string' ? s.off.reason : s.off.reason?.en ?? 'no reason') : null
    return {
      id: s.id,
      address: addressOf(s.id),
      name: passport.name || s.id,
      kind: passport.elementType === 'custom' || s.born || s.id === 'root' ? 'custom' : 'native',
      port: s.port ?? null,
      folder: dir ? path.relative(root, dir).split(path.sep).join('/') : null,
      visibility: passport.visibility || ext.visibility || null,
      on: !off,
      offReason: off,
      byRule: Boolean(s.off?.byRule), // 663-3: усыплён правилом нагрузки
      role: roles[s.id] || s.role || '',
      // 670-3 (владелец 2026-11-07: «Какие тогда ещё в будущем это элемент может решать задачи? А куда это описать?»): поле, для которого
      // элемент — естественный дом, и работы, в которые он может вырасти; не то, что он делает сейчас (это навыки и двери).
      area: typeof areas[s.id]?.area === 'string' ? areas[s.id].area : '',
      growsInto: Array.isArray(areas[s.id]?.growsInto) ? areas[s.id].growsInto.filter((g) => typeof g === 'string' && g.trim()) : [],
      short: passport.shortDescription || '',
      long: passport.longDescription || '',
      accepts: passport.accepts || '',
      returns: passport.returns || '',
      calls: Array.isArray(passport.calls) ? passport.calls : [],
      skills: (card.skills ?? []).map((k) => ({ id: k.id, description: k.description || '', examples: k.examples || [] })),
      doors: dir ? scanDoors(dir, privatePrefixes) : [],
      data: dir ? dataOf(dir) : { exists: false, dbs: [], bytes: 0, files: 0 },
      memory: { process: mem.get(`fractera-svc-${s.id}`)?.mb ?? null, watcher: mem.get(`fractera-svc-${s.id}-watch`)?.mb ?? null },
    }
  })
  // Общее для шаблона — по данным: навык или дверь у большинства элементов.
  const count = (pick) => {
    const m = new Map()
    for (const e of raw) for (const k of new Set(pick(e))) m.set(k, (m.get(k) ?? 0) + 1)
    return m
  }
  const skillCount = count((e) => e.skills.map((k) => k.id))
  const doorCount = count((e) => e.doors.map((d) => d.path))
  const isCommon = (n) => raw.length >= 3 && n / raw.length >= COMMON_SHARE
  const commonSkills = [...skillCount].filter(([, n]) => isCommon(n)).map(([k]) => k).sort()
  const commonDoors = [...doorCount].filter(([, n]) => isCommon(n)).map(([k]) => k).sort()
  return raw.map((e) => ({
    ...e,
    ownSkills: e.skills.filter((k) => !commonSkills.includes(k.id)),
    ownDoors: e.doors.filter((d) => !commonDoors.includes(d.path)),
    commonSkills,
    calledBy: raw.filter((o) => o.id !== e.id && o.calls.includes(e.id)).map((o) => o.id),
  }))
}

const firstSentence = (t, n = 240) => {
  const s = String(t || '').trim()
  const m = s.match(/^(.+?[.!?])(\s|$)/)
  const one = m ? m[1] : s
  return one.length > n ? `${one.slice(0, n - 1)}…` : one
}

/** Одна строка о элементе для списка (`contacts --all`). */
function listLine(e) {
  const what = e.short || e.role || firstSentence(e.long) || 'no description yet'
  return `- ${e.id} · ${e.address} · ${e.kind} · ${e.on ? 'on' : `OFF (${e.offReason})`} — ${firstSentence(what, 260)}`
}

/** Полное самоописание одного элемента (`card <id>`): ответы на вопросы «что это, где живёт, где данные, как вызвать, с кем связан». */
function cardText(e) {
  const lines = []
  const mem = [e.memory.process != null ? `process ${e.memory.process} MB` : null, e.memory.watcher != null ? `watcher ${e.memory.watcher} MB` : null].filter(Boolean).join(' + ')
  lines.push(`${e.id} · ${e.name} · ${e.kind} element · ${e.on ? `on${e.byRule ? ' (turned on by the node: free memory above 1 GB)' : ''}` : `TURNED OFF (${e.offReason})`}${mem ? ` · memory ${mem}` : ''}`)
  lines.push(`What it is: ${e.short || e.role || 'no description in its passport yet'}`)
  if (e.long) lines.push(`What it does: ${e.long}`)
  if (e.role && e.role !== e.short) lines.push(`Its role in this node: ${e.role}`)
  // 670-3: область — куда направлять НОВЫЕ работы этого поля (маршрут строит его агент), а не обещание, что он их уже умеет.
  if (e.area || e.growsInto.length) lines.push(`Its area: ${e.area || '—'}${e.growsInto.length ? ` · may grow into (not built yet unless a skill below says so): ${e.growsInto.join('; ')}` : ''}`)
  lines.push(`Where it lives: a process on this computer (port ${e.port ?? '?'}), folder ${e.folder ?? '?'}, address ${e.address}${e.visibility === 'node' ? '; reachable only inside this node, never from the internet' : e.visibility ? `; visibility ${e.visibility}` : ''}.`)
  if (e.data.dbs.length) {
    lines.push(`Its data: on this computer's disk — ${e.data.dbs.map((d) => `${d.rel} (${human(d.bytes)}${d.walBytes ? ` + journal ${human(d.walBytes)}` : ''})`).join(', ')}; the data folder holds ${e.data.files} file(s), ${human(e.data.bytes)}. No cloud, no subscription.`)
  } else if (e.data.exists && e.data.bytes > 0) {
    lines.push(`Its data: on this computer's disk — ${e.data.files} file(s) in ${e.folder}/data, ${human(e.data.bytes)}. No cloud, no subscription.`)
  } else {
    lines.push('Its data: keeps none of its own here (it uses the node\'s data elements).')
  }
  if (e.accepts) lines.push(`Takes: ${e.accepts}`)
  if (e.returns) lines.push(`Gives: ${e.returns}`)
  lines.push(`It calls: ${e.calls.length ? e.calls.join(', ') : 'nobody'} · called by: ${e.calledBy.length ? `${e.calledBy.length} element(s) — ${e.calledBy.join(', ')}` : 'nobody named in passports'}`)
  // Дверь, принимающая все пять методов, — «any»: перечислять их — шум.
  const methodsOf = (d) => (d.methods.length >= 5 ? 'any' : d.methods.join('/'))
  if (e.ownDoors.length) lines.push(`Its own doors: ${e.ownDoors.map((d) => `${methodsOf(d)} ${d.path}`).join(' · ')}`)
  else lines.push('Its own doors: none besides the ones every element has')
  for (const k of e.ownSkills) lines.push(`Skill ${k.id} — ${firstSentence(k.description, 220)}`)
  if (e.commonSkills.length) lines.push(`Like every element it also has: ${e.commonSkills.join(', ')} (the shared frame of the template).`)
  return lines.join('\n')
}

// ── Поиск по смыслу ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

function indexText(e) {
  return [e.name, e.short, e.long, e.role && e.role !== e.short ? e.role : '', ...e.ownSkills.map((k) => `${k.id.replace(/-/g, ' ')}: ${k.description} ${k.examples.join('; ')}`)]
    .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 6000)
}

/**
 * 626-4: what the index keeps of an element besides its whole description — short pieces, each searched on its own; the best piece and
 * the whole make the element's score (`findByMeaning`). ✗ Measured
 * 2026-11-03: the node's model (MiniLM-L12) reads 128 tokens of a text, and one vector of the whole description (up to 6,000 characters,
 * fine for OpenAI's 8,191 tokens) left the right element first in 19 of 20 intents but at 0.118–0.572, under the best score of jobs the
 * node lacks (up to 0.284) — no threshold between them. Pieces: the name with the short description, the long one by about 45 words, the
 * role, every skill.
 */
// 670-4: every piece carries its KIND, so `find` can say why an element matched — «does it now» (a skill), «its area covers it» (the
// area or a job it may grow into, 670-3) or only «what it is» (its name, description, role). ✗ Measured 2026-11-07: «пересказ ролика
// YouTube» → storage 0.38 on the words of its description («videos») — offered as a home for a job it cannot do.
function indexPieceList(e) {
  const out = [{ kind: 'name', text: [e.name, e.short].filter(Boolean).join('. ') }]
  let cur = ''
  for (const s of String(e.long || '').split(/(?<=[.!?])\s+/)) {
    if (cur && `${cur} ${s}`.split(/\s+/).length > 45) { out.push({ kind: 'description', text: cur }); cur = '' }
    cur = cur ? `${cur} ${s}` : s
  }
  out.push({ kind: 'description', text: cur })
  if (e.role && e.role !== e.short) out.push({ kind: 'role', text: e.role })
  for (const k of e.ownSkills) out.push({ kind: 'skill', ref: k.id, text: `${k.id.replace(/-/g, ' ')}: ${k.description} ${k.examples.join('; ')}`.slice(0, 600) })
  // The area and the jobs it may grow into — ONE piece, the way a skill is its description with its examples. ✗ Measured 2026-11-07 on 35
  // intents: each job as its own short piece matched by topic words — «write a post in the voice of an author» → memory 0.52 through
  // «a diary by voice», «пересказ ролика YouTube» → storage 0.47 through «video posters and trimming».
  if (e.area || e.growsInto?.length) out.push({ kind: 'area', text: [e.area, e.growsInto?.length ? `It may grow into: ${e.growsInto.join('; ')}.` : ''].filter(Boolean).join(' ') })
  return out.map((p) => ({ ...p, text: String(p.text).replace(/\s+/g, ' ').trim() })).filter((p) => p.text).slice(0, 36)
}
function indexPieces(e) {
  return indexPieceList(e).map((p) => p.text)
}

/**
 * 670-4: WHY an element matched, in words the main agent acts on. Never a verdict by score alone — measured 2026-11-07 on 35 intents:
 * right elements matched by their description at 0.30–0.57, jobs the node lacks at 0.29–0.38 (storage 0.38 for «пересказ ролика
 * YouTube»): no score separates them, a cut at 0.40 would lose three real hits (a photo link → storage, a pricing section → blocks,
 * «войти на сайт по паролю» → auth). So the kind of the best piece is said, and the card decides.
 */
function whyOf(hit) {
  const b = hit?.best
  if (!b) return ''
  const said = String(b.text || '').replace(/\s+/g, ' ').trim()
  const quote = said ? ` («${said.length > 90 ? `${said.slice(0, 89)}…` : said}»)` : ''
  if (b.kind === 'skill') return `does it now — skill ${b.ref}`
  if (b.kind === 'area') return `nearest by its AREA${quote} — if the job is of that field, it is a route its own agent builds there, not a new element; confirm from its card`
  const what = b.kind === 'whole' ? 'its whole description' : `its ${b.kind}`
  return `matches only ${what}${quote} — not a skill, not its area: read its card, it may not do this job at all`
}

/**
 * Ближайшие по смыслу элементы к словам задачи: [{ id, score }] (лучший первым) или null, если поиск по смыслу недоступен (нет элемента
 * vectors или data, или его элемент embeddings не отвечает). Индекс обновляется только для изменившихся текстов; удалённые элементы из него
 * стираются. 626-4: ядро шлёт ТЕКСТЫ — самоописание в `POST /vectors { text }`, задачу в `POST /vectors/search { query }`; векторы считает
 * элемент embeddings на этом компьютере, ключ OpenAI не нужен.
 */
// 670-4: the index's layout. 2 — the whole descriptions in their own collection (`WHOLE`), so the pieces (now more of them: the area and
// the jobs it may grow into) never push an element's whole out of the 100 vectors a search returns; a ledger of another layout is dropped
// vector by vector and indexed again.
const LAYOUT = 2
const WHOLE = 'node-elements-whole'

async function findByMeaning(query, descriptions, { k = 5, ms = 15000, collection = COLLECTION, wholeCollection = WHOLE, ledgerFile = INDEX_LEDGER, prefix = 'self', embed: injected = null } = {}) {
  let embed = injected
  if (!embed) { try { embed = require('../agent-kit/memory/embed.cjs') } catch { return null } }
  const e = embed.env()
  const base = embed.dataUrl()
  if (!base || !e.DATA_SECRET) return null
  try {
    const kind = await embed.kind(e, base, ms)
    const ledger = { items: {}, ...readJson(ledgerFile, {}) }
    const headers = { 'X-Data-Secret': e.DATA_SECRET, 'Content-Type': 'application/json' }
    const dropPieces = (id) => {
      const n = typeof ledger.items[id] === 'object' ? ledger.items[id].n : 0
      return Promise.all([`${prefix}-${id}`, ...Array.from({ length: n }, (_, i) => `${prefix}-${id}-${i}`)]
        .map((vid) => embed.call(`${base}/vectors/${vid}`, { method: 'DELETE', headers }, ms).catch(() => null)))
    }
    if (ledger.model !== kind.model || ledger.dims !== kind.dims) ledger.items = {}
    else if (ledger.layout !== LAYOUT) {
      for (const id of Object.keys(ledger.items)) await dropPieces(id)
      ledger.items = {}
    }
    // An item is { sha, n }: the hash of the element's whole text AND its pieces (670-4: an area changes only the pieces), and how many
    // pieces it has in the index.
    const texts = descriptions.map((d) => {
      const list = indexPieceList(d)
      return { id: d.id, list, sha: crypto.createHash('sha1').update(JSON.stringify([indexText(d), list.map((p) => `${p.kind}:${p.text}`)])).digest('hex') }
    })
    const stale = texts.filter((t) => ledger.items[t.id]?.sha !== t.sha)
    for (const t of stale) {
      await dropPieces(t.id)
      const whole = descriptions.find((d) => d.id === t.id)
      await Promise.all([
        embed.call(`${base}/vectors`, { method: 'POST', headers, body: JSON.stringify({ id: `${prefix}-${t.id}`, collection: wholeCollection, text: indexText(whole), refTable: 'element', refId: t.id }) }, ms),
        ...t.list.map((p, i) => embed.call(`${base}/vectors`, { method: 'POST', headers, body: JSON.stringify({ id: `${prefix}-${t.id}-${i}`, collection, text: p.text, refTable: 'element', refId: t.id }) }, ms)),
      ])
      ledger.items[t.id] = { sha: t.sha, n: t.list.length }
    }
    const alive = new Map(texts.map((t) => [t.id, t.list]))
    for (const id of Object.keys(ledger.items)) {
      if (alive.has(id)) continue
      await dropPieces(id)
      delete ledger.items[id]
    }
    fs.mkdirSync(path.dirname(ledgerFile), { recursive: true })
    fs.writeFileSync(ledgerFile, JSON.stringify({ model: kind.model, dims: kind.dims, layout: LAYOUT, items: ledger.items }, null, 2) + '\n')
    // An element's score: 0.3 × its whole description + 0.7 × its best piece. Measured 2026-11-03 on 20 intents and 6 jobs the node lacks:
    // the whole alone put the right element first 19 of 20 but under the absent jobs' scores, the pieces alone separated better (17 of 20
    // above) but ranked worse (15 of 20); the mix — 17 of 20 first, 16 of 20 above. Up to 100 vectors come back per collection (the
    // element's limit): every whole always, the far pieces of a larger node not.
    const [rw, rp] = await Promise.all([
      embed.call(`${base}/vectors/search`, { method: 'POST', headers, body: JSON.stringify({ collection: wholeCollection, query, k: 100 }) }, ms),
      embed.call(`${base}/vectors/search`, { method: 'POST', headers, body: JSON.stringify({ collection, query, k: 100 }) }, ms),
    ])
    const idOf = (x) => x.refId || String(x.id).slice(prefix.length + 1).replace(/-\d+$/, '')
    const whole = new Map()
    const piece = new Map()
    for (const x of rw?.results ?? []) { const id = idOf(x); if (alive.has(id)) whole.set(id, x.score) }
    for (const x of rp?.results ?? []) {
      const id = idOf(x)
      if (!alive.has(id)) continue
      const i = Number(String(x.id).slice(`${prefix}-${id}-`.length))
      if (!piece.has(id) || x.score > piece.get(id).score) piece.set(id, { score: x.score, ...(alive.get(id)[i] ?? { kind: 'description', text: '' }) })
    }
    void k
    return [...new Set([...whole.keys(), ...piece.keys()])]
      .map((id) => {
        const p = piece.get(id)
        return { id, score: 0.3 * (whole.get(id) ?? 0) + 0.7 * (p?.score ?? whole.get(id) ?? 0), best: p ? { kind: p.kind, ref: p.ref ?? null, text: p.text, score: p.score } : { kind: 'whole', ref: null, text: '', score: whole.get(id) ?? 0 } }
      })
      .sort((a, b) => b.score - a.score)
  } catch {
    return null
  }
}

module.exports = { describeAll, passportOf, listLine, cardText, findByMeaning, indexText, indexPieces, indexPieceList, whyOf, COLLECTION, WHOLE }
