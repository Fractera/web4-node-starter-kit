// THE SKILLS CATALOG — the pure helpers of Fractera's marking tool (node step 627-1). No network and no files here: `fetch.mjs`,
// `mark.mjs` and the guard `check-catalog-cards.mjs` call them; `selftest.mjs` proves them.
import { createHash } from 'node:crypto'

/** Does the skill fit a node as written, only for its ideas (another stack the node replaces), or not at all (or risky)? */
export const VERDICTS = ['fits', 'ideas-only', 'not-for-node']

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
  if (!VERDICTS.includes(c.fractera)) e.push('fractera')
  if (typeof c.why !== 'string' || !c.why.trim() || c.why.length > 400) e.push('why')
  if (!Array.isArray(c.risks) || !c.risks.every((r) => typeof r === 'string' && r.trim())) e.push('risks')
  else if (c.risks.length && c.fractera !== 'not-for-node') e.push('risks-need-not-for-node')
  if (typeof c.markedBy !== 'string' || !c.markedBy) e.push('markedBy')
  if (Number.isNaN(Date.parse(c.markedAt ?? ''))) e.push('markedAt')
  return e
}
