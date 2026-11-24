// Samples of the marketplace application of an own native element (node step 854, `lib/web4-items/market-offer.mjs`): exit code 1 on any miss.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { lastOffer, parseOffer, saveOffer } from '../lib/web4-items/market-offer.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const summary = 'Makes short music clips from a photo and a song for every element.'

t('a good Web2 application with a price, a free Web4 one', () => {
  const a = parseOffer({ market: 'web2', summary, price: '49,5', per: 'month', note: 'v1' })
  assert.deepEqual(a, { ok: true, value: { market: 'web2', summary, price: { amount: 49.5, currency: 'USD', per: 'month' }, note: 'v1' } })
  const b = parseOffer({ market: 'web4', summary, price: '0' })
  assert.equal(b.ok, true)
  assert.equal(b.value.price, null)
})

t('negative: unknown market, short summary, bad price, long note are refused by kind', () => {
  assert.equal(parseOffer({ market: 'ebay', summary }).error, 'bad-market')
  assert.equal(parseOffer({ market: 'web2', summary: 'short' }).error, 'bad-summary')
  assert.equal(parseOffer({ market: 'web2', summary, price: '-3' }).error, 'bad-price')
  assert.equal(parseOffer({ market: 'web2', summary, price: 'abc' }).error, 'bad-price')
  assert.equal(parseOffer({ market: 'web2', summary, note: 'x'.repeat(1001) }).error, 'bad-note')
})

t('kept on the node, never marked sent; Web4 is a simulation; the last one per element is found', () => {
  const dir = mkdtempSync(join(tmpdir(), 'market-offer-'))
  assert.equal(lastOffer(dir, 'cck60'), null)
  saveOffer(dir, 'cck60', parseOffer({ market: 'web2', summary }).value, new Date('2026-11-24T10:00:00Z'))
  saveOffer(dir, 'other', parseOffer({ market: 'web2', summary }).value)
  const r = saveOffer(dir, 'cck60', parseOffer({ market: 'web4', summary }).value, new Date('2026-11-24T11:00:00Z'))
  assert.equal(r.sent, false)
  assert.equal(r.mode, 'simulation')
  assert.equal(lastOffer(dir, 'cck60').at, '2026-11-24T11:00:00.000Z')
  assert.equal(readFileSync(join(dir, 'offers.jsonl'), 'utf8').trim().split('\n').length, 3)
})

console.log(process.exitCode ? `===MARKET_OFFER_TEST_FAILED=== ${passed} passed` : `===MARKET_OFFER_TEST_OK=== ${passed} passed`)
