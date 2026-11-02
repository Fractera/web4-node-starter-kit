import type { WorkspaceItem } from '@/lib/content/blocks/types'
import { pagesInOrder, wordsOf, type CollectionBranch, type WorkspacePageData } from '@/lib/collection/types'
import { TREE } from '../architect/_list.generated'
import { MAIN_AGENT, MAIN_AGENT_PLACE } from './main-agent-scheme'

// МЕНЮ СЛОЯ АРХИТЕКТОРА — СОБИРАЕТСЯ ИЗ ДЕРЕВА ПАПОК, А НЕ ИЗ СПИСКА (254).
//
// 🔒 РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-09-19: «на примере инструментов построить правильную
// архитектуру добавления страниц… если пользователь будет добавлять просто одну
// новую страницу-раздел, то рубрика получит автоматически одну новую ссылку».
// Образец — блог стартера; отличие названо им же: «у нас получается здесь два
// уровня вложенности».
//
// 🪦 ЗДЕСЬ СТОЯЛИ МАССИВЫ `TOOLS`, `BUILD` И ПЕРЕЧЕНЬ ГРУПП. Чтобы добавить один
// раздел, требовалось четыре согласованных правки в трёх файлах: строка в
// массиве, поле в типе словаря, `en`, `ru`. Забытая четвёртая ломалась молча, и
// сторож ловил лишь часть этого. Теперь не осталось ни одной: и группы, и
// разделы приходят из `_list.generated.ts`, который сборка складывает из самих
// папок.
//
// 🔒 ГЛУБИНА ПЕРЕСТАЛА БЫТЬ ПАРАМЕТРОМ. Группа и раздел устроены одинаково —
// папка со своим `_data`; различает их только место в дереве. Третий уровень не
// потребует здесь ни строки.
//
// 🔒 АДРЕС, А НЕ ПАРАМЕТР ЗАПРОСА — слово владельца 2026-09-18: «каждый раздел
// создавать отдельную страницу». У страницы с `?section=…` нет собственного
// адреса: её нельзя предрендерить, нельзя дать ссылкой, и она обязана решать на
// лету, что показать, — то есть уходит в динамику.

/** Адрес входа. Отдельной константой — на неё смотрят и страница, и сторож маршрутов. */
export const ARCHITECT_HOME = '/architect'

/**
 * Куда ведёт группа и где живут её разделы.
 *
 * 🔒 СКЛАДЫВАЕТСЯ ИЗ ИМЕНИ ПАПКИ, А НЕ ОБЪЯВЛЯЕТСЯ. Объявленный адрес разошёлся
 * бы с местом папки на диске, и ссылка повела бы мимо страницы, ничего при этом
 * не сломав.
 */
const dirOf = (slug: string) => `${ARCHITECT_HOME}/${slug}`

/**
 * Адрес каждой страницы слоя ВМЕСТЕ С ЕЁ ДАННЫМИ (256-6).
 *
 * 🔒 ПАРА, А НЕ ОДИН ПУТЬ, И ЭТО НУЖНО КАРТЕ САЙТА. Карта обязана перечислять
 * страницу на тех языках, на которых у неё есть СВОЙ текст, — а знают об этом
 * только её данные. Отдавая наружу голый путь, мы заставили бы карту
 * догадываться, и она догадывалась: печатала каждый включённый язык подряд.
 */
export const ARCHITECT_PAGES: readonly { path: string; page: { overrides?: Record<string, unknown> } }[] =
  // 528-3, 528-6: на любую глубину — раздел, подраздел, страница («Главный агент → Messenger → H2H → Нативный мессенджер»).
  TREE.flatMap((b) => {
    const out: { path: string; page: WorkspacePageData }[] = [{ path: dirOf(b.page.meta.slug), page: b.page }]
    const walk = (nodes: MenuNode[]) => nodes.forEach((n) => { out.push({ path: n.path, page: n.page }); walk(n.kids) })
    walk(physical(b, dirOf(b.page.meta.slug), ''))
    return out
  })

/** Страница слоя в дереве меню: адрес папки, путь от группы и пункты под ней. */
export type MenuNode = { page: WorkspacePageData; path: string; rel: string; kids: MenuNode[] }

/** Дерево папок группы как есть на диске (`_list.generated.ts` каждой папки, `branches`). */
function physical(branch: CollectionBranch | undefined, dir: string, relBase: string): MenuNode[] {
  return (branch?.children ?? []).map((p) => {
    const rel = relBase ? `${relBase}/${p.meta.slug}` : p.meta.slug
    const sub = branch?.branches?.find((s) => s.page.meta.slug === p.meta.slug)
    return { page: p, path: `${dir}/${p.meta.slug}`, rel, kids: physical(sub, `${dir}/${p.meta.slug}`, rel) }
  })
}

const ordered = (nodes: MenuNode[]): MenuNode[] =>
  pagesInOrder(nodes.map((n) => n.page)).map((p) => {
    const n = nodes.find((x) => x.page === p)!
    return { ...n, kids: ordered(n.kids) }
  })

