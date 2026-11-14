// GUARD: THE WORDS «YOUR SERVER IS READY» ONLY UNDER A PASSED FINAL CHECK (node step 744-6). `npm run check:ready-words`, in the prebuild.
// The owner, 2026-11-14: «мы не должны говорить пользу о том что сервер доступен если все сертификаты безопасности не установлены и на
// последнем этапе заключительной проверки … мы эти проверки не завершили».
// Rule A — of the files that take the launch words (`ServerLaunchWords`), only the last steps' file reads their `ready` group.
// Rule B — in that file the words that call the server usable (`done` · `links` · `site` · `panel` · `signin` · `next`) and the architect's
//          code (`<Claim`) are drawn only inside `ReadyWords`; `ReadyStep` draws `<ReadyWords` once, under `final.ok ?`, with
//          `final = finalCheck(state)` (`lib/hosting/final-check.mjs`); no other function of the file reads `words.ready`.
// Negative controls in `scripts/final-check.test.mjs` (a ready word planted before the check, the check removed, another file reading them).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const END = 'components/hosting/server-launch-end.client.tsx'
const DICT = 'components/hosting/server-launch.i18n.ts'
const USABLE = /\bw\.(?:done|links|site|panel|signin|next)\b|<Claim\b/

/** The text of a top-level function of the file (from its line to the closing brace at column 0), or null. */
function fnText(text, name) {
  const at = text.search(new RegExp(`^(?:export )?function ${name}\\(`, 'm'))
  if (at < 0) return null
  const end = text.indexOf('\n}\n', at)
  return text.slice(at, end < 0 ? text.length : end + 2)
}

/** @param {Array<[string, string]>} files `[path from the root, text]` @returns {string[]} the problems, none when clean */
export function readyWordsProblems(files) {
  const out = []
  for (const [rel, text] of files) {
    if (rel === END || rel === DICT || !/\bServerLaunchWords\b/.test(text)) continue
    if (/\bwords\.ready\b|\.ready\.(?:done|links|site|panel|signin|next|claim\w*)\b/.test(text)) out.push(`${rel}: reads the ready words of the launch — only ${END} may (744-6)`)
  }
  const end = files.find(([rel]) => rel === END)?.[1]
  if (!end) return [...out, `${END}: missing — the last steps of the launch live there`]
  const step = fnText(end, 'ReadyStep')
  const words = fnText(end, 'ReadyWords')
  if (!step || !words) return [...out, `${END}: ReadyStep and ReadyWords must both be there`]
  if (USABLE.test(step)) out.push(`${END}: ReadyStep draws a ready word or the architect's code itself — only ReadyWords may, under the final check`)
  if (!/const final = finalCheck\(state\)/.test(step)) out.push(`${END}: ReadyStep does not take the final check (const final = finalCheck(state))`)
  const draws = step.match(/<ReadyWords\b/g) ?? []
  if (draws.length !== 1 || !/\{\s*final\.ok\s*\?\s*<ReadyWords\b/.test(step)) out.push(`${END}: ReadyWords must be drawn once, under {final.ok ? <ReadyWords …`)
  if ((end.match(/<ReadyWords\b/g) ?? []).length !== 1) out.push(`${END}: ReadyWords drawn outside ReadyStep`)
  const rest = end.replace(step, '').replace(words, '').replace(fnText(end, 'Claim') ?? '', '')
  if (/\bwords\.ready\b/.test(rest)) out.push(`${END}: a function other than ReadyStep, ReadyWords and Claim reads words.ready`)
  return out
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs)$/.test(n) ? [p] : []
})
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = ['components', 'app'].flatMap((d) => walk(join(ROOT, d))).map((p) => [relative(ROOT, p), readFileSync(p, 'utf8')])
  const problems = readyWordsProblems(files)
  if (problems.length) {
    for (const p of problems) console.error(`  ✗ ${p}`)
    console.error(`===READY_WORDS_FAILED=== ${problems.length}`)
    process.exit(1)
  }
  console.log('===READY_WORDS_OK=== the ready words only under the final check')
}
