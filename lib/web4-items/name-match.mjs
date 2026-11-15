// THE TYPED NAME AGAINST THE ELEMENT'S NAME (node step 749-1). The owner, 2026-11-15: «при удалении элемента вместо того чтобы показать
// его название ты показываешь его идентификатор». An element and a draft are deleted by their NAME for people — `name-file.cjs`
// `displayName`: the core's name → the passport's → the address (678-1) — never by an id the person cannot read.
// ONE rule for the dialog (it only enables the button) and the door (it decides): spaces folded, trimmed, case ignored; an empty line
// never matches. Pure, no `fs`: the browser imports it too, so the two can never disagree.

/**
 * The name as it is compared.
 * @param {unknown} s
 * @returns {string}
 */
export function normName(s) {
  return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().toLowerCase() : ''
}

/**
 * Does the typed line name this element?
 * @param {unknown} typed
 * @param {unknown} name
 * @returns {boolean}
 */
export function sameName(typed, name) {
  const t = normName(typed)
  return t !== '' && t === normName(name)
}
