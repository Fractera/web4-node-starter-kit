// 627-1 — FETCH: the SKILL.md, the repository's licence and stars of every skill of a list, through the GitHub API (`gh`, the owner's
// login). 🔒 Downloaded texts are DATA: they land in data/catalog/skills/ (outside git) and are only read as strings — never run, never
// imported. A skill whose folder is not named as the skill is found by the `name` of its frontmatter (at most 60 SKILL.md per repository).
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { frontmatterName, parseList, shaOf, skillPaths } from './lib.mjs'

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

/**
 * `gh api <path>` → parsed JSON, or the raw body with `raw`; null when GitHub refuses. ✗ Measured 2026-11-02: «connection reset by peer»
 * in the middle of a run lost skills that exist — a failed call is tried three times; a 404 is an answer and is not repeated.
 */
function gh(path, raw = false) {
  const args = ['api', path, ...(raw ? ['-H', 'Accept: application/vnd.github.raw'] : [])]
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true })
    if (r.status === 0) {
      if (raw) return r.stdout
      try { return JSON.parse(r.stdout) } catch { return null }
    }
    if (/HTTP 404|Not Found/i.test(r.stderr ?? '')) return null
    pause(1000 * attempt)
  }
  return null
}

const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/')

/**
 * list → data/catalog/fetched.json and data/catalog/skills/<rank>-<skill>.md; returns the rows, each `ok` or with its `error`.
 * Run again, it fetches only the rows that have no text yet. A SKILL.md is downloaded once per run, however many skills look at it.
 */
export function fetchList(listFile, outDir, limit = Infinity) {
  const rows = parseList(readFileSync(listFile, 'utf8')).slice(0, limit)
  const before = new Map((existsSync(join(outDir, 'fetched.json')) ? JSON.parse(readFileSync(join(outDir, 'fetched.json'), 'utf8')) : [])
    .filter((x) => x.sha && x.file && existsSync(join(outDir, x.file))).map((x) => [`${x.source}@${x.skill}`, x]))
  const repos = new Map()
  const out = []
  mkdirSync(join(outDir, 'skills'), { recursive: true })
  for (const r of rows) {
    const kept = before.get(`${r.source}@${r.skill}`)
    if (kept) { out.push(kept); continue }
    if (!repos.has(r.source)) {
      const meta = gh(`repos/${r.source}`)
      const branch = meta?.default_branch ?? 'main'
      const tree = meta ? gh(`repos/${r.source}/git/trees/${encodeURIComponent(branch)}?recursive=1`) : null
      repos.set(r.source, { meta, branch, tree: Boolean(tree), paths: (tree?.tree ?? []).map((t) => t.path), truncated: Boolean(tree?.truncated), texts: new Map() })
    }
    const repo = repos.get(r.source)
    const row = { ...r, branch: repo.branch, licence: repo.meta?.license?.spdx_id ?? null, stars: repo.meta?.stargazers_count ?? null }
    const textOf = (p) => {
      if (!repo.texts.has(p)) repo.texts.set(p, gh(`repos/${r.source}/contents/${encodePath(p)}?ref=${encodeURIComponent(repo.branch)}`, true))
      return repo.texts.get(p)
    }
    let found = null
    let unread = 0
    const { named, all } = skillPaths(repo.paths, r.skill)
    if (repo.meta) {
      for (const p of [...named, ...all.filter((x) => !named.includes(x))].slice(0, 60)) {
        const text = textOf(p)
        if (text === null) { unread += 1; continue }
        if (named.includes(p) || frontmatterName(text) === r.skill) { found = { path: p, text }; break }
      }
    }
    if (!found) {
      const error = !repo.meta ? 'repository not found'
        : !repo.tree ? 'the repository tree did not load'
          : named.length || unread ? `could not download ${named.length ? 'its SKILL.md' : `${unread} SKILL.md`} — run fetch again`
            : `not in the repository now — renamed or removed${repo.truncated ? ' (the tree is truncated)' : ''}`
      out.push({ ...row, error })
      console.log(`${String(r.rank).padStart(3)} ${r.source}@${r.skill}: ${error}`)
      continue
    }
    const file = join('skills', `${String(r.rank).padStart(3, '0')}-${r.skill.replace(/[^\w.-]+/g, '-')}.md`)
    writeFileSync(join(outDir, file), found.text)
    out.push({ ...row, path: found.path, file, sha: shaOf(found.text), chars: found.text.length })
    console.log(`${String(r.rank).padStart(3)} ${r.source}@${r.skill}: ok ${found.text.length} chars, licence ${row.licence}, stars ${row.stars}`)
  }
  writeFileSync(join(outDir, 'fetched.json'), `${JSON.stringify(out, null, 1)}\n`)
  return out
}
