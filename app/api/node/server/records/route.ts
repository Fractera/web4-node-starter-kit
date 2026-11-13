// @api the domain ladder of the move: detect, choose, check and write records
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { checkNames } from "@/lib/hosting/dns-check.mjs"
import { detectDomain } from "@/lib/hosting/domain-detect.mjs"
import { dnsRecords, nodeNames } from "@/lib/hosting/hostnames.mjs"
import { mayDomain, patchMove, readMove } from "@/lib/hosting/move-state.mjs"
import { pointNamesAtServer } from "@/lib/hosting/server-records-cf"
import { cleanDomain } from "@/lib/hosting/server-domain.mjs"

// THE DOMAIN LADDER OF THE MOVE — ITS DOOR ON THIS COMPUTER (node steps 737-15, 737-19). The owner, 2026-11-13: «установку домена где-то в
// начале пока ставится сервер»; the ladder he drew: the domain · where its records live («кто его возвращает регистратор или Cloud Flyer»)
// · who writes them · the records · the check. The same ladder runs on the server through `/api/node/server/domain`.
// 🔒 ON THIS COMPUTER, FOR THE ARCHITECT ONLY, never on a public address.
//   GET — the domain (the node's own, else the one typed for the server: `move.json` → `domain`), the server's IP, the last detection, the
//         person's choice of who writes the records, the last DNS check, the names' records; `?detect=1` asks the internet anew
//         (`domain-detect.mjs`), `?check=1` asks public DNS for every name.
//   POST {domain} — keep a typed domain, start the runner's `domain` (the server learns it: its mark, nginx, DNS, certificates).
//   POST {way}    — who writes the records: `dns` (the person, where DNS is kept), `cloudflare` (the person, in Cloudflare), `migrate`
//                   (DNS goes back to the registrar first), `none` (nobody has access).
//   POST {confirm: <zone>} — the node writes the records itself with its Cloudflare key: every name and `*`, DNS ONLY (737-19b).
// 🔒 The Cloudflare token is read here, in the core, and never leaves it (the same way as `app/api/domain/activate`).
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const RUNNER = join(ROOT, "scripts", "dedicated-server", "move.mjs")
const WAYS = ["dns", "cloudflare", "migrate", "none"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, ...noStore })
type Detect = Awaited<ReturnType<typeof detectDomain>>
type Check = { at: string; zone: string; results: Array<{ host: string; state: string }> }

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

function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "public-address" }, 403)
  return requireRoles(req, ["architect"] as const)
}

function context() {
  const move = readMove(ROOT)
  const ip = String(move.server?.host ?? "")
  const own = nodeNames({ root: ROOT }).zone
  // The node's own domain wins; without one, the domain the person typed for the server (737-15).
  const table = own ? nodeNames({ root: ROOT }) : nodeNames({ root: ROOT, domain: typeof move.domain === "string" ? move.domain : null })
  const tunnelId = (() => { try { return JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")).tunnelId ?? null } catch { return null } })()
  const detect = (move.detect as Detect | undefined)?.name === table.zone ? (move.detect as Detect) : null
  const check = (move.dnsCheck as Check | undefined)?.zone === table.zone ? (move.dnsCheck as Check) : null
  return { ip: IPV4.test(ip) ? ip : null, table, own: Boolean(own), move, detect, check, tunnelId: typeof tunnelId === "string" ? tunnelId : null }
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const c = context()
  let { detect, check } = c
  const { ip, table, own, move } = c
  if (ip && table.zone && req.nextUrl.searchParams.get("detect") === "1") {
    const d = await detectDomain(table.zone, { ip })
    detect = d
    patchMove(ROOT, (s: Record<string, unknown>) => { s.detect = d })
  }
  if (ip && table.zone && req.nextUrl.searchParams.get("check") === "1") {
    const k: Check = { at: new Date().toISOString(), zone: table.zone, results: (await checkNames(table, ip)).map((r) => ({ host: r.host, state: r.state })) }
    check = k
    patchMove(ROOT, (s: Record<string, unknown>) => { s.dnsCheck = k })
  }
  return json({
    ok: true,
    zone: table.zone,
    ip,
    own,
    mayType: !own && mayDomain(move),
    run: move.domainRun ?? null,
    names: move.names ?? null,
    detect,
    way: typeof move.domainWay === "string" ? move.domainWay : null,
    check,
    records: ip && table.zone ? dnsRecords(table, ip, detect?.zone ?? null) : [],
    key: Boolean(envValue("CLOUDFLARE_API_TOKEN")),
  })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const { ip, table, tunnelId, own, move, detect } = context()
  const body = (await req.json().catch(() => null)) as { confirm?: unknown; domain?: unknown; way?: unknown } | null
  if (!ip) return json({ ok: false, reason: "no-server" }, 409)

  if (body && "domain" in body) {
    if (own) return json({ ok: false, reason: "node-has-domain" }, 409)
    const domain = cleanDomain(body.domain)
    if (!domain) return json({ ok: false, reason: "bad-domain" }, 400)
    if (!mayDomain(move)) return json({ ok: false, reason: "order" }, 409)
    // A new domain starts its ladder anew: what was learned and chosen about the old one does not carry over.
    patchMove(ROOT, (s: Record<string, unknown>) => {
      if (s.domain !== domain) for (const k of ["detect", "dnsCheck", "domainWay"]) delete s[k]
      s.domain = domain
      s.domainRun = { state: "starting", at: new Date().toISOString(), zone: domain }
    })
    spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), RUNNER, "domain"], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
    return json({ ok: true, domain })
  }

  if (body && "way" in body) {
    const way = WAYS.find((w) => w === body.way)
    if (!way || !table.zone) return json({ ok: false, reason: "bad-way" }, 400)
    patchMove(ROOT, (s: Record<string, unknown>) => { s.domainWay = way })
    return json({ ok: true, way })
  }

  if (!table.zone || body?.confirm !== table.zone) return json({ ok: false, reason: "not-confirmed" }, 409)
  const token = envValue("CLOUDFLARE_API_TOKEN")
  if (!token) return json({ ok: false, reason: "no-cloudflare-token" }, 409)
  // A subdomain base writes inside the zone it belongs to (its SOA, measured by the detection).
  const hosts = table.rows.filter((r: { zone: string }) => r.zone === table.zone).map((r: { host: string }) => r.host)
  const r = await pointNamesAtServer({ token, dnsZone: detect?.zone ?? table.zone, base: table.zone, hosts, ip, tunnelId })
  if (!r.results) return json({ ok: false, reason: r.reason }, 409)
  const elsewhere = table.rows.filter((r: { zone: string }) => r.zone !== table.zone).map((r: { host: string }) => r.host)
  return json({ ok: r.ok, results: r.results, elsewhere })
}
