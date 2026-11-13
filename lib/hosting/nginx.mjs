// THE SERVER'S NGINX — GENERATED, NEVER EDITED BY HAND (node step 737-2). One file `/etc/nginx/sites-available/fractera`, written from
// the table of names (`hostnames.mjs`) and the certificates present; the next generation replaces it whole.
// 🔒 STAGES ARE STATES OF ONE FUNCTION, NOT TWO FILES: the bare IP always answers (the core, read-only by the law of temporary
// addresses — `components/shell/temporary-host.ts`); a name with its certificate answers on 443 and sends 80 to 443; a name without one
// answers 503 «being connected» on 80 and keeps only the ACME path open. ✗ The old wizard wrote an «HTTP stub» for certbot and the final
// HTTPS file in two places, and a failed certbot run left the stub live with nothing on 443 (b5641206).
// 🔒 THE EDGE LAW (`edge.mjs`): every `server {}` refuses loopback names with 444, every proxied location sets the edge mark.
// 🔒 NO `ssl_stapling`: Let's Encrypt certificates carry CRL only, no OCSP (letsencrypt.org/docs/profiles, 2026-10-04) — the old file's
// stapling lines would only print warnings now.
// 🔒 ONLY VALIDATED VALUES ENTER THE FILE: host names from the table (RFC rules + the node's policy), integer ports, fixed paths.
import { EDGE_HEADER } from './edge.mjs'
import { isHostName } from './hostnames.mjs'

export const ACME_ROOT = '/var/www/fractera-acme'
export const SITE_NAME = 'fractera'
export const LE_LIVE = '/etc/letsencrypt/live'
export const OWN_CERTS = '/etc/fractera/certs'
/** The «the node is updating» page — copied there by `fractera-root nginx-apply` from scripts/dedicated-server/updating.html. */
export const MAINT_ROOT = '/var/www/fractera-maint'
export const MAINT_PAGE = '/.fractera-updating.html'
const BODY = '200m' // uploads to the storage element; the easy starter's measured limit (nginx's 1 MB default killed media uploads)
const LOOPBACK_RE = '^(localhost|127(\\.[0-9]+){3}|\\[::1\\])$'
const HOLD = 'default_type "text/plain"; add_header Retry-After 300 always; return 503 "This site is moving to its own server and will be back shortly.\\n";'

/** `1.25.1` or newer takes `http2 on;` — older ones take `listen … ssl http2`. */
export function http2Directive(version) {
  const [a, b, c] = String(version ?? '').split('.').map((n) => Number.parseInt(n, 10) || 0)
  return a > 1 || (a === 1 && (b > 25 || (b === 25 && c >= 1))) ? 'modern' : 'legacy'
}

const refuseLoopback = ['    # 737-2: a loopback name never comes from outside (lib/hosting/edge.mjs).', `    if ($host ~* "${LOOPBACK_RE}") { return 444; }`]
const acme = [`    location ^~ /.well-known/acme-challenge/ { root ${ACME_ROOT}; default_type "text/plain"; }`]

