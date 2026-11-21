import "server-only"
import { listVars } from "@/lib/env-file"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { environmentUi } from "./environment.i18n"
import { EnvironmentPanel as Panel } from "./environment-panel.client"

// СЕРВЕРНАЯ ПОЛОВИНА ВКЛАДКИ (336-1): список переменных и пояснения — из файла-примера цели (`core` или id элемента).
// Состояние «задана / не задана» остров спрашивает сам.
// 834-4: `only` — the names to show (the element agent frame shows its admin the OpenAI key alone, not the element's whole list).
export function EnvironmentPanel({ target, lang, only }: { target: string; lang: string; only?: readonly string[] }) {
  const rows = listVars(target)
  return <Panel target={target} rows={only ? rows.filter((r) => only.includes(r.name)) : rows} ui={environmentUi(lang)} dialogUi={appDialogUi(lang)} />
}
