// TESTS OF THE ELEMENT TREE: WHO SEES «РАБОЧИЙ ПРОЦЕСС» (node step 745). In the prebuild.
// The owner, 2026-11-15: «в нативном клиенте авторизация появились в рабочем процессе вкладка провайдера. Вкладки Google и волшебное
// письмо по умолчанию существуют … на вкладке провайдеры есть кнопка добавить нового провайдера»; «то что касается страницы для резервного
// копирования верни их туда где они были» (into «Рабочий процесс» of data, storage, vectors, graph).
// ✗ Measured 2026-11-14: the screens /auth/google and /auth/resend lived outside the element's tree — no menu item led to them.
// `lib/web4-items/item-tree.ts` is read by the project's TypeScript compiler (transpileModule), as `check-main-agent-menu` does.
// The negative control is built in: the same tree with `orAuth` cut out of «Рабочий процесс» must fail the auth check.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(join(ROOT, 'lib', 'web4-items', 'item-tree.ts'), 'utf8').replace(/\r\n/g, '\n')
const tmp = mkdtempSync(join(tmpdir(), 'item-tree-test-'))
let n = 0
async function load(source) {
  const out = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const file = join(tmp, `item-tree-${++n}.mjs`)
  writeFileSync(file, out)
  return import(pathToFileURL(file).href)
}

let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}

const messengers = { h2a: false, h2h: false, a2a: false }
const CTX = {
  auth: { catalog: false, messengers, native: true, app: 'project', memory: false, auth: true, web4: false, payment: false },
  data: { catalog: false, messengers, native: true, app: 'project', memory: true, auth: false, web4: false, payment: false },
  config: { catalog: false, messengers, native: true, app: 'project', memory: false, auth: false, web4: false, payment: false },
  stripe: { catalog: false, messengers, native: true, app: 'project', memory: false, auth: false, web4: false, payment: true },
  custom: { catalog: false, messengers, native: false, app: 'project', memory: false, auth: false, web4: false, payment: false },
}
/** Is the page at `path` open to this element — every node of its trail visible (the route's own rule)? */
const opens = (tree, path, c) => {
  const trail = tree.findTreePath(path.split('/'))
  return Boolean(trail) && trail.every((p) => tree.treeVisible(p, c))
}
/** The menu items and cards under `path` for this element. */
const listed = (tree, path, c) => (tree.findTreePath(path.split('/'))?.at(-1)?.pages ?? []).filter((p) => tree.treeListed(p, c)).map((p) => p.slug)

const tree = await load(SOURCE)

await t('auth: «Рабочий процесс → Провайдеры» with Google, Волшебное письмо and the add page; no work session, no Процесс, no backup', () => {
  for (const p of ['workflow', 'workflow/providers', 'workflow/providers/google', 'workflow/providers/magic-link', 'workflow/providers/add']) {
    assert.ok(opens(tree, p, CTX.auth), `auth does not open ${p}`)
  }
  for (const p of ['workflow/terminal', 'workflow/process', 'workflow/backup']) assert.ok(!opens(tree, p, CTX.auth), `auth opens ${p}`)
  assert.deepEqual(listed(tree, 'workflow', CTX.auth), ['providers'])
  // the add page is reached by the button only: neither a menu item nor a card
  assert.deepEqual(listed(tree, 'workflow/providers', CTX.auth), ['google', 'magic-link'])
})

await t('a memory element: «Рабочий процесс → Резервное копирование» (tools, cron, settings); the old address leads there', () => {
  for (const p of ['workflow', 'workflow/backup', 'workflow/backup/tools', 'workflow/backup/cron', 'workflow/backup/settings']) {
    assert.ok(opens(tree, p, CTX.data), `data does not open ${p}`)
  }
  for (const p of ['workflow/providers', 'workflow/terminal', 'workflow/process']) assert.ok(!opens(tree, p, CTX.data), `data opens ${p}`)
  assert.deepEqual(listed(tree, 'workflow', CTX.data), ['backup'])
  assert.equal(tree.findTreePath(['backup']), null, 'a backup branch still stands outside «Рабочий процесс»')
  assert.equal(tree.movedPage(['backup', 'settings']), 'workflow/backup/settings')
})

await t('other native elements have no «Рабочий процесс»: config, Stripe', () => {
  assert.ok(!opens(tree, 'workflow', CTX.config))
  assert.ok(!opens(tree, 'workflow', CTX.stripe))
})

await t('a custom element keeps its working process as it was: terminal and Процесс, never providers or backup', () => {
  for (const p of ['workflow', 'workflow/terminal', 'workflow/process', 'workflow/process/subscriptions', 'workflow/process/cron']) {
    assert.ok(opens(tree, p, CTX.custom), `custom does not open ${p}`)
  }
  for (const p of ['workflow/providers', 'workflow/backup']) assert.ok(!opens(tree, p, CTX.custom), `custom opens ${p}`)
})

await t('negative control: the same tree without `orAuth` on «Рабочий процесс» hides the providers from auth', async () => {
  const cut = SOURCE.replace(/(slug: "workflow",\n\s*custom: true,\n[^\n]*\n)\s*orAuth: true,\n/, '$1')
  assert.notEqual(cut, SOURCE, '`orAuth: true` was not found on «Рабочий процесс» to cut it out')
  const old = await load(cut)
  assert.ok(!opens(old, 'workflow/providers/google', CTX.auth))
})

await t('802: the element on the node\'s apex has no «Настройки → Домен»; «Опасная зона» stays; a custom element keeps its «Домен»', () => {
  const apex = { ...CTX.custom, apex: true }
  assert.ok(!opens(tree, 'settings/domain', apex), 'the apex holder opens settings/domain')
  assert.ok(!listed(tree, 'settings', apex).includes('domain'), 'the apex holder lists «Домен»')
  assert.ok(opens(tree, 'settings/danger-zone', apex), 'the apex holder lost «Опасная зона»')
  assert.ok(opens(tree, 'settings/domain', CTX.custom), 'a custom element lost its «Домен»')
  assert.ok(listed(tree, 'settings', CTX.custom).includes('domain'))
})

await t('802 negative control: the same tree without `ownDomain` on «Домен» shows it to the apex holder', async () => {
  const cut = SOURCE.replace('{ slug: "domain", ownDomain: true,', '{ slug: "domain",')
  assert.notEqual(cut, SOURCE, '`ownDomain: true` was not found on «Домен» to cut it out')
  const old = await load(cut)
  assert.ok(opens(old, 'settings/domain', { ...CTX.custom, apex: true }))
})

console.log(process.exitCode ? `===ITEM_TREE_TEST_FAILED=== ${passed} passed` : `===ITEM_TREE_TEST_OK=== ${passed} passed`)
