// ПРИБОР АДРЕСА КОШЕЛЬКА (532-1): `node scripts/check-wallet-address.mjs`. Известные векторы — ключ 1 и ключ 2 дают адреса, которые
// знает любой кошелёк Ethereum; EIP-55 — образцы из самого EIP-55; случайный ключ даёт адрес вида 0x + 40 знаков. Порча: подменить
// keccak_256 на sha3_256 в `lib/web4-items/evm-address.mjs` — прибор обязан покраснеть (проверено при написании, 532-1).
import { addressOfPrivateKey, newPrivateKey, toChecksumAddress } from "../lib/web4-items/evm-address.mjs"

const cases = [
  ["key 1", addressOfPrivateKey("0x" + "0".repeat(63) + "1"), "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf"],
  ["key 2", addressOfPrivateKey("0".repeat(63) + "2"), "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF"],
  ["eip-55 a", toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"), "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"],
  ["eip-55 b", toChecksumAddress("0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359"), "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359"],
  ["bad key", addressOfPrivateKey("0x" + "0".repeat(64)), null],
  ["not hex", addressOfPrivateKey("hello"), null],
]
let bad = 0
for (const [name, got, want] of cases) {
  const ok = got === want
  if (!ok) bad++
  console.log(`${ok ? "ok " : "BAD"} ${name}: ${got}${ok ? "" : ` (want ${want})`}`)
}
const fresh = addressOfPrivateKey(newPrivateKey())
const freshOk = /^0x[0-9a-fA-F]{40}$/.test(fresh ?? "")
if (!freshOk) bad++
console.log(`${freshOk ? "ok " : "BAD"} random key: ${fresh}`)
if (bad) { console.error(`===WALLET_ADDRESS_FAIL=== ${bad}`); process.exit(1) }
console.log("===WALLET_ADDRESS_OK===")
