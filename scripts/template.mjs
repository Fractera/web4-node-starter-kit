// npm run template -- <command> …
//
// Release the node's element templates and roll their files out to the elements — from the core (federal step 621-2, 2026-10-30). Until
// this step the federal agent did it from its own folder, with working clones and shell scripts; the owner: «проекты должны начать
// развивать себя сами и как минимум качество разработки должны быть как щас». The main agent's skill `release-template` says when.
//
//   clone <custom|native> [--install]   a working clone of the template in data/workshop/<repo> (outside the core's git), on main;
//                                       --install also runs npm ci (a release runs the template's whole prebuild, which needs it)
//   status <custom|native>              the workshop against the core's pin: branch, HEAD, the pinned tag, uncommitted files
//   release <custom|native> <vX.Y.Z> [--message "…"] [--dry]
//        every prebuild guard of the template one by one, after git add (guards read the index), then an annotated tag and main + tag
//        to GitHub with the node's token. An existing tag is never moved: a broken release gets the next patch.
//   pin <custom|native> <vX.Y.Z> [--dry]
//        the core's pin (WEB4-ITEMS-REGISTRY/item-template.json | native-template.json): the working file and one commit of that file
//        alone, through a separate index — someone's staged work and the node's state never ride along.
//   rollout <custom|native> <vX.Y.Z> <path…> [--elements a,b] [--skip a,b] [--keep-own-rows <old tag>] [--also <path,…>]
//           [--message "…"] [--dry]
//        copy the paths from the template's tag into every element of that kind (by the registry and the passport's elementType, or
//        --elements), run the element's dependency-free guards, commit ONLY those paths (the node's state stays uncommitted), tag the
//        next patch, push main + tag, then pin the new versions in the registry: the working lines and one commit of HEAD's file.
//        --keep-own-rows <old tag>: for a Markdown table file — the element keeps its own rows (those not in the template's file at
//        <old tag>); --also: files the element already changed itself that go into the same commit.
//   offer <custom|native> <element id> [--dry]
//        859: a BORN element of that template takes the pinned tag ITSELF — the core never writes into a born element (its code is its
//        agent's). The core names the tag it last took (registry `templateTaken`, else `born.version`), the pinned tag and how many paths
//        changed between them, and wakes its agent with the task: fetch the tag, merge those paths with git merge-file (base = the last
//        taken tag; its own commits stay, a conflict is its own), run its prebuild, commit, report by reply-core; no deploy.
//   taken <custom|native> <element id> <vX.Y.Z>
//        after its report: the registry's `templateTaken` of that element — the working line and one commit of HEAD's file.
//
// Rights: a push needs the node's GitHub token (data/node/github/.env, GITHUB_TOKEN) with write access to the template's and the
// elements' repositories — the owner's node has it; elsewhere the push stops at the dry push with ===TEMPLATE_NO_RIGHT=== (the right of
// a key is proven only by a push). The token is never printed.
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const [cmd, kind, ...rest] = process.argv.slice(2)
const flag = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null }
const has = (name) => rest.includes(name)
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--') && !['--dry', '--install'].includes(rest[i - 1])))
const DRY = has('--dry')
const KINDS = { custom: 'item-template.json', native: 'native-template.json' }
// Guards that need nothing but node itself: the element's own checks a rollout runs (the template's release runs its whole prebuild).
const ELEMENT_GUARDS = ['check-scripts-syntax', 'check-skill-process', 'check-instruction', 'check-instruction-skills', 'check-instruction-modes', 'check-dev-docs', 'check-architecture-rule']

