// THE DEDICATED SERVER — ONE COMMAND FOR THE MAIN AGENT AND THE PERSON (node step 737). `npm run server -- <verb>`.
// The owner, 2026-11-13: «шаг за шагом автоматически и по возможности без искусственного интеллекта» — every verb is plain code; the
// main agent only calls it (from Telegram too) and reads the marked last line. Verbs of later substeps join this file.
//   names [--domain <name>] [--root <node folder>]   every public name of the node, its port and its DNS label (737-1)
//   dns   --ip <IPv4> [--domain <name>] [--root …]   the A records to write at the registrar, per zone, with the `*` shortcut (737-1)
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dnsRecords, nodeNames } from '../lib/hosting/hostnames.mjs'

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

const verbs = { names, dns }
if (!verbs[verb]) {
  console.log('Команды: names · dns   (npm run server -- names --domain example.org)')
  process.exit(verb ? 1 : 0)
}
verbs[verb]()
