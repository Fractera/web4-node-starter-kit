import type { SectionRenderer } from '@/sections/contract'
import { ToolsTab } from '@/components/tools-tab/tools-tab.client'
import { toolsTabProps } from '@/components/tools-tab/props.server'

// ВКЛАДКА «ИНСТРУМЕНТЫ» ГЛАВНОГО АГЕНТА (725-8): инструменты ядра — карточки по пять, показ, правка и новый инструмент через один
// терминал главного агента. Слова, набор терминала и примеры показа — на сервере (`props.server.ts`), список — в браузере.
export const toolsTab: SectionRenderer<'toolsTab'> = (b, { key: k }) => (
  <ToolsTab key={k} item="build" service="build" place="core" lang={b.lang} {...toolsTabProps(b.lang, 'build')} />
)
