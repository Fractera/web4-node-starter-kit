// THE NAME THAT DELETES AN ELEMENT (node step 749-1). The owner, 2026-11-15: «при удалении элемента вместо того чтобы показать его
// название ты показываешь его идентификатор». The delete dialogs and doors take the element's NAME for people — the core's name file →
// the passport's name → the address (`name-file.cjs` `displayName`, 678-1) — compared by `name-match.mjs` `sameName` (spaces folded,
// case ignored). Proven over a temp folder: a named element is NOT deleted by its id or its address (the negative control), an unnamed
// one is deleted by its address as before.
// `node scripts/element-name-confirm.test.mjs` → `===ELEMENT_NAME_CONFIRM_OK===` or a failed assertion.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { normName, sameName } from '../lib/web4-items/name-match.mjs'

const require = createRequire(import.meta.url)
const nameFile = require('../lib/web4-items/name-file.cjs')

const root = mkdtempSync(join(tmpdir(), 'name-confirm-'))
let n = 0
const test = (title, fn) => { fn(); n++; console.log(`  ✓ ${title}`) }

try {
  mkdirSync(join(root, 'data', 'services', 'abcde'), { recursive: true })
  writeFileSync(join(root, 'data', 'services', 'abcde', 'name.json'), JSON.stringify({ name: 'Сайт  Fractera' }))

  test('a named element is called by its name, not by its id', () => {
    assert.equal(nameFile.displayName('abcde', { root, passportName: 'abcde', address: 'abcde' }), 'Сайт Fractera')
  })
  test('its name deletes it: spaces folded, case ignored', () => {
    const name = nameFile.displayName('abcde', { root, passportName: 'abcde', address: 'abcde' })
    assert.equal(sameName('Сайт Fractera', name), true)
    assert.equal(sameName('  сайт   FRACTERA ', name), true)
  })
  test('negative: its id, its address with the zone, a part or nothing never delete it', () => {
    const name = nameFile.displayName('abcde', { root, passportName: 'abcde', address: 'abcde' })
    for (const typed of ['abcde', 'abcde.aifa.dev', 'Сайт', '', '   ', undefined, null, 42, {}]) assert.equal(sameName(typed, name), false, String(typed))
  })
  test('a passport name counts when the core has none', () => {
    const name = nameFile.displayName('klmno', { root, passportName: 'Блог', address: 'klmno' })
    assert.equal(name, 'Блог')
    assert.equal(sameName('блог', name), true)
    assert.equal(sameName('klmno', name), false)
  })
  test('an unnamed element (the passport says its id) is deleted by its address, as before', () => {
    const name = nameFile.displayName('fghij', { root, passportName: 'fghij', address: 'fghij' })
    assert.equal(name, 'fghij')
    assert.equal(sameName('fghij', name), true)
  })
  test('the rule itself: one form for the dialog and the door', () => {
    assert.equal(normName('  A\t b \n C '), 'a b c')
    assert.equal(normName(undefined), '')
  })
} finally {
  rmSync(root, { recursive: true, force: true })
}

console.log(`===ELEMENT_NAME_CONFIRM_OK=== ${n} tests`)
