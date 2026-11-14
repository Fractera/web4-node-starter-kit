// THE RECORD OF WHERE THE NODE LIVES — WRITTEN BY THE INSTALLATION (node step 741-2). `node scripts/place-record.mjs <--home | --server |
// --migrate | --show> [--root <node folder>]`.
//   --home     the person's computer: `scripts/launch.mjs`, once, when no record exists (a server's record is never turned into «home»);
//   --server   a dedicated server: `scripts/dedicated-server/install.sh`, its first stage — the act that makes a server says so;
//   --migrate  a node installed before 741: `serve.mjs start` — from the launch's mark or the measurement; never over a version-2 record;
//   --show     what the node answers now (`lib/hosting/place.mjs` `nodePlace`).
// Prints one marked line: `===PLACE=== <kind> <source> <detail>`.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migratePlaceRecord, nodePlace, readPlaceRecord, writePlaceRecord } from '../lib/hosting/place.mjs'

const args = process.argv.slice(2)
const at = args.indexOf('--root')
const root = path.resolve(at >= 0 && args[at + 1] ? args[at + 1] : path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))

if (args.includes('--server')) writePlaceRecord(root, 'server', 'dedicated-server')
else if (args.includes('--home')) { if (!readPlaceRecord(root)) writePlaceRecord(root, 'home', 'launch') }
else if (args.includes('--migrate')) migratePlaceRecord(root)
else if (!args.includes('--show')) { console.error('usage: place-record.mjs --home | --server | --migrate | --show [--root <folder>]'); process.exit(2) }

const p = nodePlace(root)
console.log(`===PLACE=== ${p.kind} ${p.source} ${p.detail}${p.mismatch ? ` (measured: ${p.mismatch})` : ''}${p.foreign ? ' (the record came from another machine)' : ''}`)
