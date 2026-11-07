// f2f-ПОИСК В СЕТИ LAGRIX — ИМИТАЦИЯ (узел, шаг 548-9). Зовёт главный агент (`scripts/main-agent-cli.mjs lagrix`); у кастомного
// элемента своя копия — `scripts/f2f.mjs` шаблона (элемент кода ядра не импортирует).
//
// Слово владельца 2026-10-19: «агент поймёт что у него есть f2f и выполнит запрос в сеть lagrix (мы должны имитировать это
// действие максимально реалистично и максимально реалистично вернуть ответ в данный момент ничего не обнаружено)».
//
// 🔒 Запрос собран так, как его пошлёт узел, когда сеть заработает (документы протокола Lagrix): поиск — одна цена $0,01 USDC за
// список результатов, оплата ваучером супер-узлу (документ 17, §17.8); запрос несёт страну и флаг «adult» и больше ничего личного
// (§17.8); вид услуги — тег способности, его держат holders супер-узлов (§17.12); целый элемент описывает техническая карточка
// F2F (документ 20). Ответ — тот, что сеть даёт, когда ни одно объявление не подошло: пустой список.
// 🛑 Честность: в ответе `mode: "simulation"`, и сказать человеку надо именно так — «подходящих элементов не найдено (поиск в сети
// пока имитируется)». Денег не списывается, ваучер не подписывается. Каждый поиск — строка в журнале данных узла.

import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export function simulatedF2fSearch(words, { framework = 'next', template = 'fractera-custom-item-starter', country = '', adult = false, dataDir = '' } = {}) {
  const query = String(words ?? '').replace(/\s+/g, ' ').trim().slice(0, 300)
  const capability = query.toLowerCase().replace(/[^a-z0-9а-яё\s-]/gi, ' ').split(/\s+/).filter((w) => w.length > 2).slice(0, 6).join('-') || 'element'
  const searchedAt = new Date().toISOString()
  const answer = {
    network: 'lagrix',
    protocol: 'f2f',
    mode: 'simulation',
    note: 'The Lagrix network is not live yet: the request below is built the way a node will send it, and the answer is the one the network gives when no announcement matches.',
    request: {
      kind: 'element',
      capability,
      query,
      filters: { framework, template },
      country: country || 'not declared',
      adult,
      route: 'the super-nodes holding this kind of service (Lagrix document 17, section 17.12)',
      card: 'F2F technical card: template, framework, consumes, provides, env names, licence, source (Lagrix document 20)',
    },
    searchedAt,
    superNode: null,
    fee: { usdc: 0.01, per: 'result list', charged: false, why: 'simulation: no voucher was signed (Lagrix document 17, section 17.8)' },
    results: [],
    found: 0,
    say: 'Lagrix: no ready element matches (the network search is simulated for now).',
    // 548-6 (2026-10-20): эту копию зовёт только главный агент — «попросите главного агента» здесь звучало бы ему самому.
    // 670-6: прежде нового элемента — маршрут в элементе, чья область это покрывает (670-3).
    next: 'no ready element to take — build it in this node: a route in the element whose area covers it (its own agent builds it), or a new element (skill create-element: agree its role, its area, its task and who leads it with the person, then npm run create)',
  }
  journal(dataDir, 'f2f', { at: searchedAt, query, capability, found: 0, mode: 'simulation' })
  return answer
}

function journal(dataDir, protocol, line) {
  if (!dataDir) return
  try {
    mkdirSync(join(dataDir, protocol), { recursive: true })
    appendFileSync(join(dataDir, protocol, 'searches.jsonl'), JSON.stringify(line) + '\n', 'utf8')
  } catch { /* журнал не обязателен для ответа */ }
}

// ── 670-6: ОДИН КОНТРАКТ СТУПЕНИ LAGRIX ─────────────────────────────────────────────────────────────────────────────────────────────
// Владелец 2026-11-07: «lagrix прямо сейчас ещё не создан поэтому он всегда по дефолту возвращает ничего не найдено. Но этот шаг лучше сразу
// закрепить чтобы в будущем когда мы сделаем agri мы все это дело там прогнали и подключили без сильных конфликтов».
// 🔒 Два вида одной ступени: `a2a` — агент, у которого покупают РЕЗУЛЬТАТ работы (объявление — документ 17 §17.1, список — §17.2, плата
// — §17.8, сделка — документ 27); `f2f` — ЦЕЛЫЙ элемент (документ 20, техническая карточка). Форма ответа одна для имитации и для будущей
// сети: её держит сторож сборки `scripts/check-lagrix-contract.mjs` — настоящий адаптер обязан пройти его без правки сторожа.
// 🔒 Ступень зовут только там, где она окупится: в узле никого нет и решается «купить или строить» — живой поиск стоит $0,01 за список
// (§17.8), стороны, уже знающие друг друга, повторно не ищут.

