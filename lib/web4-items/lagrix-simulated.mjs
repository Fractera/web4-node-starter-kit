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
    next: 'create a new element: skill create-element — agree its role, its task and who leads it with the person, then npm run create',
  }
  if (dataDir) {
    try {
      mkdirSync(join(dataDir, 'f2f'), { recursive: true })
      appendFileSync(join(dataDir, 'f2f', 'searches.jsonl'), JSON.stringify({ at: searchedAt, query, capability, found: 0, mode: 'simulation' }) + '\n', 'utf8')
    } catch { /* журнал не обязателен для ответа */ }
  }
  return answer
}
