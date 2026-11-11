"use client"

import { useEffect, useState } from "react"
import { DesktopNav, MobileMenu } from "@/components/shell/shell-menu.client"
import type { ShellGroup } from "@/components/shell/shell-types"
import { MenuSearch } from "@/components/architect/menu-search.client"
import type { MenuSearchWords } from "@/components/architect/menu-search.i18n"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"

// ВКЛАДКИ «НАТИВНЫЕ ЭЛЕМЕНТЫ» И «КАСТОМНЫЕ ЭЛЕМЕНТЫ» В ШАПКЕ СТРАНИЦ АРХИТЕКТОРА (узел, шаги 553 и 600-3).
// Слово владельца 2026-10-26: вкладка «Все проекты» называется неверно; правильно — «Нативные элементы», и в ней все нативные;
// рядом такая же вкладка «Кастомные элементы» со всеми кастомными (root — кастомный, шаг 586).
// Вид — мега-меню оболочки (как у сайтов элементов), данные — дверь ядра `/api/node/catalog` в браузере; поле `kind` каталога
// решает, в какой вкладке элемент.
// 🔒 СОСТАВ УЗЛА НЕ ЗАПЕКАЕТСЯ В СБОРКУ ЯДРА (закон 264 «число о машине — спрашивать в браузере»): новый элемент появляется в
// списке без пересборки ядра — при открытии страницы и по событию `node:menu-changed` (678-3). Пока ответа нет или элементов нет — вкладок нет.
// 722-2 (владелец 2026-11-11: «1000 элементов … подгружает по 12»): нативные — из каталога (`?native=1`, их немного); кастомные — первые
// 12 из быстрой двери меню (`/api/architect/menu/elements`, без опроса главных) и карточка «Все проекты (N)», когда их больше.
// 🛑 Порции внутри самой выпадашки потребовали бы правки мега-меню оболочки (`components/shell/`, копия сайта байт в байт) — это
// выпуск оболочки сайта и ядра вместе, не этот шаг.

type Entry = { id: string; title: string; description: string; href: string | null; local: string | null; kind?: "custom" | "native"; mark?: string }

/** Одна вкладка-выпадашка из записей каталога; пустой список — вкладки нет вовсе. */
function groupOf(slug: string, label: string, list: Entry[]): ShellGroup | null {
  if (list.length === 0) return null
  return {
    slug,
    label,
    order: -1,
    childrenAsDropdown: true,
    roles: "public",
    catalog: true,
    // Своего домена у узла нет — карточка ведёт на элемент на этом компьютере.
    children: list.map((e) => ({ slug: e.id, title: e.title, href: e.href ?? e.local ?? "#", ...(e.description ? { description: e.description } : {}), ...(e.mark ? { mark: e.mark } : {}) })),
  }
}

type Portion = { rows: { id: string; label: string; href: string; description?: string }[]; total: number }

export function AllProjects({ lang, nativeLabel, customLabel, menuLabel, allProjectsLabel, searchWords, dialogUi }: { lang: string; nativeLabel: string; customLabel: string; menuLabel: string; allProjectsLabel: string; searchWords: MenuSearchWords; dialogUi: AppDialogUi }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  // 678-3: островок `MenuLive` увидел новый элемент или новое имя — каталог спрашивается заново, без перезагрузки страницы.
  const [round, setRound] = useState(0)
  useEffect(() => {
    const again = () => setRound((n) => n + 1)
    window.addEventListener("node:menu-changed", again)
    return () => window.removeEventListener("node:menu-changed", again)
  }, [])

  useEffect(() => {
    let alive = true
    const l = lang === "ru" ? "ru" : "en"
    const json = (u: string) => fetch(u, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    Promise.all([
      json(`/api/node/catalog?lang=${l}&native=1`),
      json(`/api/architect/menu/elements?lang=${encodeURIComponent(lang)}&from=0&limit=12&description=1&root=1`),
    ]).then(([cat, menu]: [{ entries?: Entry[] } | null, (Portion & { ok?: boolean }) | null]) => {
      if (!alive) return
      const natives = (Array.isArray(cat?.entries) ? cat.entries : []).filter((e) => e.kind !== "custom")
      const portion = menu?.ok && Array.isArray(menu.rows) ? menu : { rows: [], total: 0 }
      const customs: Entry[] = portion.rows.map((r) => ({ id: r.id, title: r.label, description: r.description ?? "", href: r.href, local: null, kind: "custom" }))
      if (portion.total > portion.rows.length) customs.push({ id: "all-projects", title: allProjectsLabel.replace("{n}", String(portion.total)), description: "", href: `/${lang}/architect/dashboard/projects`, local: null, kind: "custom" })
      setEntries([...natives, ...customs])
    })
    return () => { alive = false }
  }, [lang, round, allProjectsLabel])

  if (!entries || entries.length === 0) return null
  // Нативные первыми — как в каталоге и в левом меню; всё, что не помечено кастомным, относится к нативным.
  const groups = [
    groupOf("native-elements", nativeLabel, entries.filter((e) => e.kind !== "custom")),
    groupOf("custom-elements", customLabel, entries.filter((e) => e.kind === "custom")),
  ].filter((g): g is ShellGroup => g !== null)
  if (groups.length === 0) return null
  return (
    <>
      <DesktopNav lang={lang} groups={groups} meUrl="/api/me" />
      <MobileMenu lang={lang} groups={groups} label={menuLabel} meUrl="/api/me" />
      {/* 729: поиск элементов в шапке — лупа раскрывает поле слева от себя и иконку ИИ справа, без отдельной панели. */}
      <MenuSearch lang={lang} words={searchWords} dialogUi={dialogUi} />
    </>
  )
}
