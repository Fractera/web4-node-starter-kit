// @api list and switch the domain records to the dedicated server
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { upsertServerRecord, zoneByName } from "@/lib/domain/cloudflare"
import { checkNames } from "@/lib/hosting/dns-check.mjs"
import { dnsRecords, nodeNames } from "@/lib/hosting/hostnames.mjs"
import { readMove } from "@/lib/hosting/move-state.mjs"

// THE DOMAIN'S RECORDS MOVE TO THE SERVER EARLY (node step 737-15, D14). The owner, 2026-11-13: the records switch right after the
// server is connected, so DNS has woken by the time of the move; until the move Cloudflare's copy shows the pages («До завершения переезда
// у нас CloudFlare поддерживает статическую видимость этих страниц»).
// 🔒 ON THIS COMPUTER, FOR THE ARCHITECT ONLY, never on a public address. GET — the names of the node's zone with the A record each needs
// (the server's IPv4), and with `?check=1` what public DNS answers for each. POST {confirm: <zone>} — for a zone on the node's
// Cloudflare account, every name of THAT zone is pointed at the server (proxied; only this node's tunnel CNAME is removed). Names of
// other zones (an element's own domain elsewhere) are listed for the person to write at their registrar.
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

function context() {
  const ip = String(readMove(ROOT).server?.host ?? "")
  const table = nodeNames({ root: ROOT })
  const tunnelId = (() => { try { return JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")).tunnelId ?? null } catch { return null } })()
  return { ip: IPV4.test(ip) ? ip : null, table, tunnelId: typeof tunnelId === "string" ? tunnelId : null }
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const { ip, table } = context()
  if (!ip || !table.zone) return json({ ok: true, zone: table.zone, ip, records: [], dns: null, cloudflare: Boolean(envValue("CLOUDFLARE_API_TOKEN")) })
  const dns = req.nextUrl.searchParams.get("check") === "1" ? await checkNames(table, ip) : null
  return json({ ok: true, zone: table.zone, ip, records: dnsRecords(table, ip), dns, cloudflare: Boolean(envValue("CLOUDFLARE_API_TOKEN")) })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const { ip, table, tunnelId } = context()
  const body = (await req.json().catch(() => null)) as { confirm?: unknown } | null
  if (!ip) return json({ ok: false, reason: "no-server" }, 409)
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
