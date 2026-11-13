// LONG WORK ON THE SERVER, FOLLOWED FROM HERE (node step 737-7). A server script runs detached (`setsid`, the easy starter's way), writes
// one JSON line per stage (`scripts/dedicated-server/stages.sh`); the runner on the person's computer reads that file over SSH every few
// seconds and mirrors it into the move's state. An SSH drop does not stop the server's work — the next read continues.
import { exec } from './ssh.mjs'

/** Shell single-quote: the only way any value enters a remote command. */
export const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`

/** Start `command` detached on the server (macOS has no setsid — the local test server falls back to nohup). */
export async function startDetached(client, command, log) {
  const body = q(command)
  const r = await exec(client, `(command -v setsid >/dev/null 2>&1 && setsid bash -c ${body} || nohup bash -c ${body}) > ${q(log)} 2>&1 < /dev/null & echo STARTED`, { timeoutMs: 30_000 })
  if (!r.stdout.includes('STARTED')) throw Object.assign(new Error('start-failed'), { reason: 'start-failed', detail: r.stderr.slice(0, 300) })
}

/** The stages of a remote progress file: the last line of every id, in the order the ids first appeared. */
export async function readStages(client, file) {
  const r = await exec(client, `cat ${q(file)} 2>/dev/null || true`, { timeoutMs: 20_000 })
  const order = []
  const last = new Map()
  for (const line of r.stdout.split('\n')) {
    if (!line.trim()) continue
    let s
    try { s = JSON.parse(line) } catch { continue }
    if (typeof s?.id !== 'string') continue
    if (!last.has(s.id)) order.push(s.id)
    last.set(s.id, s)
  }
  return order.map((id) => last.get(id))
}

/**
 * Follow a remote stage file until its `final` id is done, any stage failed, the script is gone without its last line, or time ran out.
 * Resolves `{ ok, stages, failed }`.
 */
export async function follow(client, file, final, { script, onStages = null, everyMs = 3000, timeoutMs = 3_600_000 } = {}) {
  const t0 = Date.now()
  let quietSince = Date.now()
  let seen = 0
  for (;;) {
    const stages = await readStages(client, file)
    onStages?.(stages)
    const failed = stages.find((s) => s.state === 'failed')
    const end = stages.find((s) => s.id === final && s.state === 'done')
    if (failed || end) return { ok: !failed && Boolean(end), stages, failed: failed ?? null }
    if (stages.length !== seen) { seen = stages.length; quietSince = Date.now() }
    // A quiet file for two minutes: is the script still there? Gone without its last line — a failure with that name.
    if (script && Date.now() - quietSince > 120_000) {
      const alive = await exec(client, `pgrep -f ${q(script)} >/dev/null && echo ALIVE || echo GONE`, { timeoutMs: 20_000 })
      if (alive.stdout.includes('GONE')) return { ok: false, stages, failed: { id: final, state: 'failed', detail: 'the script ended without its last line' } }
      quietSince = Date.now()
    }
    if (Date.now() - t0 > timeoutMs) return { ok: false, stages, failed: { id: final, state: 'failed', detail: 'timeout' } }
    await new Promise((r) => setTimeout(r, everyMs))
  }
}
