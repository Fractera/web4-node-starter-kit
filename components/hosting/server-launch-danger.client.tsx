"use client"
// @local — the danger zone of the launch ladder (one route: «Активация выделенного сервера»): the server's previous state erased, then a fresh install

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ServerBusy } from "@/components/hosting/server-busy.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { H3 } from "@/components/ui/typography"

// 784 (the owner, 2026-11-18, Telegram 642, 662, 665: «мне нужна кнопка очистить данный сервер … Danger zone очевидно после вкладки сервер
// готов внизу»): a server holding THIS node's own install gets «Установить с нуля» here — the old node is erased with every older copy
// (806-1), then a fresh install. 795 (Telegram 683): a server busy with ANOTHER install (a stranger's node, sites, programs)
// is freed here too, with its own title and risks — one place at the bottom for everything that sets a server's state aside. A clean
// server has no danger zone: its installation is simply step 4.
export function LaunchDanger({ state, busy, words, dialogUi, onAct }: { state: LaunchState; busy: boolean; words: ServerLaunchWords; dialogUi: AppDialogUi; onAct: (action: string, extra?: Record<string, unknown>) => Promise<void> }) {
  const host = state.host ?? ""
  const rel = state.relation ?? null
  const why = (id: string) => rel?.reasons.find((r) => r.id === id)
  const unrelated = rel?.kind === "unrelated"
  const busyState = unrelated
    ? { host, sites: why("foreign-sites")?.sites ?? [], programs: why("root-programs")?.count ?? 0, nodes: rel?.nodes ?? [], clear: state.cleared ?? undefined }
    : { host, sites: [], programs: 0, clear: state.cleared ?? undefined }
  const pd = state.probe?.disk
  const disk = pd ? { ...pd, freeGb: state.probe?.diskFreeGb ?? 0 } : null
  return (
    <div className="mt-6 flex flex-col gap-1" data-block="server-launch-danger" data-danger={unrelated ? "other" : "fresh"}>
      <H3 variant="ui">{words.dangerZone}</H3>
      <ServerBusy busy={{ ...busyState, disk }} dialogUi={dialogUi} disabled={busy} fresh={!unrelated} onStart={onAct} words={words.busy} />
    </div>
  )
}
