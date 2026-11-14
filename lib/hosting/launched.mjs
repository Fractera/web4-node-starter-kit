// THE SERVERS THIS COMPUTER LAUNCHED AND SAW LIVE (node step 741-6, D36; the owner approved 2026-11-14: «да, утверждаю 741 и D31–D37
// -> go»). His wish, verbatim, 2026-11-14 11:18: «дополнительные верхнее меню которое показывает сайт в интернете по временному адресу
// автоматически скрывается если у нас существует удалённая версия».
// `data/node/server/launched.json` = `{ "<ip>": { "domain": "<zone>", "readyAt": ISO } }` — written by the launch runner
// (`scripts/dedicated-server/launch.mjs`) when the server's own domain is switched on and when its sign-in is checked live; read by the
// place door (`/api/node/place` → `launched`). No secret, no password, nothing of the server's state beyond «it lives at this domain».
// 🛑 Named aloud: 738 kept «this computer keeps only the key and the pins»; this one small record is the owner's D36. Forgetting a server
// here is the danger zone's work (740), not built here.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isHostName } from './hostnames.mjs'

const fileOf = (root) => join(root, 'data', 'node', 'server', 'launched.json')
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/

/** Every live server this computer launched: `[{ ip, domain, readyAt }]`, newest first; damaged entries are skipped. */
export function readLaunched(root) {
  let map = {}
  try { map = JSON.parse(readFileSync(fileOf(root), 'utf8')) ?? {} } catch { return [] }
  return Object.entries(map)
    .filter(([ip, v]) => IPV4.test(ip) && v && isHostName(v.domain))
    .map(([ip, v]) => ({ ip, domain: v.domain, readyAt: typeof v.readyAt === 'string' ? v.readyAt : null }))
    .sort((a, b) => String(b.readyAt ?? '').localeCompare(String(a.readyAt ?? '')))
}

/** Remember that the server at `ip` lives at `domain` (atomic write). Invalid values are refused, never written. */
export function markLaunched(root, { ip, domain }) {
  if (!IPV4.test(String(ip)) || !isHostName(domain)) return false
  let map = {}
  try { map = JSON.parse(readFileSync(fileOf(root), 'utf8')) ?? {} } catch { map = {} }
  map[ip] = { domain, readyAt: new Date().toISOString() }
  mkdirSync(join(root, 'data', 'node', 'server'), { recursive: true })
  const tmp = `${fileOf(root)}.${process.pid}.tmp`
  writeFileSync(tmp, `${JSON.stringify(map, null, 2)}\n`)
  renameSync(tmp, fileOf(root))
  return true
}
