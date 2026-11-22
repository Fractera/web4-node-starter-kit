// WHAT THE «VERSION IS OUT OF DATE» BANNER SHOWS — one pure function, no React, no fetch (node step 815-7). The banner
// (`components/node-state/origin-notice.client.tsx`) draws exactly this; `scripts/update-banner.test.mjs` proves every state.
// 815 (the owner, 2026-11-20, Telegram 237: «до сих пор горит кнопка синхронизировать Fork почему я давно синхронизировал, горит кнопка
// обновить сборку ядра? Почему я же нажал её»): the sync button only while the fork is behind Fractera (or at rest); the update button
// starts the update itself and says so from the press until the node reports «running»; while it runs neither button is there.

/**
 * @param {{ fork: boolean, behindBy: number, nodeBehind: number, repo: string | null, builtAt?: string | null, update: { state: string, changes?: number, finishedAt?: string } | null } | null} d
 *   the answer of `/api/node/update`
 * @param {{ starting?: boolean, doneHidden?: boolean, evenHidden?: boolean }} [ui] the press in flight; the snoozes of «done» and «even»
 * @returns {null | { kind: 'running' | 'failed' | 'refused' | 'interrupted' | 'forkBehind' | 'nodeBehind' | 'done' | 'even',
 *   sync: boolean, rebuild: 'on' | 'starting' | 'off' | 'none', check: boolean }}
 */
export function bannerView(d, ui = {}) {
  if (!d?.fork) return null
  const u = d.update
  const running = u?.state === 'running'
  const forkBehind = d.behindBy > 0
  let kind = null
  if (running) kind = 'running'
  // 839-4 (the owner, 2026-11-22, Telegram 918: «почему после нажатия на кнопку проверить снова я не вижу информации о том что найдена
  // новая версия»): a failure is shown only while it is the latest word — a core built after it (by hand, by the server's agent) makes it
  // history, and the banner speaks of what waits now
  else if (u && (u.state === 'failed' || u.state === 'refused' || u.state === 'interrupted') && !(d.builtAt && u.finishedAt && Date.parse(d.builtAt) > Date.parse(u.finishedAt))) kind = u.state
  else if (forkBehind) kind = 'forkBehind'
  else if (d.nodeBehind > 0) kind = 'nodeBehind'
  else if (u?.state === 'done' && (u.changes ?? 0) > 0 && !ui.doneHidden) kind = 'done'
  else if (!ui.evenHidden) kind = 'even'
  if (!kind) return null
  const canRebuild = !forkBehind && d.nodeBehind > 0
  return {
    kind,
    sync: !!d.repo && !running && (forkBehind || kind === 'even'),
    rebuild: running ? 'none' : canRebuild ? (ui.starting ? 'starting' : 'on') : 'off',
    check: !running,
  }
}
