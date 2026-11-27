// A BOUGHT STARTER COMES TO THE NODE (core step 862-4; the standard: skill `marketplace`, references/store-contract-v1.md §3–§4, v1.2).
// The core asks the store with the node's signature: the order's status (v1.2: `paid: true`, `items[]` with the starter's tag, commit and
// sha256; v1's `status: "paid"` + `starters[]` read too), then the archive (v1.2 body field `slug`) —
// one top folder named by the slug, no .git. The bytes' sha256 must equal the order's record AND the store's x-sha256 header; anything
// else is refused and deleted before a single file is unpacked. The archive is unpacked into a scratch folder, checked (exactly one top
// folder, the slug; no link that leads outside it; tar itself refuses «..» and absolute members) and only then becomes the node's kept
// starter: data/node/starters/<slug>/<tag>/ with its archive and its record <tag>.json beside it — outside git, the node's own data.
// «Установить ещё раз» births one more element from the kept copy without the store (R-05).
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, isAbsolute, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { STORE_BASE, storeCall, storeEnvelope } from './store-call.mjs'

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/
const TAG = /^v\d+\.\d+\.\d+$/
const SHA = /^[0-9a-f]{64}$/
const MAX_BYTES = 200 * 1024 * 1024

export const startersDir = (root) => join(root, 'data', 'node', 'starters')

/** The kept copy of a starter: its record (the newest tag when none is named) → { ok, path, meta } | { ok: false, reason }. */
export function keptStarter(root, slug, tag = null) {
  if (!SLUG.test(slug ?? '')) return { ok: false, reason: 'bad-slug' }
  const dir = join(startersDir(root), slug)
  if (!existsSync(dir)) return { ok: false, reason: 'not-kept' }
  const tags = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((t) => TAG.test(t))
    .sort((a, b) => a.slice(1).split('.').map(Number).reduce((d, x, i) => d || x - b.slice(1).split('.').map(Number)[i], 0))
  const at = tag ?? tags.at(-1)
  if (!at || !tags.includes(at) || !existsSync(join(dir, at))) return { ok: false, reason: 'not-kept' }
  return { ok: true, path: join(dir, at), meta: JSON.parse(readFileSync(join(dir, `${at}.json`), 'utf8')) }
}

/** Every link inside `top` must stay inside it; returns the first offender's path relative to `top`, or null. */
function linkOutside(top) {
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name)
      const st = lstatSync(p)
      if (st.isSymbolicLink()) {
        const target = readlinkSync(p)
        const to = isAbsolute(target) ? target : resolve(dirname(p), target)
        const rel = relative(top, to)
        if (isAbsolute(target) || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return relative(top, p)
      } else if (st.isDirectory()) {
        const bad = walk(p)
        if (bad) return bad
      }
    }
    return null
  }
  return walk(top)
}

/** Unpack a checked archive into data/node/starters/<slug>/<tag>/ — or refuse, leaving nothing behind. */
export function keepArchive(root, bytes, meta) {
  const base = join(startersDir(root), meta.slug)
  mkdirSync(base, { recursive: true })
  const nonce = randomBytes(6).toString('hex')
  const file = join(base, `.incoming-${nonce}.tar.gz`)
  const scratch = join(base, `.unpack-${nonce}`)
  const clean = () => { rmSync(file, { force: true }); rmSync(scratch, { recursive: true, force: true }) }
  try {
    writeFileSync(file, bytes)
    mkdirSync(scratch)
    // bsdtar (macOS, Windows) and GNU tar both refuse «..» members and strip a leading «/» unless told otherwise (-P) — never told.
    const t = spawnSync('tar', ['-xzf', file, '-C', scratch], { encoding: 'utf8', windowsHide: true, timeout: 120_000 })
    if (t.status !== 0) { clean(); return { ok: false, reason: `archive-refused: ${`${t.stderr ?? ''}`.trim().split('\n').slice(-1)[0] || `tar ${t.status}`}` } }
    // v1 named the top folder by the slug; the live store (v1.2, measured 2026-11-27) names it «<slug>-<tag>» — both are read, nothing else.
    const tops = readdirSync(scratch)
    const names = [meta.slug, `${meta.slug}-${meta.tag}`]
    if (tops.length !== 1 || !names.includes(tops[0]) || !lstatSync(join(scratch, tops[0])).isDirectory()) {
      clean(); return { ok: false, reason: `archive-shape: one top folder «${names.join('» or «')}» expected, found ${JSON.stringify(tops.slice(0, 5))}` }
    }
    const top = join(scratch, tops[0])
    const bad = linkOutside(top)
    if (bad) { clean(); return { ok: false, reason: `archive-link-outside: ${bad}` } }
    const dest = join(base, meta.tag)
    rmSync(dest, { recursive: true, force: true })
    renameSync(top, dest)
    renameSync(file, join(base, `${meta.tag}.tar.gz`))
    rmSync(scratch, { recursive: true, force: true })
    writeFileSync(join(base, `${meta.tag}.json`), JSON.stringify({ ...meta, keptAt: new Date().toISOString() }, null, 2) + '\n', 'utf8')
    return { ok: true, path: dest }
  } catch (e) {
    clean()
    return { ok: false, reason: `archive-keep: ${String(e?.message ?? e).slice(0, 160)}` }
  }
}

