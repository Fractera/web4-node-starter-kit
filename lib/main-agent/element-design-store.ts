import "server-only"
import { dataService } from "@/lib/fractera/data-service"
import { elementKeyOf } from "@/lib/element-key.cjs"

// ВЫБОР ДИЗАЙНА ЭЛЕМЕНТА В БАЗЕ УЗЛА (узел, шаг 711-2, 711-3, 711-5). Владелец 2026-11-09: «из общего числа навыков в граф добавить
// кандидатов в скилы элемента – из общего числа скилл добавленных в элемент выбрать несколько кандидатов на тест – для каждого кандидата
// на тест сделать свои референсы … сохранить их в базе данных».
// 🔒 ОДНА ДВЕРЬ К ДАННЫМ — ЭЛЕМЕНТ data (`/db/migrate`), и ПРОСТРАНСТВО САМОГО ЭЛЕМЕНТА (его база `data/elements/<id>.db`): выбор
// дизайна — данные элемента; его агент читает их своим ключом, они уезжают вместе с ним.
// 🔒 КЛЮЧ ЭЛЕМЕНТА, НЕ КЛЮЧ УЗЛА (найдено вживую 2026-11-09: `?space=<id>` с ключом узла → 404 no-such-space — ключ узла базу
// элемента не создаёт, её создаёт только первый вызов самого элемента). Ядро держит DATA_SECRET и делает тот же `X-Element-Key`, что
// установщик пишет элементу (`lib/element-key.cjs`): вызов открывает ровно пространство этого элемента и создаёт его, как первый вызов
// элемента; ни одной таблицы в базе узла, ни `/db/claim`.
// Таблицы объявлены ЗДЕСЬ, одной константой, и появляются в пространстве элемента сами при первом обращении процесса.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS design_skills (
    mark      TEXT NOT NULL PRIMARY KEY,
    name      TEXT NOT NULL,
    origin    TEXT NOT NULL,
    source    TEXT,
    summary   TEXT,
    licence   TEXT,
    stars     INTEGER,
    installs  INTEGER,
    scripts   INTEGER NOT NULL DEFAULT 0,
    test      INTEGER NOT NULL DEFAULT 0,
    added_at  TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS design_refs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    mark      TEXT NOT NULL,
    url       TEXT NOT NULL,
    media_id  TEXT,
    caption   TEXT,
    added_at  TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS design_runs (
    prototype    TEXT NOT NULL,
    mark         TEXT NOT NULL,
    kind         TEXT NOT NULL,
    requested_at TEXT NOT NULL,
    PRIMARY KEY (prototype, kind)
  )`,
]

const ELEMENT = /^[a-z][a-z0-9-]{0,39}$/

/** Один запрос в пространство элемента. */
async function sql(element: string, statement: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  if (!ELEMENT.test(element)) throw new Error(`not an element id: ${element}`)
  const { url } = dataService()
  const key = elementKeyOf(element, process.env.DATA_SECRET ?? "")
  if (!url || !key) throw new Error("no data service or no DATA_SECRET in the core")
  const res = await fetch(`${url}/db/migrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Element-Key": key },
    body: JSON.stringify({ sql: statement, params }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`data ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const body = (await res.json()) as { rows?: Record<string, unknown>[] }
  return body.rows ?? []
}

const ready = new Map<string, Promise<void>>()
function schema(element: string): Promise<void> {
  let p = ready.get(element)
  if (!p) {
    p = (async () => { for (const statement of SCHEMA) await sql(element, statement) })().catch((e) => { ready.delete(element); throw e })
    ready.set(element, p)
  }
  return p
}

export type DesignSkillRow = {
  mark: string; name: string; origin: string; source: string | null; summary: string | null; licence: string | null
  stars: number | null; installs: number | null; scripts: number; test: boolean; addedAt: string
}
export type DesignRefRow = { id: number; mark: string; url: string; mediaId: string | null; caption: string | null; addedAt: string }
/** 715-1: `build` — the core built the element after its agent finished a generation, so the test page's link opens it. */
export type RunKind = "generate" | "pin" | "build"
export type DesignRunRow = { prototype: string; mark: string; kind: RunKind; requestedAt: string }

const num = (v: unknown) => (typeof v === "number" ? v : v === null || v === undefined ? null : Number(v))

export async function readDesign(element: string): Promise<{ skills: DesignSkillRow[]; refs: DesignRefRow[]; runs: DesignRunRow[] }> {
  await schema(element)
  const [s, r, u] = await Promise.all([
    sql(element, "SELECT * FROM design_skills ORDER BY added_at"),
    sql(element, "SELECT * FROM design_refs ORDER BY id"),
    sql(element, "SELECT * FROM design_runs ORDER BY requested_at DESC"),
  ])
  return {
    skills: s.map((x) => ({ mark: String(x.mark), name: String(x.name), origin: String(x.origin), source: (x.source as string) ?? null, summary: (x.summary as string) ?? null, licence: (x.licence as string) ?? null, stars: num(x.stars), installs: num(x.installs), scripts: Number(x.scripts ?? 0), test: Number(x.test) === 1, addedAt: String(x.added_at) })),
    refs: r.map((x) => ({ id: Number(x.id), mark: String(x.mark), url: String(x.url), mediaId: (x.media_id as string) ?? null, caption: (x.caption as string) ?? null, addedAt: String(x.added_at) })),
    runs: u.map((x) => ({ prototype: String(x.prototype), mark: String(x.mark), kind: x.kind === "pin" || x.kind === "build" ? x.kind : "generate", requestedAt: String(x.requested_at) })),
  }
}

export async function addSkill(element: string, s: Omit<DesignSkillRow, "test" | "addedAt">): Promise<void> {
  await schema(element)
  await sql(element, `INSERT INTO design_skills (mark, name, origin, source, summary, licence, stars, installs, scripts, test, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?) ON CONFLICT (mark) DO NOTHING`,
    [s.mark, s.name, s.origin, s.source, s.summary, s.licence, s.stars, s.installs, s.scripts, new Date().toISOString()])
}
export async function removeSkill(element: string, mark: string): Promise<void> {
  await schema(element)
  await sql(element, "DELETE FROM design_skills WHERE mark = ?", [mark])
  await sql(element, "DELETE FROM design_refs WHERE mark = ?", [mark])
}
export async function setTest(element: string, mark: string, test: boolean): Promise<void> {
  await schema(element)
  await sql(element, "UPDATE design_skills SET test = ? WHERE mark = ?", [test ? 1 : 0, mark])
}
export async function addRef(element: string, mark: string, url: string, mediaId: string | null, caption: string | null): Promise<void> {
  await schema(element)
  await sql(element, "INSERT INTO design_refs (mark, url, media_id, caption, added_at) VALUES (?, ?, ?, ?, ?)", [mark, url, mediaId, caption, new Date().toISOString()])
}
export async function removeRef(element: string, id: number): Promise<void> {
  await schema(element)
  await sql(element, "DELETE FROM design_refs WHERE id = ?", [id])
}
export async function addRun(element: string, prototype: string, mark: string, kind: RunKind): Promise<void> {
  await schema(element)
  await sql(element, `INSERT INTO design_runs (prototype, mark, kind, requested_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (prototype, kind) DO UPDATE SET requested_at = excluded.requested_at`, [prototype, mark, kind, new Date().toISOString()])
}
