"use client"

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DesignUi } from "@/components/design/design.i18n"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { DesignFlow } from "@/components/element-design/design-flow.client"
import { RemoteSettings } from "./remote.client"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЦЕЛИКОМ (узел, шаги 712-3, 713-1). Владелец 2026-11-09: «перенести дизайн страницу на ту самую
// вкладку … мы сможем эти настройки при необходимости вручную подредактировать»; затем — «не спагетти дизайн»: вкладка стала путём
// «Бриф → Навыки → Пробы → Закрепление»; 715 — схема владельца «Навыки → Бриф (по желанию) → Сгенерировать и сравнить»
// (`components/element-design/design-flow.client.tsx`). Пульт ядра
// читает и пишет файлы самого элемента (бриф, дизайн), дверь 711 — навыки, референсы и пробы.
export function ElementDesignSettings({ item, lang, port, publicUrl, name, agentHref, ui, words, design, dialogUi }: {
  item: string; lang: string; port: number | null; publicUrl: string | null; name: string; agentHref: string
  ui: DesignUi; words: ElementRemoteWords; design: ElementDesignWords; dialogUi: AppDialogUi
}) {
  return (
    <RemoteSettings item={item} files={["brief", "design"]}>
      <DesignFlow item={item} lang={lang} port={port} publicUrl={publicUrl} name={name} agentHref={agentHref} words={design} remote={words} ui={ui} dialogUi={dialogUi} />
    </RemoteSettings>
  )
}