/**
 * The bought starter from the store, signed by the node: order status → archive → sha256 twice → kept.
 * → { ok: true, path, meta } | { ok: false, reason, status }
 */
export async function fetchStarter(root, { order, slug = null, base = process.env.FRACTERA_MARKET_URL || STORE_BASE, timeoutMs = 120_000 } = {}) {
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(order ?? '')) return { ok: false, reason: 'bad-order-id' }
  const st = await storeCall(root, 'order', { order }, { base })
  if (st.status !== 200) return { ok: false, status: st.status, reason: `order-status ${st.status}${st.body?.error ? ` ${st.body.error}` : ''}` }
  const paid = st.body?.paid === true || st.body?.status === 'paid'
  if (!paid) return { ok: false, status: 200, reason: `order-not-paid: ${st.body?.status ?? (st.body?.paid === false ? 'paid false' : 'unknown')}` }
  const rows = Array.isArray(st.body.items) ? st.body.items : Array.isArray(st.body.starters) ? st.body.starters : []
  const row = slug ? rows.find((s) => s?.slug === slug) : rows.length === 1 ? rows[0] : null
  if (!row) return { ok: false, reason: slug ? `starter-not-in-order: ${slug}` : `name the starter: ${rows.map((s) => s?.slug).join(', ') || 'none in the order'}` }
  if (!SLUG.test(row.slug ?? '') || !TAG.test(row.tag ?? '') || !SHA.test(row.sha256 ?? '')) return { ok: false, reason: 'order-row-malformed' }

  const envelope = storeEnvelope(root, { order, slug: row.slug })
  let r
  try {
    r = await fetch(`${base.replace(/\/+$/, '')}/api/marketplace/archive`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(envelope), signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (e) { return { ok: false, status: 0, reason: `archive-call: ${String(e?.message ?? e).slice(0, 160)}` } }
  if (r.status !== 200) { const b = await r.json().catch(() => null); return { ok: false, status: r.status, reason: `archive ${r.status}${b?.error ? ` ${b.error}` : ''}` } }
  const bytes = Buffer.from(await r.arrayBuffer())
  if (bytes.length > MAX_BYTES) return { ok: false, reason: `archive-too-large: ${bytes.length}` }
  const sha = createHash('sha256').update(bytes).digest('hex')
  const header = (r.headers.get('x-sha256') ?? '').toLowerCase()
  if (sha !== row.sha256) return { ok: false, reason: `sha256-mismatch: bytes ${sha.slice(0, 12)}… order ${row.sha256.slice(0, 12)}…` }
  if (header !== sha) return { ok: false, reason: `sha256-mismatch: bytes ${sha.slice(0, 12)}… header ${header.slice(0, 12)}…` }
  const meta = { slug: row.slug, name: typeof row.name === 'string' ? row.name.slice(0, 80) : row.slug, tag: row.tag, commit: row.commit ?? null, sha256: sha, size: bytes.length, order }
  const kept = keepArchive(root, bytes, meta)
  return kept.ok ? { ok: true, path: kept.path, meta } : { ok: false, reason: kept.reason }
}
