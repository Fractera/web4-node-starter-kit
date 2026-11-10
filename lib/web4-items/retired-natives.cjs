// NATIVE ELEMENTS FRACTERA RETIRED (node step 716). The owner, 2026-11-10, verbatim: «их не должно существовать как нативные элементы и не
// должно быть обращение к ним. Поэтому сначала убери их, проверь что все продолжает работать без них».
//
// A retired id is never installed, never started and never expected to have a section of the core. Three readers:
//   · `scripts/services-install.mjs` — on every node: a retired entry leaves the registry and `scripts/element-retire.mjs` removes its
//     process and folder. ✗ Why here and not only in the node update: the first update after the retirement runs the PREVIOUS
//     `scripts/node-update.mjs` (loaded before its own merge), whose registry merge keeps the entry as the node's own; the installer is
//     a fresh process of the new code in the same update.
//   · `scripts/check-native-sections.mjs` — the guard skips it (until the installer has removed it, the entry has no section to have).
//   · `scripts/node-update.mjs` — its merge drops it (and any native the fork no longer lists).
// A born element with the same id (`kind: user`) is the person's own and is never touched.
const RETIRED = Object.freeze(['design', 'blocks'])

/** Is this registry entry a native element Fractera retired? */
function isRetired(entry) {
  return !!entry && entry.kind === 'core' && !entry.born && RETIRED.includes(entry.id)
}

module.exports = { RETIRED, isRetired }
