// Samples of the Fractera marketplace rung, search v1 (node step 841-2, `lib/web4-items/fractera-market.mjs`): exit code 1 on any miss.
import { marketAnswer, marketSearch, priceText, simulatedMarket } from '../lib/web4-items/fractera-market.mjs'

let bad = 0
const check = (name, ok, got) => { console.log(`${ok ? '✓' : '✗'} ${name}`); if (!ok) { bad++; console.log('   got:', JSON.stringify(got)) } }

const live = marketAnswer({ v: 1, mode: 'live', summary: 'Two fit.', items: [{ title: 'Clips', summary: 'Music clips', url: 'https://fractera.ai/marketplace/clips', kind: 'native', price: { amount: 12, currency: 'USDC', per: 'month' } }, { title: 'x', url: 'http://evil.test/p' }] })
check('a v1 answer is taken: its summary and its https public pages', live?.mode === 'live' && live.items.length === 1 && live.items[0].kind === 'native', live)
check('each element carries the three things: what it does, its page, its price', live?.items[0].summary === 'Music clips' && priceText(live.items[0].price, 'ru') === '12 USDC / мес', live?.items[0])
check('negative: a price in another currency or below zero is no price', marketAnswer({ v: 1, summary: 's', items: [{ title: 't', url: 'https://x.test/p', price: { amount: -1, currency: 'USD' } }, { title: 'u', url: 'https://x.test/q', price: { amount: 5, currency: 'EUR' } }] })?.items.every((x) => x.price === null), null)
check('negative: another version is not a v1 answer', marketAnswer({ v: 2, summary: 's', items: [] }) === null, null)
check('negative: no summary — not an answer', marketAnswer({ v: 1, items: [] }) === null, null)
const sim = simulatedMarket('музыкальные клипы', 'ru')
check('the stand-in says it is a simulation, in the person\'s language, with public pages', sim.mode === 'simulation' && sim.summary.includes('имитируется') && sim.items.every((x) => x.url.startsWith('https://fractera.ai/marketplace/')), sim)
const off = await marketSearch('video editing', { lang: 'en', base: 'http://127.0.0.1:9', timeoutMs: 1500 })
check('negative: a silent marketplace gives the marked simulation, never an empty offer', off.mode === 'simulation' && off.items.length >= 2 && Boolean(off.why), off)

console.log(bad ? `===MARKET_TEST_FAILED=== ${bad}` : '===MARKET_TEST_OK=== 7 passed')
process.exit(bad ? 1 : 0)
