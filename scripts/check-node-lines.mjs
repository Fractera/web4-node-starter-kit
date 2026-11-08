// СТОРОЖ ПРОТОКОЛА СООБЩЕНИЙ УЗЛА АГЕНТУ (шаг 698). Каждое системное сообщение узла агенту начинается шапкой
// `⟦node · <вид> · <элемент> · <ЧЧ:ММ>⟧` из закрытого списка (`lib/agent-kit/node-line.cjs`, каталог — `lib/agent-kit/NODE-LINES.md`).
// Сторож ищет в коде ядра текст, начатый словами «Node:» или «Узел:» в шаблонной строке, и требует перед ним `nodeLine.head(…)` на той же
// строке; и сверяет, что каждый вид из KINDS назван в каталоге. Нарушение роняет сборку (код 1).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const files = execFileSync('git', ['ls-files', 'lib', 'scripts', 'app/api'], { cwd: ROOT, encoding: 'utf8' }).split('\n')
  .filter((f) => /\.(c|m)?js$|\.ts$/.test(f) && !f.endsWith('check-node-lines.mjs'))
const bad = []
for (const f of files) {
  readFileSync(join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return
    for (const m of line.matchAll(/`(?:\$\{[^}]*\})?(Node:|Узел:)/g)) {
      if (!/nodeLine\.head\(/.test(line.slice(0, m.index + m[0].length))) bad.push(`${f}:${i + 1}: «${m[1]}» without nodeLine.head(…)`)
    }
  })
}
const { KINDS } = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'node-line.cjs'))
const doc = readFileSync(join(ROOT, 'lib', 'agent-kit', 'NODE-LINES.md'), 'utf8')
for (const k of Object.keys(KINDS)) if (!doc.includes(`\`${k}\``)) bad.push(`lib/agent-kit/NODE-LINES.md: the kind «${k}» is not in the catalogue`)
if (bad.length) { console.log(bad.join('\n')); console.log(`===NODE_LINES_FAILED=== ${bad.length}`); process.exit(1) }
console.log(`===NODE_LINES_OK=== ${Object.keys(KINDS).length} kinds, every node message to an agent carries its head (${files.length} files)`)
