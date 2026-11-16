// THE OPENAI KEY'S LIVE CHECK (336-1; shared by the «Окружение» screen and the person's secret form, 768-6): the format proves nothing,
// so the key is tried with a real call — OpenAI's list of models answers 200 only to a live key. Refused — nothing is written.
import { readOpenAiResponse, readOpenAiException, logOpenAiError } from "@/lib/openai-error.cjs"
import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs"

export const OPENAI_KEY = /^sk-[A-Za-z0-9_-]{20,300}$/

/** Живой ли ключ: список моделей OpenAI отвечает 200 только настоящему ключу. */
export async function probeOpenAiKey(key: string): Promise<"ok" | "key-rejected" | "probe-failed"> {
  // 726-1: every call writes one line of the node's ledger (`lib/usage-ledger.cjs`, `npm run money`) — no prompt, no key.
  const call = { who: "environment/probe", endpoint: "models", started: Date.now() }
  try {
    const r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) })
    if (r.ok) { recordOk({ ...call, status: r.status }); return "ok" }
    // 726-0: read by the node's one reader; the screen keeps its two words, the node's log gets OpenAI's own reason.
    const info = await readOpenAiResponse(r)
    logOpenAiError("environment/probe", info)
    recordRefusal({ ...call, info })
    return ["bad-key", "ip-blocked", "forbidden", "region"].includes(info.reason) ? "key-rejected" : "probe-failed"
  } catch (e) {
    const info = readOpenAiException(e)
    logOpenAiError("environment/probe", info)
    recordRefusal({ ...call, info })
    return "probe-failed"
  }
}

