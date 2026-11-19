// GUARD: ONE DOOR FOR TRANSITIONS (node step 743-3). A one-time transition between versions lives in `lib/migrations/` and runs only
// through the ledger (`lib/deploy/migrations.mjs`), which every entry point calls.
// ✗ 2026-11-14: the place migration hung on `serve.mjs start`, the update runs `rebuild`, the migration was missed and «fixed» with a
// second hand-placed copy (8f165354). Four rules:
//   (a) every file in lib/migrations/ keeps the contract: `id` = its name, `why`, `run`, `wraps` (an array of function names);
//   (b) a function a migration wraps is called nowhere but in that migration (its own defining file and tests aside);
//   (c) nothing but the runner imports a file of lib/migrations/;
//   (d) the runner is called from every entry point that brings code to life: serve start and rebuild, the computer's installation, the
//       server's installation, the update.
// `--root <dir>` checks another copy (the negative control plants a violation there).
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const at = process.argv.indexOf('--root')
const ROOT = at > 0 ? resolve(process.argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = 'lib/migrations/'
const RUNNER = 'lib/deploy/migrations.mjs'
const bad = []

const list = spawnSync('git', ['-C', ROOT, 'ls-files', '--cached', '--others', '--exclude-standard', '--', 'lib', 'scripts', 'app', 'components'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
if (list.status !== 0) { console.error(`check:migrations: git ls-files failed — ${list.stderr}`); process.exit(1) }
const all = list.stdout.split('\n').filter((p) => p && existsSync(join(ROOT, p)))
const code = all.filter((p) => /\.(mjs|cjs|js|ts|tsx|sh)$/.test(p) && !/\.test\.(mjs|cjs|js|ts)$/.test(p))
const migrations = all.filter((p) => p.startsWith(DIR) && /^\d[\w.-]*\.mjs$/.test(basename(p)))

// (a) the contract, read by importing each file (bare node, as the runner does)
const wraps = new Map() // function name → the migration that owns it
for (const p of migrations) {
  const id = basename(p, '.mjs')
  try {
    const m = await import(pathToFileURL(join(ROOT, p)).href)
    if (m.id !== id) bad.push(`${p} — exports id «${m.id}», must be «${id}»`)
    if (typeof m.why !== 'string' || !m.why.trim()) bad.push(`${p} — no «why» line`)
    if (typeof m.run !== 'function') bad.push(`${p} — no run(root)`)
    if (!Array.isArray(m.wraps)) bad.push(`${p} — no «wraps» array (the functions only it may call)`)
    else for (const f of m.wraps) wraps.set(f, p)
  } catch (e) { bad.push(`${p} — does not load: ${e.message}`) }
}

for (const p of code) {
  const text = readFileSync(join(ROOT, p), 'utf8')
  const lines = text.split('\n')
  // (b) a wrapped function called outside its migration and its own defining file
  for (const [f, owner] of wraps) {
    if (p === owner) continue
    // 804-4: a CommonJS module defines its function at the start of a line (`function f(`), an ES module exports it.
    const defines = new RegExp(`(export\\s+(async\\s+)?|^(async\\s+)?)function\\s+${f}\\b`, 'm').test(text)
    lines.forEach((line, i) => {
      if (defines && new RegExp(`function\\s+${f}\\b`).test(line)) return
      if (new RegExp(`(?<![\\w.])${f}\\s*\\(`).test(line) && !/^\s*(\/\/|\*)/.test(line) && !defines) {
        bad.push(`${p}:${i + 1} — calls ${f}(), which only ${owner} may call: a transition runs through the ledger (npm run migrate)`)
      }
    })
  }
  // (c) only the runner (and the migrations themselves) import a migration file
  if (p !== RUNNER && !p.startsWith(DIR)) {
    lines.forEach((line, i) => { if (/lib\/migrations\/\d/.test(line) && /import|require/.test(line)) bad.push(`${p}:${i + 1} — imports a migration directly: only ${RUNNER} runs them`) })
  }
}

// (d) every entry point calls the runner
const has = (p, re) => existsSync(join(ROOT, p)) && re.test(readFileSync(join(ROOT, p), 'utf8'))
const ENTRY = [
  ['scripts/serve.mjs', /runMigrations\(root, 'start'\)/, 'serve start'],
  ['scripts/serve.mjs', /runMigrations\(root, 'rebuild'\)/, 'serve rebuild'],
  ['scripts/launch.mjs', /'migrate\.mjs', '--by', 'install'/, "the computer's installation"],
  ['scripts/dedicated-server/install.sh', /scripts\/migrate\.mjs --by install/, "the server's installation"],
  ['scripts/node-update.mjs', /'migrate\.mjs'\), '--by', 'update'/, 'the update after its merge'],
]
for (const [p, re, what] of ENTRY) if (!has(p, re)) bad.push(`${p} — ${what} no longer calls the migration ledger`)

if (bad.length) {
  console.error(`===MIGRATIONS_REFUSED=== ${bad.length}\n${bad.join('\n')}`)
  process.exit(1)
}
console.log(`===MIGRATIONS_OK=== ${migrations.length} migrations, ${wraps.size} wrapped functions, ${ENTRY.length} entry points call the ledger`)
