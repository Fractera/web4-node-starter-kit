#!/usr/bin/env node
// check:element-settings (узел, шаг 712-2) — правило пульта ядра на фикстурах: ядро показывает только поля, которые знает его редактор И
// объявляет элемент тем же типом. Владелец 2026-11-09: «Если пользователь добавил 10 и убрал из 10 -5 то значит … новые 10 не должны
// появляться а из Старых 10 … редактировать только пять». Чистые функции `lib/web4-items/element-settings-schema.cjs`; сеть не нужна.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { declaredFields, visibleFields, typeOf, prunePatch } = require('../lib/web4-items/element-settings-schema.cjs')
let bad = 0
const ok = (cond, what) => { if (!cond) { bad++; console.log(`✗ ${what}`) } else console.log(`✓ ${what}`) }

// Десять полей, которые знает редактор ядра (как в zod → JSON Schema шаблона: объекты, nullable, enum, integer).
const known = [
  ['name', 'string'], ['description', 'string'], ['seo.robotsIndex', 'boolean'], ['og.imageWidth', 'number'], ['logo', 'string'],
  ['colors.light.primary', 'string'], ['colors.dark.primary', 'string'], ['shape.shadow', 'string'], ['type.headingWeight', 'number'], ['nav.top', 'array'],
]
const element = {
  type: 'object',
  properties: {
    name: { type: 'string' }, description: { type: 'string' },
    seo: { type: 'object', properties: { robotsIndex: { type: 'boolean' } }, additionalProperties: {} },
    og: { type: 'object', properties: { imageWidth: { type: 'integer' } } },
    logo: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    colors: { type: 'object', properties: { light: { type: 'object', properties: { primary: { type: 'string' } } }, dark: { type: 'object', properties: { primary: { type: 'string' } } } } },
    shape: { type: 'object', properties: { shadow: { type: 'string', enum: ['none', 'soft', 'medium', 'strong'] } } },
    type: { type: 'object', properties: { headingWeight: { type: 'number' } } },
    nav: { type: 'object', properties: { top: { type: 'array', items: {} } } },
  },
}
const all = declaredFields(element)
ok(visibleFields(known, all).length === 10, 'an element that declares all ten — all ten shown')
ok(all.logo === 'string' && all['og.imageWidth'] === 'number' && all['shape.shadow'] === 'string', 'nullable → its type, integer → number, enum → string')
ok(all.nav === 'object' && all['nav.top'] === 'array' && !Object.keys(all).some((p) => p.startsWith('nav.top.')), 'a branch and its array are declared; inside an array — never')

// Хозяин элемента убрал пять известных полей и добавил десять своих.
const changed = structuredClone(element)
delete changed.properties.description
delete changed.properties.og
delete changed.properties.logo
delete changed.properties.colors.properties.dark
delete changed.properties.nav
for (let i = 1; i <= 10; i++) changed.properties[`own${i}`] = { type: 'string' }
const shown = visibleFields(known, declaredFields(changed))
ok(shown.length === 5, `removed five, added ten — five shown (${shown.join(', ')})`)
ok(shown.join() === 'name,seo.robotsIndex,colors.light.primary,shape.shadow,type.headingWeight', 'the five are the remaining known ones, in the editor order')
ok(!shown.some((p) => p.startsWith('own')), 'the ten new fields of the owner never appear')

// То же имя, другая форма — скрыто.
const retyped = structuredClone(element)
retyped.properties.type.properties.headingWeight = { type: 'string' }
retyped.properties.colors.properties.light = { type: 'string' }
const r = visibleFields(known, declaredFields(retyped))
ok(!r.includes('type.headingWeight') && !r.includes('colors.light.primary') && r.includes('colors.dark.primary'), 'a known name with another type is hidden, its neighbour stays')

// Чего нет — того нет.
ok(visibleFields(known, declaredFields(null)).length === 0 && visibleFields(known, declaredFields({ type: 'object' })).length === 0, 'no declaration (an older template) — nothing shown')
ok(typeOf({ anyOf: [{ type: 'string' }, { type: 'number' }] }) === null && typeOf({ type: ['boolean', 'null'] }) === 'boolean', 'two real types — not editable; a type list with null — its type')

// Запись: в файл элемента уходит только объявленное (последняя линия правила — на сервере ядра).
const decl = declaredFields(changed)
const pruned = prunePatch({ name: 'Stand', description: 'removed by the owner', own1: 'x', notDeclared: 1, seo: { robotsIndex: false, extra: true }, type: { headingWeight: '700' }, colors: { light: { primary: null }, dark: { primary: '#000' } } }, decl)
ok(pruned?.name === 'Stand' && pruned.own1 === 'x' && pruned.seo?.robotsIndex === false, 'a patch keeps the declared fields of the right type (the owner\'s own declared field too)')
ok(!('description' in pruned) && !('notDeclared' in pruned) && !('extra' in pruned.seo) && !('type' in pruned), 'a removed, an undeclared and a wrongly typed value never reach the file')
ok(pruned.colors?.light?.primary === null && !('dark' in pruned.colors), 'null erases a declared key; a removed branch is dropped')
const tr = prunePatch({ i18n: { name: { ru: 'Стенд', 'bad lang': 'x' }, 'seo.robotsIndex': { ru: 'нет' }, ghost: { ru: 'x' } } }, decl)
ok(tr?.i18n?.name?.ru === 'Стенд' && !('bad lang' in tr.i18n.name) && !('seo.robotsIndex' in tr.i18n) && !('ghost' in tr.i18n), 'translations only for declared text fields, only language codes')
ok(prunePatch({ nothing: 1 }, decl) === null && prunePatch('x', decl) === null, 'a patch with nothing declared — nothing to send')

if (bad) { console.log(`\n===ELEMENT_SETTINGS_FAILED=== ${bad}`); process.exit(1) }
console.log('\n===ELEMENT_SETTINGS_OK===')
