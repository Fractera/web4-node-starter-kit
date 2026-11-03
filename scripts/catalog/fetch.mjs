// 627-1 — FETCH WHOLE SKILL FOLDERS (run 2). One shallow, blob-less `git clone` per repository (trees only — no REST call per file,
// so GitHub's 5,000-an-hour limit is spent on one `gh api repos/<owner>/<repo>` per repository: licence, stars, branch), then only the
// skill's own folder is checked out. Owner 2026-11-02: «мы должны быть уверены на 100% что навык не имеет скрытых скриптов, и не был
// подмен после того как модамо оценку».
// 🔒 Downloaded files are DATA: data/catalog/repos/ (outside git), only read as strings — never run, never imported.
// 🔒 `core.symlinks=false`: a link in a foreign folder (say, to ~/.ssh/id_rsa) becomes a small text file with its target, and files
// git marks as links (mode 120000) are never read — a folder cannot make us read the owner's own files.
// The folder's fingerprint is made of git's blob ids of all its files — GitHub lists the same ids, so a later check needs no download.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { frontmatterName, isScript, parseList, shaOf, skillPaths } from './lib.mjs'

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, windowsHide: true, ...opts })

/** `gh api <path>` → JSON or null; a failed call is tried three times, a 404 is an answer. */
function gh(path) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const r = run('gh', ['api', path])
    if (r.status === 0) { try { return JSON.parse(r.stdout) } catch { return null } }
    if (/HTTP 404|Not Found/i.test(r.stderr ?? '')) return null
    pause(1000 * attempt)
  }
  return null
}

let lastGitError = ''

/** `git <args>` in a folder, three tries for the network parts; stdout or null (the last error is kept for the row's message). */
function git(dir, args, tries = 1) {
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    const r = run('git', dir ? ['-C', dir, ...args] : args)
    if (r.status === 0) return r.stdout
    lastGitError = String(r.stderr || r.error?.message || `exit ${r.status}`).trim().split('\n').pop().slice(0, 160)
    if (attempt < tries) pause(1500 * attempt)
  }
  return null
}

/** The repository: meta from the API, a blob-less shallow clone, its tree with modes, blob ids and sizes. */
function openRepo(source, reposDir) {
  const meta = gh(`repos/${source}`)
  if (!meta) return { error: 'repository not found' }
  const dir = join(reposDir, source.replace('/', '__'))
  if (!existsSync(join(dir, '.git'))) {
    const ok = git(null, ['clone', '-c', 'core.symlinks=false', '--depth', '1', '--filter=blob:none', '--no-checkout', '--quiet',
      `https://github.com/${source}.git`, dir], 3)
    if (ok === null) return { error: 'the clone failed' }
  }
  // 🛑 No `-l`: in a blob-less clone the sizes would make git fetch every blob of the repository one by one; the folder's sizes are
  // read from the disk after its checkout.
  const tree = git(dir, ['ls-tree', '-r', 'HEAD'])
  if (tree === null) return { error: 'the tree did not load' }
  const entries = tree.split('\n').filter(Boolean).map((line) => {
    const [head, path] = line.split('\t')
    const [mode, type, blob] = head.trim().split(/\s+/)
    return { mode, type, blob, path }
  }).filter((e) => e.type === 'blob')
  return { meta, dir, entries, branch: meta.default_branch, stars: meta.stargazers_count ?? null, licence: meta.license?.spdx_id ?? null }
}

/** A licence file's words → its SPDX id, or «custom». */
function spdxOf(text) {
  const t = String(text).slice(0, 4000)
  if (/MIT License|Permission is hereby granted, free of charge/i.test(t)) return 'MIT'
  if (/Apache License/i.test(t) && /Version 2\.0/.test(t)) return 'Apache-2.0'
  if (/Mozilla Public License/i.test(t)) return 'MPL-2.0'
  if (/GNU GENERAL PUBLIC LICENSE/i.test(t)) return /Version 3/.test(t) ? 'GPL-3.0' : 'GPL-2.0'
  if (/BSD 3-Clause|Redistribution and use in source and binary forms/i.test(t)) return 'BSD-3-Clause'
  if (/Creative Commons/i.test(t)) return 'CC'
  if (/This is free and unencumbered software released into the public domain/i.test(t)) return 'Unlicense'
  return 'custom'
}

