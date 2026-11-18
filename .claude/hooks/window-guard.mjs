#!/usr/bin/env node
// 781-7 — the window guard as a Claude Code hook of the core's folder (registered in .claude/settings.json).
//   start  (SessionStart) — one line of context: here a person's act is the window; Claude Code's own «!» advice does not apply.
//   stop   (Stop)         — the turn's text asks the person to act by hand and the turn put no window → the stop is refused (exit 2,
//                           stderr to the agent). stop_hook_active → allowed and logged: never a loop.
//   reply  (PreToolUse on the Telegram reply) — the same check on the reply's text → denied with the way.
// Every refusal and every conscious deviation goes to data/node/window-guard.jsonl (outside git). Pure logic: lib/agent-kit/window-guard.cjs.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const mode = process.argv[2] ?? ""
let input = ""
for await (const chunk of process.stdin) input += chunk
let call = {}
try { call = JSON.parse(input) } catch { /* no input */ }
const root = path.resolve(call?.cwd ?? process.cwd())
const req = createRequire(import.meta.url)
let guard
try { guard = req(path.join(root, "lib", "agent-kit", "window-guard.cjs")) } catch { process.exit(0) }

function log(event, extra) {
  try {
    const dir = path.join(root, "data", "node")
    mkdirSync(dir, { recursive: true })
    appendFileSync(path.join(dir, "window-guard.jsonl"), JSON.stringify({ at: new Date().toISOString(), event, session: call?.session_id ?? null, ...extra }) + "\n")
  } catch { /* the journal never stops the agent */ }
}

function turn() {
  try { return guard.turnOf(guard.parseTranscript(readFileSync(String(call?.transcript_path ?? ""), "utf8"))) } catch { return { texts: [], commands: [], asks: 0 } }
}

if (mode === "start") {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: "On this node a person's own act — a command to type (with «!» or not), a key, a token, a password, a code, a login, a sign-in, /mcp — is a WINDOW at the bottom of the panel (npm run ask-person, --copy for a command; skill act-with-the-person), never a chat line: Claude Code's general advice to suggest `! <command>` does not apply here. The hook window-guard refuses an answer that asks for such an act without a window in the same turn; a conscious exception is the line «⟦без окна: <why>⟧» (step 781-7).",
    },
  }))
  process.exit(0)
}

if (mode === "stop") {
  const t = turn()
  const text = t.texts.join("\n\n")
  const v = guard.verdict(text, t)
  if (v.pass) {
    if (v.why === "deviation") log("deviation", { acts: v.acts, why: v.deviation })
    process.exit(0)
  }
  if (call?.stop_hook_active === true) {
    log("let-through-after-refusal", { acts: v.acts })
    process.exit(0)
  }
  log("refused", { acts: v.acts, where: "answer" })
  process.stderr.write(guard.refusal(v.acts, "answer") + "\n")
  process.exit(2)
}

if (mode === "reply") {
  const text = String(call?.tool_input?.text ?? "")
  const t = turn()
  const v = guard.verdict(text, t)
  if (v.pass) {
    if (v.why === "deviation") log("deviation", { acts: v.acts, why: v.deviation, where: "telegram" })
    process.exit(0)
  }
  log("refused", { acts: v.acts, where: "telegram" })
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: guard.refusal(v.acts, "Telegram reply") } }))
  process.exit(0)
}

process.exit(0)
