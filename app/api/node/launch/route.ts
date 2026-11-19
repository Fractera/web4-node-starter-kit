// @api launch a node on a dedicated server and read its state
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import phase from "@/lib/hosting/phase.cjs"
import { readPlan, writePlan } from "@/lib/hosting/server-records-cf"
import { planIsEmpty, removalsConfirmed } from "@/lib/hosting/server-records-plan.mjs"
import { closeWindowProcess, openWindowProcess } from "@/lib/hosting/window-process.mjs"

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
//   POST { action: "close", host, port }                        the visit closed now (its line leaves the server, the cookie goes, the
//                                                              window closes)
//   POST { action: "window", host, port }                       the server's own panel through SSH while the visit lasts (744-3, D45)
//   POST { action: "state" | "probe", host, port }              the server's state; the server checked again
//   POST { action: "log", host, port }                         806-3: the live install — its log tail, its checklist with times, how long
//                                                              the log has been quiet and how busy the processor is (`log.sh` there)
//   POST { action: "install", host, port, mode }                the launch started on the server (install · update)
//   POST { action: "domain" | "way" | "detect" | "dns", host, port, name?, way? }   the domain step, kept on the server
//   POST { action: "dns-check" | "certs" | "check" | "activate" | "claim", host, port }   the server node's own domain door; `claim`
//                                                              returns the architect's one-time code once (739-5), kept nowhere here
//   POST { action: "upload", host, port, name, fullchain, privkey }                  the person's own certificate for one name (stdin)
//   POST { action: "signin", host, port }                      where sign-in leads, asked from the internet
//   POST { action: "telegram", host, port, op, token?, lines? } 758/761, step 5: the server's own bot — op token|skip|link|messages; the token goes on to
//                                                               the runner's stdin and the server, never back and never into a log
//   POST { action: "clear", host, port, confirm, fresh? }      a busy server freed — the dialog sends back the address it named; `fresh`
//                                                              — this node's own older install set aside too («с нуля», 784)
//   POST { action: "records-plan", host, port }               760-8: does this node's Cloudflare key see the server's zone, and what it
//                                                              would add, switch and remove there — the key never leaves the core
//   POST { action: "records-write", host, port, remove }      760-8: the plan carried out, DNS only; `remove` — the record ids the
//                                                              person's confirm named; a fresh plan with another removal stops it
// 759 → 760-8 (the owner, 2026-11-16, «тебе нужен Token и значит ты автоматически показываешь другой сценарий … её недостаток был в
// ручном выборе»): no question — the node writes when the key sees the zone; otherwise the records are written by hand where they live.
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
const TIMEOUT: Record<string, number> = { connect: 150_000, probe: 150_000, state: 60_000, install: 120_000, domain: 120_000, way: 60_000, detect: 90_000, dns: 90_000, door: 200_000, signin: 90_000, clear: 600_000, telegram: 90_000, log: 30_000 }


