"use client"
// @local — the danger zone of the launch ladder (one route: «Активация выделенного сервера»): this node's own install set aside, from zero

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ServerBusy } from "@/components/hosting/server-busy.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { H3 } from "@/components/ui/typography"

// 784 (the owner, 2026-11-18, Telegram 642, 662, 665: «будем делать перестановку на уровне ниже переустановки операционной системы … мне
// нужна кнопка очистить данный сервер … Кнопка должна существовать как Danger zone очевидно после вкладки сервер готов внизу»): a server
// holding THIS node's own install gets «Установить с нуля» at the bottom, after the last step — the old node stops and moves whole into
// the server's backup folder (nothing erased), then a fresh install. A stranger's install keeps its «Очистить» inside step 2.
type Cleared = { state?: string; detail?: string; stopped?: number; backup?: string } | null | undefined

export function LaunchDanger({ host, cleared, busy, words, dialogUi, onAct }: { host: string; cleared: Cleared; busy: boolean; words: ServerLaunchWords; dialogUi: AppDialogUi; onAct: (action: string, extra?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="mt-6 flex flex-col gap-1" data-block="server-launch-danger">
      <H3 variant="ui">{words.dangerZone}</H3>
      <ServerBusy busy={{ host, sites: [], programs: 0, clear: cleared ?? undefined }} dialogUi={dialogUi} disabled={busy} fresh onStart={onAct} words={words.busy} />
    </div>
  )
}
