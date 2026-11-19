// WHAT AN ELEMENT IS — PART OF THE PROJECT OR AN APP OF ITS OWN (node step 804-1).
//
// The owner, 2026-11-19 (terminal): «я имею переключатель проекта … при создании элементы не повторно спрашивают какой я хочу элемент
// для одного хозяина или для нескольких то есть дублируется вопрос … хранить в общем реестре ядра перечисления элементов какие являются
// связанными с ядром а какие нет?»; 16:40 «по дефолту все нативные шаблоны идущие по умолчанию и руут являются связанными с одним
// хозяином»; 16:42 «кастомные шаблоны родился под определённым сценарием … если где-то в CONFIG у элемента есть возможность потом
// изменить тип это надо убрать в рамках этого шага».
//
// One answer at an element's birth, kept in its registry entry `app`:
//   `project` — part of the project: the project's people and sign-in, the look and the site settings follow CONFIG;
//   `own`     — an app of its own: its own people and accounts (its organization in the sign-in), its own look and settings, its own
//               owner (not the node's architect, who hosts it).
// 🔒 Fixed at birth: nothing changes it later — the people of an app do not move to another one.
// 🔒 The preinstalled native elements and root are `project` by the owner's rule; their entries carry no field.
// Before 804 the node had a type (`nodeType`: project | factory) that decided a new element's people (554-1: an organization on a
// factory). An entry born before 804 has no field: the legacy rule reads that type — exactly the rule that made, or did not make, its
// organization; it differs only on a node whose type was switched after the birth.
// No dependencies: the node's scripts, the kit bridges and the core's server all read it.

const fs = require('node:fs')
const path = require('node:path')

const APPS = ['project', 'own']

const registryFile = (root) => path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json')

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function readRegistry(root = process.cwd()) {
  return readJson(registryFile(root), { services: [] }) ?? { services: [] }
}

/** A born element that serves the node — a native one (582) or a payment one (551-5): `project` whatever the legacy type said. */
function servesNode(root, s) {
  const address = readJson(path.join(root, 'data', 'services', s.id, 'address.json'), null)?.address ?? s.id
  const kind = s.kind === 'core' ? 'core' : 'user'
  const byAddress = path.join(root, 'WEB4-ITEMS', kind, address)
  const dir = fs.existsSync(byAddress) ? byAddress : path.join(root, 'WEB4-ITEMS', kind, s.id)
  const props = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), null) ?? readJson(path.join(dir, 'OWN-SERVICE-PROPS.json'), {})
  return props?.elementType === 'native' || Boolean(props?.payment)
}

/**
 * The answer for one registry entry. Pure apart from `serves` (a born entry's passport is read only when the legacy rule needs it).
 * @param {object} s the registry entry
 * @param {{ legacyType?: string|null, serves?: (s: object) => boolean }} [o]
 */
function appOfEntry(s, { legacyType = null, serves = () => false } = {}) {
  if (!s || typeof s !== 'object') return 'project'
  if (APPS.includes(s.app)) return s.app
  // The preinstalled elements (natives, root) were never born here — part of the project by the owner's rule.
  if (s.kind !== 'user' || !s.born) return 'project'
  if (legacyType !== 'factory') return 'project'
  return serves(s) ? 'project' : 'own'
}

/** What element `id` is: `project` | `own`. An id the registry does not hold (the core's main agent `build`, a typo) — `project`. */
function appOf(id, root = process.cwd(), registry = readRegistry(root)) {
  const s = (registry.services ?? []).find((x) => x && x.id === id)
  return appOfEntry(s, { legacyType: registry.nodeType ?? null, serves: (e) => servesNode(root, e) })
}

const isOwnApp = (id, root = process.cwd(), registry) => appOf(id, root, registry) === 'own'

/** The ids of the apps of their own on this node. */
function ownApps(root = process.cwd(), registry = readRegistry(root)) {
  return (registry.services ?? []).filter((s) => s && appOf(s.id, root, registry) === 'own').map((s) => s.id)
}

/**
 * 804-4: the registry without the node's type. Every born entry that has no `app` gets it once by the legacy rule (the type it was
 * born under: `legacyType`, the registry's own `nodeType` when not given), then `nodeType` is dropped. Returns the new object and the
 * ids that got the field; the caller writes the file. A registry with nothing to do comes back equal (`changed` empty, no `dropped`).
 */
function migrateApps(registry, { root = process.cwd(), legacyType } = {}) {
  const type = legacyType === undefined ? registry?.nodeType ?? null : legacyType
  const changed = []
  const services = (registry?.services ?? []).map((s) => {
    if (!s || typeof s !== 'object' || s.kind !== 'user' || !s.born || APPS.includes(s.app)) return s
    const app = appOfEntry(s, { legacyType: type, serves: (e) => servesNode(root, e) })
    changed.push(s.id)
    return { ...s, app }
  })
  const { nodeType: dropped, ...rest } = registry ?? {}
  return { registry: { ...rest, services }, changed, dropped: dropped === undefined ? null : dropped }
}

module.exports = { APPS, appOf, appOfEntry, isOwnApp, ownApps, migrateApps, readRegistry }
