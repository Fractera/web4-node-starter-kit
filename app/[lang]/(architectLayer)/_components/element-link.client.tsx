"use client"

import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// СВЯЗЬ ЭЛЕМЕНТА С CONFIG — СТРОКА СОСТОЯНИЯ (324-7; 713-3 — одной строкой над «Настройками сайта»).
// 804-6 (the owner, 2026-11-19: «если где-то в CONFIG у элемента есть возможность потом изменить тип это надо убрать в рамках этого
// шага»): the link is fixed at the birth by its one answer — part of the project follows CONFIG, an app of its own keeps its own
// settings (`lib/web4-items/element-app.cjs`). The line only says which; the switch, its door and `npm run look -- --own|--linked` are gone.

export function ElementLink({ kind, on, ui }: { kind: "config"; on: boolean; ui: ElementSettingsUi }) {
  const w = ui.linkCard
  return (
    <div data-block="elk01" className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border px-4 py-3" data-element-link={kind} data-link-on={on ? "yes" : "no"}>
      <p data-block="elk02" className="flex min-w-0 items-center gap-2.5 text-[length:var(--fs-small)] text-foreground">
        <span data-block="elk03" aria-hidden className={`size-2 shrink-0 rounded-full ${on ? "bg-primary" : "bg-muted-foreground/50"}`} />
        {on ? w.lineOn : w.lineOff}
      </p>
    </div>
  )
}
