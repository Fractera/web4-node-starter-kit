// @api read and run the domain ladder of the node on its server
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { nodeNames } from "@/lib/hosting/hostnames.mjs"
import phase from "@/lib/hosting/phase.cjs"
import { detectDomain } from "@/lib/hosting/domain-detect.mjs"
import { cleanDomain, domainState, HELPER, readSide, runDnsCheck, runHttpsCheck, serverMark, writeServerMark, writeSide } from "@/lib/hosting/server-domain.mjs"
import { pointNamesAtServer } from "@/lib/hosting/server-records-cf"
import { activateServerDomain, applyNginx, deactivateServerDomain } from "@/lib/hosting/server-domain-switch"

// THE DOMAIN OF A NODE ON ITS SERVER — THE DOOR OF ITS FIVE STEPS (node step 737-8). The owner, 2026-11-13: «Внизу появится требования
// прописать записи ко всем существующим доменам на регистраторе. После этого ты вызываешь кнопку проверки наличия сертификатов, если нет
// — дополняешь, и после этого весь проект должен работать».
// 🔒 READING IS OPEN ON THE BARE IP, ACTING IS NOT: the server's IP is a read-only address (`components/shell/temporary-host.ts`), and the
// person opening it wants to see which records to write — host names and the IP, which DNS will publish anyway; never a port. Every act
// is the architect's, and never on a public address (on the server: through `npm run server -- window`, or the main agent's CLI on
// loopback — `npm run server -- domain …`).
// 🔒 ONLY ON A LIVE SERVER: a rehearsing copy or the person's computer has no domain of the server to run.
// 🔒 THE LONG ACT IS DETACHED: certificates take minutes (`scripts/dedicated-server/certs.mjs` through `spawn-free`); the screen follows
// `data/node/server-side/certs.json`.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
const PEM_CERT = /^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----\s*$/
const PEM_KEY = /^-----BEGIN (RSA |EC )?PRIVATE KEY-----[\s\S]+-----END (RSA |EC )?PRIVATE KEY-----\s*$/
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, ...noStore })

// 737-19: the ladder's own state on the server — the last detection (`server-side/detect.json`), who writes the records (the mark's
// `domainWay`), and whether the node holds a Cloudflare key (never the key).
const WAYS = ["dns", "cloudflare", "migrate", "none"] as const
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
function ladder(readOnly: boolean) {
  const zone = domainState(ROOT, { certs: null }).zone
  const d = readSide(ROOT, "detect")
  const way = serverMark(ROOT).domainWay
  return { detect: d && d.name === zone ? d : null, way: typeof way === "string" ? way : null, ...(readOnly ? {} : { key: Boolean(envValue("CLOUDFLARE_API_TOKEN")) }) }
}

function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

export async function GET(req: NextRequest) {
  const readOnly = isTemporaryPublicAddress(req)
  if (!readOnly) {
    const denied = await requireRoles(req, ["architect"] as const)
    if (denied) return denied
  }
  const p = phase.nodePhase(ROOT)
  if (p !== "live") return json({ ok: true, phase: p, readOnly })
  return json({ ok: true, phase: p, readOnly, ...domainState(ROOT), ...ladder(readOnly) })
}

