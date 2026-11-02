import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { AgentTerminalWords } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/agent-terminal.i18n"

/** Words of the drawer. The page that opens it passes them: the server picks the language. */
export type TerminalDrawerWords = { title: string; hint?: string; collapse: string }

/** What the terminal inside the drawer needs. The server assembles it once per page. */
export type TerminalKit = { terminalWords: AgentTerminalWords; dialogUi: AppDialogUi; keyHref: string }
