import "server-only"
import { execFile } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { listServices } from "@/lib/microservices/registry"

type RegistryEntry = ReturnType<typeof listServices>[number]
import { listDrafts } from "@/lib/web4-items/drafts"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { elementLabel } from "@/lib/web4-items/element-name"
import { domainRecord } from "@/lib/web4-items/element-domain"
import { birthState } from "@/lib/web4-items/birth"
import paths from "@/lib/web4-items/paths.cjs"
import deployLock from "@/lib/deploy/deploy-lock.cjs"
import power from "@/lib/web4-items/element-power.cjs"
import web4 from "@/lib/web4-items/element-web4.cjs"
import elementProps from "@/lib/web4-items/element-props.cjs"
import { catalogWords } from "@/lib/web4-items/catalog.i18n"

// СТРОКИ ТАБЛИЦЫ «Dashboard → Проекты» (339). Слово владельца 2026-09-29: «В каждой строке: порядковый номер · служебный адрес ·
// заголовок из мета · описание из мета · отдельно адрес если существует · выставлен на продажу в web3 · последний коммит ·
// статус: работает, остановлен, идёт сборка · дата · количество коммитов · ссылка · открыть этот WEB4 ITEMS · пользователи онлайн».
//
// 🔒 СОСТОЯНИЕ ИЗМЕРЯЕТСЯ, А НЕ ВСПОМИНАЕТСЯ: порт элемента спрашивается по HTTP (pm2 пишет online и у сервера, отдающего 500),
// из того же ответа берутся заголовок и описание страницы — как есть, а не как записано в конфиге.
// 🔒 «НАТИВНЫЕ» И «КАСТОМНЫЕ» ДЕЛЯТСЯ ТАК ЖЕ, КАК ЛЕВОЕ МЕНЮ (`_lib/draft-menu.tsx`): кастомные — черновики узла, остальное — нативные.
// 🛑 web3 и «онлайн» — источника в узле нет; поле `null` = «не знаю», а не «нет» (решение владельца 2026-09-30: колонки с «—»).

// 567: «off» — человек выключил элемент (или он пришёл выключенным по паспорту): процесса нет намеренно, порт не опрашивается.
export type ProjectStatus = "running" | "stopped" | "building" | "unborn" | "off"

export type ProjectRow = {
  id: string
  custom: boolean
  /** Служебный адрес `<адрес>.<зона>` (root — корень зоны); без зоны узла — сам адрес. */
  service: string
  title: string | null
  description: string | null
  /** Свой домен элемента, если подключён. */
  domain: string | null
  web3: null
  commit: { hash: string; subject: string } | null
  status: ProjectStatus
  /** 567: причина выключения на языке страницы, если `status === "off"`. */
  offReason: string | null
  /** 567-6: элемент в сети Web4 (паспорт `visibility: network`). */
  web4: boolean
  /** Дата последнего коммита, ISO. */
  date: string | null
  commits: number | null
  /** Сайт элемента: свой домен → служебный адрес; без зоны — null. */
  link: string | null
  /** Страница элемента в ядре, без языка: `/architect/<адрес>`. */
  open: string
  online: null
  /** 548-10: роль элемента в узле одной фразой — назначенная главным агентом (`data/node/roles.json`) или умолчание службы
   *  (`WEB4-ITEMS-REGISTRY/roles.json`); нет — `null`. По ней агент соседа понимает, кто что делает. */
  role: string | null
}

/** 548-10: роли элементов — умолчания служб узла (в git) и назначенные на этом узле (данные, вне git); второе сильнее. */
function roles(): Record<string, string> {
  const read = (p: string) => { try { return JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown> } catch { return {} } }
  const all = { ...read(join(process.cwd(), "WEB4-ITEMS-REGISTRY", "roles.json")), ...read(join(process.cwd(), "data", "node", "roles.json")) }
  return Object.fromEntries(Object.entries(all).filter(([k, v]) => !k.startsWith("_") && typeof v === "string" && v.trim()).map(([k, v]) => [k, String(v).trim()]))
}

type NodeDomain = { zone?: string; hostname?: string }
function nodeDomain(): NodeDomain | null {
  try { return JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as NodeDomain } catch { return null }
}

// То же правило, что у двери `/api/node/reach` (hostnameFor): root отвечает на корне зоны, остальные — на поддомене адреса.
function serviceHost(id: string, d: NodeDomain | null): string {
  const name = addressOf(id)
  if (!d?.zone) return name
  return id === "root" ? d.hostname ?? d.zone : `${name}.${d.zone}`
}

