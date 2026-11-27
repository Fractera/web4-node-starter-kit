// СОСТОЯНИЕ ПОДПИСКИ CLAUDE CODE НА ЭТОЙ МАШИНЕ (267-2, перенос `fractera-memory-starter/lib/fractera/claude-cli.mjs`).
//
// 🔒 СПРАШИВАЕМ ПОЛЕ, А НЕ КОД ВОЗВРАТА — И ЭТО ИЗМЕРЕНО ЗАНОВО, А НЕ ПЕРЕНЕСЕНО. В памяти написано, что
// `claude auth status` отдаёт 0 и вошедшему, и невошедшему. На Windows 2026-09-22 (CLI 2.1.278) измерено
// иначе: вошедший — код 0, невошедший (пустой `CLAUDE_CONFIG_DIR`) — код **1**, но JSON печатается в обоих
// случаях. Поэтому JSON читается при любом коде, а решает поле `loggedIn`.
//
// 🔒 `null` — «спросить не удалось», и это НЕ «не вошёл»: разница решает, покажем мы вход или ложное
// «подключено».
//
// 🔒 ПУТЬ К CLI — ПРОСТО `claude`: на Windows `which` нет, а libuv сам дописывает `.exe` при поиске в PATH
// (измерено: `spawnSync('claude', …)` без оболочки находит `C:\Users\…\.local\bin\claude.exe`).
// `CLAUDE_BIN` — для машины, где CLI стоит вне PATH.

const { spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')

function claudeBin() {
  return process.env.CLAUDE_BIN || 'claude'
}

/** Папки, где лежат `claude` и `bun` по установщикам Anthropic и Bun — одинаково на трёх системах. */
function extraBins() {
  return [path.join(os.homedir(), '.local', 'bin'), path.join(os.homedir(), '.bun', 'bin')]
}

/**
 * Полный путь к исполняемому файлу без оболочки: `node-pty` запускает файл, а не строку для оболочки.
 * На Windows — с расширениями из PATHEXT. `~/.local/bin` и `~/.bun/bin` добавляются явно: долгоживущие
 * процессы (pm2, сервер узла) держат окружение, снятое ДО установки, и нового PATH не видят.
 */
function resolveBin(name, pathValue = process.env.PATH || process.env.Path || '') {
  const dirs = [...extraBins(), ...String(pathValue).split(path.delimiter).filter(Boolean)]
  const exts = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD').split(';').map((e) => e.toLowerCase()) : ['']
  for (const d of dirs) for (const e of exts) {
    const p = path.join(d, name + e)
    if (existsSync(p)) return p
  }
  return null
}

/** Окружение для `claude` с папкой своей подписки элемента (689, `CLAUDE_CONFIG_DIR`); без папки — окружение узла как есть. */
function claudeEnv(configDir = null) {
  return configDir ? { ...process.env, CLAUDE_CONFIG_DIR: configDir } : process.env
}

/**
 * @param {string | null} [configDir] своя папка Claude Code элемента (689, `workspace.cjs` `ownClaudeDir`); без неё — вход узла.
 * @returns {{ loggedIn: boolean | null, method: string | null, email: string | null, plan: string | null }}
 */
function claudeAuthState(configDir = null) {
  try {
    const out = spawnSync(claudeBin(), ['auth', 'status'], { encoding: 'utf8', timeout: 15_000, windowsHide: true, env: claudeEnv(configDir) })
    if (!out.stdout) return { loggedIn: null, method: null, email: null, plan: null }
    const p = JSON.parse(out.stdout)
    return {
      loggedIn: typeof p.loggedIn === 'boolean' ? p.loggedIn : null,
      method: typeof p.authMethod === 'string' ? p.authMethod : null,
      email: typeof p.email === 'string' ? p.email : null,
      plan: typeof p.subscriptionType === 'string' ? p.subscriptionType : null,
    }
  } catch {
    return { loggedIn: null, method: null, email: null, plan: null }
  }
}

/**
 * 689: выход из СВОЕЙ подписки элемента — перед тем как его папка уходит. 🛑 Без папки не делает ничего: выход из подписки узла
 * выключил бы всех агентов узла и самого владельца за компьютером.
 */
function claudeOwnLogout(configDir) {
  if (!configDir) return false
  try {
    const out = spawnSync(claudeBin(), ['auth', 'logout'], { encoding: 'utf8', timeout: 15_000, windowsHide: true, env: claudeEnv(configDir) })
    return out.status === 0
  } catch {
    return false
  }
}

/**
 * 666: уровни `--effort`, которые знает Claude Code этой машины, — из его собственной справки (2.1.319: «(low, medium, high, xhigh,
 * max)»). `null` — флага нет вовсе: старый CLI с `--effort` не запустился бы, и узел флаг не передаёт. Спрашивается один раз на процесс.
 */
const effortCache = new Map()
function claudeEfforts(bin = claudeBin()) {
  if (effortCache.has(bin)) return effortCache.get(bin)
  let help = ''
  try {
    const out = spawnSync(bin, ['--help'], { encoding: 'utf8', timeout: 15_000, windowsHide: true })
    help = `${out.stdout ?? ''}${out.stderr ?? ''}`
  } catch { /* справки нет — ниже: не запоминать */ }
  // Справка не пришла (сбой, таймаут) — ответ «не знаю» не запоминается: следующий запуск спросит снова.
  if (!/--help|Usage|Options/i.test(help)) return null
  const m = /--effort <level>[\s\S]{0,240}?\(([a-z][a-z, ]*)\)/.exec(help)
  const levels = /--effort\b/.test(help) ? (m ? m[1].split(/\s*,\s*/).filter(Boolean) : ['low', 'medium', 'high']) : null
  effortCache.set(bin, levels)
  return levels
}

// 837-0b (the owner, Telegram 814, a photo of the server's login terminal; 816: «почему у нас в одном проекте должны существовать разные
// архитектуры»): on the server the core and every native element typed `claude auth login` into the node user's zsh — it has none of its
// start-up files, so Debian's zsh sourced its `newuser` script, a menu waiting for one key: «c» was eaten, «laude: command not found», no
// link, no window — while every walled custom element got `/bin/bash -l` (lib/agent-kit/walled-session.cjs) and worked.
// 🔒 ONE RULE FOR THE WHOLE NODE, the core and every element alike: a Linux machine's login terminal is `bash -l` — the walled shell's
// own; macOS keeps zsh, its default, and a zsh with none of .zshenv .zprofile .zshrc .zlogin starts with -f (zshmodules, THE ZSH/NEWUSER
// MODULE: loaded only while RCS is set; macOS ships no `newuser` script, Debian does); Windows — cmd.exe. `PTY_SHELL` overrides.
const ZSH_START_FILES = ['.zshenv', '.zprofile', '.zshrc', '.zlogin']
/** The shells to try, in order, for this platform. */
function shellCandidates(platform = process.platform, env = process.env) {
  if (platform === 'win32') return [env.ComSpec, 'C:\\Windows\\System32\\cmd.exe']
  return platform === 'darwin' ? ['/bin/zsh', '/bin/bash', '/bin/sh'] : ['/bin/bash', '/bin/sh', '/bin/zsh']
}
/** Arguments of the short login terminal's shell: bash `-l` (as a walled element's), a zsh with no start-up file `-f`, else none. */
function loginShellArgs(shell, dir = process.env.ZDOTDIR || os.homedir()) {
  const name = path.basename(String(shell || ''))
  if (name === 'bash') return ['-l']
  if (name !== 'zsh') return []
  return ZSH_START_FILES.some((f) => existsSync(path.join(dir, f))) ? [] : ['-f']
}

module.exports = { claudeBin, claudeAuthState, claudeOwnLogout, claudeEfforts, extraBins, resolveBin, shellCandidates, loginShellArgs }