/** 760-8: a value of the core's environment — the Cloudflare token stays in this process; only what the plan needs leaves. */
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
  const visit = readVisit(req, host, port)
  // 744-3: the runner's fresh visit key goes into the cookie and out of the answer; a refused or closed visit takes the cookie away.
  const answer = async (verb: string, argv: string[], input: Record<string, unknown> = {}) => {
    const r = await run(verb, argv, { key: visit?.key ?? null, ...input })
    const fresh = (r.visit ?? null) as Partial<Visit> | null
    const res = json({ ...r, visit: fresh?.deadline ? { deadline: fresh.deadline } : visit ? { deadline: visit.deadline } : null })
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
  if (action === "close") {
    closeWindowProcess({ root: ROOT, host, port })
    return answer("close", at)
  }
  if (action === "window") {
    if (!visit) return answer("state", at)
    const w = await openWindowProcess({ root: ROOT, host, port, key: visit.key, until: Math.floor(Date.parse(visit.deadline) / 1000), env: cleanEnv() })
    if (!w.ok && (w.reason === "auth" || w.reason === "need-password")) {
      const res = json({ ok: false, reason: "need-password" })
      dropVisit(res, host, port)
      return res
    }
    return json({ ok: w.ok, ...(w.ok ? { window: { url: w.url } } : { reason: w.reason }), visit: { deadline: visit.deadline } })
  }
  // 806-3: «log» — the live reader of the install: the running stage's own log and the checklist, read over SSH by this visit
  if (["state", "probe", "detect", "dns", "signin", "log"].includes(action)) return answer(action, at)
  if (action === "install") return answer("install", [...at, "--mode", body?.mode === "update" ? "update" : "install"])
  if (action === "domain") return answer("domain", [...at, "--name", String(body?.name ?? "").slice(0, 260)])
  if (action === "way") return answer("way", [...at, "--way", String(body?.way ?? "")])
  // 796: the architect's e-mail of a fresh server — checked here, passed through to the server's sign-in element, kept nowhere in the core
  if (action === "claim") {
    // ✗ 2026-11-18 22:4x: the runner answered every status read «not known» (the 15:00 stopgap against the SSH loop), so step 8 kept
    // offering the e-mail form on a server whose architect already existed. The sign-in's own door is public for reading
    // (`GET https://auth.<zone>/api/claim` → { pending, kind, claimed }, never the e-mail): one HTTPS read, no SSH. Unreadable → the old answer.
    if (body?.status === true) {
      const zone = String(body?.zone ?? "").toLowerCase()
      if (HOST.test(zone)) {
        const a = (await fetch(`https://auth.${zone}/api/claim`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) })
          .then((r) => (r.ok ? r.json() : null)).catch(() => null)) as { claimed?: unknown; pending?: unknown } | null
        if (typeof a?.claimed === "boolean") return json({ ok: true, answer: { ok: true, claimed: a.claimed, pending: a.pending === true, known: true } })
      }
      return answer("door", at, { body: { action, status: true } })
    }
    const email = String(body?.email ?? "").trim().toLowerCase()
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return json({ ok: false, reason: "bad-email" }, 400)
    return answer("door", at, { body: { action, ...(email ? { email } : {}) } })
  }
  if (DOOR_ACTIONS.includes(action)) return answer("door", at, { body: { action } })
  if (action === "telegram") {
    const op = ["token", "skip", "link", "messages"].find((o) => o === body?.op)
    if (!op) return json({ ok: false, reason: "bad-action" }, 400)
    const token = op === "token" ? String(body?.token ?? "").trim().slice(0, 4096) : undefined
    // 761-2/761-14: the bot's three lines in the page's language, each naming the site — checked again by the runner (`cleanLines`)
    const lines = (op === "token" || op === "messages") && body?.lines && typeof body.lines === "object" ? body.lines : undefined
    return answer("telegram", at, { body: { action: op, ...(token ? { token } : {}), ...(lines ? { lines } : {}) } })
  }
  if (action === "upload") {
    const pair = { action, name: String(body?.name ?? ""), fullchain: String(body?.fullchain ?? ""), privkey: String(body?.privkey ?? "") }
    if (pair.fullchain.length > 65536 || pair.privkey.length > 65536) return json({ ok: false, reason: "bad-pem" }, 400)
    return answer("door", at, { body: pair })
  }
  if (action === "records-plan" || action === "records-write") {
    const token = envValue("CLOUDFLARE_API_TOKEN")
    if (!token) return json({ ok: true, cf: { key: false } })
    const now = (await run("state", at, { key: visit?.key ?? null })) as { reason?: string; state?: { domain?: { domain?: string; way?: string | null; detect?: { zone?: string } | null } | null; records?: Array<{ records: Array<{ host: string }> }>; probe?: { publicIp?: string | null } | null } }
    if (now.reason === "need-password") return answer("state", at)
    const zone = now.state?.domain?.domain
    const dnsZone = now.state?.domain?.detect?.zone ?? zone
    const ip = IPV4.test(host) ? host : now.state?.probe?.publicIp ?? ""
    if (!zone || !dnsZone || !IPV4.test(ip)) return json({ ok: false, reason: "no-domain" }, 409)
    const hosts = (now.state?.records?.[0]?.records ?? []).map((r) => r.host)
    const read = await readPlan({ token, dnsZone, base: zone, hosts, ip })
    if (!read.ok) return json({ ok: false, reason: "cloudflare-read", detail: read.reason, cf: { key: true, zone: dnsZone } }, 502)
    const cf = { key: true, zone: dnsZone, ip, visible: read.visible, plan: read.visible ? read.plan : null }
    if (action === "records-plan" || !read.visible) return json({ ok: true, cf })
    if (read.plan.blocked.length) return json({ ok: false, reason: "tunnel-record", cf }, 409)
    if (!removalsConfirmed(read.plan, body?.remove)) return json({ ok: false, reason: "plan-changed", cf }, 409)
    if (!planIsEmpty(read.plan)) {
      const w = await writePlan({ token, zoneId: read.zoneId, base: zone, ip, plan: read.plan })
      if (!w.ok) return json({ ok: false, reason: "cloudflare-write", results: w.results, cf }, 502)
    }
    if (!now.state?.domain?.way) await run("way", [...at, "--way", "dns"], { key: visit?.key ?? null })
    // ✗ 2026-11-16 (the owner pressed «Вписать записи» twice: the records were written, the card still showed the old plan): the answer
    // carries the plan read AGAIN after the write and what was written, so the card shows the zone as it is now.
    const after = await readPlan({ token, dnsZone, base: zone, hosts, ip })
    const written = { add: read.plan.add.length, change: read.plan.change.length, remove: read.plan.remove.length, at: new Date().toISOString() }
    const fresh = after.ok ? { ...cf, visible: after.visible, plan: after.visible ? after.plan : null } : cf
    const r = await run("dns", at, { key: visit?.key ?? null })
    return json({ ...r, cf: { ...fresh, written }, visit: visit ? { deadline: visit.deadline } : null })
  }
  if (action === "clear") {
    if (body?.confirm !== host) return json({ ok: false, reason: "not-confirmed" }, 409)
    // 784: «с нуля» — this node's own older install on the server is set aside too (the runner's `--fresh`), only after the same confirm.
    return answer("clear", [...at, "--confirm", host, ...(body?.fresh === true ? ["--fresh"] : [])])
  }
  return json({ ok: false, reason: "unknown-action" }, 400)
}
