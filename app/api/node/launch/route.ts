// @api launch a node on a dedicated server and read its state
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import phase from "@/lib/hosting/phase.cjs"
import { pointNamesAtServer } from "@/lib/hosting/server-records-cf"

// «АКТИВАЦИЯ ВЫДЕЛЕННОГО СЕРВЕРА» — THE DOOR (node step 738-4). The owner, 2026-11-14: «Никакого переезда нет есть просто запуск сервера …
// в данном локальном компьютере меняться ничего не должно … в любой момент перезагрузить эту страницу и пока идёт какой-то из процессов
// начать работать со вторым … с 10-м и с 100-м сервером поочерёдно возвращаясь на эту страницу когда заново вводит credentials».
// 🔒 STATELESS: every call names its server (`host`, `port`); the answer is that server's own state, read there over SSH by this browser's
// visit key (`scripts/dedicated-server/launch.mjs`). Nothing per server is written here — only the map of pins and the certificate ledger.
// 🔒 744-3 — ACCESS FOR ONE DAY, KEPT BY THE BROWSER (the owner, 2026-11-14: «Хрони ключ вокально хранилище браузера с продолжительностью
// и более 24:00 это нормально?» · «no more then 24»): the root password opens a visit; its key comes back from the runner and goes into
// an HttpOnly cookie of this door's path only, ending when the server ends it — no script reads it (✗ measured: the panel's origin loads
// Google Tag Manager when analytics is on), the node's disk never holds it, the JSON answer never carries it. Without it — the password.
// 🔒 THE ARCHITECT ONLY, NEVER ON A PUBLIC ADDRESS, NEVER ON A SERVER NODE ITSELF: a stranger with the link must not reach a server, and
// a server node launches nothing.
// 🔒 SECRETS GO TO THE RUNNER BY STDIN and nowhere else — not argv (the process list shows it), not the environment, not a file.
//   POST { action: "connect", host, port, password?, trust? }   the password → a visit of a day; empty — this browser's visit → the state
//   POST { action: "close", host, port }                        the visit closed now (its line leaves the server, the cookie goes)
//   POST { action: "state" | "probe", host, port }              the server's state; the server checked again
//   POST { action: "install", host, port, mode }                the launch started on the server (install · update)
//   POST { action: "domain" | "way" | "detect" | "dns", host, port, name?, way? }   the domain step, kept on the server
//   POST { action: "dns-check" | "certs" | "check" | "activate" | "claim", host, port }   the server node's own domain door; `claim`
//                                                              returns the architect's one-time code once (739-5), kept nowhere here
//   POST { action: "upload", host, port, name, fullchain, privkey }                  the person's own certificate for one name (stdin)
//   POST { action: "signin", host, port }                      where sign-in leads, asked from the internet
//   POST { action: "cloudflare-write", host, port }            the records written with this node's Cloudflare key, DNS only (737-19b)
//   POST { action: "clear", host, port, confirm }              a busy server freed — the dialog sends back the address it named
// Every answer says whether this node holds a Cloudflare key (`key`), never the key: the records step offers to write them itself.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const RUNNER = join(ROOT, "scripts", "dedicated-server", "launch.mjs")
const noStore = { headers: { "Cache-Control": "no-store" } }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, ...noStore })
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const HOST = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
const FINGERPRINT = /^SHA256:[A-Za-z0-9+/]{43}$/
const DOOR_ACTIONS = ["dns-check", "certs", "check", "activate", "claim"]
// How long each act may take: the check of a server measures its version over the network; a certificate run starts detached there.
const TIMEOUT: Record<string, number> = { connect: 150_000, probe: 150_000, state: 60_000, install: 120_000, domain: 120_000, way: 60_000, detect: 90_000, dns: 90_000, door: 200_000, signin: 90_000, clear: 240_000 }

/** A value of the core's environment (the Cloudflare token stays in this process; only its presence leaves). */
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

