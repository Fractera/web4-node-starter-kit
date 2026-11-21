// THE INSTALLER'S LAST WRITE OF THE REGISTRY MEETS WHAT CHANGED ON DISK WHILE IT RAN (node step 834-12).
// ✗ Paid 2026-11-21 21:50: the architect deleted an element (j58fl) from the panel while its deployment ran; the deletion took the entry
// out of the registry, and 6 s later the installer wrote back its copy read at its start — the deleted element came back as a ghost entry
// with no folder, «declared, not installed», and the next install failed on it. A birth during an install would be lost the same way.
// The rule, by code: the disk decides WHICH elements exist, the installer decides WHAT it measured about the ones it installed (ports).
//   on disk and in the installer's copy → the installer's entry
//   on disk only (born meanwhile)        → the disk's entry
//   in the copy only, present at start   → deleted meanwhile — dropped
//   in the copy only, not there at start → added by the installer itself — kept
'use strict'

/**
 * @param {{ services: Array<{ id: string }> }} mine the installer's registry @param {{ services?: Array<{ id: string }> } | null} disk
 * @param {Set<string>} atStart ids the installer read at its start
 */
function mergeRegistry(mine, disk, atStart) {
  if (!disk || !Array.isArray(disk.services)) return { registry: mine, dropped: [], kept: [] }
  const ours = new Map(mine.services.map((s) => [s.id, s]))
  const onDisk = new Set(disk.services.map((s) => s.id))
  const services = disk.services.map((s) => ours.get(s.id) ?? s)
  const dropped = []
  const kept = []
  for (const s of mine.services) {
    if (onDisk.has(s.id)) continue
    if (atStart.has(s.id)) dropped.push(s.id)
    else { services.push(s); kept.push(s.id) }
  }
  const born = disk.services.filter((s) => !ours.has(s.id)).map((s) => s.id)
  return { registry: { ...mine, services }, dropped, kept, born }
}

module.exports = { mergeRegistry }