const fail = (code, msg) => { console.log(`===TEMPLATE_${code}=== ${msg}`); process.exit(1) }
const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')) } catch { return fallback } }
const git = (dir, argv, env) => execFileSync('git', ['-C', dir, ...argv], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env: env ? { ...process.env, ...env } : process.env }).trim()
const gitOk = (dir, argv) => { try { return git(dir, argv) } catch { return null } }
// A file's bytes as git keeps them — never trimmed (git() trims command output, which would eat a file's edges).
const gitFile = (dir, rev, path) => execFileSync('git', ['-C', dir, 'show', `${rev}:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
// TEMPLATE_GITHUB_TOKEN — a key for ONE run, only at the owner's word (2026-11-16 «fractera git is here»: his gh key of the Fractera
// account, when the node's saved token is another account's); never kept, never the default.
const token = () => { const once = process.env.TEMPLATE_GITHUB_TOKEN?.trim(); if (once) return once; try { return tokenLine() } catch { return '' } }
const tokenLine = () => (readFileSync(join(ROOT, 'data', 'node', 'github', '.env'), 'utf8').split(/\r?\n/).find((l) => l.startsWith('GITHUB_TOKEN=')) ?? '').slice('GITHUB_TOKEN='.length).trim()
const mask = (text, t) => (t ? String(text).split(t).join('***') : String(text))
const authUrl = (repo, t) => repo.replace(/^https:\/\/(?:[^@/]+@)?github\.com\//, `https://x-access-token:${t}@github.com/`)
const nextPatch = (v) => { const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(v); return m ? `v${m[1]}.${m[2]}.${Number(m[3]) + 1}` : null }

if (!cmd || !KINDS[kind]) fail('USAGE', 'npm run template -- clone|status|release|pin|rollout|offer|taken <custom|native> …')
const pinFile = join(ROOT, 'WEB4-ITEMS-REGISTRY', KINDS[kind])
const pin = readJson(pinFile, null)
if (!pin) fail('FAIL', `no pin file ${pinFile}`)
const shop = join(ROOT, 'data', 'workshop', pin.from)

// Push main + a tag with the node's token; a dry push first proves the right.
function push(dir, repo, tag) {
  const t = token()
  if (!t) fail('NO_RIGHT', 'no GITHUB_TOKEN in data/node/github/.env')
  const url = authUrl(repo, t)
  try { git(dir, ['-c', 'credential.helper=', 'push', '--dry-run', '-q', url, 'HEAD:refs/heads/main']) } catch (e) { fail('NO_RIGHT', mask(e.stderr || e.message, t).trim().split('\n').pop()) }
  try { git(dir, ['-c', 'credential.helper=', 'push', '-q', url, 'HEAD:refs/heads/main', `refs/tags/${tag}`]) } catch (e) { fail('PUSH_FAIL', mask(e.stderr || e.message, t).trim().split('\n').pop()) }
  const remote = mask(git(ROOT, ['-c', 'credential.helper=', 'ls-remote', url, `refs/tags/${tag}^{}`, 'refs/heads/main']), t)
  const tagCommit = (remote.split('\n').find((l) => l.endsWith(`${tag}^{}`)) ?? '').split(/\s+/)[0]
  if (tagCommit !== git(dir, ['rev-parse', 'HEAD'])) fail('PUSH_FAIL', `tag ${tag} on GitHub is not HEAD`)
}

// 778: a folder the rollout created for a new file goes away with it — an empty skill folder left behind fails the element's guard
// (✗ 2026-11-17: «build-skills/telegram-mini-app: нет SKILL.md» after a failed run).
function dropEmptyParents(dir, rel) {
  let p = dirname(join(dir, rel))
  while (p.startsWith(dir) && p !== dir) {
    try { fs_rmdirIfEmpty(p) } catch { return }
    p = dirname(p)
  }
}
function fs_rmdirIfEmpty(p) { if (readdirSync(p).length) throw new Error('not empty'); rmdirSync(p) }

// Commit ONE file of the core through a separate index: HEAD's tree plus this blob — nothing else staged rides along.
function commitOne(rel, content, message) {
  if (gitOk(ROOT, ['symbolic-ref', 'HEAD']) !== 'refs/heads/main') fail('FAIL', 'the core is not on main')
  const blob = execFileSync('git', ['-C', ROOT, 'hash-object', '-w', '--stdin', '--path', rel], { input: content, encoding: 'utf8', windowsHide: true }).trim()
  const tmp = mkdtempSync(join(tmpdir(), 'pin-'))
  const env = { GIT_INDEX_FILE: join(tmp, 'index') }
  git(ROOT, ['read-tree', 'HEAD'], env)
  git(ROOT, ['update-index', '--cacheinfo', `100644,${blob},${rel}`], env)
  const tree = git(ROOT, ['write-tree'], env)
  rmSync(tmp, { recursive: true, force: true })
  const head = git(ROOT, ['rev-parse', 'HEAD'])
  const commit = git(ROOT, ['commit-tree', tree, '-p', head, '-m', message])
  git(ROOT, ['update-ref', 'refs/heads/main', commit, head])
  git(ROOT, ['update-index', '--cacheinfo', `100644,${blob},${rel}`]) // the shared index follows HEAD for this one path only
  return commit
}

function runGuards(dir, names) {
  for (const g of names) {
    console.log(`  … ${g}`)
    try { execSync(g, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: true, encoding: 'utf8' }) } catch (e) {
      const tail = String(e.stdout || '') + String(e.stderr || '')
      return `${g}: ${tail.trim().split('\n').slice(-3).join(' | ').slice(0, 300)}`
    }
  }
  return null
}

if (cmd === 'clone') {
  if (!existsSync(join(shop, '.git'))) {
    mkdirSync(join(ROOT, 'data', 'workshop'), { recursive: true })
    execFileSync('git', ['clone', '--quiet', pin.repo, shop], { stdio: 'inherit', windowsHide: true })
  } else git(shop, ['fetch', '--quiet', '--tags', 'origin'])
  if (has('--install')) execSync('npm ci --no-audit --no-fund', { cwd: shop, stdio: 'inherit', windowsHide: true, shell: true })
  console.log(`===TEMPLATE_CLONED=== ${kind} ${shop} at ${git(shop, ['describe', '--tags', '--always'])} (pin ${pin.version})`)
  process.exit(0)
}

if (!existsSync(join(shop, '.git')) && cmd !== 'pin') fail('NO_WORKSHOP', `no working clone — npm run template -- clone ${kind}`)

if (cmd === 'status') {
  const branch = git(shop, ['rev-parse', '--abbrev-ref', 'HEAD'])
  const dirty = git(shop, ['status', '--porcelain']).split('\n').filter(Boolean)
  const pinned = gitOk(shop, ['rev-parse', `${pin.version}^{commit}`])
  const ahead = pinned ? git(shop, ['rev-list', '--count', `${pin.version}..HEAD`]) : '?'
  console.log(`${kind}: ${shop}\n  branch ${branch} · HEAD ${git(shop, ['describe', '--tags', '--always'])} · pin ${pin.version} · commits after the pin: ${ahead}`)
  console.log(`  uncommitted: ${dirty.length ? dirty.join(', ') : 'none'} · node_modules: ${existsSync(join(shop, 'node_modules')) ? 'yes' : 'no (clone --install)'}`)
  process.exit(0)
}

if (cmd === 'release') {
  const version = positional[0]
  if (!/^v\d+\.\d+\.\d+$/.test(version ?? '')) fail('USAGE', 'release <custom|native> <vX.Y.Z> [--message "…"] [--dry]')
  if (git(shop, ['rev-parse', '--abbrev-ref', 'HEAD']) !== 'main') fail('FAIL', 'the workshop is not on main')
  // Content against HEAD after git add — not `git status`: under core.autocrlf a file rewritten with the same text but other line
  // endings shows «M» while nothing changed (measured on lib/aio/llms-extra.generated.json, 621-3).
  const uncommitted = () => { git(shop, ['add', '-A']); return git(shop, ['diff', '--cached', '--name-only', 'HEAD']).split('\n').filter(Boolean) }
  const dirty = uncommitted()
  if (dirty.length) fail('FAIL', `commit or drop first: ${dirty.join(', ')}`)
  if (gitOk(shop, ['rev-parse', '-q', '--verify', `refs/tags/${version}`])) fail('FAIL', `tag ${version} exists — a tag is never moved; take the next patch`)
  if (gitOk(shop, ['ls-remote', '--tags', 'origin', `refs/tags/${version}`])) fail('FAIL', `tag ${version} is on GitHub already`)
  git(shop, ['fetch', '--quiet', 'origin', 'main'])
  if (gitOk(shop, ['merge-base', '--is-ancestor', 'origin/main', 'HEAD']) === null) fail('FAIL', 'GitHub main has commits this clone does not — pull first')
  if (!existsSync(join(shop, 'node_modules'))) fail('FAIL', `no node_modules — npm run template -- clone ${kind} --install (a release runs the whole prebuild)`)
  const guards = (readJson(join(shop, 'package.json'), {}).scripts?.prebuild ?? '').split('&&').map((s) => s.trim()).filter(Boolean)
  console.log(`release ${kind} ${version}: ${guards.length} prebuild guard(s), one by one`)
  const broke = runGuards(shop, guards)
  if (broke) fail('FAIL', `guard ${broke}`)
  // A generating step of prebuild (a tree snapshot, a map) that changed a file means the commit is stale: the tag would not be what was checked.
  const after = uncommitted()
  if (after.length) fail('FAIL', `prebuild changed files — commit them and release again: ${after.join(', ')}`)
  if (DRY) { console.log(`===TEMPLATE_DRY_OK=== ${kind} ${version}: every guard is green; nothing tagged or pushed`); process.exit(0) }
  git(shop, ['tag', '-a', version, '-m', `${version}: ${flag('--message') ?? 'template release'}`])
  push(shop, pin.repo, version)
  console.log(`===TEMPLATE_RELEASED=== ${kind} ${version} ${git(shop, ['rev-parse', '--short', 'HEAD'])} — pin it: npm run template -- pin ${kind} ${version}`)
  process.exit(0)
}

if (cmd === 'pin') {
  const version = positional[0]
  if (!/^v\d+\.\d+\.\d+$/.test(version ?? '')) fail('USAGE', 'pin <custom|native> <vX.Y.Z> [--dry]')
  if (pin.version === version) { console.log(`===TEMPLATE_PINNED=== ${kind} already ${version}`); process.exit(0) }
  const rel = `WEB4-ITEMS-REGISTRY/${KINDS[kind]}`
  const headText = git(ROOT, ['show', `HEAD:${rel}`])
  const next = JSON.stringify({ ...JSON.parse(headText), version }, null, 2) + '\n'
  // 735 A1: a template whose newborn cannot take every «any» tool of the core is not pinned (the matrix test; no clone here — skipped).
  try { console.log(execFileSync(process.execPath, [join(ROOT, 'scripts', 'tools-protocol.test.mjs'), kind, version], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }).trim()) } catch (e) {
    fail('PROTOCOL', `${String(e.stderr || '').trim().split('\n').slice(-4).join(' | ').slice(0, 600)} — fix the template (or the core's tool), release the next patch, pin that`)
  }
  if (DRY) { console.log(`===TEMPLATE_DRY_OK=== would pin ${kind} ${pin.version} → ${version}: one file (${rel}) in one commit`); process.exit(0) }
  writeFileSync(pinFile, next)
  const commit = commitOne(rel, next, `Pin the ${kind} element template at ${version} (npm run template -- pin)`)
  console.log(`===TEMPLATE_PINNED=== ${kind} ${pin.version} → ${version} in ${commit.slice(0, 7)} — push the core: git push origin main`)
  process.exit(0)
}