// The core listens on the NAME `localhost` (server.js: `HOST || 'localhost'`; macOS resolves it to ::1, Ubuntu to 127.0.0.1), the
// elements on `127.0.0.1` (services-install.mjs) — so the core's upstream is the name, and nginx tries every address it resolves to.
function proxy(port, upstream = '127.0.0.1') {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`bad port ${port}`)
  return [
    '    location / {',
    `        proxy_pass http://${upstream}:${port};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Upgrade $http_upgrade;',
    '        proxy_set_header Connection $fractera_connection_upgrade;',
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '        proxy_set_header X-Forwarded-Host $host;',
    `        proxy_set_header ${EDGE_HEADER} 1;`,
    '        proxy_read_timeout 86400;',
    '        proxy_buffering off;',
    // 737 (found answering the owner, 2026-11-13): a core rebuild stops every process of the node for ~12 minutes; nginx would answer
    // a bare 502. A 503 page «the node is updating» with Retry-After is honest to people and to search engines.
    `        error_page 502 504 =503 ${MAINT_PAGE};`,
    '    }',
    `    location = ${MAINT_PAGE} { root ${MAINT_ROOT}; internal; add_header Retry-After 120 always; add_header Cache-Control "no-store" always; }`,
  ]
}

const listen80 = (ipv6, extra = '') => [`    listen 80${extra};`, ...(ipv6 ? [`    listen [::]:80${extra};`] : [])]

function listen443(ipv6, version) {
  const modern = http2Directive(version) === 'modern'
  const tail = modern ? ' ssl' : ' ssl http2'
  return [`    listen 443${tail};`, ...(ipv6 ? [`    listen [::]:443${tail};`] : []), ...(modern ? ['    http2 on;'] : [])]
}

/**
 * The whole site file.
 * @param {{ table: { zone: string|null, corePort: number, rows: Array<{ host: string, service: string|null, port: number|null, redirectTo: string|null }> },
 *   certs?: Record<string, { fullchain: string, privkey: string }>, active?: boolean, architectHost?: string|null,
 *   ipv6?: boolean, nginxVersion?: string, generatedAt?: string }} input
 */
export function nginxSite(input) {
  const { table, certs = {}, active = false, architectHost = null, ipv6 = true, nginxVersion = '1.24.0', live = true } = input
  const at = input.generatedAt ?? new Date().toISOString()
  const out = [
    `# Managed by the Fractera node (step 737) — generated ${at}. Any change here disappears at the next generation:`,
    '# the names come from `npm run server -- names`, the certificates from `npm run server -- certs`.',
    'map $http_upgrade $fractera_connection_upgrade { default upgrade; \'\' close; }',
    'ssl_session_cache shared:fractera_ssl:10m;',
    '',
    '# The bare IP (and any unknown name): the core, read-only — or, once the domain is switched on, a redirect to it.',
    'server {',
    ...listen80(ipv6, ' default_server'),
    '    server_name _;',
    `    client_max_body_size ${BODY};`,
    ...refuseLoopback,
    ...acme,
    ...(active && architectHost && isHostName(architectHost)
      ? ['    location / { return 301 https://' + architectHost + '$request_uri; }']
      : proxy(table.corePort, 'localhost')),
    '}',
  ]
  for (const row of table.rows) {
    if (!isHostName(row.host)) continue
    const cert = certs[row.host]
    out.push('', `# ${row.host}`)
    // 737-15 (the owner, 2026-11-13: «До завершения переезда у нас CloudFlare поддерживает статическую видимость этих страниц»): until the
    // node lives on this server every name answers 503 — Cloudflare's copy then serves the page (its Worker: «home first, the copy as the
    // spare»), never the silent rehearsal; the ACME path stays open, so certificates are issued before the move.
    if (!live) {
      out.push('server {', ...listen80(ipv6), `    server_name ${row.host};`, ...refuseLoopback, ...acme, `    location / { ${HOLD} }`, '}')
      if (cert && cert.fullchain.startsWith('/') && cert.privkey.startsWith('/') && !/[;\s{}]/.test(cert.fullchain + cert.privkey)) {
        out.push('server {', ...listen443(ipv6, nginxVersion), `    server_name ${row.host};`, `    ssl_certificate ${cert.fullchain};`,
          `    ssl_certificate_key ${cert.privkey};`, '    ssl_protocols TLSv1.2 TLSv1.3;', ...refuseLoopback, `    location / { ${HOLD} }`, '}')
      }
      continue
    }
    if (!cert) {
      out.push('server {', ...listen80(ipv6), `    server_name ${row.host};`, ...refuseLoopback, ...acme,
        '    location / { default_type "text/plain"; return 503 "This name is being connected to the node: its certificate is not issued yet.\\n"; }',
        '}')
      continue
    }
    if (!cert.fullchain.startsWith('/') || !cert.privkey.startsWith('/') || /[;\s{}]/.test(cert.fullchain + cert.privkey)) {
      throw new Error(`bad certificate path for ${row.host}`)
    }
    const target = row.service === null && row.redirectTo && isHostName(row.redirectTo)
      ? ['    location / { return 301 https://' + row.redirectTo + '$request_uri; }']
      : proxy(row.port, row.service === 'core' ? 'localhost' : '127.0.0.1')
    out.push(
      'server {', ...listen80(ipv6), `    server_name ${row.host};`, ...refuseLoopback, ...acme,
      '    location / { return 301 https://$host$request_uri; }', '}',
      'server {', ...listen443(ipv6, nginxVersion), `    server_name ${row.host};`,
      `    ssl_certificate ${cert.fullchain};`, `    ssl_certificate_key ${cert.privkey};`,
      '    ssl_protocols TLSv1.2 TLSv1.3;', `    client_max_body_size ${BODY};`, ...refuseLoopback, ...target, '}',
    )
  }
  return out.join('\n') + '\n'
}

/** The paths certbot gives one lineage per name (`--cert-name <host>`). */
export function letsEncryptPaths(host) {
  if (!isHostName(host)) throw new Error(`bad host ${host}`)
  return { fullchain: `${LE_LIVE}/${host}/fullchain.pem`, privkey: `${LE_LIVE}/${host}/privkey.pem` }
}
