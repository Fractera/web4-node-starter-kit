// 825-8 — Bun on the machine: the agents' Telegram channel runs its plugin on it (`scripts/ensure-bun.mjs` says why, with the live
// failure of 2026-11-21 on the owner's fresh server). `preinstall` installs it on a new node; a node installed before — or updated
// without a change of dependencies, which skips `npm install` — gets it here, once. Bun's own installer needs the network: no bun after
// the run → not done, tried again at the next entry point; the node runs on meanwhile, only Telegram waits.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const id = '825-8-ensure-bun'
export const why = 'the Telegram plugin of every agent runs on Bun; a node installed without it gets it once'
export const wraps = []

export function run(root) {
  // The script beside this file (the same tree), not under `root`: a throwaway node folder of the test has no scripts.
  const script = fileURLToPath(new URL('../../scripts/ensure-bun.mjs', import.meta.url))
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 900_000 })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  const line = out.split(/\r?\n/).find((l) => /===BUN_(PRESENT|INSTALLED|FAILED)===/.test(l)) ?? `ensure-bun ended with code ${r.status}`
  return /===BUN_(PRESENT|INSTALLED)===/.test(line) ? { done: true, note: line.trim() } : { done: false, reason: line.trim() }
}
