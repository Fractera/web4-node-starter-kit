// @api refuse every action of a tool shown as a look
import { NextRequest, NextResponse } from "next/server"

import { toolsTabUi } from "@/components/tools-tab/tools-tab.i18n"

// THE LOOK DOOR (node step 733-8b). The law of a look: it never spends money and never writes. A tool shown in the Tools tab whose action
// is a call to an address (the voice tools' `apiUrl`) gets this address instead: the body is read and thrown away, no model is called, nothing
// is stored, and the answer is a refusal in the page's words — «in the look this does not run — it needs …». The tool itself is unchanged.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const NEED = /^[a-z0-9-]{1,24}$/

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  let lang = url.searchParams.get("lang") ?? ""
  try {
    const form = await req.formData()
    const ui = form.get("uiLang")
    if (typeof ui === "string" && ui) lang = ui
  } catch { /* not a form — the body is thrown away all the same */ }
  const words = toolsTabUi(lang)
  const needs = (url.searchParams.get("needs") ?? "").split(",").filter((n) => NEED.test(n))
  const named = needs.map((n) => words.needNames[n] ?? n).join(", ")
  return NextResponse.json({ ok: false, reason: "look", words: words.demoHeld.replace("{needs}", named || "—") }, { status: 409, headers: HEADERS })
}
