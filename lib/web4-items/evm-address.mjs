// АДРЕС КОШЕЛЬКА ИЗ КЛЮЧА (532-1). Владелец 2026-10-18: «есть опция сгенерировать его»; план 532 подтверждён им же («Подтвердить
// (Рекомендую)»). Ключ узла — secp256k1 (документ Lagrix 19, раздел 19.2: «Its own key — the wallet»); адрес — последние 20 байт
// keccak-256 несжатого открытого ключа без первого байта, с контрольной суммой EIP-55. Чистые функции без файлов и без «server-only»:
// их зовут и дверь ядра, и прибор `scripts/check-wallet-address.mjs` (известный вектор: ключ 1 → 0x7E5F…5Bdf).
// 🛑 keccak-256 ≠ sha3-256 (другое дополнение): перепутанная функция даёт правдоподобный, но чужой адрес — прибор ловит это.
import { secp256k1 } from "@noble/curves/secp256k1"
import { keccak_256 } from "@noble/hashes/sha3"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"

const HEX64 = /^(0x)?[0-9a-fA-F]{64}$/

/** Новый случайный закрытый ключ, `0x` + 64 шестнадцатеричных знака. */
export function newPrivateKey() {
  return `0x${bytesToHex(secp256k1.utils.randomPrivateKey())}`
}

/** EIP-55: регистр каждой буквы адреса задаёт keccak-256 его строчной записи. */
export function toChecksumAddress(address) {
  const lower = String(address).toLowerCase().replace(/^0x/, "")
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(lower)))
  let out = "0x"
  for (let i = 0; i < lower.length; i++) out += parseInt(hash[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i]
  return out
}

/** Адрес кошелька по закрытому ключу (`0x…` или без префикса); неверный ключ — null. */
export function addressOfPrivateKey(privateKey) {
  if (typeof privateKey !== "string" || !HEX64.test(privateKey)) return null
  const key = hexToBytes(privateKey.replace(/^0x/, ""))
  if (!secp256k1.utils.isValidPrivateKey(key)) return null
  const pub = secp256k1.getPublicKey(key, false)
  return toChecksumAddress(bytesToHex(keccak_256(pub.slice(1)).slice(-20)))
}
