'use strict'
// THE ADMIN ROLE OF AN ELEMENT (node step 778). The owner, 2026-11-17 (Telegram 466, 468): «создать 980 ролей … elementAdmin001…
// elementAdmin980»; «генерировать их не надо они во всех проектах могут быть одинаковыми изначально создать и жёстко пришить использовать
// только эти названия»; «выдавать роль должен только архитектор вот это я не хочу задействовать его для таких задач».
//
// 🔒 One fixed family, the same text in every Fractera project (the core, the custom template, the sign-in element): elementAdmin001 …
// elementAdmin980. A role is never generated, renamed or added per node — a birth only TAKES a number. The family stays out of
// `ALL_ROLES` (lib/roles.ts) on purpose: every role picker reads that list, and 980 names there would bury the 15 real ones.
// 🔒 The number lives in the node's registry (`adminRole` of a custom element's entry), taken at birth — the first free one in the
// registry's order; an older custom element without one gets it from the installer, in the same order. No element is named here: the
// first custom element of a fresh node is 001 because it comes first, not because of its id (CLAUDE.md §3, check-element-equality).
// 🔒 Built-in elements get none: their admin is the architect alone (sign-in, data, the node's keys).
// 🔒 A number is free again only when no entry holds it — the deletion strips the role from every account BEFORE it removes the entry
// (lib/web4-items/element-delete.ts), so a new element never inherits someone else's admins.

const COUNT = 980
const PREFIX = 'elementAdmin'
const RE = /^elementAdmin(\d{3})$/

/** The role of number `n` (1…980): `elementAdmin007`; anything else — null. */
function roleOf(n) {
  return Number.isInteger(n) && n >= 1 && n <= COUNT ? `${PREFIX}${String(n).padStart(3, '0')}` : null
}

/** The number of an element-admin role, or null when the string is not one of the 980. */
function numberOf(role) {
  const m = typeof role === 'string' ? RE.exec(role) : null
  if (!m) return null
  const n = Number(m[1])
  return n >= 1 && n <= COUNT ? n : null
}

const isRole = (role) => numberOf(role) !== null

/** All 980 names, in order — for a vocabulary check, never for a picker. */
const ALL = Object.freeze(Array.from({ length: COUNT }, (_, i) => roleOf(i + 1)))

/** Does this registry entry take an admin role? Custom elements only (`kind: 'user'`). */
const takesRole = (entry) => !!entry && entry.kind === 'user'

/** The first number no entry of the registry holds, or null when all 980 are taken. */
function firstFree(registry) {
  const taken = new Set((registry?.services ?? []).map((s) => numberOf(s?.adminRole)).filter((n) => n !== null))
  for (let n = 1; n <= COUNT; n++) if (!taken.has(n)) return roleOf(n)
  return null
}

/**
 * Give every custom element of the registry that has no role the first free one, in the registry's order. A role held twice keeps the
 * earlier entry and frees the later one, which then takes a new number. Mutates `registry`; returns the ids that changed.
 */
function ensureAdminRoles(registry) {
  const changed = []
  const seen = new Set()
  for (const s of registry?.services ?? []) {
    if (!takesRole(s)) {
      if (s && 'adminRole' in s) { delete s.adminRole; changed.push(s.id) }
      continue
    }
    const n = numberOf(s.adminRole)
    if (n !== null && !seen.has(n)) { seen.add(n); continue }
    delete s.adminRole
  }
  for (const s of registry?.services ?? []) {
    if (!takesRole(s) || numberOf(s.adminRole) !== null) continue
    const role = firstFree(registry)
    if (!role) break
    s.adminRole = role
    changed.push(s.id)
  }
  return changed
}

/** The role of one element of the registry, or '' (a built-in element, or no number yet). */
function adminRoleOf(registry, id) {
  const s = (registry?.services ?? []).find((x) => x?.id === id)
  return takesRole(s) && isRole(s.adminRole) ? s.adminRole : ''
}

module.exports = { COUNT, PREFIX, ALL, roleOf, numberOf, isRole, takesRole, firstFree, ensureAdminRoles, adminRoleOf }
