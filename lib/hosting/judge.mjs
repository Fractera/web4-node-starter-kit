// IS THIS SERVER ENOUGH FOR A NODE (node steps 737-7, 738-3). The server's numbers come from `probe.sh`; the needs are a fresh node's
// (738: a server gets a fresh Fractera from the fork, never a copy of this computer) — ≈2.3 GB resident (737-research § D) and its clone.
// 🔒 A WARNING WITH NUMBERS, A REFUSAL ONLY WHERE THE NODE CANNOT LIVE: not Linux of the Ubuntu or Debian family, less memory than the
// node holds today, less disk than the copy plus its rebuilt packages, ports 80/443 held by another web server, another site on nginx. Everything else is said
// and the person decides (the easy starter's lesson: «мы не отказываемся ставить — мы говорим правду и продолжаем»).
const GB = 1024 ** 3
/** Packages, builds, Chromium, the Claude CLI and the graph's Python rebuilt on the server — an honest upper estimate in GB. */
export const REBUILT_GB = 12
/** Memory + swap the server gets for the core's build (prepare.sh adds the swap). */
export const BUILD_TOTAL_MB = 24576

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
  // The swap prepare adds so that memory + swap reach 24 GiB — the core's build peaked at 13.6 and ≈14.8 GiB (two runs, 2026-11-13).
  const swapGb = Math.max(0, Math.ceil((BUILD_TOTAL_MB - (probe?.ramMb ?? 0) - (probe?.swapMb ?? 0)) / 1024))
  const diskNeed = copyGb + REBUILT_GB + swapGb
  const disk = probe?.diskFreeGb ?? 0
  add('disk', disk < diskNeed ? 'fail' : disk < diskNeed + 10 ? 'warn' : 'ok', disk, diskNeed)
  // 738-1 (the owner, 2026-11-14): «сервер как минимум 8 ГБ и четыре ядра» — below it the node still installs (prepare adds swap), and
  // the person hears the numbers.
  add('cores', (probe?.cores ?? 1) < 4 ? 'warn' : 'ok', probe?.cores ?? 1, 4)
  add('ram', (probe?.ramMb ?? 0) < 7400 ? 'warn' : 'ok', probe?.ramMb ?? 0, 8192)
  const portsBusy = (probe?.port80Busy || probe?.port443Busy) && !probe?.nginx
  add('ports', portsBusy ? 'fail' : 'ok')
  // 🔒 ANOTHER SITE ON THIS NGINX IS A REFUSAL, NOT A WARNING: the node's site takes `default_server` on 80 and its own names, and the
  // file `sites-available/fractera` — prepare would break what lives there. The person frees the server (or says it may go) first.
  const sites = Array.isArray(probe?.foreignSites) ? probe.foreignSites : []
  if (sites.length) add('sites', 'fail', sites.join(', '))
  if ((probe?.pm2Root ?? 0) > 0) add('others', 'warn', probe.pm2Root)
  add('address', probe?.publicIp && probe.publicIp !== host ? 'warn' : 'ok', probe?.publicIp ?? null, host)
  add('systemd', probe?.systemd ? 'ok' : 'warn')
  const level = items.some((i) => i.level === 'fail') ? 'fail' : items.some((i) => i.level === 'warn') ? 'warn' : 'ok'
  return { level, items }
}
