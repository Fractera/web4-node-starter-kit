'use strict'
// THE CONTEXT WINDOW OF AN AGENT'S SESSION — ONE READING (node step 788-1). Read from the session journal on disk, no model, no door:
// the last answer of the model carries its usage (input + cache creation + cache read + output) — that is how full the window is now.
// The CLI (`npm run session -- context`, step 620) and the Telegram Pult's gauge (788-2) read it here, so the two never disagree.
// The owner, 2026-11-18 (Telegram 612): «третий индикатор … расход контекстного окна … общий контекстный окно модели 1 000 000 токенов. И
// процент заполнения».

const { existsSync, readdirSync, readFileSync, statSync } = require('node:fs')
const { homedir } = require('node:os')
const { join } = require('node:path')

/** The window of a model, by its id (skill claude-api's table; `/context` of Claude Code on this subscription — «32.4k/1m», 2026-10-30). */
function windowOf(model) {
  const m = String(model ?? '')
  if (/(fable|mythos|opus-5|sonnet-5|haiku-5|opus-4-[678]|sonnet-4-6)/.test(m)) return 1_000_000
  if (/haiku-4-5/.test(m)) return 200_000
  return null
}

/** Claude Code's journal folder of a working folder; an element on its person's own subscription keeps it in its data (689). */
function journalDir(folder, ownConfigDir = null) {
  const base = ownConfigDir && existsSync(ownConfigDir) ? ownConfigDir : join(homedir(), '.claude')
  return join(base, 'projects', String(folder).replace(/[:\\/]/g, '-'))
}

/**
 * How full the newest session of a folder is: `{ used, window, percent, model, session, at }`; `null` — no journal, or no model answer yet.
 * `window` and `percent` are `null` when the model's window is not known to the node — never a guessed number.
 */
function read(folder, { ownConfigDir = null } = {}) {
  const dir = journalDir(folder, ownConfigDir)
  if (!existsSync(dir)) return null
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
  if (!files.length) return null
  const lines = readFileSync(join(dir, files[0].f), 'utf8').split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    let row = null
    try { row = JSON.parse(lines[i]) } catch { continue }
    if (row?.type !== 'assistant' || !row.message?.usage) continue
    const u = row.message.usage
    const used = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.output_tokens ?? 0)
    const model = String(row.message.model ?? 'unknown')
    const window = windowOf(model)
    return {
      used,
      window,
      percent: window ? Math.round((used / window) * 100) : null,
      model,
      session: files[0].f.replace(/\.jsonl$/, ''),
      at: typeof row.timestamp === 'string' ? row.timestamp : null,
    }
  }
  return null
}

module.exports = { read, windowOf, journalDir }