/** a2a-поиск в сети Lagrix — ИМИТАЦИЯ: запрос собран по документу 17, ответ — тот, что даёт супер-узел, когда ни одно объявление не подошло. */
export function simulatedA2aSearch(words, { country = '', adult = false, deal = 'instant', dataDir = '' } = {}) {
  const query = String(words ?? '').replace(/\s+/g, ' ').trim().slice(0, 300)
  const capability = query.toLowerCase().replace(/[^a-z0-9а-яё\s-]/gi, ' ').split(/\s+/).filter((w) => w.length > 2).slice(0, 6).join('-') || 'service'
  const searchedAt = new Date().toISOString()
  const answer = {
    network: 'lagrix',
    protocol: 'a2a',
    mode: 'simulation',
    note: 'The Lagrix network is not live yet: the request below is built the way a node will send it, and the answer is the one a super-node gives when no announcement matches.',
    request: {
      kind: 'service',
      capability,
      query,
      filters: { deal: deal === 'deferred' ? 'deferred' : 'instant', availableBy: null, price: null },
      country: country || 'not declared',
      adult,
      route: 'a super-node holding this kind of service builds the list: capabilities, availability, price, then paid work of the last twelve months, one place in four in turn (Lagrix document 17, sections 17.2 and 17.12)',
      card: 'each result names the provider agent by its A2A card (tag agent_card) and its element, the entity whose reputation the customer sees (Lagrix document 17, section 17.1)',
    },
    searchedAt,
    superNode: null,
    fee: { usdc: 0.01, per: 'result list', charged: false, why: 'simulation: no voucher was signed (Lagrix document 17, section 17.8)' },
    results: [],
    found: 0,
    say: 'Lagrix: no agent sells this work (the network search is simulated for now).',
    next: 'nobody to buy it from — build it in this node: a route in the element whose area covers it (its own agent builds it), or a new element (skill create-element)',
  }
  journal(dataDir, 'a2a', { at: searchedAt, query, capability, found: 0, mode: 'simulation' })
  return answer
}

/** Ступень Lagrix целиком: `{ network, mode, answers: { a2a?, f2f? } }` — каждый ответ одной формы (`contractProblems`). */
export function lagrixSearch(words, { kinds = ['a2a', 'f2f'], ...opts } = {}) {
  const answers = {}
  if (kinds.includes('a2a')) answers.a2a = simulatedA2aSearch(words, opts)
  if (kinds.includes('f2f')) answers.f2f = simulatedF2fSearch(words, opts)
  return { network: 'lagrix', mode: 'simulation', answers }
}

const isStr = (v) => typeof v === 'string' && v.trim() !== ''
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Строка результата — форма закреплена сейчас для живой сети: a2a — объявление агента (документ 17 §17.1), f2f — элемент с карточкой (документ 20). */
function resultProblems(r, protocol, i) {
  const out = []
  const at = `${protocol}.results[${i}]`
  if (!isObj(r)) return [`${at} must be an object`]
  if (!isStr(r.element)) out.push(`${at}.element — the element whose reputation is seen (document 17 §17.1)`)
  if (!isStr(r.nodeId)) out.push(`${at}.nodeId — where the agent lives (tag node_id)`)
  if (!isNum(r.place) || r.place < 1) out.push(`${at}.place — its place in the list, from 1`)
  if (typeof r.inTurn !== 'boolean') out.push(`${at}.inTurn — true when the place was given in turn (document 17 §17.3)`)
  if (!isObj(r.price) || !isNum(r.price.min) || !isNum(r.price.max) || r.price.currency !== 'USDC') out.push(`${at}.price — { min, max, currency: "USDC" } (tag price)`)
  if (protocol === 'a2a') {
    if (!isStr(r.agentCard) || !/^https:\/\//.test(r.agentCard)) out.push(`${at}.agentCard — the https address of the A2A card (tag agent_card)`)
    if (!isStr(r.capability)) out.push(`${at}.capability — the service (tags d and c)`)
    if (!isObj(r.deal) || !['instant', 'deferred'].includes(r.deal.kind) || !isNum(r.deal.disputeWindowSec)) out.push(`${at}.deal — { kind: instant|deferred, disputeWindowSec } (tag deal, document 27)`)
  } else {
    const card = r.card
    if (!isObj(card)) out.push(`${at}.card — the F2F technical card (document 20)`)
    else for (const k of ['template', 'framework', 'licence', 'source']) if (!isStr(card[k])) out.push(`${at}.card.${k} (document 20)`)
    if (isObj(card) && (!Array.isArray(card.consumes) || !Array.isArray(card.provides) || !Array.isArray(card.env))) out.push(`${at}.card.consumes, provides, env — lists (env: names only, never values)`)
  }
  return out
}

/** Что в одном ответе ступени нарушает контракт: [] — ответ годен. Тот же сторож для имитации и для живой сети. */
export function contractProblems(answer, protocol) {
  const out = []
  if (!isObj(answer)) return [`${protocol}: the answer must be an object`]
  if (answer.network !== 'lagrix') out.push(`${protocol}.network must be "lagrix"`)
  if (answer.protocol !== protocol) out.push(`${protocol}.protocol must be "${protocol}"`)
  if (!['simulation', 'live'].includes(answer.mode)) out.push(`${protocol}.mode must be "simulation" or "live" — the person is told which`)
  if (!isObj(answer.request) || !isStr(answer.request.capability) || !isStr(answer.request.query)) out.push(`${protocol}.request must carry capability and query`)
  if (isObj(answer.request) && !['not declared'].includes(answer.request.country) && !/^[A-Z]{2}$/.test(String(answer.request.country))) out.push(`${protocol}.request.country — a two-letter code or «not declared» (document 17 §17.8: nothing else personal)`)
  if (!isObj(answer.fee) || !isNum(answer.fee.usdc) || !isStr(answer.fee.per) || typeof answer.fee.charged !== 'boolean') out.push(`${protocol}.fee must be { usdc, per, charged }`)
  if (answer.mode === 'simulation' && answer.fee?.charged) out.push(`${protocol}: a simulation never charges`)
  if (!Array.isArray(answer.results)) out.push(`${protocol}.results must be a list`)
  else {
    if (answer.found !== answer.results.length) out.push(`${protocol}.found must equal the number of results`)
    answer.results.forEach((r, i) => out.push(...resultProblems(r, protocol, i)))
  }
  if (!isStr(answer.say)) out.push(`${protocol}.say — the line for the person`)
  if (!isStr(answer.next)) out.push(`${protocol}.next — the next rung when nothing is found`)
  return out
}