/**
 * list → data/catalog/fetched.json; each row `ok` (with its folder's files, scripts, links, fingerprints, licence) or its `error`.
 * Run again, it keeps every row already fetched (its SKILL.md still on disk) and tries only the others — a long run that met a network
 * failure (measured 2026-11-02: every row after rank 145 failed at once) is finished by running it again.
 */
const escapeGlob = (p) => p.replace(/([*?[\]!#\\])/g, '\\$1')

/**
 * Bring files and folders of a repository onto the disk in ONE network round trip: the sparse-checkout patterns grow, and git fetches all
 * missing blobs of the new patterns in a batch. ✗ Measured 2026-11-02 on wshobson/agents: `git checkout HEAD --pathspec-from-file`
 * fetched blobs one by one — 50 SKILL.md in 38.8 s; `sparse-checkout set` + one checkout — 50 in 1.1 s, all 185 at once. Paths are
 * escaped, never globs; a folder ends with «/». `want` — [{ path, folder }].
 */
function materialize(repo, want) {
  // 🛑 `sparse-checkout set` REPLACES the patterns, and git removes from the disk what is no longer listed. ✗ Measured 2026-11-03: a
  // resumed run listed only its new folders and wiped the ones an earlier run had fetched (the marker then found no SKILL.md). The
  // patterns already written are read first, so they only grow.
  repo.patterns ??= new Set((git(repo.dir, ['sparse-checkout', 'list']) ?? '').split('\n').map((l) => l.trim()).filter(Boolean))
  for (const w of want) repo.patterns.add(`/${escapeGlob(w.path)}${w.folder ? '/' : ''}`)
  if (!repo.patterns.size) return true
  const input = `${[...repo.patterns].join('\n')}\n`
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const set = run('git', ['-C', repo.dir, 'sparse-checkout', 'set', '--no-cone', '--stdin'], { input })
    const co = set.status === 0 ? run('git', ['-C', repo.dir, 'checkout', '-q', 'HEAD']) : set
    if (co.status === 0) return true
    lastGitError = String(co.stderr || `exit ${co.status}`).trim().split('\n').pop().slice(0, 160)
    pause(1500 * attempt)
  }
  return false
}

/** One skill's row from its checked-out folder: files, scripts, links, licence, fingerprints. */
function rowOf(r, repo, path, outDir) {
  const folder = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
  const inFolder = repo.entries.filter((e) => folder === '' ? e.path === path : e.path.startsWith(`${folder}/`))
  const main = inFolder.find((e) => e.path === path)
  if (main.mode === '120000') return { ...r, error: 'its SKILL.md is a link' }
  const rel = (p) => (folder ? p.slice(folder.length + 1) : p)
  for (const e of inFolder) { try { e.size = lstatSync(join(repo.dir, e.path)).size } catch { e.size = 0 } }
  const text = readFileSync(join(repo.dir, path), 'utf8')
  const lic = inFolder.find((e) => e.mode !== '120000' && /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(rel(e.path).split('/').pop()) && !rel(e.path).includes('/'))
  return {
    ...r, branch: repo.branch, stars: repo.stars, path, folder, dir: repo.dir.slice(outDir.length + 1),
    licence: lic ? spdxOf(readFileSync(join(repo.dir, lic.path), 'utf8')) : repo.licence,
    licenceFrom: lic ? 'folder' : repo.licence ? 'repository' : null,
    sha: shaOf(text), blob: main.blob, chars: text.length,
    folderSha: createHash('sha256').update(inFolder.map((e) => `${rel(e.path)}\0${e.blob}`).sort().join('\n')).digest('hex').slice(0, 16),
    files: inFolder.length, bytes: inFolder.reduce((n, e) => n + e.size, 0),
    scripts: inFolder.filter((e) => e.mode !== '120000' && (e.mode === '100755' || isScript(e.path))).map((e) => rel(e.path)),
    links: inFolder.filter((e) => e.mode === '120000').map((e) => rel(e.path)),
    list: inFolder.map((e) => `${rel(e.path)}${e.mode === '120000' ? ' (link)' : ''} ${e.size}`),
  }
}

export function fetchList(listFile, outDir, limit = Infinity) {
  const rows = parseList(readFileSync(listFile, 'utf8')).slice(0, limit)
  const reposDir = join(outDir, 'repos')
  mkdirSync(reposDir, { recursive: true })
  const previous = join(outDir, 'fetched.json')
  const idOf = (r) => `${r.source}@${r.skill}`
  const out = new Map((existsSync(previous) ? JSON.parse(readFileSync(previous, 'utf8')) : [])
    .filter((x) => x.folderSha && x.dir && existsSync(join(outDir, x.dir, x.path))).map((x) => [idOf(x), x]))
  // Saved after every repository — a stopped run keeps what it fetched.
  const save = () => writeFileSync(previous, `${JSON.stringify(rows.map((r) => out.get(idOf(r))).filter(Boolean), null, 1)}\n`)
  const say = (r, what) => console.log(`${String(r.rank).padStart(4)} ${idOf(r)}: ${what}`)
  const bySource = new Map()
  for (const r of rows) if (!out.has(idOf(r))) bySource.set(r.source, [...(bySource.get(r.source) ?? []), r])

  for (const [source, group] of bySource) {
    const repo = openRepo(source, reposDir)
    if (repo.error) {
      for (const r of group) { out.set(idOf(r), { ...r, error: repo.error }); say(r, repo.error) }
      save()
      continue
    }
    const md = repo.entries.filter((e) => (e.path === 'SKILL.md' || e.path.endsWith('/SKILL.md')) && e.mode !== '120000').map((e) => e.path)
    // A skill whose folder is not named as the skill is found by its frontmatter `name` — every SKILL.md of the repository is checked out
    // ONCE, in one batch, and read from the disk.
    let names = null
    if (group.some((r) => !skillPaths(md, r.skill).named.length)) {
      const some = md.slice(0, 2000)
      if (materialize(repo, some.map((path) => ({ path, folder: false })))) {
        names = new Map(some.map((p) => {
          try { return [p, frontmatterName(readFileSync(join(repo.dir, p), 'utf8'))] } catch { return [p, null] }
        }))
      }
    }
    const found = []
    for (const r of group) {
      const path = skillPaths(md, r.skill).named[0] ?? (names ? [...names].find(([, n]) => n === r.skill)?.[0] : null)
      if (path) { found.push({ r, path }); continue }
      const error = names || group.every((g) => skillPaths(md, g.skill).named.length) ? 'not in the repository now — renamed or removed'
        : `could not read the repository's SKILL.md (${lastGitError}) — run fetch again`
      out.set(idOf(r), { ...r, error })
      say(r, error)
    }
    // Every folder of the repository's skills in ONE batch; if the batch fails, folder by folder. A skill at the repository's root brings
    // only its SKILL.md, never the whole repository.
    const wantOf = (p) => (p.includes('/') ? { path: p.slice(0, p.lastIndexOf('/')), folder: true } : { path: p, folder: false })
    const batchOk = materialize(repo, found.map((f) => wantOf(f.path)))
    for (const { r, path } of found) {
      if (!batchOk && !materialize(repo, [wantOf(path)])) {
        const error = `could not check out its folder (${lastGitError}) — run fetch again`
        out.set(idOf(r), { ...r, error })
        say(r, error)
        continue
      }
      const row = rowOf(r, repo, path, outDir)
      out.set(idOf(r), row)
      say(r, row.error ?? `ok · ${row.files} files, ${row.scripts.length} scripts${row.links.length ? `, ${row.links.length} links` : ''}, licence ${row.licence ?? 'none'} (${row.licenceFrom ?? '—'})`)
    }
    save()
  }
  save()
  return rows.map((r) => out.get(idOf(r))).filter(Boolean)
}
