// CUSTOM ELEMENTS THAT STILL HOLD THE NODE'S DATA KEY (node step 654-6; moved here from `node-type.cjs` when the node's type went away,
// 804-4). An element born from a custom template before 654-6 has `DATA_SECRET` in its environment: that key opens every element's space
// in every store. Only the NAMES of the variables are read, never a value; nothing is stripped by force — the element takes its own key
// with the custom template's update. `npm run contacts` names such elements.
const fs = require('node:fs')
const path = require('node:path')

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

/** `[{ id, address, elementKey }]` — the custom elements (not native, not payment) whose environment names `DATA_SECRET`. */
function withNodeKey(root = process.cwd()) {
  const out = []
  for (const s of readJson(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), { services: [] }).services ?? []) {
    if (!s || s.kind !== 'user') continue
    const address = readJson(path.join(root, 'data', 'services', s.id, 'address.json'), null)?.address ?? s.id
    const byAddress = path.join(root, 'WEB4-ITEMS', 'user', address)
    const dir = fs.existsSync(byAddress) ? byAddress : path.join(root, 'WEB4-ITEMS', 'user', s.id)
    const props = readJson(path.join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), null) ?? readJson(path.join(dir, 'OWN-SERVICE-PROPS.json'), {})
    if (props?.elementType === 'native' || props?.payment) continue
    let names = []
    try {
      names = fs.readFileSync(path.join(dir, '.env.local'), 'utf8').split(/\r?\n/).map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=/)?.[1]).filter(Boolean)
    } catch { /* not installed yet — nothing to name */ }
    if (names.includes('DATA_SECRET')) out.push({ id: s.id, address, elementKey: names.includes('ELEMENT_KEY') })
  }
  return out
}

module.exports = { withNodeKey }