// 567-7: асинхронно — ✗ `spawnSync` держал сервер ядра: 2 вызова × 13 элементов подряд = 1,45 с, пока ни одна дверь не отвечала.
function git(dir: string, args: string[]): Promise<string | null> {
  if (!existsSync(join(dir, ".git"))) return Promise.resolve(null)
  return new Promise((done) => {
    execFile("git", ["-C", dir, ...args], { encoding: "utf8", windowsHide: true, timeout: 10_000 }, (err, out) => done(err ? null : String(out).trim()))
  })
}

// 567-7: из главной нужны только `<title>` и описание — читается `<head>`, остальное не качается.
// ✗ Замерено 2026-10-22: полные главные 13 элементов — 1,7 МБ (rtyhh — 780 КБ) ради двух строк.
async function readHead(r: Response): Promise<string> {
  const reader = r.body?.getReader()
  if (!reader) return ""
  const dec = new TextDecoder()
  let html = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    html += dec.decode(value, { stream: true })
    if (/<\/head>/i.test(html) || html.length > 256_000) { await reader.cancel().catch(() => {}); break }
  }
  return html
}

function building(id: string): boolean {
  const lock = deployLock.readState() as { running?: boolean; current?: string | null } | null
  if (lock?.running && lock.current === id) return true
  try {
    const p = JSON.parse(readFileSync(join(process.cwd(), "data", "services", id, "preview.json"), "utf8")) as { state?: string }
    if (p.state === "building") return true
  } catch { /* предпросмотра нет */ }
  return birthState(id).state === "running"
}

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re)
  if (!m) return null
  const t = m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
  return t || null
}

/** Спросить элемент: отвечает ли он и что стоит в мета его главной (`/<lang>`, затем `/`). */
async function probe(port: number, lang: string): Promise<{ up: boolean; title: string | null; description: string | null }> {
  let up = false
  for (const path of [`/${lang}`, "/"]) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${path}`, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(3000) })
      up = true
      if (!r.ok || !(r.headers.get("content-type") ?? "").includes("text/html")) { await r.body?.cancel().catch(() => {}); continue }
      const html = await readHead(r)
      const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i)
      const description = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
        ?? pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
      return { up, title, description }
    } catch { /* нет ответа по этому пути */ }
  }
  return { up, title: null, description: null }
}

/**
 * 417 (владелец 2026-10-06): короткое описание элемента в сводке узла — из его паспорта (`shortDescription`, рабочая природа
 * элемента); паспорта нет или текст пуст — мета главной, как раньше.
 * 567-7: паспорт читается с диска тем же читателем, что у всего ядра (`element-props.cjs`), а не дверью элемента
 * `/api/own-service-props`. ✗ Замерено 2026-10-22: дверь отвечала 0,4–0,86 с у каждого элемента (7,4 с на узел), а её ответ совпал с
 * файлом у всех 11 живых элементов. Заодно описание есть и у остановленного и выключенного элемента.
 */
export function diskPassport(entry: RegistryEntry): { short: string | null; native: boolean } {
  const p = elementProps.readElementProps(paths.entryDir(entry)) as { shortDescription?: unknown; summary?: unknown; elementType?: unknown } | null
  const raw = typeof p?.shortDescription === "string" ? p.shortDescription : typeof p?.summary === "string" ? p.summary : ""
  // 548-10: элемент из нативного шаблона — нативный, хотя и рождён из черновика (паспорт `elementType`, шаг 544).
  return { short: raw.trim() || null, native: p?.elementType === "native" }
}

async function row(id: string, entry: RegistryEntry | null, custom: boolean, lang: string, d: NodeDomain | null, role: string | null): Promise<ProjectRow> {
  const service = serviceHost(id, d)
  const own = domainRecord(id)
  const dir = entry ? (paths.entryDir(entry) as string) : null
  const port = entry && typeof entry.port === "number" ? entry.port : null
  const off = entry ? power.offOf(entry) : null
  const [log, count, seen] = await Promise.all([
    dir ? git(dir, ["log", "-1", "--format=%h%x09%cI%x09%s"]) : null,
    dir ? git(dir, ["rev-list", "--count", "HEAD"]) : null,
    port !== null && !off ? probe(port, lang) : { up: false, title: null, description: null },
  ])
  const [hash, date, subject] = log ? log.split("\t") : []
  const passport = entry ? diskPassport(entry) : { short: null, native: false }
  const status: ProjectStatus = building(id) ? "building" : !entry ? "unborn" : off ? "off" : seen.up ? "running" : "stopped"
  return {
    id,
    custom: custom && !passport.native,
    service,
    title: seen.title,
    description: passport.short ?? seen.description,
    domain: own?.domain ?? null,
    web3: null,
    commit: hash ? { hash, subject: subject ?? "" } : null,
    status,
    offReason: off ? power.reasonIn(off, lang) : null,
    web4: web4.visibilityOf(id, process.cwd()) === "network",
    date: date ?? null,
    commits: count && /^\d+$/.test(count) ? Number(count) : null,
    link: own ? `https://${own.domain}` : d?.zone ? `https://${service}` : null,
    open: `/architect/${addressOf(id)}`,
    online: null,
    role,
  }
}

