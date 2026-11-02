import "server-only"
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { addressOfPrivateKey, newPrivateKey, toChecksumAddress } from "@/lib/web4-items/evm-address.mjs"
import nodeType from "@/lib/web4-items/node-type.cjs"

// КОШЕЛЁК УЗЛА (478-3). Слово владельца 2026-10-14: «в паспорте узла … должна быть опция подключить кошелёк, нет кошелька есть
// видимость системе … заказчику будет предоставлено только обнаружение в случае если он оплачивает комиссию за обнаружение».
// Словарь 14.10: кошелёк — регистрация узла в сети и его счёт; с 532 элементы наследуют его, если у них нет своего.
//
// 532 (владелец 2026-10-18, дословно: «есть опция сгенерировать его … по умолчанию будем поступать с кошельком та же как с
// репозиториями или ключами OpenNI … если гидро имеет записи то все элементы его наследуют ну также в элементы есть право добавить
// свой собственный кошелёк, или удалить свой собственный кошелёк и вновь переключиться на кошелёк системы»; план — «Подтвердить
// (Рекомендую)»):
// - кошелёк бывает подключён АДРЕСОМ (узел им не подписывает) или СОЗДАН на узле — тогда рядом лежит закрытый ключ: по документу
//   Lagrix 19 узел подписывает кошельком объявления, сделки и чеки;
// - у элемента свой кошелёк сильнее кошелька узла (как токен GitHub, 374-3): своего нет — элемент работает кошельком узла.
//
// 🔒 ФАЙЛЫ ВНЕ GIT (`data/*` в .gitignore): узел — `data/node/wallet.json` (+ `wallet-key.json`), элемент —
// `data/services/<id>/wallet/wallet.json` (+ `wallet-key.json`). Ключ наружу отдаёт только `readPrivateKey` — для резервной копии.
// 🔒 УДАЛЁННЫЙ СОЗДАННЫЙ КОШЕЛЁК НЕ СТИРАЕТСЯ: ключ уезжает в `…/wallet-removed/`, иначе одно нажатие уничтожило бы деньги на нём.
// 🛑 ЭТО НЕ РЕГИСТРАЦИЯ В СЕТИ: сети Lagrix ещё нет, созданный ключ ничего в ней не подписывает.

export type WalletKind = "address" | "generated"
export type NodeWallet = { address: string; network: "USDC"; connectedAt: string; kind: WalletKind }
export type WalletSource = "element" | "node" | null
export type ElementWalletState = { wallet: NodeWallet | null; source: WalletSource; own: NodeWallet | null; node: NodeWallet | null }

const ROOT = process.cwd()

/**
 * 553-6 (владелец 2026-10-21, дословно: «в случае если пользователь выбирает решение с целью одному самостоятельно управлять всеми
 * агентами (то есть не завод приложений) то на весь проект должен существовать один единственный кошелёк»). Единый проект — кошелёк
 * один, кошелёк узла: свой элементу не завести; прежний свой снять можно всегда; ключи узел не стирает. Завод — как в 532.
 * Тип читается на каждый запрос: смена типа действует сразу, без пересборки.
 */
export function oneWallet(): boolean {
  return nodeType.readNodeType(ROOT) === "project"
}
const EVM = /^0x[0-9a-fA-F]{40}$/
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/

/** Папка кошелька: узла (`element` не задан) или элемента. */
function dirOf(element?: string): string {
  if (element === undefined) return join(ROOT, "data", "node")
  if (!ID.test(element)) throw new Error("bad element id")
  return join(ROOT, "data", "services", element, "wallet")
}
const walletFile = (element?: string) => join(dirOf(element), "wallet.json")
const keyFile = (element?: string) => join(dirOf(element), "wallet-key.json")

function read(element?: string): NodeWallet | null {
  try {
    const w = JSON.parse(readFileSync(walletFile(element), "utf8")) as Partial<NodeWallet>
    if (typeof w.address !== "string" || !EVM.test(w.address)) return null
    // Созданным кошелёк считается, только если ключ на месте и даёт тот же адрес: файл, расходящийся с ключом, — подключённый адрес.
    const generated = w.kind === "generated" && readPrivateKey(element) !== null
    return { address: w.address, network: "USDC", connectedAt: w.connectedAt ?? "", kind: generated ? "generated" : "address" }
  } catch {
    return null
  }
}

/** Кошелёк узла. */
export function readWallet(): NodeWallet | null {
  return read()
}

/** Кошелёк, которым работает элемент: свой, иначе узла (532-2). */
export function readElementWallet(element: string): ElementWalletState {
  const own = read(element)
  const node = read()
  return { wallet: own ?? node, source: own ? "element" : node ? "node" : null, own, node }
}

export function isEvmAddress(value: unknown): value is string {
  return typeof value === "string" && EVM.test(value.trim())
}

function write(element: string | undefined, w: NodeWallet): NodeWallet {
  mkdirSync(dirOf(element), { recursive: true })
  writeFileSync(walletFile(element), `${JSON.stringify(w, null, 2)}\n`)
  return w
}

/** Подключить адрес (узел им не подписывает). Прежний созданный ключ не стирается — уезжает в `wallet-removed/`. */
export function saveWallet(address: string, element?: string): NodeWallet {
  retireKey(element)
  return write(element, { address: toChecksumAddress(address.trim()), network: "USDC", connectedAt: new Date().toISOString(), kind: "address" })
}

/** Создать кошелёк на узле: новый ключ secp256k1, адрес — из него (документ Lagrix 19). */
export function generateWallet(element?: string): NodeWallet {
  retireKey(element)
  const privateKey = newPrivateKey()
  const address = addressOfPrivateKey(privateKey)
  if (!address) throw new Error("key generation failed")
  const createdAt = new Date().toISOString()
  mkdirSync(dirOf(element), { recursive: true })
  writeFileSync(keyFile(element), `${JSON.stringify({ address, privateKey, createdAt }, null, 2)}\n`, { mode: 0o600 })
  try { chmodSync(keyFile(element), 0o600) } catch { /* Windows права не понимает — файл всё равно вне git и вне сайта */ }
  return write(element, { address, network: "USDC", connectedAt: createdAt, kind: "generated" })
}

/** Закрытый ключ созданного кошелька — только если он даёт адрес из `wallet.json`. Для резервной копии и только для неё. */
export function readPrivateKey(element?: string): { address: string; privateKey: string; createdAt: string } | null {
  try {
    const k = JSON.parse(readFileSync(keyFile(element), "utf8")) as { privateKey?: string; createdAt?: string }
    const w = JSON.parse(readFileSync(walletFile(element), "utf8")) as { address?: string }
    const address = addressOfPrivateKey(k.privateKey ?? "")
    if (!address || address.toLowerCase() !== String(w.address).toLowerCase()) return null
    return { address, privateKey: k.privateKey as string, createdAt: k.createdAt ?? "" }
  } catch {
    return null
  }
}

/** Ключ уходит в `wallet-removed/<время>-<адрес>.json`, а не стирается. */
function retireKey(element?: string): void {
  if (!existsSync(keyFile(element))) return
  const k = readPrivateKey(element)
  const dir = join(dirOf(element), "wallet-removed")
  mkdirSync(dir, { recursive: true })
  renameSync(keyFile(element), join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}-${k?.address ?? "unknown"}.json`))
}

/** Снять кошелёк (узла или свой элемента — элемент снова работает кошельком узла). Созданный ключ сохраняется в `wallet-removed/`. */
export function removeWallet(element?: string): void {
  retireKey(element)
  if (existsSync(walletFile(element))) rmSync(walletFile(element))
}
