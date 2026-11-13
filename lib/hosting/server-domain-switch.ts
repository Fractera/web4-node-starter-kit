import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import deployLock from "@/lib/deploy/deploy-lock.cjs"
import { applyDomainToAuth, type AuthEnvResult } from "@/lib/domain/auth-env"
import { staleElements } from "@/lib/domain/stale-addresses.cjs"
import { nodeNames } from "@/lib/hosting/hostnames.mjs"
import { HELPER, serverMark, writeServerMark } from "@/lib/hosting/server-domain.mjs"

// STEP 5 OF THE DOMAIN ON THE SERVER — SWITCHED ON, AND BACK (node step 737-8). The same five acts as the tunnel's activation
// (`app/api/domain/activate/route.ts`), with nginx in place of the tunnel: `logs/domain.json` (every reader of the node's domain — sign-in,
// the addresses of elements, the place — reads it; `via: "server"` tells the tunnel's resident to sleep), `APP-CONFIG` url (canonical
// addresses, the sitemap, the right to be indexed), sign-in moved to `auth.<zone>`, the elements that remember the computer's addresses
// rebuilt beside the running ones, and nginx regenerated: the bare IP now answers 301 to the architect name.
// 🔒 NO SWITCH WITHOUT STEP 4: the door refuses until every required name answered by HTTPS — a switch to names that do not answer
// would send the person's own panel to a dead address.
// 🔒 NGINX DECIDES LAST AND CAN REFUSE: when the helper refuses the new site, the old one stays and the mark goes back.
// 🔒 BACK TO THE IP KEEPS WHAT WAS: the url the node had before the switch is kept in the server's mark and restored.

const ROOT = process.cwd()
const DOMAIN_FILE = join(ROOT, "logs", "domain.json")
const APP_CONFIG = join(ROOT, "APP-CONFIG", "app-config.json")

function readJson<T>(file: string): T | null {
  try { return JSON.parse(readFileSync(file, "utf8")) as T } catch { return null }
}

function writeUrl(url: string | null): boolean {
  try {
    const cfg = readJson<Record<string, unknown>>(APP_CONFIG) ?? {}
    if (url) cfg.url = url
    else delete cfg.url
    mkdirSync(join(ROOT, "APP-CONFIG"), { recursive: true })
    writeFileSync(APP_CONFIG, `${JSON.stringify(cfg, null, 2)}\n`, "utf8")
    return true
  } catch {
    return false
  }
}

/** nginx from the names and the certificates present, then applied by the root helper (it keeps the old site on a refusal). */
export function applyNginx(): { ok: boolean; detail: string } {
  const w = spawnSync(process.execPath, [join(ROOT, "scripts", "server.mjs"), "nginx", "--write"], { cwd: ROOT, encoding: "utf8", timeout: 60_000 })
  if (w.status !== 0) return { ok: false, detail: `${w.stdout}${w.stderr}`.slice(-300) }
  if (!existsSync(HELPER)) return { ok: false, detail: "no-helper" }
  const a = spawnSync("sudo", ["-n", HELPER, "nginx-apply"], { encoding: "utf8", timeout: 60_000 })
  return { ok: a.status === 0, detail: `${a.stdout ?? ""}${a.stderr ?? ""}`.slice(-300) }
}

function rebuildStale(): { rebuilding: string[]; postponed: boolean } {
  const stale = staleElements(ROOT).map((x: { id: string }) => x.id)
  if (!stale.length) return { rebuilding: [], postponed: false }
  if (deployLock.isRunning()) return { rebuilding: [], postponed: true }
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "deploy-elements.mjs"), ...stale], { cwd: ROOT, windowsHide: true, stdio: "ignore", timeout: 10_000 })
  return { rebuilding: stale, postponed: false }
}

export type SwitchResult = { ok: boolean; reason?: string; nginx?: string; auth?: AuthEnvResult; rebuilding?: string[]; rebuildPostponed?: boolean; urlWritten?: boolean }

export function activateServerDomain(): SwitchResult {
  const table = nodeNames({ root: ROOT })
  if (!table.zone) return { ok: false, reason: "no-domain" }
  const site = table.rows.find((r) => r.kind === "apex")
  const architect = table.rows.find((r) => r.kind === "architect")?.host ?? null
  const auth = table.rows.find((r) => r.kind === "auth")?.host ?? null
  const before = serverMark(ROOT)
  writeServerMark(ROOT, { domainActive: true, urlBefore: before.domainActive ? before.urlBefore : readJson<{ url?: string }>(APP_CONFIG)?.url ?? null })
  const n = applyNginx()
  if (!n.ok) {
    writeServerMark(ROOT, { domainActive: false })
    return { ok: false, reason: "nginx-refused", nginx: n.detail }
  }
  const urlWritten = writeUrl(`https://${architect ?? table.zone}`)
  mkdirSync(join(ROOT, "logs"), { recursive: true })
  writeFileSync(DOMAIN_FILE, `${JSON.stringify({
    zone: table.zone, hostname: table.zone, service: site?.service ?? "core", architectHostname: architect, authHostname: auth,
    authRouted: Boolean(auth), siteUrlWritten: urlWritten, via: "server", activatedAt: new Date().toISOString(),
  }, null, 2)}\n`, "utf8")
  const authResult = auth ? applyDomainToAuth() : { files: 0, restarted: false, reason: "no-auth-service" }
  const r = rebuildStale()
  return { ok: true, auth: authResult, rebuilding: r.rebuilding, rebuildPostponed: r.postponed, urlWritten }
}

export function deactivateServerDomain(): SwitchResult {
  const mark = serverMark(ROOT)
  if (!mark.domainActive) return { ok: false, reason: "not-active" }
  writeServerMark(ROOT, { domainActive: false })
  const n = applyNginx()
  if (!n.ok) {
    writeServerMark(ROOT, { domainActive: true })
    return { ok: false, reason: "nginx-refused", nginx: n.detail }
  }
  if (readJson<{ via?: string }>(DOMAIN_FILE)?.via === "server") rmSync(DOMAIN_FILE, { force: true })
  const urlWritten = writeUrl(typeof mark.urlBefore === "string" && mark.urlBefore ? mark.urlBefore : null)
  writeServerMark(ROOT, { urlBefore: undefined })
  // Sign-in keeps the domain's settings until the next install: over the bare IP nobody signs in anyway (plain HTTP is read-only).
  const r = rebuildStale()
  return { ok: true, rebuilding: r.rebuilding, rebuildPostponed: r.postponed, urlWritten }
}
