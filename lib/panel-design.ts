import "server-only"
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

// THE PANEL'S OWN LOOK (node step 718; the owner 2026-11-11: «вторая настройка это будет дизайн панели … тот же самый интерфейс, который
// существует в тонких настройках … не будем давать менять тему, будем давать возможность настройки цвета, шрифта»).
//
// 🔒 TWO FILES, ONE READER. The panel copies the site's look before every core build (`scripts/sync-site-design.mjs` writes
// `DESIGN-CONFIG/design-config.json`) — until the architect edits the panel's own look once. From then on the panel's look is
// `data/node/panel-design.json`: node state, outside git, so a node update never overwrites it and the site's next copy never
// touches it. «Back to the site's look» deletes the file and the copy speaks again. `config/design-config.ts` reads the panel file
// first.
export const PANEL_DESIGN_FILE = join(process.cwd(), "data", "node", "panel-design.json")
const SITE_COPY = join(process.cwd(), "DESIGN-CONFIG", "design-config.json")

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v)

function readObj(file: string): Obj | null {
  try {
    const raw = JSON.parse(readFileSync(file, "utf8"))
    return isObj(raw) ? raw : null
  } catch {
    return null
  }
}

/** The panel's own look, or null while the panel copies the site's. */
export const readPanelDesign = (): Obj | null => readObj(PANEL_DESIGN_FILE)
/** The site's look as the core copied it at its last build. */
export const readSiteCopy = (): Obj => readObj(SITE_COPY) ?? {}

// A merge patch (RFC 7396): an object merges key by key, null deletes a key, anything else replaces it.
function merge(base: Obj, patch: Obj): Obj {
  const out: Obj = { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete out[k]
    else if (isObj(v) && isObj(out[k])) out[k] = merge(out[k] as Obj, v)
    else out[k] = v
  }
  return out
}

/** The first edit starts from the site's look, so the panel changes only what the architect touched. */
export function writePanelDesign(patch: unknown): { ok: true; config: Obj } | { ok: false; reason: string } {
  if (!isObj(patch)) return { ok: false, reason: "bad-body" }
  const next = merge(readPanelDesign() ?? readSiteCopy(), patch)
  mkdirSync(dirname(PANEL_DESIGN_FILE), { recursive: true })
  const tmp = `${PANEL_DESIGN_FILE}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(next, null, 2) + "\n", "utf8")
  renameSync(tmp, PANEL_DESIGN_FILE)
  return { ok: true, config: next }
}

export function clearPanelDesign(): void {
  if (existsSync(PANEL_DESIGN_FILE)) rmSync(PANEL_DESIGN_FILE)
}
