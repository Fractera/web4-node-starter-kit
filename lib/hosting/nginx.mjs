// THE SERVER'S NGINX — GENERATED, NEVER EDITED BY HAND (node step 737-2). One file `/etc/nginx/sites-available/fractera`, written from
// the table of names (`hostnames.mjs`) and the certificates present; the next generation replaces it whole.
// 🔒 STAGES ARE STATES OF ONE FUNCTION, NOT TWO FILES: the bare IP always answers (a card and `/api/health` before the switch-on — 741-1;
// the core itself is not shown by IP); a name with its certificate answers on 443 and sends 80 to 443; a name without one answers 503
// «being connected» on 80 and keeps only the ACME path open; an unknown name on 443 meets the default server and is refused. ✗ The old wizard wrote an «HTTP stub» for certbot and the final
// HTTPS file in two places, and a failed certbot run left the stub live with nothing on 443 (b5641206).
// 🔒 THE EDGE LAW (`edge.mjs`): every `server {}` refuses loopback names with 444, every proxied location sets the edge mark and passes
// its own name (741-1), never `$host`.
// 🔒 NO `ssl_stapling`: Let's Encrypt certificates carry CRL only, no OCSP (letsencrypt.org/docs/profiles, 2026-10-04) — the old file's
// stapling lines would only print warnings now.
// 🔒 ONLY VALIDATED VALUES ENTER THE FILE: host names from the table (RFC rules + the node's policy), integer ports, fixed paths.
// 🔒 741-1 (the owner approved 2026-11-14: «да, утверждаю 741 и D31–D37 -> go») — THE NAME THE NODE TRUSTS IS THE ONE NGINX MATCHED,
// NEVER THE CLIENT'S. ✗ Measured on the test server that day: `$host` carried any name the client chose into `Host` and
// `X-Forwarded-Host`; `Host: fractera.ai` made the core AND the root element grant the showcase session with every role, `Host:
// x.trycloudflare.com` or any IP literal the architect read of a temporary address (`development-steps/new-steps/741/probes`). Now a
// named `server {}` passes its own validated name; the bare IP passes the address it was reached at and shows only a card and `/api/health`
// (D31); a name this server does not own is refused on 443 by a default server (nginx routes an unmatched name to the default server
// of the port — nginx.org, «How nginx processes a request»).
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

const atLeast = (version, [x, y, z]) => {
  const [a, b, c] = String(version ?? '').split('.').map((n) => Number.parseInt(n, 10) || 0)
  return a !== x ? a > x : b !== y ? b > y : c >= z
}

/** `1.25.1` or newer takes `http2 on;` — older ones take `listen … ssl http2`. */
export function http2Directive(version) {
  return atLeast(version, [1, 25, 1]) ? 'modern' : 'legacy'
}

/** `ssl_reject_handshake` exists from nginx 1.19.4 (nginx.org); Ubuntu 22.04 and Debian 11 ship 1.18.0 — they get a certificate instead. */
export function rejectHandshake(version) {
  return atLeast(version, [1, 19, 4])
}

/** The bare IP's own name for the core: the address the request came to, IPv6 in brackets (a `map` at the top of the file). */
const IP_HOST = '$fractera_ip_host'

const refuseLoopback = ['    # 737-2: a loopback name never comes from outside (lib/hosting/edge.mjs).', `    if ($host ~* "${LOOPBACK_RE}") { return 444; }`]
const acme = [`    location ^~ /.well-known/acme-challenge/ { root ${ACME_ROOT}; default_type "text/plain"; }`]