/** Все WEB4 ITEMS узла: сначала нативные в порядке реестра, затем кастомные — новые сверху (`listDrafts`). */
export async function projectRows(lang: string): Promise<ProjectRow[]> {
  const d = nodeDomain()
  const drafts = listDrafts()
  const customIds = new Set(drafts.map((x) => x.id))
  const services = listServices()
  const byId = new Map(services.map((s) => [s.id, s]))
  const r = roles()
  const jobs = [
    // 586 (владелец 2026-10-24): «Root элемент это по своей природе кастомный» — в таблице он кастомный, как и в левом меню.
    ...services.filter((s) => !customIds.has(s.id)).map((s) => row(s.id, s, s.id === "root", lang, d, r[s.id] ?? null)),
    ...drafts.map((x) => row(x.id, byId.get(x.id) ?? null, true, lang, d, r[x.id] ?? null)),
  ]
  return Promise.all(jobs)
}

// ── 553: КАТАЛОГ «ВСЕ ПРОЕКТЫ» ────────────────────────────────────────────────────────────────────────────────────────────
// Слово владельца 2026-10-21: «каждый раз когда появляется новый элемент ссылка на него появляется в этом верхнем списке». Те же
// измерения, что у таблицы проектов: в каталог идёт только элемент, чья главная ответила; заголовок и описание — с его главной на
// языке каталога, как есть. Карточку рисует шапка элемента (каталог раздаёт CONFIG) и островок «Все проекты» в шапке ядра.

/** Запись каталога — та же форма, что `CatalogEntry` шаблона элемента (`lib/project-settings.ts`); `off` — только в каталоге ядра (632-1). */
export type CatalogEntry = { id: string; title: string; description: string; href: string | null; local: string | null; kind: "custom" | "native"; off?: boolean; mark?: string }

/**
 * 632-1: имя элемента — то же, что в левом меню: заголовок его раздела в ядре (`architect/<id>/_data`); у кастомного раздела нет — его
 * имя для людей (678-1). ✗ Замерено 2026-11-03 на узле владельца: карточка брала `<title>` главной — root выходил «Что вы хотите построить?», cache —
 * «Эталонный нативный шаблон», и владелец не нашёл root в «Кастомных элементах», хотя он там был.
 */
/** 636-8: имя агента в шапке уведомления главного чата (`/api/node/notice`) — то же, что у карточки каталога (721-1: `elementLabel`). */
export const elementName = (id: string, lang: "en" | "ru"): string => elementLabel(id, lang)
const nameOf = elementName

/**
 * Главная элемента на ЯЗЫКЕ каталога. ✗ 553-5 (замерено 2026-10-21): общий `probe` при отказе `/<язык>` за 3 с переходит на `/`, а `/`
 * ведёт на `/en` — на русской странице ядра карточки выходили английскими, когда элементы были заняты. Здесь — только `/<язык>`,
 * предел дольше; не ответила главная — элемент жив, если отвечает `/api/health`, и карточка берёт имя из паспорта или адреса.
 */
async function catalogProbe(port: number, lang: string): Promise<{ up: boolean; title: string | null; description: string | null }> {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/${lang}`, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(10_000) })
    if (r.ok && (r.headers.get("content-type") ?? "").includes("text/html")) {
      const html = await readHead(r)
      const description = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
        ?? pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
      return { up: true, title: pick(html, /<title[^>]*>([^<]*)<\/title>/i), description }
    }
    return { up: true, title: null, description: null }
  } catch {
    try {
      const h = await fetch(`http://127.0.0.1:${port}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(3000) })
      return { up: h.ok, title: null, description: null }
    } catch {
      return { up: false, title: null, description: null }
    }
  }
}

// Хвост бренда в заголовке главной: «Сайт · Бренд», «Сайт | Бренд» — в карточке нужно имя сайта.
const BRAND_TAIL = /\s+[|·–—]\s+[^|·–—]+$/

