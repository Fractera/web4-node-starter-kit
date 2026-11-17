"use client"
// @local — the node's element-admin roles by element name, read once by the Users tab's island (778-3)

import { useEffect, useState } from "react"

// АДМИНЫ ЭЛЕМЕНТОВ ПО НАЗВАНИЯМ (узел, шаг 778-3; владелец 2026-11-17, «1 да»): «В колонке «Роли» роль элемента видна фишкой «Админ:
// <название>», а не elementAdmin001. 980 ролей нигде в списках не видно». Дверь ядра `/api/node/element-admins` отдаёт только занятые
// номера реестра с названиями элементов; вкладка спрашивает её один раз, как спрашивает людей и организации.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const FAMILY = /^elementAdmin\d{3}$/

export type ElementAdmin = { role: string; element: string; name: string }

export function useElementAdmins(lang: string): ElementAdmin[] {
  const [admins, setAdmins] = useState<ElementAdmin[]>([])
  useEffect(() => {
    let live = true
    fetch(`${BASE}/api/node/element-admins?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { admins?: ElementAdmin[] } | null) => { if (live && Array.isArray(j?.admins)) setAdmins(j.admins) })
      .catch(() => { /* без названий — фишки покажут сами роли */ })
    return () => { live = false }
  }, [lang])
  return admins
}

/** Is it one of the 980 element-admin roles? */
export const isElementAdminRole = (role: string): boolean => FAMILY.test(role)

/** A role as people read it: «Админ: <element>» for an element's admin role (`chip` holds `{name}`), the role itself otherwise. */
export function roleLabel(role: string, admins: ElementAdmin[], chip: string): string {
  if (!FAMILY.test(role)) return role
  return chip.replace("{name}", admins.find((a) => a.role === role)?.name ?? role)
}
