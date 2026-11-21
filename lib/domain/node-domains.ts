import "server-only"
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { isDnsLabel } from "@/lib/web4-items/dns-label.mjs"
import { accountOfZone, activationCheck, createZone, deleteZone, getIngress, listAccounts, listZones, verifyToken, workersAccess, zoneByName, zoneHasRecords } from "@/lib/domain/cloudflare"
import { closestName, registryOf } from "@/lib/domain/registry.mjs"
import { zoneFate } from "@/lib/domain/own-zone.mjs"
import { envValue } from "@/lib/web4-items/element-delete"
import { lookup } from "@/lib/hosting/dns-check.mjs"
import { placeKind } from "@/lib/hosting/place.mjs"

// ДОМЕНЫ УЗЛА — СПИСОК, А НЕ ОДИН (шаг 324-1). Слово владельца 2026-09-27: «нужно все то что сделано там превратить в карточке
// аккордеона … первую карточку может быть открыты карточка первого домена а кроме этого здесь надо позволить подключать больше
// доменов сколько угодно». Выбор пути — «Как основной — туннель»: дополнительный домен — зона в том же аккаунте Cloudflare,
// тот же ключ и тот же туннель узла; новый туннель не заводится.
//
// 🔒 ОСНОВНОЙ ДОМЕН НЕ ПЕРЕЕЗЖАЕТ: он живёт в `logs/domain.json` (лестница 259, вход, ядро, туннель читают его оттуда), и
// список берёт его оттуда же, не копируя. Дополнительные — `data/node/domains.json` (вне git, как всё `data/*`).
// 🔒 ФОРМА ИМЕНИ — ПО ПРАВИЛАМ DNS (325-7): каждая метка — `isDnsLabel`, не меньше двух меток, имя ≤253 знаков (RFC 1035:
// 255 октетов в передаче, два из них служебные), последняя метка — не число. Вводится корень: `www.` — отдельный отказ.
// 🔒 ГОТОВ = ЗОНА АКТИВНА И КЛЮЧ УЗЛА ЕЁ ВИДИТ. Не видит — запись остаётся карточкой со следующим шагом, а не пропадает:
// человек идёт в Cloudflare и возвращается нажать «Проверить снова». Ничего не проверяется само.
// 🔒 КЛЮЧ ЧИТАЕТСЯ ИЗ ОКРУЖЕНИЯ УЗЛА И НИКУДА НЕ ОТДАЁТСЯ.
// 🔒 КОНВЕЙЕР, А НЕ ИНСТРУКЦИЯ (слово владельца 2026-09-27: «если мы уже прошли этот конвейер и у нас есть доступ к API … просто
// иди и подключай этот домен через API если это невозможно то значит создавай нормальный конвейер с пошаговым подключением»):
//   1. зону создаёт узел сам (`createZone` в аккаунте основного домена); ключу не хватает права — ступень ключа;
//   2. серверы имён: узел показывает, какие назначил Cloudflare, и ЗАМЕРЯЕТ, какие сейчас у регистратора (DoH) — меняет их
//      только человек, это единственный шаг вне узла;
//   3. совпали — узел сам просит Cloudflare перепроверить зону (`activationCheck`), итог — «активна».
// Каждая проверка по кнопке возвращает, что увидено и когда, — «ничего не изменилось» тоже ответ.

const ROOT = process.cwd()
const FILE = join(ROOT, "data", "node", "domains.json")
const PRIMARY_FILE = join(ROOT, "logs", "domain.json")
const SERVICES = join(ROOT, "data", "services")

export type ZoneState = "active" | "pending" | "not-visible" | "unknown"
export type NodeDomain = {
  name: string; state: ZoneState; status?: string; zoneId?: string; nameServers?: string[]
  registrarNs?: string[]; nsMatch?: boolean; activationAsked?: boolean; addedAt: string; checkedAt?: string
  /** Регистратор домена по RDAP (324-2): только имя — экран чужого сервиса не описывается. `null` — RDAP не ответил. */
  registrar?: string | null
  /** 828: what the zone's registry said of the name (RDAP 200 / 404 / anything else) — `unregistered` is refused, `unknown` never stops a name */
  registry?: Registry
  /** 828-2: the id of the zone the node itself created for this name — only such a zone may leave Cloudflare with the entry */
  createdZoneId?: string
  /** 775: what the person added it for — the main domain's section («main») or the elements' («element»); none — an older entry */
  for?: DomainFor
  /** 799: on a server node — where public DNS leads the name now (A), the server's own IPv4, an IPv6 record that leads elsewhere */
  pointsTo?: string[]
  serverIp?: string
  aaaa?: string[]
}
export type DomainFor = "main" | "element"
export type Registry = "registered" | "unregistered" | "unknown"
/** 828: a refusal of an unregistered name carries the name it most likely meant; `closestHere` — the node already has that one */
export type NotRegistered = { ok: false; error: "not-registered"; closest: string | null; closestHere: boolean }
export type Shape = "ok" | "bad-shape" | "with-www" | "primary" | "exists"

