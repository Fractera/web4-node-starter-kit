// THE ONE RULE OF EVERY LADDER (node step 744-7, D46, D47). The owner, 2026-11-14: «пока ты не покажешь мне нормальный котором каждый
// следующий шаг заблокирован до предыдущего … реализуй шаги в формате аккордеона … только один шаг должен быть открыты все остальные
// должны быть скрыты».
// 🔒 NO PAGE DECIDES WHICH RUNG IS OPEN. A rung opens only when every rung before it is done; the ladder stands on the first rung that is
// not done (every rung done — on the last one). The part `ladder-step` (`Ladder`) takes it from here; a page only says what each rung has
// done. ✗ Measured before (738): each page kept its own table of what opens what, and one edit let «install» open past an empty domain.
// `scripts/ladder-rule.test.mjs` (in the prebuild) refuses a file of `components/hosting/` that computes it again.

/**
 * For each rung: is it open — is every rung before it done? A done rung after an undone one stays closed.
 * @param {Array<{ done?: boolean }>} rungs
 * @returns {boolean[]}
 */
export function openOf(rungs) {
  const open = []
  let before = true
  for (const r of rungs) {
    open.push(before)
    before = before && Boolean(r.done)
  }
  return open
}

/**
 * The rung the ladder stands on: the first one not done; every rung done — the last; no rungs — null.
 * @param {Array<{ id: string, done?: boolean }>} rungs
 * @returns {string | null}
 */
export function currentOf(rungs) {
  if (!rungs.length) return null
  const i = rungs.findIndex((r) => !r.done)
  return rungs[i === -1 ? rungs.length - 1 : i].id
}
