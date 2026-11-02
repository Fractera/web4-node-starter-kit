// @api manage the node or element wallet and its key backup
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/web4-items/element-delete"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { generateWallet, isEvmAddress, oneWallet, readElementWallet, readPrivateKey, readWallet, removeWallet, saveWallet } from "@/lib/web4-items/node-wallet"

// КОШЕЛЁК УЗЛА И ЭЛЕМЕНТА (478-3; 532). Без `element` — кошелёк узла, с `?element=<адрес или id рождённого элемента>` — свой кошелёк
// элемента (ответ называет источник: `element` · `node` · null — элемент наследует кошелёк узла, 532-2).
//   GET              — `{ wallet }` узла или `{ wallet, source, own, node }` элемента; ключа в ответе нет никогда.
//   GET `?backup=1`  — файл резервной копии созданного ключа (404, если кошелёк подключён адресом или его нет).
//   POST `{ address }` — подключить адрес (EVM: 0x и 40 шестнадцатеричных знаков, иначе 422); POST `{ generate: true }` — создать ключ на узле.
//   DELETE           — снять (созданный ключ не стирается: `wallet-removed/`); у элемента — снова кошелёк узла.
// Только архитектор: кошелёк — счёт элементов узла. На временном публичном адресе запись и резервная копия запрещены: ключ, прошедший
// через чужой туннель, — утечка.
export const dynamic = "force-dynamic"

const ROLES = ["architect"] as const
const NO_STORE = { "Cache-Control": "no-store" }

type Scope = { element?: string } | NextResponse

function scopeOf(req: NextRequest): Scope {
  const raw = req.nextUrl.searchParams.get("element")
  if (raw === null) return {}
  const id = idOfAddress(raw)
  if (!id || !isBornElement(id)) return NextResponse.json({ ok: false, error: "unknown-element" }, { status: 404, headers: NO_STORE })
  return { element: id }
}

function stateOf(element?: string) {
  // 553-6: элементный ответ называет, один ли кошелёк на узел (единый проект) — островок прячет «Добавить свой».
  return element === undefined ? { wallet: readWallet() } : { ...readElementWallet(element), oneWallet: oneWallet() }
}

async function gate(req: NextRequest, write: boolean): Promise<NextResponse | null> {
  if (write && isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403, headers: NO_STORE })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const backup = req.nextUrl.searchParams.get("backup") === "1"
  const denied = await gate(req, backup)
  if (denied) return denied
  const scope = scopeOf(req)
  if (scope instanceof NextResponse) return scope
  if (!backup) return NextResponse.json({ ok: true, ...stateOf(scope.element) }, { headers: NO_STORE })
  const key = readPrivateKey(scope.element)
  if (!key) return NextResponse.json({ ok: false, error: "no-generated-key" }, { status: 404, headers: NO_STORE })
  const body = {
    warning: "Whoever knows this private key controls the money on this wallet. Keep the file offline; never send it to anyone.",
    ...key,
    element: scope.element ?? null,
  }
  return new NextResponse(`${JSON.stringify(body, null, 2)}\n`, {
    headers: { ...NO_STORE, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="wallet-${key.address}.json"` },
  })
}

export async function POST(req: NextRequest) {
  const denied = await gate(req, true)
  if (denied) return denied
  const scope = scopeOf(req)
  if (scope instanceof NextResponse) return scope
  // 553-6: единый проект — свой кошелёк элементу не заводится (снять прежний — DELETE — можно всегда).
  if (scope.element !== undefined && oneWallet()) return NextResponse.json({ ok: false, error: "one-wallet", ...stateOf(scope.element) }, { status: 409, headers: NO_STORE })
  const body = (await req.json().catch(() => null)) as { address?: unknown; generate?: unknown } | null
  if (body?.generate === true) {
    generateWallet(scope.element)
    return NextResponse.json({ ok: true, ...stateOf(scope.element) }, { headers: NO_STORE })
  }
  if (!isEvmAddress(body?.address)) return NextResponse.json({ ok: false, error: "bad-address" }, { status: 422, headers: NO_STORE })
  saveWallet(body.address, scope.element)
  return NextResponse.json({ ok: true, ...stateOf(scope.element) }, { headers: NO_STORE })
}

export async function DELETE(req: NextRequest) {
  const denied = await gate(req, true)
  if (denied) return denied
  const scope = scopeOf(req)
  if (scope instanceof NextResponse) return scope
  removeWallet(scope.element)
  return NextResponse.json({ ok: true, ...stateOf(scope.element) }, { headers: NO_STORE })
}
