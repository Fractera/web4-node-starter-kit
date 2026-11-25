// @api ask the main agent to bring a quiz version back
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { elementDir } from "@/lib/web4-items/element-github"
import { quizVersions } from "@/lib/web4-items/product-quiz-pdf"

// «ВЕРНУТЬСЯ К ВЕРСИИ N» (шаг 852-5; Рома 2026-11-24: «откат — новая версия, а не переписывание истории»). POST { item, back: N } с роли
// архитектора или админа: версия N должна быть тегом элемента `quiz-v<N>`; дверь будит главного агента (закон 636 — агента элемента
// дверь не будит), и тот ставит агенту элемента задачу: вернуть `development-docs/product/` к тегу quiz-v<N> новым коммитом и пометить
// его следующей версией. История не переписывается.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
type Wake = (service: string, opts: { text?: string; from?: string; about?: string; confirmed?: boolean }) => Promise<{ ok: boolean; reason?: string }>

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { item?: unknown; back?: unknown } | null
  const id = typeof body?.item === "string" ? idOfAddress(body.item) : null
  const dir = id ? elementDir(id) : null
  if (!id || !dir) return NextResponse.json({ ok: false, error: "unknown-element" }, { status: 404, headers: NO_STORE })
  const versions = await quizVersions(dir)
  const back = versions.find((v) => v.n === body?.back)
  if (!back) return NextResponse.json({ ok: false, error: "no-such-version" }, { status: 400, headers: NO_STORE })
  const next = (versions[0]?.n ?? 0) + 1
  if (back.n === versions[0]?.n) return NextResponse.json({ ok: false, error: "already-current" }, { status: 400, headers: NO_STORE })
  const text = [
    `The architect pressed «вернуться к версии ${back.n}» on the quiz page of element «${id}» (core step 852-5).`,
    `Give its agent the task (npm run task -- ${id} "…"): make version ${next} equal to version ${back.n} — restore development-docs/product/ from its tag ${back.tag} (git checkout ${back.tag} -- development-docs/product), commit «Quiz v${next} = v${back.n}», tag quiz-v${next}, push when its repository is connected; never move or delete a tag. Then tell the architect in one line.`,
  ].join("\n")
  const wake = (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake
  const woke = typeof wake === "function" ? await wake("build", { text, from: "quiz page", about: `quiz of ${id} back to v${back.n}`, confirmed: true }).catch(() => ({ ok: false })) : { ok: false }
  return NextResponse.json({ ok: true, back: back.n, next, woke: woke.ok }, { headers: NO_STORE })
}
