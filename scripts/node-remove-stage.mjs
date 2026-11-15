// THE LAST STAGE OF REMOVING THE NODE FROM THIS COMPUTER (node step 746-1). The owner, 2026-11-15: «полное удаление … только с
// локальной машины всего проекта … с подтверждением что пользователь понимает … данных которые потеряет безвозвратно».
//
// 🔒 THIS FILE RUNS AS A COPY IN THE SYSTEM'S TEMP FOLDER, never from the node: it deletes the folder it would live in. So it imports
// nothing of the project — node's built-ins only. `scripts/node-remove.mjs --yes` copies it and starts it outside the core's process tree
// (`spawn-free`: a child of the core dies with the pm2 tree the first move kills).
// 🔒 ORDER — FROM THE LIVING TO THE DEAD: wait for the door's answer → the node's processes (`serve.mjs remove --yes`, 371-3: by folder, the
// person's other pm2 processes untouched, `pm2 save --force`, the Windows autostart) → the agents' session journals of this folder →
// the folder → the report. Processes first: Windows does not give up a folder a process holds (EBUSY).
// 🛑 THE PROCESSES DID NOT GO — NOTHING IS DELETED. A folder deleted under a living core leaves a site answering from nowhere; the report
// names the reason and the node stays as it was.
// 🔒 ONE TRACE STAYS: `~/Fractera-removed-<date>.txt` — the folder that would hold a log is gone, and the person must see what happened.
// Usage: node <tmp copy> --stage <root> --journals <dir> [--journals <dir>…] --report <file>
import { spawnSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const one = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null }
const many = (flag) => argv.flatMap((a, i) => (a === flag && argv[i + 1] ? [argv[i + 1]] : []))
const root = one('--stage')
const report = one('--report')
const journals = many('--journals')
const wait = Number(process.env.FRACTERA_REMOVE_WAIT_MS ?? 3000)
const lines = [`Fractera: removing the project from this computer — ${new Date().toISOString()}`, `Folder: ${root}`]
const done = (ok) => {
  lines.push(ok ? 'Done: the project is removed from this computer.' : 'Stopped: nothing more was deleted.')
  lines.push('Kept: your fork on GitHub, launched servers, the tunnel and DNS in your Cloudflare account, your Claude subscription,')
  lines.push('the programs cloudflared and pm2. A new node: clone your fork and run npm run launch.')
  try { if (report) writeFileSync(report, `${lines.join('\n')}\n`) } catch { /* the report is the only trace — nothing else to write to */ }
  try { rmSync(fileURLToPath(import.meta.url), { force: true }) } catch { /* the temp folder is cleaned by the system */ }
  process.exit(ok ? 0 : 1)
}

if (!root || !existsSync(join(root, 'package.json'))) {
  lines.push('Refused: the folder is not a node.')
  done(false)
}
await new Promise((r) => setTimeout(r, wait))

const serve = join(root, 'scripts', 'serve.mjs')
const r = spawnSync(process.execPath, [serve, 'remove', '--yes'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 180_000 })
lines.push(`Processes (npm run serve:remove -- --yes): exit ${r.status ?? r.signal}`)
const said = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
if (said) lines.push(...said.split(/\r?\n/).map((l) => `  ${l}`))
if (r.status !== 0) done(false)

for (const dir of journals) {
  try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }); lines.push(`Journal deleted: ${dir}`) } catch (e) { lines.push(`Journal NOT deleted: ${dir} (${e.message})`) }
}
try {
  rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
  lines.push(existsSync(root) ? `Folder NOT deleted completely: ${root} — delete what is left by hand.` : `Folder deleted: ${root}`)
  done(!existsSync(root))
} catch (e) {
  lines.push(`Folder NOT deleted: ${e.message} — delete what is left by hand.`)
  done(false)
}
