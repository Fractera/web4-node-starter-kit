// WHERE THE NODE STANDS — DETECTED, NEVER DECLARED (node step 737-18). The owner, 2026-11-13: «очень важно теперь найти способ нативно
// отслеживать является ли данное состояние локальным или это выделенный сервер потому что до сих пор у нас существует вкладка где мы все
// это переключали руками. Больше этого быть не должно».
// 🔒 TWO SOURCES, BOTH FACTS, IN THIS ORDER:
//   1. the record written by the act that put the node there — the move or the «new server» road writes `data/node/server.json` on the
//      server (phase silent or live): «server, recorded»;
//   2. a measurement of this machine: macOS and Windows are the person's computer; Linux holding a public IPv4 on its own network
//      interface is a server reachable from the internet; Linux behind a private address is a computer.
// ✗ What this replaces (276-3, «Где размещён ваш проект?»): a declaration the person clicked. The owner declared «server» on his Mac at
// 10:15 on 2026-11-13 and the whole node believed it — a switch nobody can verify is a switch that lies.
// Limit named aloud: a cloud machine that sees only a private address behind its provider's NAT (some clouds do) reads as «computer»
// until the move or the «new server» road records it; a home PC connected without a router reads as «server». Both are rare; neither
// changes any access right — rights follow the request itself (the edge mark of `lib/hosting/edge.mjs`).
// Bare `node` reads it (CommonJS-free `.mjs`, no `@/` imports): the core's pages, element birth and the server command.
import { readFileSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'

/** Private, shared, loopback and link-local IPv4 ranges — an address in them is not reachable from the internet by itself. */
export function isPublicIpv4(ip) {
  const p = String(ip).split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false
  const [a, b] = p
  if (a === 10 || a === 127 || a === 0 || a >= 224) return false
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 100 && b >= 64 && b <= 127) return false // carrier-grade NAT
  if (a === 169 && b === 254) return false
  if (a === 192 && b === 0 && p[2] === 2) return false // documentation
  if (a === 198 && (b === 18 || b === 19)) return false // benchmarking
  return true
}

/** The public IPv4 this machine holds on its own interfaces, or `null`. */
export function publicIpOnInterfaces(interfaces = os.networkInterfaces()) {
  for (const list of Object.values(interfaces ?? {})) {
    for (const a of list ?? []) {
      const v4 = a && (a.family === 'IPv4' || a.family === 4)
      if (v4 && !a.internal && isPublicIpv4(a.address)) return a.address
    }
  }
  return null
}

/**
 * @param {string} root the node's folder
 * @param {{ platform?: string, interfaces?: object }} [probe] — the tests' machine
 * @returns {{ kind: 'home' | 'server', source: 'moved' | 'measured', changedAt: string | null, detail: string }}
 */
export function nodePlace(root, probe = {}) {
  try {
    const m = JSON.parse(readFileSync(join(root, 'data', 'node', 'server.json'), 'utf8'))
    if (m.phase === 'live' || m.phase === 'silent') {
      const at = typeof m.movedAt === 'string' ? m.movedAt : typeof m.at === 'string' ? m.at : null
      return { kind: 'server', source: 'moved', changedAt: at, detail: m.independent ? 'new-server' : 'moved' }
    }
  } catch { /* not a server record */ }
  const platform = probe.platform ?? process.platform
  if (platform === 'darwin') return { kind: 'home', source: 'measured', changedAt: null, detail: 'macos' }
  if (platform === 'win32') return { kind: 'home', source: 'measured', changedAt: null, detail: 'windows' }
  const ip = publicIpOnInterfaces(probe.interfaces)
  return ip
    ? { kind: 'server', source: 'measured', changedAt: null, detail: `public-ip ${ip}` }
    : { kind: 'home', source: 'measured', changedAt: null, detail: 'private-address' }
}