/**
 * 775: the element that answers on the main domain's root (`<zone>` itself, no prefix) — one rule for the activation's tunnel and for the
 * fourth rung's list (✗ 2026-11-17: the list showed «root.throughsongs.com» while the site answers on throughsongs.com). The activation
 * has always given the root to the element `root` when it has a server (`activate` route, 190); kept here once, not twice.
 */
export function zoneRootElement(serviceUrl: (id: string) => string | null): string | null {
  return serviceUrl("root") ? "root" : null
}

/** Основной домен узла (зона лестницы 259) или `null`. */
export function primaryDomain(): { name: string; status: string | null } | null {
  try {
    const d = JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { zone?: unknown; zoneStatus?: unknown }
    return typeof d.zone === "string" && d.zone ? { name: d.zone, status: typeof d.zoneStatus === "string" ? d.zoneStatus : null } : null
  } catch { return null }
}

/** Основной домен подключён лестницей до конца (`activatedAt` в `logs/domain.json`): тексты «как получить домен» больше не нужны. */
export function primaryConnected(): boolean {
  try { return typeof (JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { activatedAt?: unknown }).activatedAt === "string" } catch { return false }
}


function readList(): NodeDomain[] {
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as { domains?: unknown }
    return Array.isArray(raw.domains) ? (raw.domains as NodeDomain[]).filter((d) => typeof d?.name === "string") : []
  } catch { return [] }
}

function writeList(domains: NodeDomain[]): boolean {
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(tmp, JSON.stringify({ domains }, null, 2) + "\n", "utf8")
    renameSync(tmp, FILE)
    return true
  } catch { return false }
}

/** Дополнительные домены узла. Домен, ставший основным (324-2, «Сделать основным»), из них выпадает: он живёт в лестнице. */
export function extraDomains(): NodeDomain[] {
  const primary = primaryDomain()?.name
  return readList().filter((d) => d.name !== primary)
}

/**
 * 775 (the owner, 2026-11-17: two sections, «внутри одного аккордеона не должно быть информации о других»): which section lists a domain.
 * While the node has no main domain, a domain added in the main section (or an older entry with no `for`) is a candidate for it; once the
 * node has one, every other domain is for the elements.
 */
export function domainSection(d: NodeDomain, hasPrimary: boolean): DomainFor {
  return hasPrimary || d.for === "element" ? "element" : "main"
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/\.$/, "")
}

/** Годится ли имя как корень домена по правилам DNS (без проверки занятости). */
export function isDomainName(name: string): boolean {
  const labels = name.split(".")
  return name.length <= 253 && labels.length >= 2 && labels.every((l) => isDnsLabel(l)) && /[a-z]/.test(labels[labels.length - 1])
}

export function domainShape(name: string): Shape {
  if (!isDomainName(name)) return "bad-shape"
  if (name.split(".")[0] === "www") return "with-www"
  const primary = primaryDomain()?.name
  if (primary && (name === primary || name.endsWith(`.${primary}`))) return "primary"
  if (readList().some((d) => d.name === name)) return "exists"
  return "ok"
}

/** Элемент, к которому подключён домен (324-2 пишет `data/services/<id>/domain.json`), или `null`. */
export function domainHolder(name: string): string | null {
  let ids: string[] = []
  try { ids = readdirSync(SERVICES) } catch { return null }
  for (const id of ids) {
    try {
      const d = (JSON.parse(readFileSync(join(SERVICES, id, "domain.json"), "utf8")) as { domain?: unknown }).domain
      if (d === name) return id
    } catch { /* нет файла */ }
  }
  return null
}

const DOH = "https://cloudflare-dns.com/dns-query"

/** Серверы имён, которые домен отдаёт сейчас в интернете (их ставит регистратор). 828-3: `null` — DNS не ответил (раньше это
 *  был пустой список, и карточка не отличала «не удалось спросить» от «серверов имён нет»). */
