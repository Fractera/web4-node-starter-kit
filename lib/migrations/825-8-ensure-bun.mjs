// 825-8 — the agents' Telegram ready (`scripts/telegram-ready.mjs`: Bun, the plugin, its dependencies — the live failure of 2026-11-21 on
// the owner's fresh server). A server's install has it as a fatal stage; a node installed before, or updated without a change of
// dependencies (no `npm install`), gets it here once. Not ready → not done, tried again at the next entry point.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const id = '825-8-ensure-bun'
export const why = 'Bun, the Telegram plugin and its dependencies ready before an agent starts; a node installed without them gets them once'
export const wraps = []

export function run(root) {
  // The script beside this file (the same tree), not under `root`: a throwaway node folder of the test has no scripts.
  const script = fileURLToPath(new URL('../../scripts/telegram-ready.mjs', import.meta.url))
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 900_000 })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  const line = out.split(/\r?\n/).find((l) => /===TELEGRAM_READY(_FAILED)?===/.test(l)) ?? `telegram-ready ended with code ${r.status}`
  return r.status === 0 && /===TELEGRAM_READY===/.test(line) ? { done: true, note: line.trim() } : { done: false, reason: line.trim() }
}
