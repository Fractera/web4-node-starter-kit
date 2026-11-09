import { sectionsOfGroup, type Field } from "@/lib/site-settings/fields"
import type { FieldType, RemoteFile } from "@/components/element-settings/remote.client"

// ПОЛЯ НАСТРОЕК САЙТА, КОТОРЫЕ НЕСЁТ ПУЛЬТ ЯДРА (узел, шаг 712-4). Владелец 2026-11-09: «в ядре будут представлены только те строки
// которые совпадают с предварительно созданными в ядре». Поле редактора видно, когда элемент объявляет его тем же типом JSON; картинки
// и наборы значков живут в собственном хранилище элемента — пульт ядра их не несёт (`null`).
export const REMOTE_TYPE: Record<Field["type"], FieldType | null> = {
  text: "string", textarea: "string", select: "string", combo: "string", color: "string", number: "number", switch: "boolean", socials: "array",
  image: null, icons: null,
}

export type Visible = (file: RemoteFile, path: string, type: FieldType) => boolean

/** Поле видно в ядре. */
export const fieldVisible = (f: Field, visible: Visible): boolean => {
  const t = REMOTE_TYPE[f.type]
  return t !== null && visible("app", f.path, t)
}

/** Видимые поля группы (`basics`, `seo`, `metaMedia`) по секциям; пустые секции не возвращаются. */
export function visibleSections(group: string, visible: Visible) {
  return sectionsOfGroup(group)
    .map((s) => ({ ...s, fields: s.fields.filter((f) => fieldVisible(f, visible)) }))
    .filter((s) => s.fields.length > 0)
}