/**
 * Дерево меню группы. У «Главного агента» (528-6) страницы, чьё место названо в `MAIN_AGENT_PLACE`, встают под свой пункт-родитель —
 * адрес страницы при этом прежний. Место названо, а родителя нет — страница остаётся наверху (её найдёт сторож), а не пропадает.
 */
export function groupTree(slug: string): MenuNode[] {
  const nodes = physical(TREE.find((b) => b.page.meta.slug === slug), dirOf(slug), '')
  if (slug !== MAIN_AGENT) return ordered(nodes)
  const all = new Map<string, MenuNode>()
  const index = (ns: MenuNode[]) => ns.forEach((n) => { all.set(n.rel, n); index(n.kids) })
  index(nodes)
  const moved = new Set<string>()
  for (const [rel, parent] of Object.entries(MAIN_AGENT_PLACE)) {
    const n = all.get(rel)
    const to = all.get(parent)
    if (n && to && n !== to) { to.kids.push(n); moved.add(rel) }
  }
  return ordered(nodes.filter((n) => !moved.has(n.rel)))
}

/** Пункт дерева группы по пути от группы (`construction`, `messenger/h2a`) — для страниц-оглавлений. */
export function groupNode(slug: string, rel: string): MenuNode | null {
  const find = (ns: MenuNode[]): MenuNode | null => {
    for (const n of ns) {
      if (n.rel === rel) return n
      const deeper = find(n.kids)
      if (deeper) return deeper
    }
    return null
  }
  return find(groupTree(slug))
}

/** Адрес каждой страницы слоя — для сторожа маршрутов и любого обхода. */
export const ARCHITECT_PATHS: readonly string[] = ARCHITECT_PAGES.map((p) => p.path)

/**
 * Левое меню: группы, а под каждой — её разделы раскрывающимся подменю.
 *
 * 🔒 `active` ЗНАЧИТ «ЭТО ТЕКУЩАЯ СТРАНИЦА», `open` — «ЧЕЛОВЕК ВНУТРИ ГРУППЫ».
 * Слитые в одно, они ставили `aria-current="page"` на группу, пока открыт её
 * раздел: экранный диктор читал это как «вы на двух страницах сразу».
 *
 * 🔒 ГРУППА БЕЗ ДЕТЕЙ ОСТАЁТСЯ ОБЫЧНЫМ ПУНКТОМ, без стрелки: раскрывать ей
 * нечего, и пустая раскрывашка выглядела бы поломкой.
 */
export function architectMenu(lang: string, currentPath: string): WorkspaceItem[] {
  const at = (path: string) => `/${lang}${path}`

  // 528-3, 528-6: пункт с детьми раскрывается следующим уровнем; открыт, когда человек на нём или где-то под ним (и под пунктом,
  // который стоит здесь по схеме главного агента, хотя адрес у него свой).
  const item = (n: MenuNode): WorkspaceItem => {
    const kids = n.kids.map(item)
    return kids.length > 0
      ? { label: wordsOf(n.page, lang).title, href: at(n.path), active: n.path === currentPath, open: n.path === currentPath || kids.some((k) => k.active || k.open), children: kids }
      : { label: wordsOf(n.page, lang).title, href: at(n.path), active: n.path === currentPath, ...(n.page.meta.newTab ? { newTab: true } : {}) }
  }

  return pagesInOrder(TREE.map((b) => b.page)).map((group) => {
    const dir = dirOf(group.meta.slug)
    const children: WorkspaceItem[] = groupTree(group.meta.slug).map(item)

    return {
      label: wordsOf(group, lang).title,
      ...(group.meta.icon ? { icon: group.meta.icon } : {}),
      href: at(dir),
      active: currentPath === dir,
      open: currentPath === dir || children.some((c) => c.active || c.open),
      ...(children.length > 0 ? { children } : {}),
    }
  })
}

// 🪦 ЗДЕСЬ ЖИЛА `architectGroupTabs` — ВЕРХНИЙ РЯД ИЗ ГРУПП СЛОЯ. Удалена
// 2026-09-21 (264-4) по двум причинам сразу, и вторая важнее первой.
//
// 1. ЕЁ НЕ ЗВАЛ НИКТО. Вход в слой давно строит свой ряд из тем собственной
//    страницы (`architect/page.tsx`), то есть функция пережила свой предмет и
//    держалась только экспортом.
// 2. ОНА БЫЛА ОБРАЗЦОМ ЗАПРЕЩЁННОГО ПРИЁМА, и это уже стоило владельцу
//    повторного указания. Её тело собирало ряд из ссылок на ДРУГИЕ адреса —
//    ровно то, что он запретил: «эти кнопки не должны дублировать левое меню,
//    это просто кнопки быстрой навигации по текущей длинной странице».
//    Живой код читается как разрешение; мёртвый — так же, только возразить
//    некому. Поэтому он удаляется, а не помечается флагом.
//
// 🔒 ПРАВИЛО ВМЕСТО НЕЁ: верхний ряд любой страницы слоя ведёт ТОЛЬКО внутрь
// этой страницы (`#якорь`). Пункт ряда, ведущий на другой адрес, дублирует левое
// меню — это и есть признак, по которому ошибка ловится сразу.
