'use strict'
// ЗАМОК «УЗЕЛ ЗАНЯТ» — РОЖДЕНИЕ ЭЛЕМЕНТА И ОБНОВЛЕНИЕ УЗЛА НЕ ИДУТ ВМЕСТЕ (узел, шаг 839-14).
//
// Владелец, 2026-11-23 (Telegram 1085): «нужно решение … она всплывает регулярно нужен какой-то сторож». ✗ Замерено на сервере
// 2026-11-23 00:37–00:39 UTC (главный агент сервера, Telegram 1084): рождение jkz0e собирало свою папку, а обновление узла на шаге
// «элементы» собирало ту же — «ENOENT …/.next-a/required-server-files.json», затем «Another next build process is already running»,
// и рождение записало BIRTH_FAILED. Развёртывание элемента обновление уже исключало (`deploy-lock.cjs`); рождение — нет.
//
// Две стороны одного замка:
// - `birthRunning(root)` — рождение, чей процесс жив и чей журнал ещё без итога (`logs/birth-<id>.json` + `logs/birth-<id>.log`,
//   пишет `lib/web4-items/birth.ts`): его ждёт обновление узла (`scripts/node-update.mjs`, шаг «проверка»);
// - `updateRunning(root)` — обновление узла, чей процесс жив (`data/node/node-update.json`, пишет `scripts/node-update.mjs`): его ждёт
//   рождение (`startBirth`).
// 🔒 Живость меряется при каждом чтении (сигнал 0; EPERM — процесс чужой, но живой), а не помнится: умерший процесс никого не держит.
// Запись старше трёх часов не держит тоже — рождение длится минуты, обновление десятки минут, а номер процесса со временем может достаться
// другому.

const fs = require('node:fs')
const path = require('node:path')

const STALE_MS = 3 * 60 * 60 * 1000

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM')
  }
}

const fresh = (iso, now) => {
  const t = Date.parse(String(iso ?? ''))
  return Number.isFinite(t) && now - t < STALE_MS
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

/** Идущее рождение элемента: `{ id, startedAt }` или null. */
function birthRunning(root, now = Date.now()) {
  const dir = path.join(root, 'logs')
  let names = []
  try { names = fs.readdirSync(dir) } catch { return null }
  for (const name of names) {
    const m = /^birth-([a-z0-9][a-z0-9-]*)\.json$/.exec(name)
    if (!m) continue
    const meta = readJson(path.join(dir, name))
    if (!meta || !pidAlive(meta.pid) || !fresh(meta.startedAt, now)) continue
    let log = ''
    try { log = fs.readFileSync(path.join(dir, `birth-${m[1]}.log`), 'utf8') } catch { /* журнала ещё нет — рождение только началось */ }
    if (/===BIRTH_(OK|FAILED)===/.test(log)) continue
    return { id: m[1], startedAt: meta.startedAt ?? null }
  }
  return null
}

/** Идущее обновление узла: `{ stage, startedAt }` или null. */
function updateRunning(root, now = Date.now()) {
  const s = readJson(path.join(root, 'data', 'node', 'node-update.json'))
  if (!s || s.state !== 'running' || !pidAlive(s.pid) || !fresh(s.startedAt, now)) return null
  return { stage: s.stage ?? null, startedAt: s.startedAt ?? null }
}

module.exports = { birthRunning, updateRunning, pidAlive, STALE_MS }
