#!/usr/bin/env node
// check:element-look (706-2) — облик элемента для узла: форма секции `design` паспорта и посев «как X» (`create --look-like`).
// Чистые функции `lib/web4-items/element-look.cjs` на фикстурах во временной папке; узел и реестр не трогаются.
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const L = require('../lib/web4-items/element-look.cjs')
let bad = 0
const ok = (cond, what) => { if (!cond) { bad++; console.log(`✗ ${what}`) } else console.log(`✓ ${what}`) }

ok(L.normalizeLook({ skill: 'frontend-design', audience: 'partner engineers', character: ['strict', 'calm'], references: [{ url: 'https://stripe.com/docs', note: 'tone' }] }).ok, 'a valid brief passes')
ok(L.normalizeLook(undefined).look === null, 'no design part — no look')
ok(!L.normalizeLook({ character: ['a', 'b', 'c', 'd', 'e', 'f'] }).ok, 'six character words are refused')
ok(!L.normalizeLook({ references: [{ url: 'ftp://x' }] }).ok, 'a reference without http(s) is refused')
ok(!L.normalizeLook({ skill: 'Bad Skill' }).ok, 'a skill name of the wrong shape is refused')
ok(!L.normalizeLook([1]).ok, 'a design part that is not an object is refused')

const dir = mkdtempSync(join(tmpdir(), 'look-'))
try {
  mkdirSync(join(dir, 'OWN-SERVICE-PROPS'), { recursive: true })
  mkdirSync(join(dir, 'DESIGN-CONFIG'), { recursive: true })
  const props = join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json')
  writeFileSync(props, JSON.stringify({ id: 'kid01', designSkill: 'impeccable' }))
  writeFileSync(join(dir, 'DESIGN-CONFIG', 'design-config.json'), JSON.stringify({ colors: { old: 1 }, extra: { keep: true } }))
  ok(L.readTokens(dir)?.colors?.old === 1, 'tokens are read from DESIGN-CONFIG')
  const look = { skill: 'frontend-design', audience: 'a family', references: [{ media: 'm1', note: 'photo of the kitchen' }, { url: 'https://example.com' }, { media: 'm2' }], tokens: { colors: { brand: '#123' }, fonts: { body: 'Inter' } }, taken: { at: 'x' } }
  const done = L.seedLook(dir, props, look, 'stand1')
  const p = JSON.parse(readFileSync(props, 'utf8'))
  const cfg = JSON.parse(readFileSync(join(dir, 'DESIGN-CONFIG', 'design-config.json'), 'utf8'))
  ok(p.design?.inheritedFrom === 'stand1' && p.designSkill === 'frontend-design', 'the newborn passport names its source and the skill')
  ok(p.design.references.length === 2 && p.design.references.every((r) => !r.media), "the source's uploaded pictures do not travel, links and captions do")
  ok(!('tokens' in p.design) && !('taken' in p.design), 'tokens and the take stamp stay out of the brief')
  ok(cfg.colors.brand === '#123' && cfg.fonts.body === 'Inter' && cfg.extra?.keep === true && !('old' in cfg.colors), 'DESIGN-CONFIG gets the branches, keeps the rest')
  ok(done.tokens === true, 'the seed reports the tokens written')
  ok(L.normalizeLook(p.design).ok, 'the seeded brief passes the same shape check')
} finally { rmSync(dir, { recursive: true, force: true }) }
ok(L.registryLook({ services: [{ id: 'a' }] }, 'a') === null && L.registryLook({ services: [{ id: 'a', look: { skill: 'x' } }] }, 'a')?.skill === 'x', 'the registry look is found only when taken')

if (bad) { console.log(`===ELEMENT_LOOK_FAILED=== ${bad}`); process.exit(1) }
console.log('===ELEMENT_LOOK_OK===')
