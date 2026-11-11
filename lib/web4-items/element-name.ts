import "server-only"
import nameFile from "@/lib/web4-items/name-file.cjs"
import elementProps from "@/lib/web4-items/element-props.cjs"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { elementDir } from "@/lib/web4-items/element-github"
import { TREE } from "@/app/[lang]/(architectLayer)/architect/_list.generated"
import { wordsOf } from "@/lib/collection/types"
import { elementNameWords } from "@/lib/web4-items/element-name.i18n"

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

/**
 * 721-1: ИМЯ ЭЛЕМЕНТА ДЛЯ ЛЮДЕЙ НА ЯЗЫКЕ ЧЕЛОВЕКА — везде, где элемент виден: заголовок страницы, каталоги, карточки, меню. Слово
 * владельца 2026-11-11: «Видимые в интерфейсе названия должны быть человеческие». Порядок (правило 632-1, перенесено сюда из
 * `dashboard-rows.ts`): заголовок раздела элемента в ядре (`architect/<адрес>/_data`, так зовут нативные: «Вход», «Граф знаний») →
 * имя для людей (имя ядра → паспорт → адрес, 678-1) → у root без имени — «Главный сайт». Идентификатор человеку не показывается.
 */
export function elementLabel(id: string, lang: string): string {
  const address = addressOf(id)
  const section = TREE.find((b) => b.page.meta.slug === address || b.page.meta.slug === id)
  if (section) return wordsOf(section.page, lang).title
  const name = elementDisplayName(id)
  if (id === "root" && (name === id || name === address)) return elementNameWords(lang).rootSite
  return name
}