if (cmd === 'rollout') {
  const [version, ...paths] = positional
  const also = (flag('--also') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  // No template path but --also: publish what the elements changed themselves (an instruction from `npm run instruction:element`).
  if (!/^v\d+\.\d+\.\d+$/.test(version ?? '') || (!paths.length && !also.length)) fail('USAGE', 'rollout <custom|native> <vX.Y.Z> [<path…>] [--elements a,b] [--keep-own-rows <old tag>] [--also a,b] [--regen <script,…>] [--merge-base <tag>] [--message "…"] [--dry]')
  if (!gitOk(shop, ['rev-parse', `${version}^{commit}`])) fail('FAIL', `the workshop has no tag ${version} — npm run template -- clone ${kind}`)
  const keepFrom = flag('--keep-own-rows')
  // 761-16d: `--append-section "## Heading"` brings one new section of a Markdown file into an element that lacks it, keeping the
  // element's own text; package.json only ever gains the template's scripts the element lacks — an element's package.json is its own.
  const appendHead = flag('--append-section')
  const only = flag('--elements') ? new Set(flag('--elements').split(',').map((s) => s.trim())) : null
  const skip = new Set((flag('--skip') ?? '').split(',').map((s) => s.trim()).filter(Boolean))
  const message = flag('--message') ?? `files of the ${kind} template ${version}`
  // 778: `--regen build-parts-map` — a file an element GENERATES from its own tree (its parts map) is never copied from the template: the
  // element's own generator runs after the template's files land, and its output rides along when it is named in `--also`. ✗ 2026-11-17:
  // root's PARTS.json held 6.7 KB of root's own parts the template's copy would have erased (its build would fail check:parts-map).
  const regen = (flag('--regen') ?? '').split(',').map((x) => x.trim()).filter(Boolean)
  // 778: `--merge-base <the tag the elements were rolled from>` — a file the element changed itself is MERGED with the template's change
  // (`git merge-file`: base = that tag, ours = the element, theirs = this version), never overwritten; a conflict stops the rollout
  // naming the file (its own agent merges it). ✗ 2026-11-17: root's own rows of .claude/modes/build.md were erased, its guard failed.
  const mergeBase = flag('--merge-base')
  if (mergeBase && !gitOk(shop, ['rev-parse', `${mergeBase}^{commit}`])) fail('FAIL', `the workshop has no tag ${mergeBase}`)
  const registryRel = 'WEB4-ITEMS-REGISTRY/web4-items.json'
  const registry = readJson(join(ROOT, registryRel), { services: [] }).services ?? []
  const want = kind === 'native' ? 'native' : 'custom'
  const rows = (text) => text.replace(/\r\n/g, '\n').split('\n').filter((l) => /^\|/.test(l))
  const pins = []
  for (const s of registry) {
    if (skip.has(s.id) || (only && !only.has(s.id))) continue
    const dir = join(ROOT, 'WEB4-ITEMS', s.kind === 'core' ? 'core' : 'user', s.address ?? s.id)
    if (!existsSync(join(dir, '.git'))) continue
    const type = readJson(join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), {}).elementType ?? 'custom'
    if (!only && type !== want) continue
    const at = git(dir, ['describe', '--tags', '--always'])
    if (at !== s.version) { console.log(`· ${s.id}: HEAD ${at} is not its pin ${s.version} — left alone`); continue }
    const changed = []
    const created = []
    // 778: the same restore as below, usable before the commit step (a generator that fails leaves nothing behind).
    const restore0 = () => {
      const back = changed.filter((p) => !created.includes(p))
      if (back.length) git(dir, ['checkout', 'HEAD', '--', ...back])
      for (const p of created) { rmSync(join(dir, p), { force: true }); dropEmptyParents(dir, p) }
    }
    for (const p of paths) {
      let next = gitFile(shop, version, p)
      const file = join(dir, p)
      const now = existsSync(file) ? readFileSync(file, 'utf8') : null
      if (keepFrom && now !== null && p.endsWith('.md')) {
        const inherited = new Set(rows(gitFile(shop, keepFrom, p)))
        const templateRows = new Set(rows(next))
        const own = rows(now).filter((r) => !inherited.has(r) && !templateRows.has(r))
        if (own.length) {
          const lines = next.replace(/\r\n/g, '\n').split('\n')
          const sep = lines.findIndex((l) => /^\|\s*-/.test(l))
          if (sep < 0) fail('FAIL', `${s.id}: ${p} of the template has no table to keep the element's ${own.length} own row(s)`)
          lines.splice(sep + 1, 0, ...own)
          next = lines.join('\n')
        }
      }
      if (now !== null && p === 'package.json') {
        const mine = JSON.parse(now); const theirs = JSON.parse(next)
        // only a script whose file this rollout brings (✗ 2026-11-16 first run: every missing template script came along, some to files
        // the element lacks)
        const add = Object.entries(theirs.scripts ?? {}).filter(([k, v]) => !(k in (mine.scripts ?? {})) && paths.some((q) => q !== 'package.json' && String(v).includes(q)))
        if (!add.length) continue
        mine.scripts = { ...(mine.scripts ?? {}), ...Object.fromEntries(add) }
        next = JSON.stringify(mine, null, 2) + '\n'
      } else if (now !== null && appendHead && p.endsWith('.md')) {
        if (now.includes(appendHead)) continue
        const i = next.indexOf(appendHead)
        if (i < 0) fail('FAIL', `${p} of the template has no section «${appendHead}»`)
        const rest = next.slice(i + appendHead.length); const end = rest.search(/\n## /)
        next = `${now.replace(/\s*$/, '')}\n\n${appendHead}${end < 0 ? rest : rest.slice(0, end + 1)}`.replace(/\s*$/, '\n')
      }
      if (mergeBase && now !== null) {
        let base = null
        try { base = gitFile(shop, mergeBase, p) } catch { base = null }
        if (base !== null && base.replace(/\r\n/g, '\n') !== now.replace(/\r\n/g, '\n')) {
          const tmp = mkdtempSync(join(tmpdir(), 'merge-'))
          const [o, b0, t] = ['ours', 'base', 'theirs'].map((n) => join(tmp, n))
          writeFileSync(o, now); writeFileSync(b0, base); writeFileSync(t, next)
          let clean = true
          try { execFileSync('git', ['merge-file', '-q', o, b0, t], { stdio: 'ignore', windowsHide: true }) } catch { clean = false }
          const merged = readFileSync(o, 'utf8')
          rmSync(tmp, { recursive: true, force: true })
          if (!clean) { restore0(); fail('FAIL', `${s.id}: ${p} — the element changed it and the merge with ${version} conflicts; leave it out and let its own agent merge it — its files are back as they were`) }
          next = merged
        }
      }
      if (now !== null && now.replace(/\r\n/g, '\n') === next.replace(/\r\n/g, '\n')) continue
      if (now === null) created.push(p)
      // 778: a file the template brings into a folder the element does not have yet (a new branch, a new skill) — the folder first.
      // ✗ 2026-11-17: the rollout of v0.3.215 stopped with ENOENT on `.claude/skills/build-skills/skills/telegram-mini-app/SKILL.md`.
      if (now === null) mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, now !== null && now.includes('\r\n') ? next.replace(/\r?\n/g, '\r\n') : next)
      changed.push(p)
    }
    // 778: the element's own generators over the new tree; a generated file that was clean before comes back from HEAD on a dry run.
    const cleanBefore = also.filter((p) => !git(dir, ['status', '--porcelain', '--', p]))
    for (const g of regen) {
      const script = join(dir, 'scripts', `${g}.mjs`)
      if (!existsSync(script)) { restore0(); fail('FAIL', `${s.id}: no scripts/${g}.mjs to regenerate with — its files are back as they were`) }
      try { execFileSync(process.execPath, [script], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }) } catch (e) {
        restore0(); fail('FAIL', `${s.id}: ${g} — ${String(e.stderr || e.message).trim().split('\n').slice(-2).join(' | ').slice(0, 300)} — its files are back as they were`)
      }
    }
    const alsoChanged = also.filter((p) => git(dir, ['status', '--porcelain', '--', p]))
    const all = [...changed, ...alsoChanged]
    if (!all.length) { console.log(`· ${s.id} ${at}: already current`); continue }
    // a file the rollout created has no HEAD to come back to: it is removed; the others come back from HEAD
    const restore = () => {
      const back = changed.filter((p) => !created.includes(p))
      if (back.length) git(dir, ['checkout', 'HEAD', '--', ...back])
      for (const p of created) { rmSync(join(dir, p), { force: true }); dropEmptyParents(dir, p) }
    }
    // 778: a generated file that was clean before the rollout comes back from HEAD too (a dry run, a broken guard).
    const restoreGen = () => { const gen = cleanBefore.filter((p) => git(dir, ['status', '--porcelain', '--', p])); if (gen.length) git(dir, ['checkout', 'HEAD', '--', ...gen]) }
    git(dir, ['add', '--', ...all])
    // 778: the element's guards run on a dry run as well — a dry «OK» that the real run then refuses costs the person a second paste.
    const broke = runGuards(dir, ELEMENT_GUARDS.filter((g) => existsSync(join(dir, 'scripts', `${g}.mjs`))).map((g) => `node scripts/${g}.mjs`))
    if (broke) { git(dir, ['reset', '-q', '--', ...all]); restore(); restoreGen(); fail('FAIL', `${s.id}: ${broke} — its files are back as they were`) }
    if (DRY) {
      git(dir, ['reset', '-q', '--', ...all]); restore(); restoreGen()
      console.log(`· ${s.id} ${at}: would change ${all.join(', ')} (its guards are green)`); continue
    }
    const tag = nextPatch(s.version)
    if (!tag || gitOk(dir, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`])) fail('FAIL', `${s.id}: no free next tag after ${s.version}`)
    git(dir, ['commit', '-q', '-m', `${message} (template ${kind} ${version})`, '--', ...all])
    git(dir, ['tag', '-a', tag, '-m', `${tag}: ${message}`])
    // 832-8 (measured 2026-11-21: j58fl's registry `repo` is the TEMPLATE's own repository, and an element born on a dedicated server has
    // none of its own): an element is pushed only to a repository of its own — never to the template it was born from (its HEAD would
    // land on the template's main). Without one, the release stays on this node: the commit and the tag here, the pin below.
    const norm = (u) => String(u ?? '').replace(/\.git$/, '').replace(/\/+$/, '').toLowerCase()
    if (s.repo && norm(s.repo) !== norm(pin.repo)) push(dir, s.repo, tag)
    else console.log(`· ${s.id}: no repository of its own — ${tag} stays on this node`)
    pins.push([s.id, s.version, tag])
    console.log(`✓ ${s.id} ${s.version} → ${tag} (${all.join(', ')})`)
  }
  if (DRY) { console.log(`===TEMPLATE_DRY_OK=== rollout ${kind} ${version}: nothing written`); process.exit(0) }
  if (!pins.length) { console.log(`===TEMPLATE_ROLLOUT_OK=== nothing to change`); process.exit(0) }
  // Pins: the working registry (node state stays in it) and one commit of HEAD's registry with only the versions changed.
  const setVersions = (text) => { const j = JSON.parse(text.replace(/^﻿/, '')); for (const [id, , tag] of pins) { const e = j.services.find((x) => x.id === id); if (e) e.version = tag } return JSON.stringify(j, null, 2) + '\n' }
  writeFileSync(join(ROOT, registryRel), setVersions(readFileSync(join(ROOT, registryRel), 'utf8')))
  const commit = commitOne(registryRel, setVersions(git(ROOT, ['show', `HEAD:${registryRel}`])), `Pin ${pins.map(([id, , t]) => `${id} ${t}`).join(', ')} (npm run template -- rollout ${kind} ${version})`)
  console.log(`===TEMPLATE_ROLLOUT_OK=== ${pins.length} element(s) released and pinned in ${commit.slice(0, 7)} — push the core: git push origin main`)
  process.exit(0)
}

// 859 (the fractera.ai server, 2026-11-24: «a born element cannot take the template update» — the Update button is only for preinstalled
// elements, the rollout leaves an element ahead of its pin alone). The element's own agent merges; the core only names what and why.
if (cmd === 'offer' || cmd === 'taken') {
  const registryRel = 'WEB4-ITEMS-REGISTRY/web4-items.json'
  const id = positional[0]
  const entry = (readJson(join(ROOT, registryRel), { services: [] }).services ?? []).find((x) => x.id === id)
  if (!entry) fail('FAIL', `no element «${id}» in the registry`)
  if (!entry.born) fail('FAIL', `${id} is not born on this node — a preinstalled element takes a template by its Update button or a rollout`)
  if (entry.born.from !== pin.from) fail('FAIL', `${id} was born from ${entry.born.from}, not from the ${kind} template ${pin.from}`)
  if (cmd === 'taken') {
    const tag = positional[1]
    if (!/^v\d+\.\d+\.\d+$/.test(tag ?? '') || !gitOk(shop, ['rev-parse', `${tag}^{commit}`])) fail('USAGE', `taken ${kind} ${id} <a tag of the workshop>`)
    const setTaken = (text) => { const j = JSON.parse(text.replace(/^\uFEFF/, '')); const e = j.services.find((x) => x.id === id); if (e) e.templateTaken = { version: tag, at: new Date().toISOString() }; return JSON.stringify(j, null, 2) + '\n' }
    if (DRY) { console.log(`===TEMPLATE_DRY_OK=== ${id} would record ${tag}`); process.exit(0) }
    writeFileSync(join(ROOT, registryRel), setTaken(readFileSync(join(ROOT, registryRel), 'utf8')))
    const commit = commitOne(registryRel, setTaken(git(ROOT, ['show', `HEAD:${registryRel}`])), `${id} took the ${kind} template ${tag} (npm run template -- taken)`)
    console.log(`===TEMPLATE_TAKEN=== ${id} ${tag} recorded in ${commit.slice(0, 7)} — push the core: git push origin main`)
    process.exit(0)
  }
  const base = entry.templateTaken?.version ?? entry.born.version
  const target = pin.version
  if (!gitOk(shop, ['rev-parse', `${target}^{commit}`])) fail('FAIL', `the workshop has no tag ${target} — npm run template -- clone ${kind}`)
  if (!gitOk(shop, ['rev-parse', `${base}^{commit}`])) fail('FAIL', `the workshop has no tag ${base} (the one ${id} took last)`)
  if (base === target) { console.log(`===TEMPLATE_OFFER_NONE=== ${id} already took ${target}`); process.exit(0) }
  const changed = git(shop, ['diff', '--name-only', base, target]).split('\n').filter(Boolean)
  const subjects = git(shop, ['log', '--format=- %s', `${base}..${target}`]).split('\n').filter(Boolean).slice(0, 12).map((l) => l.slice(0, 160))
  const text = [
    `Build process: take the ${kind} template's pinned release ${target} into your folder — you were born from it and last took ${base}; the core never writes into a born element, so this merge is yours (core step 859).`,
    `${changed.length} path(s) changed between them. What the releases bring:`,
    ...subjects,
    `How: git fetch ${pin.repo} tag ${base} tag ${target} --no-tags; then for every path of \`git diff --name-only ${base} ${target}\`: a path you never changed since ${base} — take the template's file; a path you changed — git merge-file (yours, base = ${base}, theirs = ${target}); a new file — add it; a deleted one — delete it unless you use it. Your own commits and your own work stay; resolve a conflict in your favour where it is your product, in the template's where it is the node's machinery, and name each one.`,
    // ✗ 2026-11-25 fractera.ai (its agent, «for-mac-quiz-visibility» §1): a template carrying the quiz tree (852) reached the marketplace,
    // but its tree stayed as text in current-step.md and quiz.json had no `tree` — the Pult and the bots saw no quiz. A changed skill asks
    // the element to bring its own data to the skill's form in the same merge.
    `A changed skill applies to your data now: read each skill this release changes; if it changes the form of your data (the product quiz's \`tree\` in development-docs/product/quiz.json is one), bring your existing data to that form in the same work — e.g. a quiz tree kept elsewhere moves into quiz.json \`tree\` with its numbers and marks as they are, then \`npm run quiz:tree\` must pass — and commit it separately «Bring <what> to the form of <skill>».`,
    `Then run your prebuild (RC=0), commit in English «Take the ${kind} template ${target}», do NOT deploy. Report with npm run reply-core in at most 6 lines: the commit hash, the prebuild result, the conflicts and how you resolved them.`,
  ].join('\n')
  if (DRY) { console.log(text); console.log(`===TEMPLATE_DRY_OK=== offer ${id}: ${base} → ${target}, ${changed.length} path(s); nobody woken`); process.exit(0) }
  try {
    const out = execFileSync(process.execPath, [join(ROOT, 'scripts', 'main-agent-cli.mjs'), 'task', id, text], { cwd: ROOT, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    console.log(out.trim().split('\n').pop())
  } catch (e) { fail('FAIL', `the task did not reach ${id}: ${String(e.stdout || e.message).trim().split('\n').pop()}`) }
  console.log(`===TEMPLATE_OFFERED=== ${id}: ${base} → ${target}, ${changed.length} path(s); after its report: npm run template -- taken ${kind} ${id} ${target}`)
  process.exit(0)
}

fail('USAGE', 'npm run template -- clone|status|release|pin|rollout|offer|taken <custom|native> …')
