// ОБЛИК ЭЛЕМЕНТА ДЛЯ УЗЛА (шаг 706-2). Владелец 2026-11-09: «имеет смысл новых дизайна добавить к own-service-props.json ну возможно
// ещё и ссылку на референс … если первая уже создано агент нативно может получить описание для второго и сразу же при запуске
// подставить его на вкладку дизайн».
//
// Облик — блок `design` паспорта элемента (`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`, его пишет бриф на странице «Дизайн» элемента)
// плюс ветки его `DESIGN-CONFIG/design-config.json` (шрифты, цвета, текст, формы). «Забрать в ядро» (`takeDescription`) кладёт облик в
// запись реестра — `look`; рождение «как X» (`create --look-like X`) берёт его ОТТУДА, а не из папки X: ядро видит облик соседа через
// его паспорт, как видит описание.
//
// 🔒 КАРТИНКИ НЕ ПЕРЕЕЗЖАЮТ. Загруженный референс живёт в хранилище X (`media`), а каждое хранилище открыто только своему элементу;
// новому элементу достаются ссылки и подписи, ссылка на чужую картинку отбрасывается.
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

// 711: a skill found by the Design tab is named by its mark — a bare name, `owner/repo@skill`, `own:…` or `skill:src:name`.
const SKILL = /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]{0,119}$/
const PROTOTYPE = /^[a-z0-9][a-z0-9-]{0,47}$/
const ID = /^[a-z][a-z0-9]{3,23}$/
// 711-7: the design document's fifth branch — the interface's speed.
const BRANCHES = ['colors', 'fonts', 'type', 'shape', 'motion']
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')

/** Проверить и очистить блок `design` паспорта. `{ ok: true, look: null }` — блока нет или он пуст. */
function normalizeLook(raw) {
  if (raw === undefined || raw === null) return { ok: true, look: null }
  if (!isObj(raw)) return { ok: false, error: 'look-bad-shape' }
  const look = {}
  if (raw.skill !== undefined && raw.skill !== '') {
    if (typeof raw.skill !== 'string' || !SKILL.test(raw.skill.trim())) return { ok: false, error: 'look-bad-shape' }
    look.skill = raw.skill.trim()
  }
  const audience = text(raw.audience, 600)
  if (audience) look.audience = audience
  if (raw.character !== undefined) {
    if (!Array.isArray(raw.character) || raw.character.length > 5) return { ok: false, error: 'look-bad-shape' }
    const words = raw.character.map((w) => text(w, 40)).filter(Boolean)
    if (words.length) look.character = words
  }
  const avoid = text(raw.avoid, 600)
  if (avoid) look.avoid = avoid
  if (raw.references !== undefined) {
    if (!Array.isArray(raw.references) || raw.references.length > 12) return { ok: false, error: 'look-bad-shape' }
    const refs = []
    for (const r of raw.references) {
      if (!isObj(r)) return { ok: false, error: 'look-bad-shape' }
      const ref = {}
      const url = text(r.url, 500)
      if (url) {
        if (!/^https?:\/\//.test(url)) return { ok: false, error: 'look-bad-shape' }
        ref.url = url
      }
      const media = text(r.media, 80)
      if (media) ref.media = media
      const note = text(r.note, 300)
      if (note) ref.note = note
      if (Object.keys(ref).length) refs.push(ref)
    }
    if (refs.length) look.references = refs
  }
  // 711-6: the pinned prototype (`npm run design:pin` in the element) — which prototype won, with which skill and references.
  if (isObj(raw.pinned) && typeof raw.pinned.prototype === 'string' && PROTOTYPE.test(raw.pinned.prototype) && typeof raw.pinned.skill === 'string' && SKILL.test(raw.pinned.skill)) {
    const refs = Array.isArray(raw.pinned.references) ? raw.pinned.references.filter(isObj).map((r) => ({ url: text(r.url, 500), ...(text(r.caption, 300) ? { caption: text(r.caption, 300) } : {}) })).filter((r) => /^https?:\/\//.test(r.url)).slice(0, 12) : []
    look.pinned = { prototype: raw.pinned.prototype, skill: raw.pinned.skill, at: text(raw.pinned.at, 40), ...(refs.length ? { references: refs } : {}) }
  }
  if (raw.inheritedFrom !== undefined && raw.inheritedFrom !== '') {
    if (typeof raw.inheritedFrom !== 'string' || !ID.test(raw.inheritedFrom)) return { ok: false, error: 'look-bad-shape' }
    look.inheritedFrom = raw.inheritedFrom
  }
  return { ok: true, look: Object.keys(look).length ? look : null }
}

/** Ветки оформления из `DESIGN-CONFIG/design-config.json` папки элемента; нет файла или веток — `null`. */
function readTokens(dir) {
  const file = join(dir, 'DESIGN-CONFIG', 'design-config.json')
  if (!existsSync(file)) return null
  try {
    const cfg = JSON.parse(readFileSync(file, 'utf8'))
    if (!isObj(cfg)) return null
    const out = Object.fromEntries(BRANCHES.filter((b) => isObj(cfg[b]) && Object.keys(cfg[b]).length).map((b) => [b, cfg[b]]))
    return Object.keys(out).length ? out : null
  } catch { return null }
}

/** Облик, забранный в ядро (запись реестра `look`), или `null`. */
function registryLook(registry, id) {
  const e = (registry?.services ?? []).find((s) => s.id === id)
  return e && isObj(e.look) ? e.look : null
}

/** Рождение «как X»: облик X ложится в паспорт и `DESIGN-CONFIG` новорождённого. Возвращает, что записано. */
function seedLook(dir, propsFile, look, fromId) {
  const brief = { ...look }
  delete brief.tokens
  delete brief.taken
  if (Array.isArray(brief.references)) {
    brief.references = brief.references.map((r) => { const c = { ...r }; delete c.media; return c }).filter((r) => r.url || r.note)
    if (!brief.references.length) delete brief.references
  }
  brief.inheritedFrom = fromId
  const props = JSON.parse(readFileSync(propsFile, 'utf8'))
  props.design = brief
  if (brief.skill) props.designSkill = brief.skill
  writeFileSync(propsFile, JSON.stringify(props, null, 2) + '\n', 'utf8')
  let tokens = false
  if (isObj(look.tokens)) {
    const file = join(dir, 'DESIGN-CONFIG', 'design-config.json')
    let cfg = {}
    try { const cur = JSON.parse(readFileSync(file, 'utf8')); if (isObj(cur)) cfg = cur } catch { /* нового файла нет */ }
    for (const b of BRANCHES) if (isObj(look.tokens[b])) cfg[b] = look.tokens[b]
    mkdirSync(join(dir, 'DESIGN-CONFIG'), { recursive: true })
    writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n', 'utf8')
    tokens = true
  }
  return { brief: Object.keys(brief).filter((k) => k !== 'inheritedFrom'), tokens }
}

module.exports = { normalizeLook, readTokens, registryLook, seedLook, BRANCHES }
