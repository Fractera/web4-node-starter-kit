import "server-only"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

// THE TOOLS OF ONE PLACE FOR THE «TOOLS» TAB (node step 725-8, 733-8). The owner, 2026-11-12: «Нажатие на кнопку инструмента справа
// откроет карточки с описанием инструмента какое они задачи решают где могут быть использованы и то самое полное описание которое ты создал
// для обнаружения этих инструментов. Очевидно что каждый элемент должен получить такую же карточку».
// 🔒 The truth is the folder's own generated maps: `lib/parts/PARTS.json` (every tool — a folder under `_tools/` or a component tool, 733-2:
// its title, version, recipe, scope, measured `usedBy`) and `_tools/TOOLS.json` (the folder tools' longer words: how, value). Nothing here
// is a second list; a place with neither map answers null and the tab says so.
// 🔒 Read at the request, not at the build: an element's agent adds a tool at any minute, the panel's pages are prerendered.

export type ToolText = { title: string; what: string; how: string; value: string }
export type ToolRow = {
  /** The tool's id without the element templates' prefix «tool-» — the same tool has one key in the core and in an element. */
  key: string
  /** The id in the parts map — what `npm run tool:take -- <id>` names. */
  id: string
  dir: string
  version: string
  scope: "panel" | "any" | null
  /** The tools it is made of (733-2): ids without the «tool-» prefix, with their versions. */
  parts: { key: string; version: string }[]
  needs: string[]
  usedBy: string[]
  words: { en: string[]; ru: string[] }
  en: ToolText
  ru: ToolText
  /** 733-9-2: a copy taken from the core whose source now holds a newer version — what the element's agent may update to. */
  newer?: { version: string; command: string }
}

type Lang2 = { en?: string; ru?: string }
type RawTool = { id: string; dir?: string; version?: string; needs?: string[]; usedBy?: string[]; words?: { en?: string[]; ru?: string[] }; en: ToolText; ru: ToolText }
type RawPart = {
  id: string; kind: string; path?: string; version?: string; scope?: "panel" | "any"; parts?: { id: string; version: string }[]
  title?: Lang2 | string; what?: Lang2; how?: string; needs?: string[]; usedBy?: string[]; words?: { en?: string[]; ru?: string[] }
  source?: { from?: string; tool?: string; version?: string }
}

const readJson = <T,>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, "utf8").replace(/\r\n/g, "\n")) as T
  } catch {
    return null
  }
}

const bare = (id: string) => id.replace(/^tool-/, "")

/** A component tool's words from its card in the parts map; its «how» exists in English only — the Russian card shows it as it is. */
function fromPart(p: RawPart, lang: "en" | "ru"): ToolText {
  const title = typeof p.title === "string" ? p.title : p.title?.[lang] ?? p.title?.en ?? p.id
  return { title, what: p.what?.[lang] ?? p.what?.en ?? "", how: p.how ?? "", value: "" }
}

const newerThan = (a: string, b: string) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number)
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0)
  return false
}

/** The tools of the folder `dir` (the core's root or an element's folder), or null when it has no map. `core` — the core's folder, for an
 *  element: its copies are compared with their source (733-9-2). */
export function readTools(dir: string | null, core?: string): ToolRow[] | null {
  if (!dir) return null
  const hasTools = existsSync(join(dir, "_tools", "TOOLS.json"))
  const hasParts = existsSync(join(dir, "lib", "parts", "PARTS.json"))
  if (!hasTools && !hasParts) return null
  const folder = new Map((readJson<{ tools?: RawTool[] }>(join(dir, "_tools", "TOOLS.json"))?.tools ?? []).map((t) => [bare(t.id), t]))
  const parts = (readJson<{ parts?: RawPart[] }>(join(dir, "lib", "parts", "PARTS.json"))?.parts ?? []).filter((p) => p.kind === "tool")
  const source = new Map(core && core !== dir
    ? (readJson<{ parts?: RawPart[] }>(join(core, "lib", "parts", "PARTS.json"))?.parts ?? []).filter((p) => p.kind === "tool").map((p) => [p.id, p.version ?? ""])
    : [])
  const rows: ToolRow[] = parts.map((p) => {
    const key = bare(p.id)
    const now = p.source?.from === "core" && p.source.tool ? source.get(p.source.tool) : undefined
    const newer = now && p.source?.version && newerThan(now, p.source.version) ? { version: now, command: `npm run tool:take -- ${p.source.tool} --update` } : undefined
    const t = folder.get(key)
    folder.delete(key)
    return {
      key,
      id: p.id,
      dir: t?.dir ?? (p.path?.startsWith("_tools/") ? p.path.split("/").slice(0, 2).join("/") : p.path ?? `_tools/${key}`),
      version: p.version ?? t?.version ?? "",
      scope: p.scope ?? null,
      parts: (p.parts ?? []).map((x) => ({ key: bare(x.id), version: x.version })),
      needs: p.needs ?? t?.needs ?? [],
      usedBy: p.usedBy ?? t?.usedBy ?? [],
      words: { en: p.words?.en ?? t?.words?.en ?? [], ru: p.words?.ru ?? t?.words?.ru ?? [] },
      en: t?.en ?? fromPart(p, "en"),
      ru: t?.ru ?? fromPart(p, "ru"),
      ...(newer ? { newer } : {}),
    }
  })
  // A place whose parts map is older than its tools map (an element born before 725) still shows its folder tools.
  for (const [key, t] of folder) {
    rows.push({
      key, id: t.id, dir: t.dir ?? `_tools/${t.id}`, version: t.version ?? "", scope: null, parts: [], needs: t.needs ?? [],
      usedBy: t.usedBy ?? [], words: { en: t.words?.en ?? [], ru: t.words?.ru ?? [] }, en: t.en, ru: t.ru,
    })
  }
  // The ones a person meets first: a tool used by more files, then by name.
  return rows.sort((a, b) => b.usedBy.length - a.usedBy.length || a.en.title.localeCompare(b.en.title))
}
