// Samples of the Fractera marketplace rung, search v1 (node step 841-2, `lib/web4-items/fractera-market.mjs`): exit code 1 on any miss.
import { marketAnswer, marketAnswerV2, marketSearch, priceText, simulatedMarket } from '../lib/web4-items/fractera-market.mjs'

let bad = 0
const check = (name, ok, got) => { console.log(`${ok ? '✓' : '✗'} ${name}`); if (!ok) { bad++; console.log('   got:', JSON.stringify(got)) } }

const live = marketAnswer({ v: 1, mode: 'live', summary: 'Two fit.', items: [{ title: 'Clips', summary: 'Music clips', url: 'https://fractera.ai/marketplace/clips', kind: 'native', price: { amount: 12, currency: 'USDC', per: 'month' } }, { title: 'x', url: 'http://evil.test/p' }] })
check('a v1 answer is taken: its summary and its https public pages', live?.mode === 'live' && live.items.length === 1 && live.items[0].kind === 'native', live)
check('each element carries the three things: what it does, its page, its price', live?.items[0].summary === 'Music clips' && priceText(live.items[0].price, 'ru') === '12 USDC / мес', live?.items[0])
check('negative: a price in another currency or below zero is no price', marketAnswer({ v: 1, summary: 's', items: [{ title: 't', url: 'https://x.test/p', price: { amount: -1, currency: 'USD' } }, { title: 'u', url: 'https://x.test/q', price: { amount: 5, currency: 'EUR' } }] })?.items.every((x) => x.price === null), null)
check('negative: another version is not a v1 answer', marketAnswer({ v: 2, summary: 's', items: [] }) === null, null)
check('negative: no summary — not an answer', marketAnswer({ v: 1, items: [] }) === null, null)
const sim = simulatedMarket('музыкальные клипы', 'ru')
check('no answer is said honestly, in the person\'s language, with no invented elements (the owner, Telegram 1093)', sim.mode === 'simulation' && sim.summary.includes('не ответил') && sim.items.length === 0, sim)
const off = await marketSearch('video editing', { lang: 'en', base: 'http://127.0.0.1:9', timeoutMs: 1500 })
check('negative: a silent marketplace never invents an offer — the marked «did not answer», no items, its reason kept', off.mode === 'simulation' && off.items.length === 0 && Boolean(off.why), off)

const v2 = marketAnswerV2({ v: 2, mode: 'live', caller: { verified: true }, summary: 'One fits.', items: [{ name: 'Тестовый пост', slug: 'fractera-test-post-starter', page: 'https://f2f-marketplace.fractera.ai/s/post', description: 'A post by its title', price: { amount: 0, currency: 'USD', per: 'once' }, whyFits: { context: 'a post of the asked length' } }, { name: 'bad', page: 'http://evil.test/p' }] })
check('862-2: a v2 answer — verified, one item with its page, price and «why»; an http page is dropped (negative)', v2?.verified === true && v2.items.length === 1 && v2.items[0].why === 'a post of the asked length' && v2.items[0].url.startsWith('https://'), v2)
check('862-2 negative: a v1 body is not a v2 answer', marketAnswerV2({ v: 1, summary: 's', items: [] }) === null, null)
console.log(bad ? `===MARKET_TEST_FAILED=== ${bad}` : '===MARKET_TEST_OK=== 9 passed')
process.exit(bad ? 1 : 0)
