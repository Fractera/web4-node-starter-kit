// EVERY NATIVE ELEMENT HAS ITS SECTION IN THE LEFT MENU (node step 631, 2026-11-03): `npm run check:native-sections`, part of `prebuild`.
//
// The owner, 2026-11-03: «По какой-то причине отсутствует страйп хотя я уже многократно говорил что нативные элементы которые по
// умолчанию выключены всё равно должны устанавливаться. Я до сих пор не вижу нашего нового нормативного элемента который мы создали для
// embending». Measured the same day: stripe (step 573) was installed on the owner's node, but the core had no folder
// `architect/stripe/`, and `embeddings` (626-2) had none either — the left menu is built from those folders (`_lib/architect-menu.ts`,
// `builtInIds()` in `lib/web4-items/built-in-elements.ts`), so both stayed invisible and nothing failed.
// The rule: every element of the registry with `kind: "core"` (installed by the node, turned on or off by its passport) has its section
// `architect/<id>/_data/index.ts` and its agent kit `architect/<id>/agent-kit.json` (`npm run agent-kit:add -- <id>`).
// `--registry <path>` checks another registry (the negative control).
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const i = args.indexOf('--registry')
const registry = i >= 0 ? args[i + 1] : join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json')
const ARCHITECT = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect')

// 716: a native Fractera retired has no section to have — the installer removes its entry (`lib/web4-items/retired-natives.cjs`).
const { isRetired } = createRequire(import.meta.url)('../lib/web4-items/retired-natives.cjs')
const natives = (JSON.parse(readFileSync(registry, 'utf8').replace(/^﻿/, '')).services ?? []).filter((s) => s.kind === 'core' && !isRetired(s))
const missing = []
for (const s of natives) {
  if (!existsSync(join(ARCHITECT, s.id, '_data', 'index.ts'))) missing.push(`${s.id} — no section architect/${s.id}/_data/index.ts: the left menu does not show it`)
  else if (!existsSync(join(ARCHITECT, s.id, 'agent-kit.json'))) missing.push(`${s.id} — no agent kit in architect/${s.id}/: npm run agent-kit:add -- ${s.id}`)
}
if (missing.length) {
  for (const m of missing) console.log(`  ✗ ${m}`)
  console.log(`===NATIVE_SECTIONS_FAIL=== ${missing.length} of ${natives.length} native elements have no section (the pattern: architect/cache/README.md)`)
  process.exit(1)
}
console.log(`===NATIVE_SECTIONS_OK=== ${natives.length} of ${natives.length} native elements have their section and agent kit`)
