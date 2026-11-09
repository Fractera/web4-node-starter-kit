// ЧТО ПУЛЬТ ЯДРА ПОКАЗЫВАЕТ У ЭЛЕМЕНТА (узел, шаг 712-2). Владелец 2026-11-09: «ядро всего лишь навсего представляет доступ к …
// настройкам которые сейчас существуют в элементе. То есть это удалённый пульт управления … в ядре будут представлены только те строки
// которые совпадают с предварительно созданными в ядре … Если пользователь добавил 10 и убрал из 10 -5 то значит … новые 10 не должны
// появляться а из Старых 10 … редактировать только пять».
//
// 🔒 «СУЩЕСТВУЕТ В ЭЛЕМЕНТЕ» = ЭЛЕМЕНТ ЭТО ОБЪЯВЛЯЕТ. Файлы настроек элемента разреженные (в них только то, что отличается от шаблона),
// поэтому судят не по файлу, а по объявлению: дверь элемента (`/api/settings/<вид>`) отдаёт JSON Schema из его собственной схемы. Эта
// функция раскладывает объявление в плоский список «путь → тип»; поле видно в ядре, только если редактор ядра его знает И элемент
// объявляет его тем же типом. Убрали поле из схемы элемента — его нет в списке; добавили своё — редактор ядра его не спрашивает; то же
// имя с другим типом — не совпадает и скрыто.
// Чистая функция без импортов: её зовут дверь ядра (`app/api/node/element-settings`) и сторож `check:element-settings`.

/** @typedef {'string' | 'number' | 'boolean' | 'array' | 'object'} FieldType */

const KINDS = new Set(['string', 'number', 'boolean', 'array', 'object'])
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Тип узла схемы: `integer` — число; `anyOf`/`oneOf` и массив типов с `null` — тип без `null` (поле, которое можно стереть);
 * `enum` без типа — строка. Два разных типа сразу — `null`: такое поле ядро не правит.
 * @param {unknown} node @returns {FieldType | null}
 */
function typeOf(node) {
  if (!isObj(node)) return null
  const alt = Array.isArray(node.anyOf) ? node.anyOf : Array.isArray(node.oneOf) ? node.oneOf : null
  if (alt) {
    const kinds = [...new Set(alt.map(typeOf).filter(Boolean))]
    return kinds.length === 1 ? kinds[0] : null
  }
  let t = node.type
  if (Array.isArray(t)) {
    const kinds = [...new Set(t.filter((x) => x !== 'null'))]
    if (kinds.length !== 1) return null
    t = kinds[0]
  }
  if (t === 'integer') t = 'number'
  if (t === undefined && Array.isArray(node.enum)) t = 'string'
  if (t === undefined && isObj(node.properties)) t = 'object'
  return KINDS.has(t) ? t : null
}

/** Узел без `anyOf`-обёртки: ветки объекта лежат в его варианте-объекте. @param {unknown} node */
function unwrap(node) {
  if (!isObj(node)) return node
  const alt = Array.isArray(node.anyOf) ? node.anyOf : Array.isArray(node.oneOf) ? node.oneOf : null
  return alt ? alt.find((n) => isObj(n) && (n.type === 'object' || isObj(n.properties))) ?? node : node
}

/**
 * Объявление элемента → `{ путь: тип }`. Ветки объекта входят сами (`nav` — `object`) и своими полями (`nav.top` — `array`); внутрь
 * массивов не спускаемся: пункт меню или ссылка соцсети — дело редактора списка.
 * @param {unknown} schema @param {string} [prefix] @param {Record<string, FieldType>} [out]
 * @returns {Record<string, FieldType>}
 */
function declaredFields(schema, prefix = '', out = {}) {
  const node = unwrap(schema)
  if (!isObj(node) || !isObj(node.properties)) return out
  for (const [key, child] of Object.entries(node.properties)) {
    const path = prefix ? `${prefix}.${key}` : key
    const t = typeOf(child)
    if (!t) continue
    out[path] = t
    if (t === 'object') declaredFields(child, path, out)
  }
  return out
}

/**
 * Какие из полей, известных редактору ядра, показать. `known` — `[путь, тип]` редактора; ответ — те же пути в том же порядке.
 * @param {Array<[string, FieldType]>} known @param {Record<string, FieldType>} declared @returns {string[]}
 */
function visibleFields(known, declared) {
  return known.filter(([path, type]) => declared[path] === type).map(([path]) => path)
}

const fits = (value, type) => (type === 'array' ? Array.isArray(value) : type === 'object' ? isObj(value) : typeof value === type)

/**
 * Заплата без необъявленного (712-4): путь объявлен элементом, значение — его типа или `null` (стереть объявленный ключ). Ветка `i18n`
 * настроек сайта — переводы строк: `{ i18n: { "<путь>": { "<язык>": текст | null } } }`, ключ — объявленное строковое поле. Пустая после
 * отсечения заплата — `null`: отправлять нечего. Это последняя линия правила владельца: что бы ни прислал браузер, в файл элемента
 * ложится только то, что элемент объявляет.
 * @param {unknown} patch @param {Record<string, FieldType>} fields @param {string} [prefix] @returns {Record<string, unknown> | null}
 */
function prunePatch(patch, fields, prefix = '') {
  if (!isObj(patch)) return null
  const out = {}
  for (const [key, value] of Object.entries(patch)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (!prefix && key === 'i18n' && fields.i18n === undefined) {
      if (!isObj(value)) continue
      const kept = {}
      for (const [p, langs] of Object.entries(value)) {
        if (fields[p] !== 'string' || !isObj(langs)) continue
        const l = Object.fromEntries(Object.entries(langs).filter(([code, v]) => /^[a-z]{2}(?:-[A-Za-z]{2,4})?$/.test(code) && (v === null || typeof v === 'string')))
        if (Object.keys(l).length) kept[p] = l
      }
      if (Object.keys(kept).length) out.i18n = kept
      continue
    }
    const type = fields[path]
    if (!type) continue
    if (value === null) out[key] = null
    else if (type === 'object' && isObj(value)) {
      const inner = prunePatch(value, fields, path)
      if (inner) out[key] = inner
    } else if (fits(value, type)) out[key] = value
  }
  return Object.keys(out).length ? out : null
}

module.exports = { typeOf, declaredFields, visibleFields, prunePatch }
