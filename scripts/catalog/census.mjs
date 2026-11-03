// 627-5 — THE CENSUS: the skills.sh leaderboard top-down, pages of 500, until enough rows (the owner, 2026-11-02: «сверху книзу до тех
// пор пока 5000 навыков не окажется у нас»; no cut by stars or installs — only the leaderboard's own order). The door needs a Vercel OIDC
// token: the owner's free Vercel account, `vercel link` + `vercel env pull` in a folder OUTSIDE the node; the token is read from that
// file and never printed or stored here. Also: the partners' audits of a skill (that door answers without a token).
// Measured 2026-11-02: 93,000 skills; the top 6,000 end at 3,307 installs; 5,378 GitHub + 622 `well-known` (sites); 698 sources.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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

/**
 * The `well-known` skills (served by their own sites, not GitHub): the skills.sh copy is their only source — TEXT files only (binaries
 * are not served, measured 2026-11-03). Written as data under `sites/` (paths with «..» or a leading «/» are refused), one row each in
 * `fetched-sites.json`, the same shape the marker reads from `fetched.json`. A copy that equals a GitHub skill is merged by its fingerprint.
 */
export async function pullSites({ tokenFile, dataDir }) {
  const token = tokenOf(tokenFile)
  const { blobShaOf, folderShaOf, isScript, shaOf } = await import('./lib.mjs')
  const { spdxOf } = await import('./fetch.mjs')
  const rows = JSON.parse(readFileSync(join(dataDir, 'well-known.json'), 'utf8'))
  const out = []
  for (const r of rows) {
    const res = await fetch(`${API}/skills/${r.id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
    if (res?.status !== 200) { out.push({ rank: r.rank, source: r.source, skill: r.slug, installs: r.installs, error: `skills.sh answered ${res?.status ?? 'nothing'}` }); continue }
    const body = await res.json()
    const files = (body.files ?? []).filter((f) => typeof f.path === 'string' && !f.path.startsWith('/') && !f.path.split('/').includes('..'))
    const main = files.find((f) => f.path === 'SKILL.md')
    if (!main) { out.push({ rank: r.rank, source: r.source, skill: r.slug, installs: r.installs, error: 'no SKILL.md in the copy' }); continue }
    const dir = join('sites', r.source.replace(/\//g, '__'))
    for (const f of files) {
      const file = join(dataDir, dir, r.slug, f.path)
      mkdirSync(join(file, '..'), { recursive: true })
      writeFileSync(file, f.contents ?? '')
    }
    const lic = files.find((f) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f.path))
    out.push({
      rank: r.rank, source: r.source, skill: r.slug, installs: r.installs, sourceType: 'well-known', url: r.url?.replace('https://www.', 'https://'),
      dir, folder: r.slug, path: `${r.slug}/SKILL.md`, stars: null, licence: lic ? spdxOf(lic.contents) : null, licenceFrom: lic ? 'folder' : null,
      sha: shaOf(main.contents), blob: blobShaOf(main.contents), chars: main.contents.length, skillsShHash: body.hash ?? null,
      folderSha: folderShaOf(files.map((f) => [f.path, blobShaOf(f.contents ?? '')])),
      files: files.length, bytes: files.reduce((n, f) => n + Buffer.byteLength(f.contents ?? ''), 0),
      scripts: files.filter((f) => isScript(f.path)).map((f) => f.path), links: [], list: files.map((f) => `${f.path} ${Buffer.byteLength(f.contents ?? '')}`),
    })
  }
  writeFileSync(join(dataDir, 'fetched-sites.json'), `${JSON.stringify(out, null, 1)}\n`)
  return { rows: rows.length, ok: out.filter((x) => x.sha).length }
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
  const sites = existsSync(join(dataDir, 'fetched-sites.json')) ? JSON.parse(readFileSync(join(dataDir, 'fetched-sites.json'), 'utf8')) : []
  const fetched = [...JSON.parse(readFileSync(join(dataDir, 'fetched.json'), 'utf8')), ...sites].filter((r) => r.sha)
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