type Body = { action?: unknown; name?: unknown; host?: unknown; fullchain?: unknown; privkey?: unknown; way?: unknown }

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "public-address" }, 403)
  const denied = await requireRoles(req, ["architect"] as const)
  if (denied) return denied
  if (phase.nodePhase(ROOT) !== "live") return json({ ok: false, reason: "not-on-server" }, 409)
  const body = (await req.json().catch(() => null)) as Body | null
  const action = typeof body?.action === "string" ? body.action : ""
  const active = serverMark(ROOT).domainActive === true

  if (action === "domain") {
    if (active) return json({ ok: false, reason: "active" }, 409)
    const name = cleanDomain(body?.name)
    if (!name) return json({ ok: false, reason: "bad-domain" }, 400)
    // A new domain starts its ladder anew: who writes the records is asked again.
    writeServerMark(ROOT, { domain: name, ...(serverMark(ROOT).domain !== name ? { domainWay: undefined } : {}) })
    return json({ ok: true, ...domainState(ROOT), ...ladder(false) })
  }
  if (!domainState(ROOT, { certs: null }).zone) return json({ ok: false, reason: "no-domain" }, 409)

  if (action === "detect") {
    const zone = domainState(ROOT, { certs: null }).zone as string
    const ip = typeof serverMark(ROOT).ip === "string" ? serverMark(ROOT).ip : null
    writeSide(ROOT, "detect", await detectDomain(zone, { ip }))
    return json({ ok: true, ...domainState(ROOT), ...ladder(false) })
  }
  if (action === "way") {
    const way = WAYS.find((w) => w === body?.way)
    if (!way) return json({ ok: false, reason: "bad-way" }, 400)
    writeServerMark(ROOT, { domainWay: way })
    return json({ ok: true, ...domainState(ROOT), ...ladder(false) })
  }
  if (action === "cloudflare-write") {
    const token = envValue("CLOUDFLARE_API_TOKEN")
    if (!token) return json({ ok: false, reason: "no-cloudflare-token" }, 409)
    const state = domainState(ROOT, { certs: null })
    const ip = typeof serverMark(ROOT).ip === "string" ? (serverMark(ROOT).ip as string) : ""
    const d = readSide(ROOT, "detect")
    const hosts = state.rows.filter((r: { zone: string }) => r.zone === state.zone).map((r: { host: string }) => r.host)
    const r = await pointNamesAtServer({ token, dnsZone: d && d.name === state.zone ? d.zone : state.zone, base: state.zone as string, hosts, ip, tunnelId: null })
    return json({ ...r, ...domainState(ROOT), ...ladder(false) }, r.ok ? 200 : 409)
  }
  if (action === "dns-check") {
    await runDnsCheck(ROOT)
    return json({ ok: true, ...domainState(ROOT) })
  }
  if (action === "certs") {
    spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "dedicated-server", "certs.mjs")], { cwd: ROOT, env: cleanEnv(), stdio: "ignore", timeout: 10_000, windowsHide: true })
    return json({ ok: true, started: "certs" }, 202)
  }
  if (action === "upload") {
    // The person's own certificate for one name: the pair waits in the node's folder for a second, the helper checks the key matches
    // and moves both where only root reads them, then nginx serves it.
    const host = typeof body?.host === "string" ? body.host.trim().toLowerCase() : ""
    const fullchain = typeof body?.fullchain === "string" ? body.fullchain : ""
    const privkey = typeof body?.privkey === "string" ? body.privkey : ""
    if (!nodeNames({ root: ROOT }).rows.some((r) => r.host === host)) return json({ ok: false, reason: "unknown-host" }, 400)
    if (fullchain.length > 65536 || privkey.length > 65536 || !PEM_CERT.test(fullchain) || !PEM_KEY.test(privkey)) return json({ ok: false, reason: "bad-pem" }, 400)
    const dir = join(ROOT, "data", "node", "server-side", "upload", host)
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    writeFileSync(join(dir, "fullchain.pem"), fullchain, { mode: 0o600 })
    writeFileSync(join(dir, "privkey.pem"), privkey, { mode: 0o600 })
    const r = spawnSync("sudo", ["-n", HELPER, "cert-upload", host], { encoding: "utf8", timeout: 30_000 })
    rmSync(dir, { recursive: true, force: true })
    if (r.status !== 0) return json({ ok: false, reason: "upload-refused", detail: `${r.stderr ?? ""}`.slice(-200) }, 422)
    const n = applyNginx()
    return json({ ok: n.ok, ...(n.ok ? {} : { reason: "nginx-refused", detail: n.detail }), ...domainState(ROOT) }, n.ok ? 200 : 422)
  }
  if (action === "check") {
    await runHttpsCheck(ROOT)
    return json({ ok: true, ...domainState(ROOT) })
  }
  if (action === "activate") {
    if (active) return json({ ok: false, reason: "active" }, 409)
    if (!domainState(ROOT).steps.check) return json({ ok: false, reason: "check-first" }, 409)
    const r = activateServerDomain()
    if (r.ok) revalidatePath("/[lang]", "layout")
    return json({ ...r, ...domainState(ROOT) }, r.ok ? 200 : 422)
  }
  if (action === "deactivate") {
    const r = deactivateServerDomain()
    if (r.ok) revalidatePath("/[lang]", "layout")
    return json({ ...r, ...domainState(ROOT) }, r.ok ? 200 : 422)
  }
  return json({ ok: false, reason: "unknown-action", allowed: ["domain", "detect", "way", "cloudflare-write", "dns-check", "certs", "upload", "check", "activate", "deactivate"] }, 400)
}
