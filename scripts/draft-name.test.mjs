// A NEW ELEMENT IS NAMED AT ITS FIRST CLICK (node step 749-2). The owner, 2026-11-15: «вместо того чтобы показать его название ты
// показываешь его идентификатор» — the panel's «+ Создать элемент» made a draft with only a random id and its birth passed no `--name`,
// so the element was called by its id everywhere. Now the door cleans the name by `name-file.cjs` `cleanName` (an empty one is refused),
// keeps it in the core's name store, the draft's deletion removes it, and the birth carries it (`birth-args.mjs`).
// `node scripts/draft-name.test.mjs` → `===DRAFT_NAME_OK===` or a failed assertion.
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { birthArgs } from '../lib/web4-items/birth-args.mjs'

const require = createRequire(import.meta.url)
const nameFile = require('../lib/web4-items/name-file.cjs')

const root = mkdtempSync(join(tmpdir(), 'draft-name-'))
let n = 0
const test = (title, fn) => { fn(); n++; console.log(`  ✓ ${title}`) }

try {
  test('the door refuses an empty name (negative): nothing, spaces, not a string', () => {
    for (const raw of [undefined, null, '', '   ', '\n\t', 42, {}, ['x']]) assert.equal(nameFile.cleanName(raw), '', String(raw))
  })
  test('the door cleans a name: spaces folded, 60 characters at most', () => {
    assert.equal(nameFile.cleanName('  Проба   имени '), 'Проба имени')
    assert.equal(nameFile.cleanName('я'.repeat(70)).length, nameFile.NAME_MAX)
  })
  test('the draft is called by its name from the first second, not by its id', () => {
    nameFile.writeName('qwert', 'Проба имени', root)
    assert.equal(nameFile.ownName('qwert', root), 'Проба имени')
    assert.equal(nameFile.displayName('qwert', { root, address: 'qwert' }), 'Проба имени')
  })
  test('the draft deleted — its name goes with it, and nothing is left to call it', () => {
    nameFile.writeName('qwert', '', root)
    assert.equal(existsSync(join(root, 'data', 'services', 'qwert', 'name.json')), false)
    assert.equal(nameFile.displayName('qwert', { root, address: 'qwert' }), 'qwert')
  })
  test('the birth carries the name: a custom element, with and without a repository', () => {
    assert.deepEqual(birthArgs('qwert', { app: 'project' }, 'Проба имени'), ['qwert', '--app', 'project', '--name', 'Проба имени'])
    assert.deepEqual(birthArgs('qwert', { app: 'own', repo: 'https://github.com/o/p' }, 'Сайт'), ['qwert', '--app', 'own', '--repo', 'https://github.com/o/p', '--name', 'Сайт'])
  })
  test('the birth carries the name: a native element', () => {
    assert.deepEqual(birthArgs('qwert', { native: true }, 'Контент-завод'), ['qwert', '--native', '--name', 'Контент-завод'])
  })
  test('negative: without a name the birth says nothing about it (as before 749)', () => {
    assert.deepEqual(birthArgs('qwert', { app: 'project' }), ['qwert', '--app', 'project'])
    assert.deepEqual(birthArgs('qwert', { app: 'project' }, '   '), ['qwert', '--app', 'project'])
    assert.deepEqual(birthArgs('qwert', { native: true }, null), ['qwert', '--native'])
  })
} finally {
  rmSync(root, { recursive: true, force: true })
}

console.log(`===DRAFT_NAME_OK=== ${n} tests`)
