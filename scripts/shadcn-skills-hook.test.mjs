#!/usr/bin/env node
// npm run test:shadcn-skills-hook — тест хука 730-2: интерфейсный файл пишется только после навыков use-primitives и use-shadcn.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const HOOK = path.join(path.dirname(new URL(import.meta.url).pathname), "..", ".claude", "hooks", "shadcn-skills.mjs")
const root = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-hook-"))
for (const n of ["use-primitives", "use-shadcn"]) { fs.mkdirSync(path.join(root, ".claude/skills", n), { recursive: true }); fs.writeFileSync(path.join(root, ".claude/skills", n, "SKILL.md"), "x") }
const log = path.join(root, "t.jsonl")
const skill = (n) => `{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"${n}"}}]}}\n`
const hook = (file, skills, tool = "Write") => {
  fs.writeFileSync(log, skills.map(skill).join(""))
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ tool_name: tool, cwd: root, transcript_path: log, tool_input: { file_path: path.join(root, file), content: "x" } }), encoding: "utf8" })
}
let failed = 0
const expect = (name, r, code, text) => {
  const ok = r.status === code && (!text || (r.stderr ?? "").includes(text))
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — exit ${r.status}, wanted ${code}\n${r.stderr}`}`)
  if (!ok) failed++
}
expect("an interface file with no skills loaded is refused", hook("components/x/a.client.tsx", []), 2, "«use-primitives» и «use-shadcn»")
expect("only one skill loaded — refused, the other named", hook("app/[lang]/x/page-part.tsx", ["use-primitives"]), 2, "«use-shadcn»")
expect("both skills loaded — allowed", hook("components/x/a.client.tsx", ["use-primitives", "use-shadcn"]), 0)
expect("an Edit is held the same way", hook("_tools/t/client/x.client.tsx", [], "Edit"), 2)
expect("not an interface file — allowed", hook("lib/x.ts", []), 0)
expect("shadcn's own source — allowed", hook("components/ui/button.tsx", []), 0)
expect("a design skill's territory (a section) — allowed", hook("components/sections/section-hero/hero.tsx", []), 0)
expect("a design skill's territory (a prototype) — allowed", hook("app/[lang]/(protectedLayer)/prototypes/_pages/p1/sections/a.tsx", []), 0)
fs.rmSync(path.join(root, ".claude/skills/use-primitives"), { recursive: true })
expect("a project without use-primitives asks only for use-shadcn", hook("components/x/a.client.tsx", ["use-shadcn"]), 0)
fs.rmSync(root, { recursive: true, force: true })
console.log(failed ? `\n===TEST_FAILED=== ${failed}` : "\n===TEST_OK===")
process.exit(failed ? 1 : 0)
