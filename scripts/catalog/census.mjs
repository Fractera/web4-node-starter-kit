// 627-5 — THE CENSUS: the skills.sh leaderboard top-down, pages of 500, until enough rows (the owner, 2026-11-02: «сверху книзу до тех
// пор пока 5000 навыков не окажется у нас»; no cut by stars or installs — only the leaderboard's own order). The door needs a Vercel OIDC
// token: the owner's free Vercel account, `vercel link` + `vercel env pull` in a folder OUTSIDE the node; the token is read from that
// file and never printed or stored here. Also: the partners' audits of a skill (that door answers without a token).
// Measured 2026-11-02: 93,000 skills; the top 6,000 end at 3,307 installs; 5,378 GitHub + 622 `well-known` (sites); 698 sources.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const API = 'https://skills.sh/api/v1'

const tokenOf = (file) => {
  const t = readFileSync(file, 'utf8').match(/^VERCEL_OIDC_TOKEN="?([^"\n]+)"?/m)?.[1]
  if (!t) throw new Error(`no VERCEL_OIDC_TOKEN in ${file} — run \`vercel env pull\` there again (the token lives for hours, not days)`)
  return t
}

/** The leaderboard top-down → `census.json` (every row), `list.txt` (GitHub rows, the fetch's input), `well-known.json` (sites). */
export async function pullCensus({ tokenFile, rows: wanted = 6000, outDir }) {
  const token = tokenOf(tokenFile)
  const rows = []
  for (let page = 0; rows.length < wanted; page += 1) {
    const r = await fetch(`${API}/skills?view=all-time&page=${page}&per_page=500`, { headers: { Authorization: `Bearer ${token}` } })
    if (r.status !== 200) throw new Error(`the leaderboard page ${page} answered ${r.status}${r.status === 401 ? ' — the token has expired: vercel env pull' : ''}`)
    const body = await r.json()
    rows.push(...body.data.map((d, i) => ({ rank: page * 500 + i + 1, ...d })))
    if (!body.pagination?.hasMore) break
  }
  const taken = rows.slice(0, wanted)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'census.json'), `${JSON.stringify(taken, null, 1)}\n`)
  const github = taken.filter((r) => r.sourceType === 'github' && /^[\w.-]+\/[\w.-]+$/.test(r.source))
  writeFileSync(join(outDir, 'list.txt'), [
    `# The skills.sh leaderboard top-down, read ${new Date().toISOString()} — GitHub rows only (sites: well-known.json).`,
    '# Columns: rank | owner/repo | skill | installs.',
    ...github.map((r) => `${r.rank} | ${r.source} | ${r.slug} | ${r.installs}`),
  ].join('\n') + '\n')
  writeFileSync(join(outDir, 'well-known.json'), `${JSON.stringify(taken.filter((r) => r.sourceType !== 'github'), null, 1)}\n`)
  const sources = new Set(taken.map((r) => r.source))
  return { rows: taken.length, github: github.length, wellKnown: taken.length - github.length, sources: sources.size, lastInstalls: taken.at(-1)?.installs }
}

/** Write the audits of `audits.json` into cards already marked — no model call; a card without an audit gets []. */
export function attachAudits({ dataDir, cardsFile }) {
  const audits = JSON.parse(readFileSync(join(dataDir, 'audits.json'), 'utf8'))
  const cards = readFileSync(cardsFile, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l))
  for (const c of cards) c.audits = audits[c.id] ?? []
  writeFileSync(cardsFile, cards.map((c) => JSON.stringify(c)).join('\n') + '\n')
  return { cards: cards.length, withAudit: cards.filter((c) => c.audits.length).length }
}

/** The partners' audits of each fetched skill → `audits.json` { "<source>@<skill>": [{ provider, status }] } — no token needed. */
export async function pullAudits({ dataDir }) {
  const fetched = JSON.parse(readFileSync(join(dataDir, 'fetched.json'), 'utf8')).filter((r) => r.sha)
  const out = {}
  let found = 0
  for (const r of fetched) {
    const res = await fetch(`${API}/skills/audit/${r.source}/${r.skill}`).catch(() => null)
    if (res?.status === 200) {
      const body = await res.json().catch(() => null)
      out[`${r.source}@${r.skill}`] = (body?.audits ?? []).map((a) => ({ provider: a.provider, status: a.status }))
      found += 1
    } else {
      out[`${r.source}@${r.skill}`] = []
    }
    await new Promise((ok) => setTimeout(ok, 150))
  }
  writeFileSync(join(dataDir, 'audits.json'), `${JSON.stringify(out, null, 1)}\n`)
  return { skills: fetched.length, audited: found }
}
