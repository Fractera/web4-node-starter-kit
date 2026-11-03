// THE SKILLS CATALOG — the pure helpers of Fractera's marking tool (node step 627-1). No network and no files here: `fetch.mjs`,
// `mark.mjs` and the guard `check-catalog-cards.mjs` call them; `selftest.mjs` proves them.
import { createHash } from 'node:crypto'

// Two questions instead of one verdict (627-1 run 2; the owner, 2026-11-02: «почему-то забраковал навык в котором есть видео?»):
/** How useful is the skill for what Fractera nodes are for — sites, apps, agents, content for social networks? */
export const VALUES = ['high', 'some', 'none']
/** How it is used: as written · as written with an outside service or key · only its ideas · not at all (a risk always means skip). */
export const USES = ['install', 'install-with-service', 'ideas', 'skip']
/** Files of a skill's folder an agent could run — the card names them, and such a skill is installed only after a separate yes. */
export const SCRIPT_EXT = ['.sh', '.bash', '.zsh', '.py', '.js', '.mjs', '.cjs', '.ts', '.ps1', '.bat', '.cmd', '.rb', '.go', '.pl', '.php', '.exe', '.bin']
export const isScript = (path) => SCRIPT_EXT.some((e) => String(path).toLowerCase().endsWith(e))

/** «1.2M» / «936.7K» / «141» → a number of installs; anything else → 0. */
export function installsOf(s) {
  const m = /^([\d.]+)\s*([KM]?)$/i.exec(String(s ?? '').trim())
  return m ? Math.round(Number(m[1]) * ({ K: 1e3, M: 1e6 }[m[2].toUpperCase()] ?? 1)) : 0
}

/** Lines «rank | owner/repo | skill | installs»; «#» starts a comment; a source that is a site, not a GitHub repository, is skipped. */
export function parseList(text) {
  const rows = []
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const p = line.split('|').map((x) => x.trim())
    if (p.length !== 4 || !/^[\w.-]+\/[\w.-]+$/.test(p[1]) || !p[2]) continue
    rows.push({ rank: Number(p[0]) || rows.length + 1, source: p[1], skill: p[2], installs: installsOf(p[3]) })
  }
  return rows
}

/** The fingerprint of a SKILL.md, 16 hex: the same text in two repositories is one skill. */
export const shaOf = (text) => createHash('sha256').update(String(text)).digest('hex').slice(0, 16)

/** git's own blob id of a text — the `sha` GitHub lists in a repository tree, so an update sees a change without downloading (627-6). */
export const blobShaOf = (text) => createHash('sha1').update(`blob ${Buffer.byteLength(String(text))}\0`).update(String(text)).digest('hex')

/** The `name` of a SKILL.md frontmatter, or null. */
export function frontmatterName(text) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text))
  const m = fm && /^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m.exec(fm[1])
  return m ? m[1].trim() : null
}

/** The SKILL.md paths of a repository's tree: `named` — in a folder named as the skill; `all` — every SKILL.md (checked by name later). */
export function skillPaths(paths, skill) {
  const all = paths.filter((p) => p === 'SKILL.md' || p.endsWith('/SKILL.md'))
  const named = all.filter((p) => p.split('/').slice(-2, -1)[0]?.toLowerCase() === String(skill).toLowerCase())
  return { named, all }
}

/** Rows with one fingerprint are one skill: the most starred source keeps it (then the most installed); the others are duplicates. */
export function dedupeBySha(rows) {
  const groups = new Map()
  for (const r of rows) if (r.sha) groups.set(r.sha, [...(groups.get(r.sha) ?? []), r])
  const keep = []
  const duplicates = []
  for (const group of groups.values()) {
    const [first, ...rest] = [...group].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || b.installs - a.installs)
    keep.push(first)
    for (const d of rest) duplicates.push({ id: `${d.source}@${d.skill}`, duplicateOf: `${first.source}@${first.skill}` })
  }
  return { keep: keep.sort((a, b) => a.rank - b.rank), duplicates }
}

/** The skill's page on skills.sh. */
export const urlOf = (source, skill) =>
  `https://skills.sh/${source}/${String(skill).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`

const texts = (v, min, max, len) =>
  Array.isArray(v) && v.length >= min && v.length <= max && v.every((s) => typeof s === 'string' && s.trim() && s.length <= len)

/** A card against the schema of 627-1 → what is wrong with it, by field; an empty list — the card is good. */
export function validateCard(c) {
  if (!c || typeof c !== 'object') return ['not-an-object']
  const e = []
  if (typeof c.id !== 'string' || c.id !== `${c.source}@${c.skill}` || !/^[\w.-]+\/[\w.-]+$/.test(c.source ?? '')) e.push('id')
  if (!Number.isInteger(c.installs) || c.installs < 0) e.push('installs')
  if (c.stars !== null && !Number.isInteger(c.stars)) e.push('stars')
  if (c.licence !== null && typeof c.licence !== 'string') e.push('licence')
  if (!/^https:\/\/skills\.sh\//.test(c.url ?? '')) e.push('url')
  if (!/^[0-9a-f]{16}$/.test(c.sha ?? '')) e.push('sha')
  if (c.blob !== undefined && !/^[0-9a-f]{40}$/.test(c.blob ?? '')) e.push('blob')
  if (typeof c.summary !== 'string' || c.summary.length < 80 || c.summary.length > 1200) e.push('summary')
  if (!texts(c.tasks, 1, 8, 160)) e.push('tasks')
  if (!texts(c.tags, 1, 10, 40) || c.tags.some((t) => t !== t.toLowerCase())) e.push('tags')
  if (!(Array.isArray(c.tools) && c.tools.length <= 25 && c.tools.every((t) => typeof t === 'string' && t.trim()))) e.push('tools')
  if (!Number.isInteger(c.quality) || c.quality < 1 || c.quality > 5) e.push('quality')
  if (typeof c.qualityWhy !== 'string' || !c.qualityWhy.trim() || c.qualityWhy.length > 300) e.push('qualityWhy')
  if (!VALUES.includes(c.value)) e.push('value')
  if (!USES.includes(c.use)) e.push('use')
  if (!(Array.isArray(c.needs) && c.needs.length <= 10 && c.needs.every((t) => typeof t === 'string' && t.trim()))) e.push('needs')
  if (!Number.isInteger(c.files) || c.files < 1) e.push('files')
  if (!(Array.isArray(c.scripts) && c.scripts.every((s) => typeof s === 'string' && s.trim()))) e.push('scripts')
  if (c.licenceFrom !== null && !['folder', 'repository'].includes(c.licenceFrom)) e.push('licenceFrom')
  if (c.audits !== undefined && !(Array.isArray(c.audits) && c.audits.every((a) => a && typeof a.provider === 'string' && typeof a.status === 'string'))) e.push('audits')
  if (typeof c.why !== 'string' || !c.why.trim() || c.why.length > 500) e.push('why')
  if (!Array.isArray(c.risks) || !c.risks.every((r) => typeof r === 'string' && r.trim())) e.push('risks')
  else if (c.risks.length && c.use !== 'skip') e.push('risks-need-skip')
  if (typeof c.markedBy !== 'string' || !c.markedBy) e.push('markedBy')
  if (Number.isNaN(Date.parse(c.markedAt ?? ''))) e.push('markedAt')
  return e
}
