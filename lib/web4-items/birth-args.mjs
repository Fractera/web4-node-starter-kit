// THE ARGUMENTS OF `scripts/item-birth.mjs` (node steps 319-3, 367-3, 582, 749-2) — apart from the spawn (`birth.ts` `startBirth`), so
// they are checked without a birth. 749-2 (the owner, 2026-11-15: «вместо того чтобы показать его название ты показываешь его
// идентификатор»): the name the person gave the draft at its first click goes to the birth as `--name`, and the passport carries it —
// before, a birth from the panel wrote `props.name = id` and the element was called by its id everywhere.

/**
 * @param {string} id
 * @param {{ native: true } | { native?: false, look: string, repo?: string | null }} plan
 * @param {string | null} [name] the draft's name held by the core (`name-file.cjs` `ownName`)
 * @returns {string[]}
 */
export function birthArgs(id, plan, name = null) {
  const named = typeof name === 'string' && name.trim() ? ['--name', name.trim()] : []
  if (plan.native) return [id, '--native', ...named]
  return [id, '--look', plan.look, ...(plan.repo ? ['--repo', plan.repo] : []), ...named]
}
