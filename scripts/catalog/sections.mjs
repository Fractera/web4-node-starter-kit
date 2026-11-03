// 627-5 — TWO LEVELS OF SECTIONS FOR THE CATALOG, built ONCE after the collection (the owner, 2026-11-02: «не стоит углубляться больше
// чем на два уровня»). Built while marking in parallel, the same section would be invented under several names — so: all cards' tags
// counted, ONE Sonnet call (no tools, the owner's subscription) shapes the tree «section → subsection → its tags», and every card is placed
// by its tags with no model at all. A card whose tags meet no subsection goes to «Other».
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { resolveBin } = require('../../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/claude-cli.cjs')

const SYSTEM = `You shape the sections of a skills catalog for Fractera nodes — people build sites, web apps and AI agents on them and make
content (texts, images, video, voice) for social networks, shops, blogs. You get the catalog's tags with how many skills carry each.
Output ONLY one JSON object, no prose: {"sections": [{"name": "...", "subsections": [{"name": "...", "tags": ["..."]}]}]}
- 8 to 14 sections, each with 2 to 10 subsections — two levels, never more. Short plain English names a person understands
  («Content & media», «Video»), no jargon.
- Every subsection lists the given tags that belong to it — only tags from the list, each tag in one subsection at most.
- Cover the frequent tags first; a rare tag may stay out.`

/** Count the tags, ask once for the tree, place every card. Returns the tree with its counts; writes `sections.json` and the cards. */
export function buildSections({ cardsFile, dataDir, topTags = 700 }) {
  const cards = readFileSync(cardsFile, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l))
  const count = new Map()
  for (const c of cards) for (const t of c.tags) count.set(t, (count.get(t) ?? 0) + 1)
  const tags = [...count].sort((a, b) => b[1] - a[1]).slice(0, topTags)
  const bin = resolveBin('claude')
  if (!bin) throw new Error('claude is not found')
  const cwd = join(tmpdir(), 'fractera-catalog-sections')
  mkdirSync(cwd, { recursive: true })
  writeFileSync(join(cwd, 'system.txt'), SYSTEM)
  const input = `Tags (tag: skills):\n${tags.map(([t, n]) => `${t}: ${n}`).join('\n')}`
  const r = spawnSync(bin, ['-p', '--model', 'sonnet', '--tools', '', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence',
    '--system-prompt-file', join(cwd, 'system.txt'), '--output-format', 'json'], { cwd, input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600_000 })
  const answer = JSON.parse(r.stdout)
  if (answer.is_error) throw new Error(String(answer.result).slice(0, 300))
  const text = String(answer.result)
  const tree = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
  const where = new Map()
  for (const s of tree.sections) for (const sub of s.subsections) for (const t of sub.tags) if (!where.has(t)) where.set(t, [s.name, sub.name])
  const placed = new Map()
  for (const c of cards) {
    const votes = new Map()
    for (const t of c.tags) {
      const w = where.get(t)
      if (w) votes.set(w.join('\u0000'), (votes.get(w.join('\u0000')) ?? 0) + 1)
    }
    const best = [...votes].sort((a, b) => b[1] - a[1])[0]
    const [section, subsection] = best ? best[0].split('\u0000') : ['Other', 'Other']
    c.section = section
    c.subsection = subsection
    const k = `${section}\u0000${subsection}`
    placed.set(k, (placed.get(k) ?? 0) + 1)
  }
  writeFileSync(cardsFile, cards.map((c) => JSON.stringify(c)).join('\n') + '\n')
  const out = {
    builtAt: new Date().toISOString(), model: Object.keys(answer.modelUsage ?? {})[0] ?? 'sonnet', costUsd: answer.total_cost_usd ?? null,
    sections: [...tree.sections, { name: 'Other', subsections: [{ name: 'Other', tags: [] }] }].map((s) => ({
      name: s.name,
      skills: s.subsections.reduce((n, sub) => n + (placed.get(`${s.name}\u0000${sub.name}`) ?? 0), 0),
      subsections: s.subsections.map((sub) => ({ name: sub.name, skills: placed.get(`${s.name}\u0000${sub.name}`) ?? 0, tags: sub.tags })),
    })),
  }
  writeFileSync(join(dataDir, 'sections.json'), `${JSON.stringify(out, null, 1)}\n`)
  return out
}
