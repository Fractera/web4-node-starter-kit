// IS THIS SERVER ENOUGH FOR THIS NODE — measured on both sides (node step 737-7). The server's numbers come from `probe.sh`; the
// node's own needs are measured here and now: the memory its processes hold (pm2) and the size of its copy (`transfer.measure`).
// 🔒 A WARNING WITH NUMBERS, A REFUSAL ONLY WHERE THE NODE CANNOT LIVE: not Linux of the Ubuntu or Debian family, less memory than the
// node holds today, less disk than the copy plus its rebuilt packages, ports 80/443 held by another web server, another site on nginx. Everything else is said
// and the person decides (the easy starter's lesson: «мы не отказываемся ставить — мы говорим правду и продолжаем»).
import { spawnSync } from 'node:child_process'

const GB = 1024 ** 3
/** Packages, builds, Chromium, the Claude CLI and the graph's Python rebuilt on the server — an honest upper estimate in GB. */
export const REBUILT_GB = 12
/** Memory + swap the server gets for the core's build (prepare.sh adds the swap). */
export const BUILD_TOTAL_MB = 16384

/** The memory the node's processes hold now, in MB (pm2's own measure); null when pm2 does not answer. */
export function residentMb(root) {
  const r = spawnSync(process.platform === 'win32' ? 'pm2.cmd' : 'pm2', ['jlist'], { encoding: 'utf8', shell: process.platform === 'win32', timeout: 20_000, maxBuffer: 64 * 1024 * 1024 })
  if (r.status !== 0) return null
  try {
    const list = JSON.parse(r.stdout.slice(r.stdout.indexOf('[')))
    const ours = list.filter((p) => String(p.name ?? '').startsWith('fractera-') && String(p.pm2_env?.pm_cwd ?? '').startsWith(root))
    return Math.round(ours.reduce((n, p) => n + (p.monit?.memory ?? 0), 0) / 1048576)
  } catch { return null }
}

/**
 * @param {any} probe the server's JSON line
 * @param {{ ramMb: number|null, copyBytes: number|null }} needs
 * @param {string} host the address the person typed
 * @returns {{ level: 'ok'|'warn'|'fail', items: Array<{ id: string, level: 'ok'|'warn'|'fail', value?: unknown, need?: unknown }> }}
 */
export function judge(probe, needs, host) {
  const items = []
  const add = (id, level, value, need) => items.push({ id, level, ...(value !== undefined ? { value } : {}), ...(need !== undefined ? { need } : {}) })
  const os = probe?.os ?? {}
  add('os', os.id === 'ubuntu' ? 'ok' : os.id === 'debian' ? 'warn' : 'fail', os.pretty ?? os.id)
  add('arch', ['x86_64', 'aarch64'].includes(os.arch) ? 'ok' : 'fail', os.arch)
  // The memory AVAILABLE now (other programs on the server hold the rest), the total when an old probe did not say.
  const ram = probe?.availMb || probe?.ramMb || 0
  const held = needs.ramMb ?? 2300
  add('memory', ram < held ? 'fail' : ram < Math.max(4000, held + 1500) ? 'warn' : 'ok', ram, held)
  const copyGb = Math.ceil((needs.copyBytes ?? 0) / GB)
  // The swap prepare adds so that memory + swap reach 16 GB — the core's build needs ≈13.6 GB in all (measured 2026-11-13).
  const swapGb = Math.max(0, Math.ceil((BUILD_TOTAL_MB - (probe?.ramMb ?? 0) - (probe?.swapMb ?? 0)) / 1024))
  const diskNeed = copyGb + REBUILT_GB + swapGb
  const disk = probe?.diskFreeGb ?? 0
  add('disk', disk < diskNeed ? 'fail' : disk < diskNeed + 10 ? 'warn' : 'ok', disk, diskNeed)
  add('cores', (probe?.cores ?? 1) < 2 ? 'warn' : 'ok', probe?.cores ?? 1)
  const portsBusy = (probe?.port80Busy || probe?.port443Busy) && !probe?.nginx
  add('ports', portsBusy ? 'fail' : 'ok')
  // 🔒 ANOTHER SITE ON THIS NGINX IS A REFUSAL, NOT A WARNING: the node's site takes `default_server` on 80 and its own names, and the
  // file `sites-available/fractera` — prepare would break what lives there. The person frees the server (or says it may go) first.
  const sites = Array.isArray(probe?.foreignSites) ? probe.foreignSites : []
  if (sites.length) add('sites', 'fail', sites.join(', '))
  if ((probe?.pm2Root ?? 0) > 0) add('others', 'warn', probe.pm2Root)
  add('address', probe?.publicIp && probe.publicIp !== host ? 'warn' : 'ok', probe?.publicIp ?? null, host)
  add('systemd', probe?.systemd ? 'ok' : 'warn')
  if (probe?.nodeThere) add('earlier', 'warn')
  const level = items.some((i) => i.level === 'fail') ? 'fail' : items.some((i) => i.level === 'warn') ? 'warn' : 'ok'
  return { level, items }
}
