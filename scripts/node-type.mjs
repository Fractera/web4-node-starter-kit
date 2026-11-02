// ТИП УЗЛА — КОМАНДА (553-1). Запуск из корня узла: `npm run node-type -- get | set <project|factory> | look <id> <own|project>`.
//
// 🎯 Слово владельца 2026-10-21: два типа узла — «Единый проект» и «Завод приложений», тип хранится в реестре узла; по умолчанию —
// единый проект. Знание о типе — `lib/web4-items/node-type.cjs`; здесь только печать и вызов двери связей ядра.
// 🔒 Тип меняет человек (или главный агент по его слову). Существующие элементы команда НЕ переключает — печатает, какие стоят
// вопреки умолчанию типа, и как переключить каждый (`look` — та же дверь, что карточки связей на странице элемента).

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { TYPES, readNodeType, writeNodeType, mismatches, ownWallets } = require('../lib/web4-items/node-type.cjs')

// Корень узла — от расположения скрипта: команду зовёт и главный агент из своей папки (data/main-agent).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const fail = (m) => { console.log(`NODE_TYPE_FAILED: ${m}`); process.exit(1) }

const MEANING = {
  project: 'one owner; every element lives under the core\'s CONFIG (one header and footer)',
  factory: 'a hosting of projects of different owners; new custom elements are born on their own settings; the core and native elements stay under CONFIG',
}

function report() {
  const type = readNodeType(ROOT)
  console.log(`type: ${type} — ${MEANING[type]}`)
  // 553-6: единый проект — кошелёк один, кошелёк узла.
  const wallets = type === 'project' ? ownWallets(ROOT) : []
  if (wallets.length) console.log(`own wallets: ${wallets.join(', ')} — the node is a single project; remove each on its Settings → Payments → Web3 page`)
  const odd = mismatches(type, ROOT)
  if (!odd.length) {
    console.log('every born custom element already follows this type')
    return type
  }
  const want = type === 'factory' ? 'own' : 'project'
  console.log(`born custom elements that differ from the default of this type (CONFIG ${type === 'factory' ? 'on' : 'off'}) — switch each one only by the owner's word:`)
  for (const x of odd) console.log(`- ${x.id}${x.address !== x.id ? ` (${x.address})` : ''} · CONFIG ${x.config ? 'on' : 'off'} → npm run node-type -- look ${x.id} ${want}`)
  return type
}

const [cmd, a, b] = process.argv.slice(2)

if (cmd === 'get' || !cmd) {
  report()
  process.exit(0)
}

if (cmd === 'set') {
  if (!TYPES.includes(a)) fail(`type «${a ?? ''}» — not one of: ${TYPES.join(' | ')}`)
  try { writeNodeType(a, ROOT) } catch (e) { fail(`the registry is not written: ${e.message}`) }
  console.log(`===NODE_TYPE_OK=== ${report()}`)
  process.exit(0)
}

if (cmd === 'look') {
  if (!a) fail('look <id> <own|project>')
  if (b !== 'own' && b !== 'project') fail(`look «${b ?? ''}» — not one of: own | project`)
  let port = 24680
  try { port = JSON.parse(readFileSync(join(ROOT, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* ядро ещё не писало — порт по умолчанию */ }
  const on = b === 'project'
  for (const kind of ['config', 'design']) {
    let r
    try {
      r = await fetch(`http://localhost:${port}/api/architect/items/${encodeURIComponent(a)}/links`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, on }),
      })
    } catch { fail('the core is not running') }
    console.log(`${kind} ${on ? 'on' : 'off'}: ${r.status} ${(await r.text()).slice(0, 300)}`)
  }
  process.exit(0)
}

fail(`unknown command «${cmd}» — get | set <project|factory> | look <id> <own|project>`)
