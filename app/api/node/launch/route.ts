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
// 🔒 STATELESS: every call names its server (`host`, `port`); the answer is that server's own state, read there over SSH by the node's key
// (`scripts/dedicated-server/launch.mjs`). Nothing per server is written here — only the map of pins and the certificate ledger.
// 🔒 THE ARCHITECT ONLY, NEVER ON A PUBLIC ADDRESS, NEVER ON A SERVER NODE ITSELF: a stranger with the link must not reach a server with
// the node's key, and a server node launches nothing.
// 🔒 THE PASSWORD GOES TO THE RUNNER BY STDIN and nowhere else — not argv (the process list shows it), not the environment, not a file.
//   POST { action: "connect", host, port, password?, trust? }   the password once (empty: the key is already there) → the state
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

function run(verb: string, argv: string[], stdin = ""): Promise<Record<string, unknown>> {
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
    child.stdin.end(stdin)
  })
}

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return json({ ok: false, reason: "public-address" }, 403)
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
  const answer = async (verb: string, argv: string[], stdin = "") => json({ ...(await run(verb, argv, stdin)), key })

  if (action === "connect") {
    const password = typeof body?.password === "string" ? body.password : ""
    if (password.length > 512 || /[\r\n]/.test(password)) return json({ ok: false, reason: "bad-password" }, 400)
    const trust = typeof body?.trust === "string" && FINGERPRINT.test(body.trust) ? ["--trust", body.trust] : []
    if (trust.length && !password) return json({ ok: false, reason: "need-password" }, 400)
    return answer("connect", [...at, ...trust], `${password}\n`)
  }
  if (["state", "probe", "detect", "dns", "signin"].includes(action)) return answer(action, at)
  if (action === "install") return answer("install", [...at, "--mode", body?.mode === "update" ? "update" : "install"])
  if (action === "domain") return answer("domain", [...at, "--name", String(body?.name ?? "").slice(0, 260)])
  if (action === "way") return answer("way", [...at, "--way", String(body?.way ?? "")])
  if (DOOR_ACTIONS.includes(action)) return answer("door", at, JSON.stringify({ action }))
  if (action === "upload") {
    const pair = { action, name: String(body?.name ?? ""), fullchain: String(body?.fullchain ?? ""), privkey: String(body?.privkey ?? "") }
    if (pair.fullchain.length > 65536 || pair.privkey.length > 65536) return json({ ok: false, reason: "bad-pem" }, 400)
    return answer("door", at, JSON.stringify(pair))
  }
  if (action === "cloudflare-write") {
    // 737-19b on a server of this page: every name of a fresh node and `*`, DNS ONLY, pointed at the server's IP with this node's key.
    const token = envValue("CLOUDFLARE_API_TOKEN")
    if (!token) return json({ ok: false, reason: "no-cloudflare-token", key }, 409)
    const now = (await run("state", at)) as { ok?: boolean; state?: { domain?: { domain?: string; detect?: { zone?: string } }; records?: Array<{ records: Array<{ host: string }> }>; probe?: { publicIp?: string } } }
    const zone = now.state?.domain?.domain
    const ip = IPV4.test(host) ? host : now.state?.probe?.publicIp ?? ""
    if (!zone || !IPV4.test(ip)) return json({ ok: false, reason: "no-domain", key }, 409)
    const hosts = (now.state?.records?.[0]?.records ?? []).map((r) => r.host)
    const r = await pointNamesAtServer({ token, dnsZone: now.state?.domain?.detect?.zone ?? zone, base: zone, hosts, ip, tunnelId: null })
    const after = await run("dns", at)
    return json({ ...after, ok: r.ok, results: r.results, ...(r.ok ? {} : { reason: r.reason }), key }, r.ok ? 200 : 409)
  }
  if (action === "clear") {
    if (body?.confirm !== host) return json({ ok: false, reason: "not-confirmed" }, 409)
    return answer("clear", [...at, "--confirm", host])
  }
  return json({ ok: false, reason: "unknown-action" }, 400)
}
