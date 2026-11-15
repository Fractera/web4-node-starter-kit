import "server-only"
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { accountOfZone, deleteDnsRecords, deleteTunnelRecord, getIngress, listZones, setIngress, upsertServerRecord, upsertTunnelRecord, zoneByName } from "@/lib/domain/cloudflare"
import { roadOf } from "@/lib/domain/reach-road.mjs"
import { placeKind, publicIpOnInterfaces } from "@/lib/hosting/place.mjs"
import { envValue } from "@/lib/web4-items/element-delete"
import { serviceUrl } from "@/lib/microservices/registry"
import { domainRecord } from "@/lib/web4-items/element-domain"
import { startStaticCopy } from "@/lib/web4-items/static-copy-start.cjs"

// ПОДДОМЕН ПЕРЕЕЗЖАЕТ ВМЕСТЕ С АДРЕСОМ ЭЛЕМЕНТА (решение владельца 2026-10-01: «Да, переноси поддомен при переименовании и убери
// старый dhndy»). 🪦 Отменяет «поддомен не трогается» шага 325-3: с 325-8 поддомен элемента = его адрес, и после переименования
// Preview и «Адрес в интернете» искали новое имя без записи DNS — Preview падал на 127.0.0.1, браузер на https его не грузит.
//
// 🔒 ПЕРЕНОСИТСЯ ТОЛЬКО ПОДКЛЮЧЁННОЕ: у старого имени нет правила туннеля — ничего не создаётся (подключение — кнопка человека).
// 🔒 СНИМАЕТСЯ ТОЛЬКО СВОЁ: правила туннеля старых имён элемента в зоне узла и записи CNAME, ведущие на туннель этого узла;
// свой домен элемента (`domain.json`) и чужие записи не трогаются.

type Step = { step: string; ok: boolean; detail?: string }

export async function moveSubdomain(id: string, from: string, to: string): Promise<{ moved: boolean; steps: Step[] }> {
  const steps: Step[] = []
  let domain: { zone?: string; tunnelId?: string; via?: string } | null = null
  try { domain = JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) } catch { /* узел без домена */ }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  const local = serviceUrl(id)
  if (from !== to && local && domain?.zone && roadOf(domain, placeKind(process.cwd())) === "server") return moveOnServer(id, from, to, domain.zone, key)
  if (!domain?.zone || !domain.tunnelId || !key || !local || from === to) return { moved: false, steps: [{ step: "subdomain", ok: true, detail: "nothing-to-move" }] }
  const zoneName = domain.zone
  const newHost = `${to}.${zoneName}`
  // Старые имена: прежний адрес и id (имя до первого переименования); новое имя в них не входит.
  const oldHosts = new Set([`${from}.${zoneName}`, `${id}.${zoneName}`].filter((h) => h !== newHost))
  const own = domainRecord(id)?.domain ?? null
  if (own) oldHosts.delete(own)

  const zones = await listZones(key)
  const zone = zones.ok ? zones.result.find((z) => z.name === zoneName) : null
  const account = zone ? await accountOfZone(key, zone.id) : null
  if (!zone || !account?.ok) return { moved: false, steps: [{ step: "subdomain", ok: false, detail: "cloudflare-unreachable" }] }
  const rules = await getIngress(key, account.result, domain.tunnelId)
  if (!rules.ok) return { moved: false, steps: [{ step: "tunnel", ok: false, detail: rules.reason }] }
  const connected = rules.result.some((r) => !!r.hostname && (oldHosts.has(r.hostname) || r.hostname === newHost))
  if (!connected) return { moved: false, steps: [{ step: "subdomain", ok: true, detail: "not-connected" }] }

  const kept = rules.result.filter((r) => !(r.hostname && (oldHosts.has(r.hostname) || r.hostname === newHost)))
  const put = await setIngress(key, account.result, domain.tunnelId, [...kept, { hostname: newHost, service: local }])
  steps.push({ step: "tunnel", ok: put.ok, detail: put.ok ? `${newHost} (removed ${[...oldHosts].join(",")})` : put.reason })
  if (!put.ok) return { moved: false, steps }
  const rec = await upsertTunnelRecord(key, zone.id, newHost, domain.tunnelId)
  steps.push({ step: "dns-new", ok: rec.ok, detail: rec.ok ? newHost : rec.reason })
  for (const h of oldHosts) {
    const del = await deleteTunnelRecord(key, zone.id, h, domain.tunnelId)
    steps.push({ step: "dns-old", ok: del.ok, detail: del.ok ? `${h}:${del.result}` : del.reason })
  }
  if (rec.ok) startStaticCopy(process.cwd(), id) // 385-3: адрес переехал — копия встаёт на новый, маршрут прежнего снимается
  return { moved: rec.ok, steps }
}

// 750-3: НА ВЫДЕЛЕННОМ СЕРВЕРЕ имя элемента держит nginx узла (`via: "server"`), туннеля нет. ✗ До 750 переименование здесь отвечало
// `nothing-to-move`: новое имя оставалось без записи, без имени в nginx и без сертификата. Теперь: запись A нового имени на IP сервера
// и снятие старых — ключом Cloudflare узла, если зона там; иначе новая запись названа в шаге (у регистратора узел не пишет); затем
// `name-up.mjs` отсоединённо — nginx учит новое имя (старое уходит с перезаписью: имена берутся из реестра и адресов), сертификат догоняет.
async function moveOnServer(id: string, from: string, to: string, zoneName: string, key: string | null): Promise<{ moved: boolean; steps: Step[] }> {
  const steps: Step[] = []
  const newHost = `${to}.${zoneName}`
  const oldHosts = [...new Set([`${from}.${zoneName}`, `${id}.${zoneName}`])].filter((h) => h !== newHost && h !== domainRecord(id)?.domain)
  const ip = publicIpOnInterfaces()
  const zone = key ? await zoneByName(key, zoneName) : null
  if (key && ip && zone?.ok && zone.result) {
    const rec = await upsertServerRecord(key, zone.result.id, newHost, ip, null)
    steps.push({ step: "dns-new", ok: rec.ok, detail: rec.ok ? newHost : (rec as { reason?: string }).reason })
    for (const h of oldHosts) {
      const del = await deleteDnsRecords(key, zone.result.id, h)
      steps.push({ step: "dns-old", ok: del.ok, detail: del.ok ? `${h}:${del.result}` : (del as { reason?: string }).reason })
    }
  } else {
    steps.push({ step: "dns-new", ok: true, detail: `record-to-add:A ${newHost} ${ip ?? "<server IP>"}` })
  }
  const r = spawnSync(process.execPath, [join(process.cwd(), "scripts", "spawn-free.mjs"), join(process.cwd(), "scripts", "dedicated-server", "name-up.mjs")], { cwd: process.cwd(), stdio: "ignore", timeout: 10_000, windowsHide: true })
  steps.push({ step: "nginx", ok: r.status === 0, detail: "name-up-started" })
  return { moved: r.status === 0, steps }
}
