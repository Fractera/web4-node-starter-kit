// THE NODE'S SKILLS MEMORY — look at how other projects solved it (node step 595-3; the tool skills_find of step 595-4 calls the same).
// The graph element answers by meaning with the caller's keywords (it calls no language model); only items marked skill:… come back,
// at most three fragments and 3 KB, each with its skill, source and licence. Nothing close enough → found: false, never a guess.
// 598-2: «close enough» is LightRAG's own cosine threshold, asked per query — its default 0.2 let anything through (sourdough bread
// found copywriting). 0.5 measured on 21 questions: the 12 within the base (two of them in Russian) found their skill, the 9 outside it
// found nothing; 0.45 let two of the nine through, 0.55 lost two of the twelve — a narrow window, measure again when the base grows.
// 626-7: the vectors became the node's own (MiniLM-L12, 384), and the scale moved — 21 new questions (12 inside, two in Russian; 9
// outside, one in Russian): 0.40 — 11 of 12 right, 2 of 9 leak; 0.45 — 10 of 12, 1 of 9; 0.50 — 8 of 12, 1 of 9; 0.55 — 7 of 12, 1 of 9.
// No clean gap: 0.45. The one leak («choose a reliable used car» → impeccable) holds to 0.55 — it comes from the graph's keywords, not
// the threshold. The memory's `solution-search.mjs` takes the same value.
// A fragment is one skill: its sections in the graph's order, short sections no longer end the answer.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isSkillMark } from './to-graph.mjs'
import { notLoaded, readManifest } from './base.mjs'

const LIMIT = 3000
export const THRESHOLD = 0.45

// 654-4: the graph's doors open with the node data key (X-Data-Secret — the shared graph and every space) or an element's own key;
// the node key (SETTINGS_SECRET) opens them no more. The core is the node: it reads the skills base in the shared graph with DATA_SECRET.
export function nodeAccess(root) {
  let key = ''
  try {
    for (const line of readFileSync(join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^DATA_SECRET=(.*)$/)
      if (m) key = m[1].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* no key — the graph refuses */ }
  let port = 24689
  try {
    const reg = JSON.parse(readFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    const list = Array.isArray(reg) ? reg : reg.items ?? reg.services ?? Object.values(reg)
    port = list.find((x) => x && x.id === 'graph')?.port ?? port
  } catch { /* the default port of the graph element */ }
  return { key, url: `http://127.0.0.1:${port}` }
}

/** GET /api/graph-status of the graph element → { status, body } (status 0 — the element does not answer). */
export async function graphStatus(root, timeout = 10_000) {
  const { key, url } = nodeAccess(root)
  try {
    const r = await fetch(`${url}/api/graph-status`, { headers: { 'X-Data-Secret': key }, signal: AbortSignal.timeout(timeout) })
    let body = null
    try { body = await r.json() } catch { /* not JSON */ }
    return { status: r.status, body }
  } catch (err) {
    return { status: 0, body: null, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function graphCall(root, door, body, timeout = 120_000) {
  const { key, url } = nodeAccess(root)
  const r = await fetch(`${url}/api/${door}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Data-Secret': key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  })
  let json = null
  try { json = await r.json() } catch { /* not JSON */ }
  return { status: r.status, body: json }
}

const words = (v) => (Array.isArray(v) ? v : String(v ?? '').split(',')).map((w) => String(w).trim()).filter(Boolean).slice(0, 12)

/** { query, themes?, terms?, maxSkills? } → { found, fragments: [{ skill, source, licence, sections, text, description? }], text }
 *  711-1: `maxSkills` — how many skills one answer may hold (3 for `skills_find`; the core's Design tab asks for all that pass the
 *  graph's similarity threshold), and each fragment carries its skill entity's description when the graph returns it. */
export async function findSkills(root, { query, themes, terms, maxSkills = 3 }) {
  const hl = words(themes)
  const ll = words(terms)
  if (!hl.length && !ll.length) ll.push(...words(String(query).split(/\s+/).filter((w) => w.length > 3)))
  const { status, body } = await graphCall(root, 'graph-query', { query: String(query).slice(0, 2000), mode: 'mix', hl_keywords: hl, ll_keywords: ll, top_k: 20, chunk_top_k: 8, threshold: THRESHOLD })
  if (status !== 200 || !body) return { found: false, error: `graph ${status}${body?.error ? ` ${body.error}` : ''}`, fragments: [], text: '' }
  // The licence: the base's manifest first (the LICENSE we hand out), then the skill entity («Licence: Apache-2.0.» — the version keeps
  // its dot, the sentence's dot goes).
  const licences = new Map(readManifest().map((s) => [`skill:${s.source}:${s.skill}`, s.license]))
  for (const e of body.entities ?? []) {
    if (!isSkillMark(e.file_path) || e.entity_type !== 'skill' || licences.has(e.file_path)) continue
    const licence = String(e.description ?? '').match(/Licence: (\S+?)\.?(?:\s|$)/)?.[1]
    if (licence) licences.set(e.file_path, licence)
  }
  const bySkill = new Map()
  let size = 0
  for (const c of body.chunks ?? []) {
    if (!isSkillMark(c.file_path)) continue
    const room = LIMIT - size
    if (room < 200) break
    if (!bySkill.has(c.file_path) && bySkill.size >= maxSkills) continue
    const [, source, skill] = c.file_path.split(':')
    const [first, ...rest] = String(c.content ?? '').trim().split('\n')
    const head = first.startsWith(`${skill} — `) ? first.slice(skill.length + 3) : first
    const piece = `#### ${head}\n${rest.join('\n').trim()}`.slice(0, room)
    if (!bySkill.has(c.file_path)) bySkill.set(c.file_path, { skill, source, licence: licences.get(c.file_path) ?? 'see the skill entity', sections: [], parts: [] })
    const f = bySkill.get(c.file_path)
    f.sections.push(head)
    f.parts.push(piece)
    size += piece.length
  }
  // 711-1: the skill entity's own description (the graph's words for the whole skill), beside the matched pieces.
  const describe = new Map((body.entities ?? []).filter((e) => e.entity_type === 'skill' && isSkillMark(e.file_path)).map((e) => [e.file_path, String(e.description ?? '').split(/ Source: /)[0].trim()]))
  const fragments = [...bySkill.entries()].map(([mark, { parts, ...f }]) => ({ ...f, mark, ...(describe.get(mark) ? { description: describe.get(mark) } : {}), text: parts.join('\n\n') }))
  const text = fragments.map((f) => `### ${f.skill} (${f.source}, licence ${f.licence})\n${f.text}`).join('\n\n')
  // 598-2: a fresh clone has the base on disk before its graph has it — the answer says so (626-7: no OpenAI key is needed any more;
  // the graph counts its vectors through the node's `embeddings` element).
  const missing = notLoaded(root).filter((m) => m.why === 'new')
  const notice = missing.length
    ? `${missing.length} of ${readManifest().length} skills of the node's base are not in the graph yet — the node's main agent loads them: npm run skills-base (about half a minute; the node's embeddings element must be running).`
    : ''
  return { found: fragments.length > 0, fragments, text, ...(notice ? { notice } : {}) }
}