async function registrarNs(name: string): Promise<string[] | null> {
  try {
    const r = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=NS`, { headers: { accept: "application/dns-json" }, cache: "no-store", signal: AbortSignal.timeout(8000) })
    if (!r.ok) return null
    const j = (await r.json()) as { Answer?: Array<{ type: number; data: string }> }
    return (j.Answer ?? []).filter((x) => x.type === 2).map((x) => x.data.toLowerCase().replace(/\.$/, "")).sort()
  } catch { return null }
}

// РЕГИСТРАТОР ПО RDAP (324-2) — 828: one question to the registry gives both the registrar's name and whether the name exists at all
// (`lib/domain/registry.mjs`, RFC 7480: 404 — no such domain). Measured 2026-09-28: IANA's bootstrap names the RDAP server of a zone —
// .dev → pubapi.registry.google, .com → rdap.verisign.com.

/**
 * 828 (✗ 2026-11-21: «througsongs.com» became a zone): the name an unregistered typo most likely meant — among the zones the node's key
 * sees and the node's own domains. One the node has not got yet — the page offers it in one tap; one it has — the page only names it.
 */
async function notRegistered(name: string): Promise<NotRegistered> {
  const own = [primaryDomain()?.name, ...readList().map((d) => d.name)].filter((x): x is string => !!x && x !== name)
  const key = placeKind(ROOT) === "server" ? null : envValue("CLOUDFLARE_API_TOKEN")
  const seen = key ? await listZones(key) : null
  const zones = seen?.ok ? seen.result.map((z) => z.name) : []
  const closest = closestName(name, [...own, ...zones])
  return { ok: false, error: "not-registered", closest, closestHere: !!closest && own.includes(closest) }
}

type Observed = Pick<NodeDomain, "state" | "status" | "zoneId" | "nameServers" | "registrarNs" | "nsMatch" | "activationAsked" | "registrar" | "registry" | "pointsTo" | "serverIp" | "aaaa">

/** 799: the IPv4 the server node was launched on (`data/node/server.json`, written by the launch) — the value of the A records. */
export function serverIp(): string | null {
  try {
    const ip = String((JSON.parse(readFileSync(join(ROOT, "data", "node", "server.json"), "utf8")) as { ip?: unknown }).ip ?? "")
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) ? ip : null
  } catch { return null }
}

/**
 * 799 (the owner, 2026-11-18: «на сервере должна существовать возможность использования нескольких доменов так же как и версия на
 * компьютере»): a server node has no Cloudflare key and no tunnel — its domain is ready when public DNS leads the name to this server
 * (`active`), the same readiness the element's «Домен» card asks for; nginx and the certificate follow the attachment (`name-up.mjs`).
 * An AAAA record elsewhere is a trap: Let's Encrypt tries IPv6 first (`lib/hosting/dns-check.mjs`).
 */
async function observeOnServer(name: string): Promise<Observed | { error: string }> {
  const ip = serverIp()
  if (!ip) return { error: "no-server-ip" }
  const [a, aaaa, reg] = await Promise.all([lookup(name, "A"), lookup(name, "AAAA"), registryOf(name)])
  if (a === null) return { error: "dns-unreachable" }
  const registrar = reg.registrar, registry = reg.state as Registry
  const v6 = aaaa ?? []
  const here = a.length > 0 && a.every((x: string) => x === ip) && v6.length === 0
  const status = here ? undefined : v6.length && a.includes(ip) ? "aaaa" : a.length ? "elsewhere" : "no-records"
  return { state: here ? "active" : "pending", status, pointsTo: a, serverIp: ip, aaaa: v6, registrar, registry, zoneId: undefined, nameServers: undefined, registrarNs: undefined, nsMatch: undefined, activationAsked: undefined }
}

/** Всё, что узел может узнать о домене сейчас: зона, её серверы имён, серверы у регистратора; совпали — просит активацию. */
async function observe(name: string): Promise<Observed | { error: string }> {
  if (placeKind(ROOT) === "server") return observeOnServer(name)
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { error: "no-key" }
  const [z, ns, r] = await Promise.all([zoneByName(key, name), registrarNs(name), registryOf(name)])
  if (!z.ok) return { error: `cloudflare:${z.reason}` }
  // 828-3: `registrarNs` absent — public DNS did not answer (the card says so instead of «nothing»).
  const reg = ns ?? undefined, registrar = r.registrar, registry = r.state as Registry
  // 775: a zone the key no longer sees leaves nothing of its old measure behind (✗ 2026-11-17: throughsongs.com «not-visible» kept «active»).
  if (!z.result) return { state: "not-visible", status: undefined, zoneId: undefined, nameServers: undefined, nsMatch: undefined, activationAsked: undefined, registrarNs: reg, registrar, registry }
  const assigned = (z.result.name_servers ?? []).map((n) => n.toLowerCase()).sort()
  const nsMatch = assigned.length > 0 && assigned.every((n) => (reg ?? []).includes(n))
  const active = z.result.status === "active"
  let activationAsked = false
  if (!active && nsMatch) activationAsked = (await activationCheck(key, z.result.id)).ok
  return { state: active ? "active" : "pending", status: z.result.status, zoneId: z.result.id, nameServers: assigned, registrarNs: reg, nsMatch, activationAsked, registrar, registry }
}

function save(name: string, patch: Partial<NodeDomain>): NodeDomain | null {
  const list = readList()
  const i = list.findIndex((d) => d.name === name)
  if (i < 0) return null
  list[i] = { ...list[i], ...patch, checkedAt: new Date().toISOString() }
  return writeList(list) ? list[i] : null
}

/** «Добавить домен»: форма → реестр (828) → запись (`unknown`) → сразу первый замер. */
export async function addDomain(input: string, forWhat: DomainFor = "element"): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string } | NotRegistered> {
  const name = normalizeDomain(input)
  const shape = domainShape(name)
  if (shape !== "ok") return { ok: false, error: shape }
  // 775: one main domain — a second candidate is refused while one waits or the node already has its main domain.
  if (forWhat === "main" && (primaryDomain() || readList().some((d) => domainSection(d, false) === "main"))) return { ok: false, error: "main-exists" }
  // 828: the registry first — a name it does not know is never written, and no zone is ever made for it.
  if ((await registryOf(name)).state === "unregistered") return notRegistered(name)
  if (!writeList([...readList(), { name, state: "unknown", addedAt: new Date().toISOString(), for: forWhat }])) return { ok: false, error: "write-failed" }
  return checkDomain(name)
}

/** «Проверить»: замерить заново и записать, что увидено. */
export async function checkDomain(name: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  if (!readList().some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const o = await observe(name)
  if ("error" in o) return { ok: false, error: o.error }
  const d = save(name, o)
  return d ? { ok: true, domain: d } : { ok: false, error: "write-failed" }
}

/** «Создать зону»: узел заводит зону в аккаунте основного домена сам. Уже видна — просто замер.
 *  324-2: основного домена ещё нет (первый домен узла) — аккаунт узнаётся у ключа (`/accounts`); ключ видит не ровно один
 *  аккаунт — отказ `no-account`, и карточка просит Account ID (запасное поле по слову владельца: «если нажатие вернёт
 *  ошибку, то подсунешь вторую кнопку и напишешь попробуй снова»). Названный аккаунт проверяет сам Cloudflare при создании. */
export async function createDomainZone(name: string, accountId?: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string } | NotRegistered> {
  if (!readList().some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { ok: false, error: "no-key" }
  const seen = await zoneByName(key, name)
  if (seen.ok && seen.result) return checkDomain(name)
  // 828: an entry already in the list (added before the registry was asked) gets no zone either while its registry does not know it.
  const r = await registryOf(name)
  if (r.state === "unregistered") { save(name, { registry: "unregistered", registrar: null }); return notRegistered(name) }
  const primary = primaryDomain()
  let account: string
  if (primary) {
    const main = await zoneByName(key, primary.name)
    if (!main.ok || !main.result) return { ok: false, error: "primary-not-visible" }
    const acc = await accountOfZone(key, main.result.id)
    if (!acc.ok) return { ok: false, error: `cloudflare:${acc.reason}` }
    account = acc.result
  } else if (accountId) {
    if (!/^[0-9a-f]{32}$/.test(accountId)) return { ok: false, error: "bad-account-id" }
    account = accountId
  } else {
    const accounts = await listAccounts(key)
    if (!accounts.ok || accounts.result.length !== 1) return { ok: false, error: "no-account" }
    account = accounts.result[0].id
  }
  const created = await createZone(key, account, name)
  if (!created.ok) return { ok: false, error: /zone\.create/.test(created.reason) ? "no-zone-permission" : created.reason }
  // 828-2: the node remembers the zone it made — only that zone may leave Cloudflare when the entry is removed.
  save(name, { createdZoneId: created.result.id })
  return checkDomain(name)
}

// КЛЮЧ УЗЛА — ТРЕВОГА ТОЛЬКО ПО ЗАМЕРУ (324-1, решение владельца 2026-09-27 «go» после разбора: постоянная строка ключа и
// красная карточка по ЗАПОМНЕННОМУ отказу делались под один узел — у пользователя с ключом по исправленной инструкции их не
// бывает). Замеряется каждый раз: есть ли ключ и его статус у Cloudflare (`/user/tokens/verify`: active · disabled · expired).
// Нехватка права создавать зоны — не тревога страницы: она выясняется в момент «Создать зону» и показывается там же.
export async function nodeKeyState(): Promise<
  { present: false } | { present: true; tail: string; status: string | null; workers: { scripts: boolean; routes: boolean } | null; tunnel: boolean | null; id: string | null; zones: string[] | null }
> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { present: false }
  const v = await verifyToken(key)
  // 344-1: права на Workers — копия публичных страниц в Cloudflare. Замер, а не память: зона основного домена → её аккаунт.
  let workers: { scripts: boolean; routes: boolean } | null = null
  let tunnel: boolean | null = null
  const zoneName = primaryDomain()?.name
  const zone = zoneName ? await zoneByName(key, zoneName) : null
  if (zone?.ok && zone.result) {
    const acct = await accountOfZone(key, zone.result.id)
    if (acct.ok) workers = await workersAccess(key, acct.result, zone.result.id)
    // 2026-10-01 (dhndy: «Подключить не удалось: 502», Cloudflare `1001 Not authorized`): ключ без права на туннель выглядел здесь
    // исправным — работающие адреса отвечают (туннель живёт своими учётными данными), а подключить новый нельзя. Замер — тот же
    // вызов, что делает «Подключить»: чтение настроек туннеля узла. Туннеля у узла нет — `null`, не тревога.
    const tunnelId = nodeTunnelId()
    if (acct.ok && tunnelId) tunnel = (await getIngress(key, acct.result, tunnelId)).ok
  }
  // 2026-11-17 (the owner asleep: «сам поставь домен … возможно он в другом аккаунте»): which token this is and which zones it sees —
  // neither is a secret (the token's id is in its own dashboard address), both answer «why does the key not see my domain».
  const seen = await listZones(key)
  const zones = seen.ok ? seen.result.map((z) => z.name).slice(0, 50) : null
  return { present: true, tail: key.slice(-4), status: v.ok ? v.result.status : null, workers, tunnel, id: v.ok ? v.result.id : null, zones }
}

export type ZoneFate = "deleted" | "kept-active" | "kept-records" | "kept-failed" | null

/**
 * Убрать домен из списка — только если он не подключён к элементу. 828-2: зону, которую узел сам создал (`createdZoneId`), он забирает с
 * собой, пока она пустая и не активна (`lib/domain/own-zone.mjs`); чужую, активную или с записями — не трогает и говорит почему.
 */
export async function removeDomain(name: string): Promise<{ ok: true; zone: ZoneFate } | { ok: false; error: string; holder?: string }> {
  const list = readList()
  const entry = list.find((d) => d.name === name)
  if (!entry) return { ok: false, error: "not-found" }
  const holder = domainHolder(name)
  if (holder) return { ok: false, error: "attached", holder }
  const zone = await ownZoneLeaves(entry)
  return writeList(readList().filter((d) => d.name !== name)) ? { ok: true, zone } : { ok: false, error: "write-failed" }
}

async function ownZoneLeaves(d: NodeDomain): Promise<ZoneFate> {
  const key = d.createdZoneId && placeKind(ROOT) !== "server" ? envValue("CLOUDFLARE_API_TOKEN") : null
  if (!key || !d.createdZoneId) return d.createdZoneId ? "kept-failed" : null
  const seen = await zoneByName(key, d.name)
  if (!seen.ok) return "kept-failed"
  const zone = seen.result
  const hasRecords = zone && zone.id === d.createdZoneId && zone.status !== "active" ? await zoneHasRecords(key, zone.id) : false
  const fate = zoneFate({ createdZoneId: d.createdZoneId, zone, hasRecords })
  if (fate !== "delete") return fate
  return (await deleteZone(key, d.createdZoneId)).ok ? "deleted" : "kept-failed"
}

/** Туннель узла (`logs/domain.json` → `tunnelId`), или `null` — узел без туннеля. */
function nodeTunnelId(): string | null {
  try {
    const d = JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { tunnelId?: unknown }
    return typeof d.tunnelId === "string" && d.tunnelId ? d.tunnelId : null
  } catch { return null }
}
