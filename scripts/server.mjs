// THE DEDICATED SERVER — ONE COMMAND FOR THE MAIN AGENT AND THE PERSON (node step 737). `npm run server -- <verb>`.
// The owner, 2026-11-13: «шаг за шагом автоматически и по возможности без искусственного интеллекта» — every verb is plain code; the
// main agent only calls it (from Telegram too) and reads the marked last line. Verbs of later substeps join this file.
//   names [--domain <name>] [--root <node folder>]   every public name of the node, its port and its DNS label (737-1)
//   dns   --ip <IPv4> [--domain <name>] [--root …]   the A records to write at the registrar, per zone, with the `*` shortcut (737-1)
//   nginx [--write]                                    the server's nginx site from the names and the certificates present (737-2)
//   phase                                              silent · live · none — this node's phase on a dedicated server (737-4)
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { certFor, parseCertList } from '../lib/hosting/certs.mjs'
import { dnsRecords, nodeNames } from '../lib/hosting/hostnames.mjs'
import { nginxSite } from '../lib/hosting/nginx.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const verb = args[0]
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null
}
const root = path.resolve(opt('root') ?? path.join(here, '..'))
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/

function names() {
  const table = nodeNames({ root, domain: opt('domain') })
  if (!table.zone) {
    console.log('У узла нет домена: имена появятся, когда домен будет выбран (--domain <имя> — посмотреть заранее).')
    console.log('===SERVER_NAMES=== 0 no-domain')
    return
  }
  for (const r of table.rows) {
    const target = r.redirectTo ? `301 → ${r.redirectTo}${r.service ? ` (${r.service}:${r.port})` : ' (nginx)'}` : `${r.service}:${r.port}`
    console.log(`${r.host.padEnd(40)} ${r.label.padEnd(12)} ${r.kind.padEnd(15)} ${target}${r.optional ? '  · по желанию' : ''}`)
  }
  console.log(`===SERVER_NAMES=== ${table.rows.length} ${table.zone}`)
}

function dns() {
  const ip = opt('ip')
  if (!ip || !IPV4.test(ip)) {
    console.error('Нужен IPv4 сервера: --ip 203.0.113.7')
    console.error('===SERVER_DNS_FAILED=== no-ip')
    process.exit(1)
  }
  const table = nodeNames({ root, domain: opt('domain') })
  if (!table.zone) {
    console.log('У узла нет домена — записывать пока нечего.')
    console.log('===SERVER_DNS=== 0 no-domain')
    return
  }
  let count = 0
  for (const group of dnsRecords(table, ip)) {
    console.log(`\nЗона ${group.zone} — записи у регистратора этого домена:`)
    console.log(`  ${'тип'.padEnd(5)}${'имя'.padEnd(14)}значение`)
    for (const r of group.records) {
      console.log(`  ${r.type.padEnd(5)}${r.name.padEnd(14)}${r.value}${r.optional ? '   (по желанию)' : ''}`)
      count += 1
    }
    if (group.wildcard) console.log(`  или одной строкой для всех поддоменов: ${group.wildcard.type} ${group.wildcard.name} ${group.wildcard.value} (плюс @)`)
  }
  console.log(`===SERVER_DNS=== ${count} ${table.zone}`)
}

const HELPER = '/usr/local/sbin/fractera-root'
const readJson = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }

/** The certificates the root helper sees; none on a machine without the helper (the person's computer). */
function certList() {
  if (!existsSync(HELPER)) return []
  const r = spawnSync('sudo', ['-n', HELPER, 'cert-list'], { encoding: 'utf8' })
  return r.status === 0 ? parseCertList(r.stdout) : []
}

function nginxVersion() {
  const r = spawnSync('nginx', ['-v'], { encoding: 'utf8' })
  return String(r.stderr || r.stdout || '').match(/nginx\/([\d.]+)/)?.[1] ?? '1.24.0'
}

function nginx() {
  const table = nodeNames({ root })
  const list = certList()
  const certs = Object.fromEntries(table.rows.map((r) => [r.host, certFor(r.host, list)]).filter(([, c]) => c))
  const server = readJson(path.join(root, 'data', 'node', 'server.json')) ?? {}
  const architect = table.rows.find((r) => r.kind === 'architect')?.host ?? table.zone
  const text = nginxSite({ table, certs, active: server.domainActive === true, architectHost: architect, ipv6: existsSync('/proc/net/if_inet6'), nginxVersion: nginxVersion() })
  if (!args.includes('--write')) { process.stdout.write(text); return }
  const dir = path.join(root, 'data', 'node', 'server-side', 'nginx')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'fractera.conf'), text)
  console.log(`===SERVER_NGINX=== written ${table.rows.length} names, ${Object.keys(certs).length} with a certificate`)
}

function phase() {
  const { nodePhase } = createRequire(import.meta.url)('../lib/hosting/phase.cjs')
  console.log(`===SERVER_PHASE=== ${nodePhase(root) ?? 'none'}`)
}

const verbs = { names, dns, nginx, phase }
if (!verbs[verb]) {
  console.log('Команды: names · dns · nginx · phase   (npm run server -- names --domain example.org)')
  process.exit(verb ? 1 : 0)
}
verbs[verb]()
