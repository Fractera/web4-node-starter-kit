import "server-only"
import { createHash } from "node:crypto"
import { statSync } from "node:fs"
import { join } from "node:path"
import { listDrafts } from "@/lib/web4-items/drafts"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { builtInDraft } from "@/lib/web4-items/built-in-elements"
import { isNativeElement } from "@/lib/a2a/element-passport"
import { elementDisplayName } from "@/lib/web4-items/element-name"

// 678-3: ОТПЕЧАТОК СОСТАВА УЗЛА ДЛЯ ЛЕВОГО МЕНЮ. Слово владельца 2026-11-07: «каждый раз когда ты создаёшь новый элемент или меняешь
// его название левое меню обновлялось бы … до перезагрузки страницы я не могу увидеть твою работу». `npm run create` и `rename` пишут
// мимо открытой страницы — браузер узнаёт о перемене по отпечатку: те же имена и адреса, что рисует меню, и время записи реестра.
// Только чтение небольших файлов — ни процесса, ни модели.

export type MenuStampEntry = { id: string; address: string; name: string; native: boolean }

function mtimeOf(file: string): number {
  try { return statSync(file).mtimeMs } catch { return 0 }
}

export function menuEntries(): MenuStampEntry[] {
  const ids = [...(builtInDraft("root") ? ["root"] : []), ...listDrafts().map((d) => d.id)]
  const natives = new Set(listDrafts().filter((d) => d.native).map((d) => d.id))
  return ids.map((id) => ({ id, address: addressOf(id), name: elementDisplayName(id), native: natives.has(id) || isNativeElement(id) }))
}

export function menuStamp(): { stamp: string; entries: MenuStampEntry[] } {
  const entries = menuEntries()
  const registry = mtimeOf(join(process.cwd(), "WEB4-ITEMS-REGISTRY", "web4-items.json"))
  const stamp = createHash("sha1").update(JSON.stringify([registry, entries])).digest("hex").slice(0, 16)
  return { stamp, entries }
}