// The core listens on the NAME `localhost` (server.js: `HOST || 'localhost'`; macOS resolves it to ::1, Ubuntu to 127.0.0.1), the
// elements on `127.0.0.1` (services-install.mjs) — so the core's upstream is the name, and nginx tries every address it resolves to.
// `name` — the own validated host name of its `server {}`, or `IP_HOST` for the bare IP; never `$host` (741-1).
function proxied(match, port, upstream, name) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`bad port ${port}`)
  if (name !== IP_HOST && !isHostName(name)) throw new Error(`bad name ${name}`)
  return [
    `    location ${match} {`,
    `        proxy_pass http://${upstream}:${port};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Upgrade $http_upgrade;',
    '        proxy_set_header Connection $fractera_connection_upgrade;',
    `        proxy_set_header Host ${name};`,
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    `        proxy_set_header X-Forwarded-Host ${name};`,
    `        proxy_set_header ${EDGE_HEADER} 1;`,
    '        proxy_read_timeout 86400;',
    '        proxy_buffering off;',
    // 737 (found answering the owner, 2026-11-13): a core rebuild stops every process of the node for ~12 minutes; nginx would answer
    // a bare 502. A 503 page «the node is updating» with Retry-After is honest to people and to search engines.
    `        error_page 502 504 =503 ${MAINT_PAGE};`,
    '    }',
  ]
}
const maintenance = [`    location = ${MAINT_PAGE} { root ${MAINT_ROOT}; internal; add_header Retry-After 120 always; add_header Cache-Control "no-store" always; }`]

function proxy(port, upstream, name) {
  return [...proxied('/', port, upstream, name), ...maintenance]
}

// 741-1, D31 (approved 2026-11-14): THE BARE IP SHOWS A CARD, NOT THE NODE. The launch page and its tooling never use the IP (they reach
// the server by SSH and loopback; the page links only https names), while the IP is permanent and scanned around the clock — the
// read-only panel the quick tunnel's random, hour-lived name may show is not shown here. Public facts only: what this is, where it will
// answer. nginx's `return` text may carry variables, so no `$`, no quote and no backslash can enter it (the zone is a validated name).
function ipCard(zone) {
  const at = zone && isHostName(zone) ? `https://${zone}` : null
  const en = at ? `This Fractera node is being connected. Its address will be ${at}` : 'This Fractera node is being connected to its domain.'
  const ru = at ? `Узел Fractera подключается. Его адрес будет ${at}` : 'Узел Fractera подключается к своему домену.'
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Fractera</title></head>'
    + '<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.5">'
    + `<h1>Fractera</h1><p>${en}</p><p lang="ru">${ru}</p></body></html>`
  if (/['\\$]/.test(html)) throw new Error('the IP card cannot carry a quote, a backslash or a $')
  return [`    location / { default_type "text/html; charset=utf-8"; add_header Cache-Control "no-store" always; add_header X-Robots-Tag "noindex" always; return 200 '${html}'; }`]
}

const listen80 = (ipv6, extra = '') => [`    listen 80${extra};`, ...(ipv6 ? [`    listen [::]:80${extra};`] : [])]

function listen443(ipv6, version, extra = '') {
  const modern = http2Directive(version) === 'modern'
  const tail = (modern ? ' ssl' : ' ssl http2') + extra
  return [`    listen 443${tail};`, ...(ipv6 ? [`    listen [::]:443${tail};`] : []), ...(modern ? ['    http2 on;'] : [])]
}

// 741-1: the default server of 443 — a name this server does not own ends here. ✗ Without it the FIRST named `server {}` was the default and
// served any name with its own certificate (measured: SNI `nobody.invalid` → CN=aifa.dev, `Host: fractera.ai` → the root element's
// showcase session). From 1.19.4 the handshake itself is refused; older nginx needs a certificate to answer at all, so it shows the
// first real one (a public name anyway) and drops the request.
function default443(ipv6, version, firstCert) {
  const out = ['', '# 741-1: a name this server does not own never reaches the node on 443.', 'server {',
    ...listen443(ipv6, version, ' default_server'), '    server_name _;']
  if (rejectHandshake(version)) out.push('    ssl_reject_handshake on;')
  else out.push(`    ssl_certificate ${firstCert.fullchain};`, `    ssl_certificate_key ${firstCert.privkey};`)
  out.push('    return 444;', '}')
  return out
}

/** A certificate path pair that may enter the file — absolute, no whitespace, no `;`, no braces. */
const safeCert = (c) => Boolean(c) && c.fullchain.startsWith('/') && c.privkey.startsWith('/') && !/[;\s{}]/.test(c.fullchain + c.privkey)

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
    `map $server_addr ${IP_HOST} { "~:" "[$server_addr]"; default $server_addr; }`,
    'ssl_session_cache shared:fractera_ssl:10m;',
    '',
    '# The bare IP (and any unknown name): a card and /api/health — or, once the domain is switched on, a redirect to it (741-1, D31).',
    'server {',
    ...listen80(ipv6, ' default_server'),
    '    server_name _;',
    `    client_max_body_size ${BODY};`,
    ...refuseLoopback,
    ...acme,
    ...(active && architectHost && isHostName(architectHost)
      ? ['    location / { return 301 https://' + architectHost + '$request_uri; }']
      : [...proxied('= /api/health', table.corePort, 'localhost', IP_HOST), ...maintenance, ...ipCard(table.zone)]),
    '}',
  ]
  let firstCert = null
  for (const row of table.rows) {
    if (!isHostName(row.host)) continue
    const cert = certs[row.host]
    out.push('', `# ${row.host}`)
    // 737-15 (the owner, 2026-11-13: «До завершения переезда у нас CloudFlare поддерживает статическую видимость этих страниц»): until the
    // node lives on this server every name answers 503 — Cloudflare's copy then serves the page (its Worker: «home first, the copy as the
    // spare»), never the silent rehearsal; the ACME path stays open, so certificates are issued before the move.
    if (!live) {
      out.push('server {', ...listen80(ipv6), `    server_name ${row.host};`, ...refuseLoopback, ...acme, `    location / { ${HOLD} }`, '}')
      if (safeCert(cert)) {
        firstCert ??= cert
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
    if (!safeCert(cert)) throw new Error(`bad certificate path for ${row.host}`)
    firstCert ??= cert
    const target = row.service === null && row.redirectTo && isHostName(row.redirectTo)
      ? ['    location / { return 301 https://' + row.redirectTo + '$request_uri; }']
      : proxy(row.port, row.service === 'core' ? 'localhost' : '127.0.0.1', row.host)
    out.push(
      'server {', ...listen80(ipv6), `    server_name ${row.host};`, ...refuseLoopback, ...acme,
      `    location / { return 301 https://${row.host}$request_uri; }`, '}',
      'server {', ...listen443(ipv6, nginxVersion), `    server_name ${row.host};`,
      `    ssl_certificate ${cert.fullchain};`, `    ssl_certificate_key ${cert.privkey};`,
      '    ssl_protocols TLSv1.2 TLSv1.3;', `    client_max_body_size ${BODY};`, ...refuseLoopback, ...target, '}',
    )
  }
  if (firstCert) out.push(...default443(ipv6, nginxVersion, firstCert))
  return out.join('\n') + '\n'
}

/** The paths certbot gives one lineage per name (`--cert-name <host>`). */
export function letsEncryptPaths(host) {
  if (!isHostName(host)) throw new Error(`bad host ${host}`)
  return { fullchain: `${LE_LIVE}/${host}/fullchain.pem`, privkey: `${LE_LIVE}/${host}/privkey.pem` }
}
