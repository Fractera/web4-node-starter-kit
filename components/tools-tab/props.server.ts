import "server-only"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { chatUi } from "@/sections/chat.i18n"
import { tableUi } from "@/sections/table.i18n"
import { agentTerminalWords } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/agent-terminal.i18n"
import { openAiKeyHref } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/widgets"
import type { TerminalKit } from "@/_tools/terminal-drawer/types/terminal-drawer"
import type { ToolDemoKit } from "./tool-demo.client"
import { toolsTabUi, type ToolsTabWords } from "./tools-tab.i18n"

// WHAT THE «TOOLS» TAB TAKES FROM THE SERVER (725-8): its words, the terminal's kit and the demo samples — one assembly for the main
// agent's page (the section kind `toolsTab`) and every element's page, so the two never drift.
export function toolsTabProps(lang: string, service: string): { words: ToolsTabWords; kit: TerminalKit; demo: ToolDemoKit } {
  const ru = lang === "ru"
  return {
    words: toolsTabUi(lang),
    kit: { terminalWords: agentTerminalWords(lang), dialogUi: appDialogUi(lang), keyHref: openAiKeyHref(service, lang) },
    demo: {
      chatUi: chatUi(lang),
      tableUi: tableUi(lang),
      chatSample: [
        { id: "d1", from: "user", text: ru ? "Покажи, как ты выглядишь в ленте." : "Show how you look in a feed.", who: ru ? "Архитектор" : "Architect" },
        { id: "d2", from: "assistant", text: ru ? "Вот так: сообщения, кто их написал и когда. С обработчиком отправки внизу появляется поле ввода." : "Like this: messages, who wrote them and when. Given a send handler, an input appears below.", who: "Claude" },
      ],
      codeSample: ru
        ? "// Пример: инструмент берётся, а не строится заново\nimport { VoiceTextarea } from \"@/components/form/voice-textarea.client\"\n"
        : "// An example: a tool is taken, not built again\nimport { VoiceTextarea } from \"@/components/form/voice-textarea.client\"\n",
    },
  }
}
