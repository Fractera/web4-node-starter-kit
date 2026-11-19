// 804-7: an app of its own knows its owner — the node puts the part «Whose app this is» into its session prompt (lib/agent-kit/modes.cjs
// `ownAppText`, lib/agent-kit/own-app.md), its session start gives its OWN picture of its owner and never the architect's
// (lib/agent-kit/memory/brief.cjs `compose`), and the main agent's whole-diary search leaves its rows out (recall.cjs `inScope`).
// Run: node scripts/own-app.test.mjs
import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const HERE = dirname(fileURLToPath(import.meta.url))
const modes = require('../lib/agent-kit/modes.cjs')
const brief = require('../lib/agent-kit/memory/brief.cjs')
const recall = require('../lib/agent-kit/memory/recall.cjs')

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

const tmp = mkdtempSync(join(tmpdir(), 'own-app-'))
const here = process.cwd()
try {
  mkdirSync(join(tmp, 'lib', 'web4-items'), { recursive: true })
  copyFileSync(join(HERE, '..', 'lib', 'web4-items', 'element-app.cjs'), join(tmp, 'lib', 'web4-items', 'element-app.cjs'))
  mkdirSync(join(tmp, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  const born = { from: 'fractera-custom-item-starter' }
  writeFileSync(join(tmp, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [
    { id: 'root', kind: 'user' }, { id: 'marina', kind: 'user', born, app: 'own' }, { id: 'shop', kind: 'user', born, app: 'project' },
  ] }))
  process.chdir(tmp)

  t('an app of its own gets «Whose app this is» in its session prompt — build and working sessions alike', () => {
    const text = modes.ownAppText('marina')
    assert.match(text, /^# Whose app this is/)
    assert.match(text, /not the node's architect/)
    assert.match(text, /know-the-owner/)
    assert.equal(modes.ownAppText('marina--work'), text)
  })
  t('negative: part of the project, root and the main agent read nothing extra', () => {
    assert.equal(modes.ownAppText('shop'), '')
    assert.equal(modes.ownAppText('root'), '')
    assert.equal(modes.ownAppText('build'), '')
    assert.equal(modes.ownAppText('nobody'), '')
  })
  t('the part rides in both prompt builders, after the chat rules and before the mode file', () => {
    const src = readFileSync(join(HERE, '..', 'lib', 'agent-kit', 'modes.cjs'), 'utf8')
    assert.ok(/chatText\(mode\), ownAppText\(key\), file \?/.test(src), 'promptArgs')
    assert.ok(/chatText\(modeOfKey\(key\)\), ownAppText\(key\), systemPart/.test(src), 'soulArgs')
  })
} finally {
  process.chdir(here)
  rmSync(tmp, { recursive: true, force: true })
}

t('an own app with no picture of its owner opens with the acquaintance skill; the architect is named as not the owner', () => {
  const text = brief.compose({ agent: 'marina', picture: [], firstMeeting: true, ownApp: true })
  assert.match(text, /know-the-owner/)
  assert.match(text, /is not its owner/)
  assert.ok(!/The architect, as the node's main agent knows them/.test(text))
})
t('an own app with its own picture gets that picture, never the architect\'s', () => {
  const text = brief.compose({ agent: 'marina', picture: ['- Марина: на вы, коротко'], ownApp: true })
  assert.match(text, /This app's owner, as you know them/)
  assert.match(text, /Марина: на вы/)
  assert.ok(!/The architect, as the node's main agent knows them/.test(text))
})
t('negative: an element of the project still gets the architect\'s picture, and no first-meeting line', () => {
  const text = brief.compose({ agent: 'shop', picture: ['- Рома: на ты'] })
  assert.match(text, /The architect, as the node's main agent knows them:\n- Рома: на ты/)
  assert.ok(!/know-the-owner/.test(text))
})
t('the main agent\'s diary search leaves out the rows of an app of its own; the app finds its own rows', () => {
  const rows = [{ agent: 'marina', text: 'a' }, { agent: 'shop', text: 'b' }, { agent: 'build', text: 'c' }]
  const own = new Set(['marina'])
  assert.deepEqual(rows.filter(recall.inScope('build', own)).map((r) => r.agent), ['shop', 'build'])
  assert.deepEqual(rows.filter(recall.inScope('marina', new Set())).map((r) => r.agent), ['marina'])
  assert.deepEqual(rows.filter(recall.inScope('build', new Set())).map((r) => r.agent), ['marina', 'shop', 'build'], 'negative: no own apps — the whole diary')
})
console.log(process.exitCode ? `===OWN_APP_FAILED=== ${passed} passed` : `===OWN_APP_OK=== ${passed} passed`)
