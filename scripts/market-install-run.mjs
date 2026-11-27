// The detached runner of a bought starter's install (core step 862-3): `node scripts/market-install-run.mjs <order> <slug> <log> [--again]`.
// Started by `lib/web4-items/market-purchase.mjs` through `spawn-free.mjs`, outside the core's process tree, so a core restart never
// cuts a birth. It runs `main-agent-cli.mjs market install` and writes everything it says into <log> — the door reads the state there.
import { openSync, writeSync, closeSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const [order, slug, log, ...flags] = process.argv.slice(2)
if (!/^ord-[0-9a-f]{24}$/.test(order ?? '') || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug ?? '') || !log) process.exit(2)
const fd = openSync(log, 'w')
writeSync(fd, `market install ${order} ${slug} · ${new Date().toISOString()}\n`)
const r = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'main-agent-cli.mjs'), 'market', 'install', order, slug, ...(flags.includes('--again') ? ['--again'] : [])], { cwd: process.cwd(), encoding: 'utf8', windowsHide: true, timeout: 25 * 60_000 })
writeSync(fd, `${r.stdout ?? ''}${r.stderr ?? ''}`)
if (r.status !== 0 && !/===MAIN_AGENT_FAIL===/.test(`${r.stdout}${r.stderr}`)) writeSync(fd, `\n===MAIN_AGENT_FAIL=== install exited ${r.status ?? 'by a signal'}\n`)
closeSync(fd)
