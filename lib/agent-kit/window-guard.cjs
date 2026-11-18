// 781-7 — THE WINDOW GUARD: a person's act asked in a chat line is refused until the window exists.
//
// The owner, 2026-11-18 ~11:10 UTC: «каждый раз когда нужно вести ключ API, Taken логин или пароль … а самое главное команды который
// начинается с! Ты должен использовать внутреннее нативные уведомления … почему ты не вывел это уведомление автоматически? … есть ли у
// тебя сторож … Который ловит! В чате и проверяет создалось ли уведомление или … это должен быть сознательное отклонение».
// ✗ Why (measured the same morning): the rule lived only in text (CLAUDE.md §6, the skill act-with-the-person, the agent's memory),
// while Claude Code's own system prompt tells every session «suggest they type `! <command>`» — the main agent followed it, never
// loaded the skill, and nothing read its answer.
//
// Pure functions, no network, no model: `actsIn(text)` finds a person's act in an answer; `turnOf(entries)` cuts the current turn out of a
// Claude Code transcript; `verdict(...)` says pass / refuse. The hook `.claude/hooks/window-guard.mjs` runs them on Stop (the terminal)
// and before the Telegram `reply`. A conscious deviation is the line «⟦без окна: <why>⟧» (or «⟦no window: <why>⟧») in the answer.

'use strict'

