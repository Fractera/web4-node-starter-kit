import { Badge } from "@/components/ui/badge"
import type { AiProviderWords } from "./ai-provider.i18n"

// БАЗОВЫЙ AI-ПРОВАЙДЕР УЗЛА — на странице «Настройки» главного агента (691, владелец 2026-11-08: «in the settings you can to do now part
// base AI provider default antropic , not possible now replace to codex»; «it wil huge long time process for replae all»). Сегодня у узла
// один движок — Anthropic, Claude Code; Codex показан и честно назван недоступным: переключение всего узла — шаг 690 в очереди. Кнопки
// переключения нет, пока переключать нечего; её добавит 690. Карточка статичная: на странице нет ни одного вопроса к машине.

export function AiProviderCard({ words }: { words: AiProviderWords }) {
  return (
    <div className="my-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4" data-ai-provider="anthropic">
      <div>
        <p className="font-medium text-foreground">{words.title}</p>
        <p className="mt-1 text-muted-foreground text-sm">{words.lead}</p>
      </div>
      <ul className="flex flex-col gap-2">
        <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3" data-ai-provider-option="anthropic" aria-current="true">
          <span className="font-medium text-foreground text-sm">{words.anthropic}</span>
          <Badge>{words.anthropicState}</Badge>
        </li>
        <li className="flex flex-col gap-1 rounded-md border border-dashed border-border p-3 opacity-70" data-ai-provider-option="codex" aria-disabled="true">
          <span className="font-medium text-foreground text-sm">{words.codex}</span>
          <span className="text-muted-foreground text-xs">{words.codexState}</span>
        </li>
      </ul>
      <p className="text-muted-foreground text-xs">{words.ownNote}</p>
    </div>
  )
}
