#!/usr/bin/env node
// npm run test:parts-gate — the gate of a new interface file (725-3, 725-7, 733-1): parts asked in the session, the birth declared, a tool carded first.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

// fileURLToPath, not URL.pathname: ✗ windows-latest read «/D:/a/…» and joined it into «D:\\D:\\a\\…».
const HOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".claude", "hooks", "parts-gate.mjs")
const root = fs.mkdtempSync(path.join(os.tmpdir(), "parts-gate-"))
fs.mkdirSync(path.join(root, "lib/parts"), { recursive: true })
fs.writeFileSync(path.join(root, "lib/parts/PARTS.json"), "{}")
const log = path.join(root, "t.jsonl")
const ASK = `{"type":"assistant","message":{"content":[{"type":"tool_use","name":"mcp__node-skills__parts_find","input":{"query":"x"}}]}}\n`
const run = (file, { asked = false, content = "export function A() { return null }\n", tool = "Write", cwd = root } = {}) => {
  fs.writeFileSync(log, asked ? ASK : "")
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ tool_name: tool, cwd, transcript_path: log, tool_input: { file_path: path.join(cwd, file), content } }), encoding: "utf8" })
}
let failed = 0
const expect = (name, r, code, text) => {
  const ok = r.status === code && (!text || (r.stderr ?? "").includes(text))
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — exit ${r.status}, wanted ${code}\n${r.stderr}`}`)
  if (!ok) failed++
}
const PART = '"use client"\n// @part zz-row — a row\nexport function A() { return null }\n'
const LOCAL = "// @local — only this page draws it\nexport function A() { return null }\n"
expect("a new file, nothing asked, nothing declared — refused, both named", run("components/x/a.client.tsx"), 2, "parts_find")
expect("asked but not declared — refused with the declaration", run("components/x/a.client.tsx", { asked: true }), 2, "@part <id>")
expect("declared but not asked — refused with the ask", run("components/x/a.client.tsx", { content: PART }), 2, "parts_find")
expect("asked and declared a part — allowed", run("components/x/a.client.tsx", { asked: true, content: PART }), 0)
expect("asked and declared local — allowed", run("app/[lang]/(architectLayer)/_components/b.client.tsx", { asked: true, content: LOCAL }), 0)
expect("npm run parts in the transcript counts as asking", (() => { fs.writeFileSync(log, '{"command":"npm run parts -- поле"}\n'); return spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ tool_name: "Write", cwd: root, transcript_path: log, tool_input: { file_path: path.join(root, "components/x/c.tsx"), content: LOCAL } }), encoding: "utf8" }) })(), 0)
fs.mkdirSync(path.join(root, "components/x"), { recursive: true }); fs.writeFileSync(path.join(root, "components/x/old.tsx"), "x")
expect("rewriting an existing file is not a birth — allowed", run("components/x/old.tsx"), 0)
expect("a route file — allowed", run("app/[lang]/x/page.tsx"), 0)
expect("shadcn's own source — allowed", run("components/ui/new.tsx"), 0)
expect("a widget (design territory) — allowed", run("app/[lang]/(publicLayer)/blog/_widgets/static/w/w.tsx"), 0)
expect("not an interface file — allowed", run("lib/x.ts"), 0)
expect("an Edit is not a birth — allowed", run("components/x/a.client.tsx", { tool: "Edit" }), 0)
// 733-1: a tool is born with its card first; every refusal asks the three questions of the definition.
expect("a refusal asks the three questions", run("components/x/q.client.tsx", { asked: true }), 2, "«verb + object»")
expect("a new tool file without its card — refused, the card named", run("_tools/qr-code/client/qr.client.tsx", { asked: true }), 2, "_tools/qr-code/tool.json")
fs.mkdirSync(path.join(root, "_tools/qr-code"), { recursive: true }); fs.writeFileSync(path.join(root, "_tools/qr-code/tool.json"), "{}")
expect("a new tool file with its card — allowed, the card declares it", run("_tools/qr-code/client/qr.client.tsx", { asked: true }), 0)
expect("a carded tool still asks the parts map first", run("_tools/qr-code/client/qr2.client.tsx"), 2, "parts_find")
const bare = fs.mkdtempSync(path.join(os.tmpdir(), "parts-gate-bare-"))
expect("a project without the parts map — allowed", run("components/x/a.client.tsx", { cwd: bare }), 0)
fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(bare, { recursive: true, force: true })
if (failed) { console.error(`===PARTS_GATE_FAILED=== ${failed}`); process.exit(1) }
console.log("===PARTS_GATE_OK===")
