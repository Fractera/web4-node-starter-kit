import "server-only"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

// THE TOOLS OF ONE PLACE FOR THE «TOOLS» TAB (node step 725-8). The owner, 2026-11-12: «Нажатие на кнопку инструмента справа откроет
// карточки с описанием инструмента какое они задачи решают где могут быть использованы и то самое полное описание которое ты создал для
// обнаружения этих инструментов. Очевидно что каждый элемент должен получить такую же карточку».
// 🔒 The truth is the folder's own generated maps: `_tools/TOOLS.json` (the cards `tool.json`) and `lib/parts/PARTS.json` (the measured
// `usedBy`). Nothing here is a second list; a place without the maps answers null and the tab says so.
// 🔒 Read at the request, not at the build: an element's agent adds a tool at any minute, the panel's pages are prerendered.

export type ToolText = { title: string; what: string; how: string; value: string }
export type ToolRow = {
  /** The tool's id without the element templates' prefix «tool-» — the same tool has one key in the core and in an element. */
  key: string
  dir: string
  needs: string[]
  usedBy: string[]
  words: { en: string[]; ru: string[] }
  en: ToolText
  ru: ToolText
}

type RawTool = { id: string; dir?: string; needs?: string[]; usedBy?: string[]; words?: { en?: string[]; ru?: string[] }; en: ToolText; ru: ToolText }
type RawPart = { id: string; kind: string; usedBy?: string[] }

const readJson = <T,>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, "utf8").replace(/\r\n/g, "\n")) as T
  } catch {
    return null
  }
}

/** The tools of the folder `dir` (the core's root or an element's folder), or null when it has no map. */
export function readTools(dir: string | null): ToolRow[] | null {
  if (!dir || !existsSync(join(dir, "_tools", "TOOLS.json"))) return null
  const tools = readJson<{ tools?: RawTool[] }>(join(dir, "_tools", "TOOLS.json"))?.tools ?? []
  const parts = readJson<{ parts?: RawPart[] }>(join(dir, "lib", "parts", "PARTS.json"))?.parts ?? []
  const measured = new Map(parts.filter((p) => p.kind === "tool").map((p) => [p.id.replace(/^tool-/, ""), p.usedBy ?? []]))
  return tools.map((t) => {
    const key = t.id.replace(/^tool-/, "")
    return {
      key,
      dir: t.dir ?? `_tools/${t.id}`,
      needs: t.needs ?? [],
      usedBy: measured.get(key) ?? t.usedBy ?? [],
      words: { en: t.words?.en ?? [], ru: t.words?.ru ?? [] },
      en: t.en,
      ru: t.ru,
    }
  })
}
