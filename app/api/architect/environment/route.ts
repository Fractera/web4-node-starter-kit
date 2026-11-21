// @api read which environment variables are set and save the OpenAI key
import elementAgentRoles from "@/lib/auth/element-agent-roles.cjs"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/web4-items/element-delete"
import { EDITABLE, type EditableName, setNames, writeVar } from "@/lib/env-file"
import { OPENAI_KEY, probeOpenAiKey as probe } from "@/lib/openai-probe"

// ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (336-1). `?target=core` или id рождённого элемента.
//   GET  — имена заданных переменных и есть ли ключ OpenAI у ядра. Значений в ответе нет никогда.
//   POST `{ target, name, value }` — только EDITABLE; ключ OpenAI до записи проверяется НАСТОЯЩИМ вызовом OpenAI (формат
//        не доказывает, что ключ живой). Отказ — файл не тронут.
// Ворота architect/admin; на временном публичном адресе — отказ: ключ, вписанный через чужой туннель, — утечка.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

function targetOk(target: string): boolean {
  return target === "core" || isBornElement(target)
}

// 834-3 (the owner, Telegram 644: «A4 ещё нужно OpenAI ключ пробросить»): an element's own admin sets ITS element's key — never the
// core's, never a neighbour's (`lib/auth/element-agent-roles.cjs`); the architect and the node's admin, as before, any target.
async function gate(req: NextRequest, target = "core"): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, target !== "core" && isBornElement(target) ? elementAgentRoles.agentRoles(process.cwd(), target) : ["architect", "admin"])
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("target") ?? ""
  const denied = await gate(req, target)
  if (denied) return denied
  if (!targetOk(target)) return NextResponse.json({ ok: false, error: "unknown-target" }, { status: 404 })
  const set = setNames(target)
  const coreHasKey = Boolean(process.env.OPENAI_API_KEY) || setNames("core").includes("OPENAI_API_KEY")
  return NextResponse.json({ ok: true, set, editable: EDITABLE, coreHasKey }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  let body: { target?: unknown; name?: unknown; value?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 }) }
  const target = typeof body.target === "string" ? body.target : ""
  const denied = await gate(req, target)
  if (denied) return denied
  const name = typeof body.name === "string" ? body.name : ""
  const value = typeof body.value === "string" ? body.value.trim() : ""
  if (!targetOk(target)) return NextResponse.json({ ok: false, error: "unknown-target" }, { status: 404 })
  if (!(EDITABLE as readonly string[]).includes(name)) return NextResponse.json({ ok: false, error: "not-editable" }, { status: 400 })
  if (!OPENAI_KEY.test(value)) return NextResponse.json({ ok: false, error: "bad-format" }, { status: 400 })
  const checked = await probe(value)
  if (checked !== "ok") return NextResponse.json({ ok: false, error: checked }, { status: 400, headers: NO_STORE })
  if (!writeVar(target, name as EditableName, value)) return NextResponse.json({ ok: false, error: "write-failed" }, { status: 500 })
  const coreHasKey = Boolean(process.env.OPENAI_API_KEY) || setNames("core").includes("OPENAI_API_KEY")
  return NextResponse.json({ ok: true, coreHasKey }, { headers: NO_STORE })
}
