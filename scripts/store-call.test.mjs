// Samples of the node-signed envelope (core step 862-2): it verifies with its own public key, its node is the key's id, and a body
// changed after signing does not verify (negative). Runs on a scratch identity — never the node's own key.
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createPublicKey, verify } from 'node:crypto'
import { createRequire } from 'node:module'
import { storeEnvelope } from '../lib/web4-items/store-call.mjs'

const require = createRequire(import.meta.url)
const channel = require('../lib/node/creator-channel.cjs')
let failures = 0
const check = (label, ok) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`) }
const root = mkdtempSync(join(tmpdir(), 'store-call-'))
try {
  const e = storeEnvelope(root, { element: 'market', request: 'пост по названию', lang: 'ru', limit: 3 })
  const ok = (env) => verify(null, Buffer.from(channel.canonical(env.body)), createPublicKey(env.publicKey), Buffer.from(env.signature, 'base64'))
  check('v 2 and the fields kept', e.v === 2 && e.body.element === 'market' && e.body.request === 'пост по названию')
  check('body.node is the id of the public key', e.body.node === channel.idOf(e.publicKey))
  check('a fresh nonce of 16 hex and an ISO time', /^[0-9a-f]{16}$/.test(e.body.nonce) && !Number.isNaN(Date.parse(e.body.at)))
  check('the signature verifies with the public key', ok(e))
  check('negative: a body changed after signing does not verify', !ok({ ...e, body: { ...e.body, request: 'видеомонтаж' } }))
  check('two envelopes never share a nonce', storeEnvelope(root, {}).body.nonce !== storeEnvelope(root, {}).body.nonce)
} finally { rmSync(root, { recursive: true, force: true }) }
if (failures) { console.error(`===STORE_CALL_TEST_FAILED=== ${failures}`); process.exit(1) }
console.log('===STORE_CALL_TEST_OK===')
