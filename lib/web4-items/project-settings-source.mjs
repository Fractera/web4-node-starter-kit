// THE PROJECT'S SETTINGS FROM THEIR PROVIDER (node step 734-3b). The owner, 2026-11-12: «the core alone is special; all elements are
// equal» — the project's settings and look live in the element that provides `project-settings` (CONFIG today, found by that word in
// the registry, never by an id), and the core reads them there. ✗ Before 734-3b the birth copied the root element's DESIGN-CONFIG and
// root's last copy of CONFIG's settings, and the core's own design came from root's door: a native service read through a custom one.
//
// 🔒 The node key (`SETTINGS_SECRET`) is read by code from the node's environment and goes only to 127.0.0.1; it is never printed.
// 🔒 A silent provider is an answer with a reason, never an empty copy: «could not read» must stay distinguishable from «the owner
// decided nothing» (the lesson of 2026-09-25 in `scripts/sync-site-design.mjs`).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const KINDS = ['app', 'platform', 'design']
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/** The node key from the environment or the node's `.env.local`; empty when there is none. */
export function nodeSettingsKey(root) {
  if (process.env.SETTINGS_SECRET?.trim()) return process.env.SETTINGS_SECRET.trim()
  try {
    const m = readFileSync(join(root, '.env.local'), 'utf8').match(/^SETTINGS_SECRET=(.*)$/m)
    return m ? m[1].trim() : ''
  } catch {
    return ''
  }
}

/** The registry entry that provides the project's settings and has a port, or null. */
export function projectSettingsProvider(registry) {
  return (registry?.services ?? []).find((s) => Array.isArray(s.provides) && s.provides.includes('project-settings') && Number.isInteger(s.port)) ?? null
}

/** The provider's loopback address, or null. */
export function projectSettingsBase(registry) {
  const p = projectSettingsProvider(registry)
  return p ? `http://127.0.0.1:${p.port}` : null
}

async function callTool(base, key, name, args = {}, timeoutMs = 10000) {
  const res = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'x-settings-key': key },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`http-${res.status}`)
  const text = await res.text()
  const line = text.trimStart().startsWith('{') ? text : text.split('\n').find((l) => l.startsWith('data:'))?.slice(5) ?? ''
  const msg = JSON.parse(line)
  if (msg.error) throw new Error(`mcp: ${msg.error.message ?? 'error'}`)
  const out = msg.result?.content?.find((c) => c.type === 'text')?.text ?? ''
  if (msg.result?.isError) throw new Error(out || 'tool-error')
  return JSON.parse(out)
}

/**
 * The project's settings as an element keeps its own copy (`receivedAt, from, version, patches, catalog` — the shape of
 * `lib/project-settings.ts` of the element templates), asked from the provider by MCP `get_project_settings`.
 * → `{ ok: true, copy, provider }` or `{ ok: false, reason }` (`no-provider`, `no-settings-key`, `unreachable: …`, `bad-answer`).
 */
export async function projectSettingsCopy({ root, registry, timeoutMs = 10000 }) {
  const provider = projectSettingsProvider(registry)
  if (!provider) return { ok: false, reason: 'no-provider' }
  const key = nodeSettingsKey(root)
  if (!key) return { ok: false, reason: 'no-settings-key' }
  const base = `http://127.0.0.1:${provider.port}`
  let got
  try {
    got = await callTool(base, key, 'get_project_settings', {}, timeoutMs)
  } catch (err) {
    return { ok: false, reason: `unreachable: ${err instanceof Error ? err.message : err}` }
  }
  if (typeof got?.version !== 'string' || !isObj(got.patches) || !KINDS.every((k) => isObj(got.patches[k]))) return { ok: false, reason: 'bad-answer' }
  const catalog = isObj(got.catalog) && isObj(got.catalog.byLang) ? got.catalog : null
  return { ok: true, provider: provider.id, copy: { receivedAt: new Date().toISOString(), from: `${base}/mcp`, version: got.version, patches: got.patches, catalog } }
}

/**
 * The project's look: the provider's OWN design (`/api/settings/design`, node key — every element has this door for itself). The owner's
 * pick B (2026-11-12): the look of the element that provides `project-settings` is the project's look; the core and a newborn of the
 * project look take it there, never from root. → `{ ok: true, config, provider }` or `{ ok: false, reason }`.
 */
export async function projectDesign({ root, registry, timeoutMs = 10000 }) {
  const provider = projectSettingsProvider(registry)
  if (!provider) return { ok: false, reason: 'no-provider' }
  const key = nodeSettingsKey(root)
  if (!key) return { ok: false, reason: 'no-settings-key' }
  try {
    const res = await fetch(`http://127.0.0.1:${provider.port}/api/settings/design`, { headers: { 'x-settings-key': key }, signal: AbortSignal.timeout(timeoutMs) })
    const body = await res.json().catch(() => null)
    if (!res.ok || !body?.ok || !isObj(body.config)) return { ok: false, reason: `http-${res.status}` }
    return { ok: true, provider: provider.id, config: body.config }
  } catch (err) {
    return { ok: false, reason: `unreachable: ${err instanceof Error ? err.message : err}` }
  }
}
