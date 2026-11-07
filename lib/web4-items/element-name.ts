import "server-only"
import nameFile from "@/lib/web4-items/name-file.cjs"
import elementProps from "@/lib/web4-items/element-props.cjs"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { elementDir } from "@/lib/web4-items/element-github"

// 678-1: ИМЯ ЭЛЕМЕНТА ДЛЯ ЛЮДЕЙ в ядре — левое меню, шапка «Кастомные элементы», уведомления. Правило — `name-file.cjs`: имя ядра →
// `name` паспорта (не id и не адрес) → адрес. Нативный раздел ядра со своим заголовком берёт заголовок раздела, не это имя.

export function elementDisplayName(id: string): string {
  const dir = elementDir(id)
  const props = dir ? (elementProps.readElementProps(dir) as { name?: unknown } | null) : null
  return nameFile.displayName(id, {
    root: process.cwd(),
    passportName: typeof props?.name === "string" ? props.name : null,
    address: addressOf(id),
  })
}
