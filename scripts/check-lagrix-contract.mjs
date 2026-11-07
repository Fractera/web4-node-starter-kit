// СТОРОЖ КОНТРАКТА СТУПЕНИ LAGRIX (узел, шаг 670-6). `npm run check:lagrix-contract`, и в `prebuild` — на трёх системах CI.
//
// Владелец 2026-11-07: «lagrix прямо сейчас ещё не создан поэтому он всегда по дефолту возвращает ничего не найдено. Но этот шаг лучше сразу
// закрепить чтобы в будущем когда мы сделаем agri мы все это дело там прогнали и подключили без сильных конфликтов».
// 🔒 Что держит: ответы a2a и f2f ступени (`lib/web4-items/lagrix-simulated.mjs` → `lagrixSearch`) одной формы (`contractProblems`); строка
// результата живой сети — форма документов 17 (§17.1, объявление агента) и 20 (техническая карточка элемента). Сегодня его проходит
// имитация; настоящий адаптер обязан пройти его без правки этого файла — правка контракта есть правка обоих видов и этого сторожа вместе.
// 🔒 Сторож доказывает, что умеет падать: пять сломанных ответов должны быть пойманы, ответы живой формы — приняты. Без сети, без записи.
import { lagrixSearch, contractProblems } from '../lib/web4-items/lagrix-simulated.mjs'

const problems = []
const out = lagrixSearch('youtube video summary', {})
if (out.network !== 'lagrix') problems.push('lagrixSearch: network must be "lagrix"')
for (const p of ['a2a', 'f2f']) {
  if (!out.answers?.[p]) problems.push(`lagrixSearch: no ${p} answer`)
  else problems.push(...contractProblems(out.answers[p], p))
}

const a = out.answers.a2a ?? {}
const f = out.answers.f2f ?? {}
const broken = [
  [{ ...a, mode: undefined }, 'mode'],
  [{ ...a, results: [{}], found: 1 }, 'results[0]'],
  [{ ...a, found: 1 }, 'found'],
  [{ ...a, fee: { ...a.fee, charged: true } }, 'never charges'],
  [{ ...a, request: { ...a.request, country: 'Lisbon, Rua Augusta 12' } }, 'country'],
]
for (const [b, word] of broken) if (!contractProblems(b, 'a2a').some((x) => x.includes(word))) problems.push(`the guard missed a broken answer (${word})`)

// The shape the live network must give — an announcement of document 17 §17.1 and a card of document 20.
const liveA2a = { ...a, mode: 'live', fee: { ...a.fee, charged: true }, found: 1, results: [{ element: '0x5c1e', nodeId: '0x892a0149f82d', place: 1, inTurn: false, price: { min: 0.3, max: 0.7, currency: 'USDC' }, agentCard: 'https://agent.example.com/.well-known/agent-card.json', capability: 'market-analysis', deal: { kind: 'instant', disputeWindowSec: 300 } }] }
const liveF2f = { ...f, mode: 'live', fee: { ...f.fee, charged: true }, found: 1, results: [{ element: '0x5c1e', nodeId: '0x892a0149f82d', place: 1, inTurn: true, price: { min: 5, max: 5, currency: 'USDC' }, card: { template: 'fractera-custom-item-starter v0.3.171', framework: 'Node.js 22, Next.js 16', licence: 'MIT', source: 'https://github.com/example/element v1.0.0', consumes: ['auth'], provides: ['POST /api/summary'], env: ['OPENAI_API_KEY'] } }] }
for (const [answer, p] of [[liveA2a, 'a2a'], [liveF2f, 'f2f']]) {
  const got = contractProblems(answer, p)
  if (got.length) problems.push(`a live-shaped ${p} answer was refused: ${got.join('; ')}`)
}

if (problems.length) {
  console.log('===LAGRIX_CONTRACT_FAILED===')
  for (const p of problems) console.log(`- ${p}`)
  process.exit(1)
}
console.log(`===LAGRIX_CONTRACT_OK=== a2a and f2f answers keep one shape (mode ${out.answers.a2a.mode}); ${broken.length} broken answers caught; live-shaped results of documents 17 and 20 accepted`)