/** The core's `NEXT_*` and `PORT` must not reach a child (ANTI-PATTERNS «All systems»). */
function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("NEXT_") && k !== "PORT" && k !== "__NEXT_PROCESSED_ENV")) as NodeJS.ProcessEnv
}

// ── 744-3: the visit cookie ── `<deadline, epoch seconds>.<the key, base64url>`; its name per server, its path this door only.
type Visit = { key: string; deadline: string }
const VISIT_MAX_S = 86_400
const visitCookie = (host: string, port: number) => `fractera-visit-${host.replace(/[^a-z0-9.-]/g, "")}-${port}`
const overHttps = (req: NextRequest) => (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")) === "https"

/** This browser's live visit to the server, or `null` (none, or past its deadline). */
function readVisit(req: NextRequest, host: string, port: number): Visit | null {
  const raw = req.cookies.get(visitCookie(host, port))?.value ?? ""
  const dot = raw.indexOf(".")
  const until = Number(raw.slice(0, dot))
  if (dot < 1 || !(until > Date.now() / 1000)) return null
  const key = Buffer.from(raw.slice(dot + 1), "base64url").toString("utf8")
  return key.includes("OPENSSH PRIVATE KEY") ? { key, deadline: new Date(until * 1000).toISOString() } : null
}

function keepVisit(res: NextResponse, req: NextRequest, host: string, port: number, visit: Visit): void {
  const until = Math.floor(Date.parse(visit.deadline) / 1000)
  const maxAge = Math.min(VISIT_MAX_S, until - Math.floor(Date.now() / 1000))
  if (!(maxAge > 0)) return
  res.cookies.set(visitCookie(host, port), `${until}.${Buffer.from(visit.key, "utf8").toString("base64url")}`, { httpOnly: true, sameSite: "strict", path: "/api/node/launch", maxAge, secure: overHttps(req) })
}

function dropVisit(res: NextResponse, host: string, port: number): void {
  res.cookies.set(visitCookie(host, port), "", { httpOnly: true, sameSite: "strict", path: "/api/node/launch", maxAge: 0 })
}

function run(verb: string, argv: string[], input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [RUNNER, verb, ...argv], { cwd: ROOT, env: cleanEnv(), stdio: ["pipe", "pipe", "ignore"], windowsHide: true })
    let out = ""
    child.stdout.on("data", (d) => { if (out.length < 2_000_000) out += d })
    const timer = setTimeout(() => child.kill(), TIMEOUT[verb] ?? 60_000)
    child.on("close", () => {
      clearTimeout(timer)
      const line = out.split("\n").reverse().find((l) => l.startsWith("===LAUNCH=== "))
      try { resolve(line ? JSON.parse(line.slice(13)) : { ok: false, reason: "timeout" }) } catch { resolve({ ok: false, reason: "unreadable" }) }
    })
    child.on("error", () => { clearTimeout(timer); resolve({ ok: false, reason: "runner" }) })
    child.stdin.end(JSON.stringify(input))
  })
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "public-address" }, 403)
  // 744-2: JSON only — a cross-origin JSON POST needs a preflight the node never grants; the proxy's cross-site wall stands before this.
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return json({ ok: false, reason: "json-only" }, 415)
  const denied = await requireRoles(req, ["architect"] as const)
  if (denied) return denied
  if (phase.nodePhase(ROOT)) return json({ ok: false, reason: "on-server" }, 409)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const action = typeof body?.action === "string" ? body.action : ""
  const host = typeof body?.host === "string" ? body.host.trim().toLowerCase() : ""
  const port = typeof body?.port === "number" ? body.port : Number(body?.port ?? 22)
  if (!(IPV4.test(host) || HOST.test(host)) || !Number.isInteger(port) || port < 1 || port > 65535) return json({ ok: false, reason: "bad-address" }, 400)
  const at = ["--host", host, "--port", String(port)]
  const key = Boolean(envValue("CLOUDFLARE_API_TOKEN"))
  const visit = readVisit(req, host, port)
  // 744-3: the runner's fresh visit key goes into the cookie and out of the answer; a refused or closed visit takes the cookie away.
  const answer = async (verb: string, argv: string[], input: Record<string, unknown> = {}) => {
    const r = await run(verb, argv, { key: visit?.key ?? null, ...input })
    const fresh = (r.visit ?? null) as Partial<Visit> | null
    const res = json({ ...r, visit: fresh?.deadline ? { deadline: fresh.deadline } : visit ? { deadline: visit.deadline } : null, key })
    if (fresh?.key && fresh.deadline) keepVisit(res, req, host, port, { key: fresh.key, deadline: fresh.deadline })
    else if (verb === "close" || r.reason === "need-password") dropVisit(res, host, port)
    return res
  }

  if (action === "connect") {
    const password = typeof body?.password === "string" ? body.password : ""
    if (password.length > 512 || /[\r\n]/.test(password)) return json({ ok: false, reason: "bad-password" }, 400)
    const trust = typeof body?.trust === "string" && FINGERPRINT.test(body.trust) ? ["--trust", body.trust] : []
    if (trust.length && !password) return json({ ok: false, reason: "need-password" }, 400)
    return answer("connect", [...at, ...trust], password ? { password } : {})
  }
  if (action === "close") return answer("close", at)
  if (["state", "probe", "detect", "dns", "signin"].includes(action)) return answer(action, at)
  if (action === "install") return answer("install", [...at, "--mode", body?.mode === "update" ? "update" : "install"])
  if (action === "domain") return answer("domain", [...at, "--name", String(body?.name ?? "").slice(0, 260)])
  if (action === "way") return answer("way", [...at, "--way", String(body?.way ?? "")])
  if (DOOR_ACTIONS.includes(action)) return answer("door", at, { body: { action } })
  if (action === "upload") {
    const pair = { action, name: String(body?.name ?? ""), fullchain: String(body?.fullchain ?? ""), privkey: String(body?.privkey ?? "") }
    if (pair.fullchain.length > 65536 || pair.privkey.length > 65536) return json({ ok: false, reason: "bad-pem" }, 400)
    return answer("door", at, { body: pair })
  }
  if (action === "cloudflare-write") {
    // 737-19b on a server of this page: every name of a fresh node and `*`, DNS ONLY, pointed at the server's IP with this node's key.
    const token = envValue("CLOUDFLARE_API_TOKEN")
    if (!token) return json({ ok: false, reason: "no-cloudflare-token", key }, 409)
    const now = (await run("state", at, { key: visit?.key ?? null })) as { ok?: boolean; reason?: string; state?: { domain?: { domain?: string; detect?: { zone?: string } }; records?: Array<{ records: Array<{ host: string }> }>; probe?: { publicIp?: string } } }
    if (now.reason === "need-password") return answer("state", at)
    const zone = now.state?.domain?.domain
    const ip = IPV4.test(host) ? host : now.state?.probe?.publicIp ?? ""
    if (!zone || !IPV4.test(ip)) return json({ ok: false, reason: "no-domain", key }, 409)
    const hosts = (now.state?.records?.[0]?.records ?? []).map((r) => r.host)
    const r = await pointNamesAtServer({ token, dnsZone: now.state?.domain?.detect?.zone ?? zone, base: zone, hosts, ip, tunnelId: null })
    const after = await run("dns", at, { key: visit?.key ?? null })
    return json({ ...after, ok: r.ok, results: r.results, ...(r.ok ? {} : { reason: r.reason }), visit: visit ? { deadline: visit.deadline } : null, key }, r.ok ? 200 : 409)
  }
  if (action === "clear") {
    if (body?.confirm !== host) return json({ ok: false, reason: "not-confirmed" }, 409)
    return answer("clear", [...at, "--confirm", host])
  }
  return json({ ok: false, reason: "unknown-action" }, 400)
}
