// АДРЕС ДВЕРИ НАСТРОЕК В КОПИИ ЯДРА (узел, шаг 712-4). Редакторы перенесены из шаблона элемента
// (`admin/_widgets/dynamic/widget-dynamic-site-settings/`) дословно; меняется только адрес: вместо своей двери элемента — пульт ядра
// `/api/node/element-settings` к элементу на экране. Элемент на экране — `data-remote-item` вкладки (`site-settings.client.tsx`); адрес
// собирается при нажатии или после открытия, когда вкладка уже на странице. Тело то же: заплата JSON Merge Patch, `null` удаляет.
import { remoteUrl } from "@/components/element-settings/remote.client"

/** Элемент, чьи настройки на экране. */
export function remoteItem(): string {
  if (typeof document === "undefined") return ""
  return document.querySelector("[data-remote-item]")?.getAttribute("data-remote-item") ?? ""
}

export function settingsDoor(): string {
  return remoteUrl(remoteItem(), "app")
}

/** Адрес двери по виду настроек: `platform` — выключатели элемента (`features`). */
export function settingsUrl(kind: "app" | "platform" | "design"): string {
  return remoteUrl(remoteItem(), kind === "platform" ? "features" : kind)
}
