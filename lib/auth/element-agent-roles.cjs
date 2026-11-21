// WHO MAY OPEN AN ELEMENT'S AGENT PAGES (node step 834-1) — its Claude subscription, terminal, Telegram bot and OpenAI key.
// The owner, Telegram 641/644, 2026-11-21: the element's own admin manages its agent from the element's menu — «кнопка подписку, вход в
// терминал, настройка Telegram бота … A4 ещё нужно OpenAI ключ пробросить».
// 🔒 The architect and the node's admin, as everywhere in the panel — and THAT element's own admin (its `adminRole` in the registry,
// `lib/web4-items/element-admin-role.cjs`). Never another element's admin: an app of its own has another owner, and its agent is theirs.
// The core and the native elements have no admin of their own — their pages stay the architect's.
const fs = require('node:fs')
const path = require('node:path')
const adminRole = require('../web4-items/element-admin-role.cjs')

const PANEL = ['architect', 'admin']

/** @param {string} root @param {string} service a registry id @returns {string[]} */
function agentRoles(root, service) {
  let registry = null
  try { registry = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')) } catch { /* none */ }
  const own = adminRole.adminRoleOf(registry, String(service ?? ''))
  return own ? [...PANEL, own] : [...PANEL]
}

/** The registry id of an element named by its id or its address, or null. */
function elementIdOf(root, idOrAddress) {
  const want = String(idOrAddress ?? '')
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(want)) return null
  let services = []
  try { services = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')).services ?? [] } catch { return null }
  const byId = services.find((s) => s.id === want && s.kind === 'user')
  if (byId) return byId.id
  for (const s of services) {
    if (s.kind !== 'user') continue
    try {
      const a = JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', s.id, 'address.json'), 'utf8')).address
      if (a === want) return s.id
    } catch { /* no address file */ }
  }
  return null
}

module.exports = { agentRoles, elementIdOf, PANEL }
