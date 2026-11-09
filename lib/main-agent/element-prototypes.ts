import "server-only"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/web4-items/element-github"

// ПРОТОТИПЫ ДИЗАЙНА ЭЛЕМЕНТА ГЛАЗАМИ ЯДРА (узел, шаг 711-5). Прототипы пишет агент элемента в своей папке
// (`app/[lang]/(protectedLayer)/prototypes/_pages/<id>/`, шаблон кастомного элемента v0.3.179); ядро их только читает — как документы
// элемента (`lib/web4-items/element-docs.ts`): запись, статус и снимки для вкладки «Строительство → Дизайн».
// 🔒 Путь собирается из проверенного имени прототипа и известных папок, никогда из запроса целиком.

export const PROTOTYPE_ID = /^[a-z0-9][a-z0-9-]{0,47}$/
export type ElementPrototype = {
  id: string
  skill: string
  from: string
  references: { url: string; caption?: string }[]
  status: "draft" | "ready" | "pinned" | "archived"
  createdAt: string
  readyAt?: string
  closedAt?: string
  title?: string
  shots: { desktop: boolean; mobile: boolean }
  archived: boolean
}

const branch = (root: string) => join(root, "app", "[lang]", "(protectedLayer)", "prototypes")
const places = (root: string) => [{ dir: join(branch(root), "_pages"), archived: false }, { dir: join(branch(root), "_archive"), archived: true }]

function read(dir: string, id: string, archived: boolean): ElementPrototype | null {
  try {
    const p = JSON.parse(readFileSync(join(dir, id, "prototype.json"), "utf8")) as Omit<ElementPrototype, "shots" | "archived">
    if (p.id !== id) return null
    const shots = { desktop: existsSync(join(dir, id, "shots", "desktop.png")), mobile: existsSync(join(dir, id, "shots", "mobile.png")) }
    return { ...p, references: Array.isArray(p.references) ? p.references : [], shots, archived }
  } catch {
    return null
  }
}

/** Все прототипы элемента: сначала идущие, потом архив; новые первыми. Элемент не того шаблона — пусто и `supported: false`. */
export function elementPrototypes(element: string): { supported: boolean; list: ElementPrototype[] } {
  const root = elementDir(element)
  if (!root || !existsSync(branch(root))) return { supported: false, list: [] }
  const list: ElementPrototype[] = []
  for (const { dir, archived } of places(root)) {
    if (!existsSync(dir)) continue
    for (const id of readdirSync(dir)) {
      if (!PROTOTYPE_ID.test(id) || !statSync(join(dir, id)).isDirectory()) continue
      const p = read(dir, id, archived)
      if (p) list.push(p)
    }
  }
  list.sort((a, b) => Number(a.archived) - Number(b.archived) || b.createdAt.localeCompare(a.createdAt))
  return { supported: true, list }
}

/** Снимок прототипа (PNG) или null. */
export function prototypeShot(element: string, id: string, size: "desktop" | "mobile"): Buffer | null {
  const root = elementDir(element)
  if (!root || !PROTOTYPE_ID.test(id)) return null
  for (const { dir } of places(root)) {
    const f = join(dir, id, "shots", `${size}.png`)
    if (existsSync(f)) return readFileSync(f)
  }
  return null
}

/** Лежит ли навык в папке навыков элемента (`.claude/skills/<имя>/SKILL.md`) — тогда передавать его не нужно. */
export function elementHasSkill(element: string, name: string): boolean {
  const root = elementDir(element)
  return Boolean(root && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(name) && existsSync(join(root, ".claude", "skills", name, "SKILL.md")))
}
