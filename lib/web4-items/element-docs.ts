import "server-only"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/web4-items/element-github"

// DOCUMENTS OF ONE ELEMENT FOR THE CORE'S PAGES (step 412-2). The person, 2026-10-06: the development documents go back to the
// left menu — but only real files (on 2026-10-05 nine empty stubs were removed exactly because nothing stood behind them).
// 🔒 One rule: a menu item exists only while its file or folder exists in the element's folder; the page reads the file as it is.
// The element's own agent writes these files (`development-docs/README.md` there); the core only reads them.

// 416 (владелец 2026-10-06: «Возвращай интерфейс навыки и Хуки чтобы я мог их просматривать во время разработки»): `deep` —
// папка навыков: её файлы плюс `SKILL.md` каждой подпапки; страница показывает их свёрнутыми, по имени.
// 710 (владелец 2026-11-09: «у главного агента почему-то надпись что эти страницы ещё не построены»): `nested` — папка шагов, где каждый
// шаг — своя папка (`new-steps/706/706-main.md`): её `.md` и `.md` каждой подпапки; не больше MAX_FILES, самые новые имена последними.
export type DocSource = { file: string; folder?: boolean; deep?: boolean; nested?: boolean }
const MAX_FILES = 60
export type DocFile = { name: string; text: string; json: boolean }

/** Absolute path of a document inside a folder (an element's, or the core's — 710), or null when the folder or the file is missing. */
function pathIn(dir: string | null, file: string): string | null {
  if (!dir) return null
  const p = join(dir, file)
  return existsSync(p) ? p : null
}

export function hasDoc(id: string, src: DocSource): boolean {
  return hasDocAt(elementDir(id), src)
}
function hasDocAt(dir: string | null, src: DocSource): boolean {
  const p = pathIn(dir, src.file)
  if (!p) return false
  try {
    return src.folder ? statSync(p).isDirectory() : statSync(p).isFile()
  } catch {
    return false
  }
}

/** The document's files: one for a file, every non-dot file of a folder (newest name last). Null — no such document. */
export function readDoc(id: string, src: DocSource): DocFile[] | null {
  return readDocAt(elementDir(id), src)
}
/** 710: the same reading in any folder — the core's own documents for the main agent's pages. */
export function readDocAt(dir: string | null, src: DocSource): DocFile[] | null {
  if (!hasDocAt(dir, src)) return null
  const p = pathIn(dir, src.file)!
  const one = (path: string, name: string): DocFile => ({ name, text: readFileSync(path, "utf8"), json: name.endsWith(".json") })
  if (!src.folder) return [one(p, src.file)]
  return readdirSync(p)
    // 417: only texts a person reads — Markdown and JSON; code next to them (server.ts of the passport) is not shown.
    .filter((n) => !n.startsWith(".") && /\.(md|json)$/.test(n) && statSync(join(p, n)).isFile())
    // 417: README first — the explanation goes above the file it explains.
    .sort((a, b) => (a === "README.md" ? -1 : b === "README.md" ? 1 : a.localeCompare(b)))
    .map((n) => one(join(p, n), `${src.file}/${n}`))
    .concat(
      src.deep
        ? readdirSync(p)
            .filter((n) => !n.startsWith(".") && statSync(join(p, n)).isDirectory() && existsSync(join(p, n, "SKILL.md")))
            .sort()
            .map((n) => one(join(p, n, "SKILL.md"), `${src.file}/${n}/SKILL.md`))
        : [],
    )
    .concat(
      src.nested
        ? readdirSync(p)
            .filter((n) => !n.startsWith(".") && statSync(join(p, n)).isDirectory())
            .sort()
            .flatMap((n) => readdirSync(join(p, n)).filter((f) => f.endsWith(".md") && statSync(join(p, n, f)).isFile()).sort().map((f) => one(join(p, n, f), `${src.file}/${n}/${f}`)))
            .slice(-MAX_FILES)
        : [],
    )
}
