import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// СВЯЗЬ ЭЛЕМЕНТА С CONFIG (шаг 324-7; с 716 связь одна — CONFIG: элементов «Дизайн» и «Блоки» у узла нет, облик каждого элемента —
// его собственный DESIGN-CONFIG).
// 🔒 СОСТОЯНИЕ — `data/services/<id>/links.json` (`{ config }`), папка данных элемента у узла: её читает сам элемент
// (`lib/own-site.ts` → `linkOn`), удаление элемента стирает её вместе с ним. Нет ключа — связь включена.
// 🔒 804-6 (the owner, 2026-11-19: «если где-то в CONFIG у элемента есть возможность потом изменить тип это надо убрать в рамках этого
// шага»): the state is written ONCE by the birth from its one answer (`scripts/item-birth.mjs`: part of the project → on, an app of its
// own → off; `lib/web4-items/element-app.cjs`) and never switched after — the switch, its door PATCH /api/architect/items/<id>/links
// and `npm run look -- --own|--linked` are gone (their code is in git before 804-6).

export type LinkKind = "config"
export type Links = Record<LinkKind, boolean>
const DATA = join(process.cwd(), "data", "services")

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function readJson(file: string): unknown {
  try { return JSON.parse(readFileSync(file, "utf8")) } catch { return null }
}

export function readLinks(id: string): Links {
  const raw = readJson(join(DATA, id, "links.json"))
  const r = isObj(raw) ? raw : {}
  return { config: r.config !== false }
}
