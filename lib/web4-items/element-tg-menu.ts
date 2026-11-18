import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/web4-items/element-github"

// THE MINI APP'S MENU IN THE CORE (node step 790). The owner, 2026-11-18 (Telegram 748): «все что делаем и строим в Telegram
// отображается в рабочих процессах на левом меню». An element of template v0.3.216+ keeps ONE menu of its Telegram Mini App —
// `app/[lang]/(protectedLayer)/tg/_data/menu.json`, data like its passport — and the core draws the same tree under «Working process →
// Mini App» in its left menu; a press opens the same screen `/<lang>/tg/<slug>` of the element in a phone frame. The element's door
// `GET /api/tg-menu` gives the same file to anyone else over loopback. An element without the file — no tree, one line why.

type Words = { en: string; [lang: string]: string }
type RawItem = { slug: string; title: Words; children?: Array<{ slug: string; title: Words }> }
type RawMenu = { modes?: Array<{ id: string; title: Words; groups?: Array<{ items?: RawItem[] }> }> }

export type TgTreeNode = { slug: string; title: string; children: TgTreeNode[] }
export type TgTreeMode = { id: string; title: string; items: TgTreeNode[] }

const SLUG = /^$|^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/
const pick = (w: Words | undefined, lang: string) => (w ? w[lang] || w.en : "")

/** The element's Mini App menu in one language; null — the element has none (older template, native element). */
export function elementTgMenu(id: string, lang: string): TgTreeMode[] | null {
  const dir = elementDir(id)
  if (!dir) return null
  let raw: RawMenu
  try { raw = JSON.parse(readFileSync(join(dir, "app", "[lang]", "(protectedLayer)", "tg", "_data", "menu.json"), "utf8")) as RawMenu } catch { return null }
  const modes = (raw.modes ?? []).map((m) => ({
    id: m.id,
    title: pick(m.title, lang) || m.id,
    items: (m.groups ?? []).flatMap((g) => g.items ?? []).filter((it) => SLUG.test(it.slug ?? "x/")).map((it) => ({
      slug: it.slug,
      title: pick(it.title, lang) || it.slug,
      children: (it.children ?? []).filter((c) => SLUG.test(c.slug ?? "x/") && c.slug).map((c) => ({ slug: c.slug, title: pick(c.title, lang) || c.slug, children: [] })),
    })),
  }))
  return modes.length ? modes : null
}

/** The address segment of a screen in the core: the branch's own page is «home». */
export const tgSegment = (slug: string) => (slug ? slug : "home")

/** Every screen of the element's Mini App, as core segments — the page answers only for these (another slug is a 404). */
export function elementTgSegments(id: string): string[] {
  const walk = (n: TgTreeNode): string[] => [tgSegment(n.slug), ...n.children.flatMap(walk)]
  return (elementTgMenu(id, "en") ?? []).flatMap((m) => m.items.flatMap(walk))
}