// A command the person types — a line or a code span that starts with «!» and a command word (Claude Code's own `!` prefix).
const BANG_WORDS = 'cd|npm|npx|node|sudo|git|ls|pm2|claude|brew|curl|bash|sh|zsh|open|cat|echo|export|python3?|pip3?|bun|launchctl|cloudflared|ssh|kill|rm|mv|cp|chmod|defaults'
const BANG_LINE = new RegExp(`(^|\\n)[ \\t>*\\-]*\`*[ \\t]*!\\s?(${BANG_WORDS})\\b`, 'i')
const BANG_INLINE = /`!\s?[^`\s][^`]*`/
// Claude Code's own slash commands the person would type in the terminal.
const SLASH = /(^|[\s`«"(])\/(mcp|login|logout|telegram:[a-z-]+|permissions|config|doctor)\b/i
// JavaScript's \b and \w know only ASCII letters: a Cyrillic word has no \b before it (✗ the first run of the test, 781-7). So the edges
// and the word tails here are Unicode classes with the «u» flag.
const B = '(?<![\\p{L}\\p{N}_])'
const E = '(?![\\p{L}\\p{N}_])'
const W = '\\p{L}*'
const GAP = '(?:[^\\s.!?]+\\s+){0,4}?'
// The person typing, pasting or sending a secret: an imperative and a secret noun close after it.
const SECRET = new RegExp(
  `${B}(введи|введите|вставь|вставьте|пришли|пришлите|отправь|отправьте|скинь|скиньте|укажи|укажите|набери|наберите|скопируй|скопируйте|` +
  `enter|paste|send|type|provide|share)\\s+${GAP}` +
  `(ключ${W}|токен${W}|парол${W}|логин${W}|секрет${W}|код|кода|коды|api[ -]?key|keys?|tokens?|passwords?|passcode|login|secrets?|credentials)${E}`,
  'iu',
)
// «run it in the terminal» in words (the terminal, a command, «this window» of the terminal).
const TERMINAL = new RegExp(
  `${B}(выполни|выполните|запусти|запустите|набери|наберите|введи|введите)\\s+${GAP}(в\\s+терминал${W}|команд${W}|в\\s+(?:этом\\s+)?окне\\s+(?:терминала\\s+)?сам${W})|` +
  `${B}в\\s+терминале\\s+(выполни|выполните|введи|введите|набери|наберите|запусти|запустите)${E}|` +
  `${B}(run|type|paste|execute)\\s+${GAP}in\\s+(your|the|a)\\s+terminal${E}`,
  'iu',
)
// The reason starts with a letter and has 8+ characters (✗ replay 781-7: «: причина» passed with its space counted); a placeholder in
// angle brackets is not a reason.
const DEVIATION = /⟦\s*(без окна|no window)\s*:\s*([^\s⟧<][^⟧]{7,})⟧/iu

/** The code spans of a text — fenced blocks and inline code — to look for `sudo` only where a command is shown. */
function codeOf(text) {
  const out = []
  const s = String(text ?? '')
  for (const m of s.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) out.push(m[1])
  for (const m of s.replace(/```[\s\S]*?```/g, ' ').matchAll(/`([^`\n]+)`/g)) out.push(m[1])
  return out
}

/** The kinds of a person's act found in a text: bang · sudo · slash · secret · terminal. Empty — none. */
function actsIn(text) {
  const s = String(text ?? '')
  if (!s.trim()) return []
  const found = []
  if (BANG_LINE.test(s) || BANG_INLINE.test(s)) found.push('bang')
  // ✗ replay 781-7: spans joined by a newline let «`sudo`, `/mcp`» read as a command — each span alone, a space and a word after sudo.
  if (codeOf(s).some((c) => /(^|[\s;&|(])sudo[ \t]+\S/.test(c))) found.push('sudo')
  if (SLASH.test(s)) found.push('slash')
  if (SECRET.test(s)) found.push('secret')
  if (TERMINAL.test(s)) found.push('terminal')
  return found
}

/** The conscious deviation written in a text, or null. */
function deviationIn(text) {
  const m = DEVIATION.exec(String(text ?? ''))
  return m ? m[2].trim() : null
}

/** A person's own prompt (not a tool result, not a meta line of Claude Code). */
function isPrompt(e) {
  if (!e || e.type !== 'user' || e.isMeta || e.toolUseResult !== undefined) return false
  const c = e.message?.content
  if (typeof c === 'string') return c.trim().length > 0
  return Array.isArray(c) && c.some((b) => b?.type === 'text') && !c.every((b) => b?.type === 'tool_result')
}

/**
 * The current turn of a transcript (parsed JSONL entries): everything after the last prompt of the person or the node.
 * → { texts: the assistant's text blocks, commands: the shell commands it ran, asks: how many `npm run ask-person` requests it put }
 */
function turnOf(entries) {
  const list = Array.isArray(entries) ? entries : []
  let from = 0
  for (let i = list.length - 1; i >= 0; i--) if (isPrompt(list[i])) { from = i + 1; break }
  const texts = []
  const commands = []
  for (const e of list.slice(from)) {
    if (e?.type !== 'assistant' || !Array.isArray(e.message?.content)) continue
    for (const b of e.message.content) {
      if (b?.type === 'text' && typeof b.text === 'string') texts.push(b.text)
      if (b?.type === 'tool_use' && (b.name === 'Bash' || b.name === 'PowerShell') && typeof b.input?.command === 'string') commands.push(b.input.command)
    }
  }
  const asks = commands.filter((c) => /\bnpm\s+run\s+ask-person\b/.test(c) && !/\bask-person\s+(--\s+)?(list|drop|done)\b/.test(c)).length
  return { texts, commands, asks }
}

/** Parse a transcript file's text into entries; a broken line is skipped. */
function parseTranscript(raw) {
  const out = []
  for (const line of String(raw ?? '').split('\n')) {
    if (!line.trim()) continue
    try { out.push(JSON.parse(line)) } catch { /* a line being written */ }
  }
  return out
}

/**
 * The guard's decision for a text the person is about to read (`text`), in a turn (`turn` from turnOf).
 * → { pass: true, why: 'clean'|'window'|'deviation', acts, deviation } or { pass: false, acts }
 */
function verdict(text, turn) {
  const acts = actsIn(text)
  if (!acts.length) return { pass: true, why: 'clean', acts }
  if ((turn?.asks ?? 0) > 0) return { pass: true, why: 'window', acts }
  const dev = deviationIn(text) ?? (turn?.texts ?? []).map(deviationIn).find(Boolean) ?? null
  if (dev) return { pass: true, why: 'deviation', acts, deviation: dev }
  return { pass: false, acts }
}

const KIND_WORDS = { bang: 'a command with «!»', sudo: 'a sudo command', slash: 'a Claude Code slash command', secret: 'a key, token, password, code or login to type or send', terminal: '«run it in the terminal»' }

/** The refusal the agent reads (English, short, with the way). */
function refusal(acts, where) {
  const what = acts.map((k) => KIND_WORDS[k] ?? k).join(', ')
  return `window-guard (781-7): your ${where} asks the person to act by hand (${what}) and no window was put in this turn. ` +
    'Put the window first: npm run ask-person -- "<what to do, their language>" --copy "<the command, if any>" --hint "<what may pop up and what to press>" ' +
    '(skill act-with-the-person; a secret has its own --secret kind), then tell them in one line that the window at the bottom waits. ' +
    'If a window is truly wrong here, keep the text and add the line «⟦без окна: <why>⟧» — it is allowed, logged and shown to the owner.'
}

module.exports = { actsIn, deviationIn, codeOf, isPrompt, turnOf, parseTranscript, verdict, refusal }
