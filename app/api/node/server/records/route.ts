// @api list and switch the domain records to the dedicated server
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { upsertServerRecord, zoneByName } from "@/lib/domain/cloudflare"
import { checkNames } from "@/lib/hosting/dns-check.mjs"
import { dnsRecords, nodeNames } from "@/lib/hosting/hostnames.mjs"
import { mayDomain, patchMove, readMove } from "@/lib/hosting/move-state.mjs"
import { cleanDomain } from "@/lib/hosting/server-domain.mjs"

// THE DOMAIN'S RECORDS MOVE TO THE SERVER EARLY (node step 737-15, D14). The owner, 2026-11-13: the records switch right after the
// server is connected, so DNS has woken by the time of the move; until the move Cloudflare's copy shows the pages («До завершения переезда
// у нас CloudFlare поддерживает статическую видимость этих страниц»).
// 🔒 ON THIS COMPUTER, FOR THE ARCHITECT ONLY, never on a public address. GET — the names of the node's zone with the A record each needs
// (the server's IPv4), and with `?check=1` what public DNS answers for each. POST {confirm: <zone>} — for a zone on the node's
// Cloudflare account, every name of THAT zone is pointed at the server (proxied; only this node's tunnel CNAME is removed). Names of
// other zones (an element's own domain elsewhere) are listed for the person to write at their registrar.
// 737-15, A NEW DOMAIN (the owner, 2026-11-13: «установку домена где-то в начале пока ставится сервер»): a node with no domain of its
// own gets one for the server here — POST {domain} keeps it in `move.json` and starts the runner's `domain` (saved until the copy; after
// it the server learns it now and issues a certificate for every name already pointing there). The same POST again checks and issues anew.
// 🔒 The Cloudflare token is read here, in the core, and never leaves it (the same way as `app/api/domain/activate`).
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, ...noStore })

function envValue(name: string): string | null {
  const fromProcess = process.env[name]?.trim()
  if (fromProcess) return fromProcess
  const file = join(ROOT, ".env.local")
  if (!existsSync(file)) return null
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && m[1] === name && m[2].trim()) return m[2].trim()
  }
  return null
}

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "public-address" }, 403)
  return requireRoles(req, ["architect"] as const)
}

const RUNNER = join(ROOT, "scripts", "dedicated-server", "move.mjs")
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

function context() {
  const move = readMove(ROOT)
  const ip = String(move.server?.host ?? "")
  const own = nodeNames({ root: ROOT }).zone
  // The node's own domain wins; without one, the domain the person typed for the server (737-15).
  const table = own ? nodeNames({ root: ROOT }) : nodeNames({ root: ROOT, domain: typeof move.domain === "string" ? move.domain : null })
  const tunnelId = (() => { try { return JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")).tunnelId ?? null } catch { return null } })()
  return { ip: IPV4.test(ip) ? ip : null, table, own: Boolean(own), move, tunnelId: typeof tunnelId === "string" ? tunnelId : null }
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const { ip, table, own, move } = context()
  const typed = { own, mayType: !own && mayDomain(move), run: move.domainRun ?? null, names: move.names ?? null }
  if (!ip || !table.zone) return json({ ok: true, zone: table.zone, ip, records: [], dns: null, cloudflare: Boolean(envValue("CLOUDFLARE_API_TOKEN")), ...typed })
  const dns = req.nextUrl.searchParams.get("check") === "1" ? await checkNames(table, ip) : null
  return json({ ok: true, zone: table.zone, ip, records: dnsRecords(table, ip), dns, cloudflare: Boolean(envValue("CLOUDFLARE_API_TOKEN")), ...typed })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const { ip, table, tunnelId, own, move } = context()
  const body = (await req.json().catch(() => null)) as { confirm?: unknown; domain?: unknown } | null
  if (!ip) return json({ ok: false, reason: "no-server" }, 409)
  if (body && "domain" in body) {
    if (own) return json({ ok: false, reason: "node-has-domain" }, 409)
    const domain = cleanDomain(body.domain)
    if (!domain) return json({ ok: false, reason: "bad-domain" }, 400)
    if (!mayDomain(move)) return json({ ok: false, reason: "order" }, 409)
    patchMove(ROOT, (s: Record<string, unknown>) => { s.domain = domain; s.domainRun = { state: "starting", at: new Date().toISOString(), zone: domain } })
    spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), RUNNER, "domain"], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
    return json({ ok: true, domain })
  }
  if (!table.zone || body?.confirm !== table.zone) return json({ ok: false, reason: "not-confirmed" }, 409)
  const token = envValue("CLOUDFLARE_API_TOKEN")
  if (!token) return json({ ok: false, reason: "no-cloudflare-token" }, 409)
  const zone = await zoneByName(token, table.zone)
  if (!zone.ok || !zone.result) return json({ ok: false, reason: zone.ok ? "zone-not-on-cloudflare" : zone.reason }, 409)
  const results: Array<{ host: string; ok: boolean; reason?: string }> = []
  for (const row of table.rows.filter((r: { zone: string }) => r.zone === table.zone)) {
    const r = await upsertServerRecord(token, zone.result.id, row.host, ip, tunnelId)
    results.push({ host: row.host, ok: r.ok, ...(r.ok ? {} : { reason: (r as { reason?: string }).reason }) })
  }
  const elsewhere = table.rows.filter((r: { zone: string }) => r.zone !== table.zone).map((r: { host: string }) => r.host)
  return json({ ok: results.every((x) => x.ok), results, elsewhere })
}
