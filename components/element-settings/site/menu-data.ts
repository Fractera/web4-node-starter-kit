import type { ShellGroup } from "@/components/shell/shell-types"
import type { NavCandidate, NavItem, NavSlot } from "./editors/lib/nav"

// МЕНЮ ЭЛЕМЕНТА ДЛЯ РЕДАКТОРА (узел, шаг 712-4) — то же, что собирала страница элемента из своей оболочки (`site-settings-editors/
// blocks.tsx`), но из его публичной двери оболочки `/api/shell/<язык>`, которую ядро спрашивает через пульт: текущее меню места и
// кандидаты — все страницы шапки и подвала.
export function shellMenu(shell: { top?: ShellGroup[]; footer?: ShellGroup[] }, lang: string, slot: NavSlot): { current: NavItem[]; candidates: NavCandidate[] } {
  const top = shell.top ?? []
  const footer = shell.footer ?? []
  const groups = slot === "top" ? top : footer
  const hrefOf = (g: ShellGroup) => g.href ?? `/${lang}/${g.slug}`
  const current: NavItem[] = groups.map((g, i) => ({
    id: g.slug,
    href: hrefOf(g),
    order: (i + 1) * 10,
    label: g.label,
    ...(g.children.length ? { children: g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, label: c.title })) } : {}),
  }))
  const seen = new Set<string>()
  const candidates: NavCandidate[] = []
  for (const g of [...top, ...footer]) {
    for (const c of [{ id: g.slug, href: hrefOf(g), title: g.label, section: g.label }, ...g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, title: c.title, section: g.label }))]) {
      if (!seen.has(c.href)) { seen.add(c.href); candidates.push(c) }
    }
  }
  return { current, candidates }
}
