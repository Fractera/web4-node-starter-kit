// THE AGENT GOES FIRST WHEN ITS ELEMENT IS DELETED (node step 750-1). ✗ Measured 2026-11-15 13:05 on the owner's Mac: a deleted element's
// Opus session kept running in its vanished folder — `deleteElement` stopped pm2, never the agent, and once the registry forgot the element
// the core could not reach its kit any more (`close` → `no-agent-kit`); the dying agent asked three permissions hunting its folder.
// So the deletion closes both sessions — the agent `<id>` and its worker `<id>--work` — through the core's own hook
// (`globalThis.__web4AgentDone`, `lib/agent-kit/mount.cjs`) while the registry still names the element, and waits for the kit's delayed
// stop (1.5 s) before the next stage. A session already off is no failure. Pure: the hook and the pause are given.

/**
 * @param {string} id
 * @param {((service: string, opts: { close: boolean }) => unknown) | undefined} done  `globalThis.__web4AgentDone`
 * @param {(ms: number) => Promise<void>} [pause]
 * @returns {Promise<{ step: 'agents', ok: boolean, detail: string }>}
 */
export async function closeAgents(id, done, pause = (ms) => new Promise((r) => setTimeout(r, ms))) {
  if (typeof done !== 'function') return { step: 'agents', ok: false, detail: 'no-kits' }
  const res = []
  for (const service of [id, `${id}--work`]) {
    let r
    try { r = await done(service, { close: true }) } catch (e) { r = { ok: false, reason: String(e?.message ?? e) } }
    res.push(`${service}:${r && r.ok ? 'closed' : (r && r.reason) || 'failed'}`)
  }
  if (res.some((x) => x.endsWith(':closed'))) await pause(2000)
  const failed = res.filter((x) => !/:(closed|no-session|no-agent-kit)$/.test(x))
  return { step: 'agents', ok: failed.length === 0, detail: res.join(',') }
}
