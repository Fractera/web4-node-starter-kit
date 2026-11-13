// @api read and run the five steps of the server's own domain
import { spawnSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { nodeNames } from "@/lib/hosting/hostnames.mjs"
import phase from "@/lib/hosting/phase.cjs"
import { cleanDomain, domainState, HELPER, runDnsCheck, runHttpsCheck, serverMark, writeServerMark } from "@/lib/hosting/server-domain.mjs"
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
  return json({ ok: true, phase: p, readOnly, ...domainState(ROOT) })
}

type Body = { action?: unknown; name?: unknown; host?: unknown; fullchain?: unknown; privkey?: unknown }

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
    writeServerMark(ROOT, { domain: name })
    return json({ ok: true, ...domainState(ROOT) })
  }
  if (!domainState(ROOT, { certs: null }).zone) return json({ ok: false, reason: "no-domain" }, 409)

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
  return json({ ok: false, reason: "unknown-action", allowed: ["domain", "dns-check", "certs", "upload", "check", "activate", "deactivate"] }, 400)
}
