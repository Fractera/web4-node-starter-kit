import type { ElementSettingsUi } from '../_i18n/element-settings.i18n'
import { ElementOwnPageLink } from './element-own-page-link.client'

// «НАСТРОЙКИ САЙТА» ЭЛЕМЕНТА В МЕНЮ ЯДРА (328; 706-1 — во вкладке «Строительство»). Конфигуратор живёт в самом элементе
// (`/<язык>/admin/site-settings`, выбор «б» 324-8); ядро не встраивает его окном. Здесь — что там настраивается, состояние связи с
// CONFIG и кнопка, адрес которой выбирает браузер (`ElementOwnPageLink`).
export function ElementSiteSettings({ lang, ui, port, publicUrl, configOn }: { lang: string; ui: ElementSettingsUi; port: number | null; publicUrl: string | null; configOn: boolean }) {
  const w = ui.siteSettings
  return (
    <section className="my-6 flex flex-col gap-3" data-element-site-settings data-block="element-site-settings">
      <p className="text-sm text-foreground">{w.text}</p>
      <p className={configOn ? 'rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground' : 'text-sm text-muted-foreground'} data-config-link={configOn ? 'on' : 'off'}>
        {configOn ? w.configOn : w.configOff}
      </p>
      <ElementOwnPageLink lang={lang} path="admin/site-settings" port={port} publicUrl={publicUrl} label={w.open} localOnly={ui.ownPage.localOnly} />
    </section>
  )
}
