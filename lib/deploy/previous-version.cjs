// ПРЕДЫДУЩАЯ РАБОЧАЯ ВЕРСИЯ ЭЛЕМЕНТА — для отката (шаг 287).
//
// Слово владельца 2026-09-24: «…зайдёте в ядро на вкладку дашборд развертываний и выполните откат до предыдущей рабочей
// версии». Источник первый — журнал развёртываний `logs/deploy-history.jsonl` (его пишет `scripts/deploy-elements.mjs`
// после каждого развёртывания: элемент, версия, успех, время): последняя УСПЕШНАЯ версия, отличная от текущей.
// Журнала ещё нет (узел развёртывался до 287) — история реестра в git: последняя другая версия, успех неизвестен, и это
// говорится (`source: 'git'`).
const { readFileSync, existsSync, statSync } = require('node:fs')
const { join } = require('node:path')
const { execFileSync } = require('node:child_process')

const ROOT = process.cwd()
const REGISTRY_REL = 'WEB4-ITEMS-REGISTRY/web4-items.json'

function currentVersion(id) {
  try {
    const reg = JSON.parse(readFileSync(join(ROOT, REGISTRY_REL), 'utf8'))
    return (reg.services || []).find((s) => s.id === id)?.version ?? null
  } catch {
    return null
  }
}

function fromHistory(id, current) {
  const file = join(ROOT, 'logs', 'deploy-history.jsonl')
  if (!existsSync(file)) return null
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const e = JSON.parse(lines[i])
      if (e.id === id && e.ok && e.version && e.version !== current) return { version: e.version, at: e.at, source: 'history' }
    } catch { /* битая строка — пропустить */ }
  }
  return null
}

// 815-9 (measured 2026-11-20 on the Mac: 625 ms per element, 5.7 s for the deployments board, the core frozen for all of it — the dead
// clicks of Telegram 239): the registry's history is read ONCE per new commit of the registry — one `git log`, then each version map
// parsed once and kept here; every element is then a walk in memory. ✗ Before: up to 60 `git show` per element, per request.
let history = { key: null, at: 0, maps: [] }
const KEEP_MS = 5 * 60_000
function registryHistory() {
  // the key: the registry file as it is now — a new version or a commit changes it; at most five minutes old otherwise
  let key = null
  try { const st = statSync(join(ROOT, REGISTRY_REL)); key = `${st.mtimeMs}:${st.size}` } catch { /* no registry */ }
  if (key && key === history.key && Date.now() - history.at < KEEP_MS) return history.maps
  const shas = execFileSync('git', ['log', '--format=%H', '-n', '60', '--', REGISTRY_REL], { cwd: ROOT, encoding: 'utf8', windowsHide: true })
    .split(/\r?\n/).filter(Boolean)
  // every version of the registry in ONE git process (cat-file --batch: «<sha> blob <size>\n<content>\n» per object)
  const out = execFileSync('git', ['cat-file', '--batch'], { cwd: ROOT, input: shas.map((sha) => `${sha}:${REGISTRY_REL}`).join('\n') + '\n', windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
  const maps = []
  let at = 0
  for (let i = 0; i < shas.length && at < out.length; i++) {
    const nl = out.indexOf(10, at)
    const head = out.subarray(at, nl).toString('utf8').split(' ')
    at = nl + 1
    if (head[1] !== 'blob') { maps.push({}); continue }
    const size = Number(head[2])
    try { maps.push(Object.fromEntries((JSON.parse(out.subarray(at, at + size).toString('utf8')).services || []).map((x) => [x.id, x.version]))) } catch { maps.push({}) }
    at += size + 1
  }
  history = { key, at: Date.now(), maps }
  return maps
}

function fromGit(id, current) {
  try {
    for (const m of registryHistory()) {
      const v = m[id]
      if (v && v !== current) return { version: v, at: null, source: 'git' }
    }
  } catch { /* нет git — нечего сказать */ }
  return null
}

function previousVersion(id) {
  const current = currentVersion(id)
  if (!current) return null
  return fromHistory(id, current) || fromGit(id, current)
}

module.exports = { previousVersion, currentVersion, REGISTRY_REL }
