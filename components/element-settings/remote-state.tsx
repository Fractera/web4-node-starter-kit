import { Small } from "@/components/ui/typography"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import type { Loaded } from "./remote.client"

// СОСТОЯНИЕ ПУЛЬТА СЛОВАМИ (712-3). 🛑 Отказ — состояние, а не пустые настройки: пустой редактор при отказе предложил бы сохранить
// пустоту поверх настоящих настроек элемента.
export function RemoteState({ loaded, words }: { loaded: Loaded | undefined; words: ElementRemoteWords }) {
  if (!loaded || loaded.state === "loading") return <Small data-block="ers01" data-remote-state="loading" className="text-muted-foreground">{words.state.loading}</Small>
  if (loaded.state === "ok") return null
  const known = words.state[loaded.reason as keyof ElementRemoteWords["state"]]
  return (
    <Small data-block="ers02" data-remote-state={loaded.reason} className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-foreground">
      {known ?? `${words.state.other} ${loaded.reason}`}
    </Small>
  )
}
