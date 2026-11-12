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
// 731: `context-reset` is born only by the main agent's `session clear --continue` (an element's `npm run reset` always continues). Where
// the main agent is told how to reset itself, the words must name --continue — ✗ 2026-11-12 09:48 it took the bare row and stayed dark.
const clearRow = JSON.parse(readFileSync(join(ROOT, 'lib', 'agent-kit', 'commands.json'), 'utf8')).commands.find((c) => c.id === 'clear')
// 732: the main agent's colour marks (the owner 2026-11-12, variant A) — CLAUDE.md §1 must keep all five, the five-mark line is how the
// owner reads the feed; a seal alone would let a resealed edit drop them silently.
{
  const md = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
  for (const m of ['🟡🟡🟡', '🟢', '🟠', '🔴 a problem that still needs', '🔴🔴🔴']) if (!md.includes(m)) bad.push(`CLAUDE.md §1: the colour mark «${m}» is missing (step 732)`)
}
if (!/YOUR OWN reset[^]*session -- clear --continue/.test(clearRow?.run ?? '')) bad.push('lib/agent-kit/commands.json «clear»: the main agent\'s own reset must name npm run session -- clear --continue')
if (!/'npm run session -- clear --continue'/.test(readFileSync(join(ROOT, 'lib', 'agent-kit', 'window.cjs'), 'utf8'))) bad.push('lib/agent-kit/window.cjs: the window line must name npm run session -- clear --continue')
if (bad.length) { console.log(bad.join('\n')); console.log(`===NODE_LINES_FAILED=== ${bad.length}`); process.exit(1) }
console.log(`===NODE_LINES_OK=== ${Object.keys(KINDS).length} kinds, every node message to an agent carries its head (${files.length} files)`)