async function catalogEntry(id: string, entry: RegistryEntry, custom: boolean, lang: "en" | "ru", d: NodeDomain | null, all: boolean): Promise<CatalogEntry | null> {
  const port = typeof entry.port === "number" ? entry.port : null
  if (port === null) return null
  const off = power.offOf(entry)
  const seen = off ? { up: false, title: null, description: null } : await catalogProbe(port, lang)
  const passport = diskPassport(entry)
  const kind = custom && !passport.native ? "custom" : "native"
  const own = domainRecord(id)
  const href = own ? `https://${own.domain}/${lang}` : d?.zone ? `https://${serviceHost(id, d)}/${lang}` : null
  if (!seen.up) {
    // 632-1 (владелец 2026-11-03: «…сейчас я не вижу там Stripe»): выключенный или молчащий элемент остаётся — под своим именем, с
    // причиной, и ведёт в свой раздел ядра, где его включают.
    // 662-1 (владелец 2026-11-06: «когда пользователи добавляют элементы они автоматически появляются в меню»; выбор «Метка +
    // включение»): в каталог для CONFIG теперь идут ВСЕ элементы реестра. ✗ Замерено: он брал только ответивших в ту секунду —
    // при `node:update` вышло 12, 8, 12, 7 карточек. Выключенный — с меткой и путём в раздел ядра (шапка элемента показывает его
    // только архитектору и ставит перед путём `ARCHITECT_URL`); включённый, но занятый перезапуском — обычной карточкой со своими
    // адресами и описанием из паспорта.
    const w = catalogWords(lang)
    if (off || all) {
      return {
        id,
        title: nameOf(id, lang).slice(0, 160),
        description: (off ? `${w.off}: ${power.reasonIn(off, lang)}` : w.silent).slice(0, 400),
        // 662-1: выключенный — прямо к включателю («Опасная зона» → «Включение элемента»). ✗ Замерено на узле владельца 2026-11-06:
        // главная раздела Stripe в ядре включателя не показывает — «клик ведёт в раздел со включателем» не выполнялся.
        href: off ? `/${lang}/architect/${addressOf(id)}/settings/danger-zone` : `/${lang}/architect/${addressOf(id)}`,
        local: null,
        kind,
        off: true,
        ...(off ? { mark: w.mark } : {}),
      }
    }
    return {
      id,
      title: nameOf(id, lang).slice(0, 160),
      description: (passport.short ?? "").slice(0, 400),
      href,
      local: `http://localhost:${port}/${lang}`,
      kind,
    }
  }
  const page = (seen.title ?? "").replace(BRAND_TAIL, "").trim()
  return {
    id,
    title: nameOf(id, lang).slice(0, 160),
    // 682 (владелец 2026-11-08: «чтобы в верхнем меню кнопок этот элемент можно было найти быстро по названию и описанию»): у кастомного —
    // описание его паспорта (главный агент пишет его при рождении, `create --describe`), а не мета главной: ✗ замерено 2026-11-07 — у девяти
    // новых элементов шапка показывала одинаковый текст главной шаблона. Старое «WEB4 element …, born from …» описанием не считается.
    description: ((kind === "custom" && passport.short && !/^WEB4 element \S+, born from /.test(passport.short) ? passport.short : null) ?? seen.description ?? passport.short ?? page).slice(0, 400),
    href,
    local: `http://localhost:${port}/${lang}`,
    kind,
  }
}

/** Карточки «Все проекты» на одном языке: root, затем кастомные (новые сверху), затем нативные в порядке реестра.
 *  `all` — каталог шапки ядра (632-1): и выключенные, и молчащие элементы; без него — только ответившие (каталог для CONFIG). */
export async function catalogEntries(lang: "en" | "ru", { all = false }: { all?: boolean } = {}): Promise<CatalogEntry[]> {
  const d = nodeDomain()
  const drafts = listDrafts()
  const customIds = new Set(drafts.map((x) => x.id))
  const services = listServices()
  const byId = new Map(services.map((s) => [s.id, s]))
  const root = byId.get("root")
  const jobs = [
    // 586: root — кастомный (слово владельца 2026-10-24), первым, как и прежде.
    ...(root ? [catalogEntry("root", root, true, lang, d, all)] : []),
    ...drafts.filter((x) => x.id !== "root" && byId.has(x.id)).map((x) => catalogEntry(x.id, byId.get(x.id) as RegistryEntry, true, lang, d, all)),
    ...services.filter((s) => s.id !== "root" && !customIds.has(s.id)).map((s) => catalogEntry(s.id, s, false, lang, d, all)),
  ]
  const entries = await Promise.all(jobs)
  return entries.filter((e): e is CatalogEntry => e !== null)
}
