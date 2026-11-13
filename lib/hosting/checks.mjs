// THE SERVER'S NODE IS CHECKED FROM OUTSIDE AND FROM INSIDE (node step 737-7) — two planes, each with its negative control.
//   outside (from the person's computer): `http://<IP>/api/health` answers 200 with the node's commit; a request naming `localhost`
//            is refused by nginx (the edge law, 737-2); the core's own port is not reachable from the internet (the firewall).
//   inside (on the server, over SSH): every installed, switched-on element answers on its loopback port.
import { request } from 'node:http'
import { connect as tcp } from 'node:net'
import { exec } from './ssh.mjs'
import { installedElements } from './hostnames.mjs'

function get(host, path, headers = {}, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    const req = request({ host, port: 80, path, method: 'GET', headers, timeout: timeoutMs }, (res) => {
      let body = ''
      res.on('data', (d) => { if (body.length < 100_000) body += d })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
    })
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }) })
    req.on('error', (e) => resolve({ status: 0, error: e.code ?? e.message }))
    req.end()
  })
}

function portClosed(host, port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const s = tcp({ host, port })
    const done = (closed) => { s.destroy(); resolve(closed) }
    s.setTimeout(timeoutMs, () => done(true))
    s.once('connect', () => done(false))
    s.once('error', () => done(true))
  })
}

/** Outside checks. `commit` — the core's commit the server must answer with (this computer's HEAD). */
export async function outsideChecks(host, { commit = null, corePort = 24680 } = {}) {
  const out = []
  const health = await get(host, '/api/health')
  let answered = null
  try { answered = JSON.parse(health.body).commit ?? null } catch { /* not JSON */ }
  out.push({ id: 'health', ok: health.status === 200, value: health.status || health.error })
  if (commit) out.push({ id: 'commit', ok: Boolean(answered) && String(answered).startsWith(commit.slice(0, 7)), value: answered, need: commit })
  const spoof = await get(host, '/api/health', { Host: 'localhost' })
  out.push({ id: 'edge', ok: spoof.status !== 200, value: spoof.status || spoof.error })
  out.push({ id: 'firewall', ok: await portClosed(host, corePort), value: corePort })
  return out
}

/** Inside checks over SSH: each installed element that is not switched off answers on 127.0.0.1:<port> (any status below 500). */
export async function insideChecks(client, root) {
  const out = []
  const reg = installedElements(root)
  let off = new Set()
  try {
    const { createRequire } = await import('node:module')
    const power = createRequire(import.meta.url)('../web4-items/element-power.cjs')
    off = new Set((power.readRegistry(root).services || []).filter((s) => power.offOf(s)).map((s) => s.id))
  } catch { /* no power records — every element is expected */ }
  for (const e of reg) {
    if (off.has(e.id)) { out.push({ id: `element:${e.id}`, ok: true, value: 'off' }); continue }
    const r = await exec(client, `curl -s -o /dev/null -w '%{http_code}' --max-time 15 http://127.0.0.1:${Number(e.port)}/`, { timeoutMs: 30_000 })
    const code = Number.parseInt(r.stdout.trim(), 10) || 0
    out.push({ id: `element:${e.id}`, ok: code > 0 && code < 500, value: code })
  }
  return out
}
