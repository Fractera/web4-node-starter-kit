import { readFileSync } from "node:fs"
import { join } from "node:path"

import paths from "@/lib/web4-items/paths.cjs"

// ИМЯ ПРИЛОЖЕНИЯ ЗАВОДА (узел, шаг 554-1). Организация входа с `element` — приложение кастомного элемента; в базе входа её имя —
// id элемента. Человеку показываем `short_name` настроек элемента (свой APP-CONFIG поверх умолчаний, по умолчанию «Fractera») —
// читаем в момент показа, поэтому переименование сайта видно на вкладке «Пользователи» сразу. 🔒 Синхронизации, таймеров и толчков
// нет (закон 2026-09-25): имя не копируется во вход, а берётся из единственного места, где человек его меняет.

function readJson(file: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>
  } catch {
    return null
  }
}

export function appName(element: string): string {
  const dir = paths.itemDir(element, "user") as string
  for (const file of ["app-config.json", "defaults.json"]) {
    const name = readJson(join(dir, "APP-CONFIG", file))?.short_name
    if (typeof name === "string" && name.trim()) return name.trim()
  }
  return element
}

type Org = { name?: unknown; element?: unknown }

/** Ответ двери людей элемента входа: у организаций-приложений имя заменяется живым `short_name` элемента. */
export function withAppNames(body: unknown): unknown {
  if (!body || typeof body !== "object") return body
  const cache = new Map<string, string>()
  const fix = (o: Org) => {
    if (typeof o?.element !== "string" || !o.element) return o
    if (!cache.has(o.element)) cache.set(o.element, appName(o.element))
    return { ...o, name: cache.get(o.element) }
  }
  const b = body as { rows?: { orgs?: Org[] }[]; organizations?: Org[]; organization?: Org }
  return {
    ...b,
    ...(Array.isArray(b.rows) ? { rows: b.rows.map((r) => (Array.isArray(r?.orgs) ? { ...r, orgs: r.orgs.map(fix) } : r)) } : {}),
    ...(Array.isArray(b.organizations) ? { organizations: b.organizations.map(fix) } : {}),
    ...(b.organization ? { organization: fix(b.organization) } : {}),
  }
}
