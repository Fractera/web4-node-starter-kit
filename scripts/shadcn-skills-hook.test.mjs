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
expect("an interface file with no skills loaded is refused", hook("components/x/a.client.tsx", []), 2, "«use-primitives»")
expect("only one skill loaded — refused, the other named", hook("app/[lang]/x/page-part.tsx", ["use-primitives"]), 2, "«use-shadcn»")
expect("both skills loaded — allowed", hook("components/x/a.client.tsx", ["use-primitives", "use-shadcn"]), 0)
expect("an Edit is held the same way", hook("_tools/t/client/x.client.tsx", [], "Edit"), 2)
expect("not an interface file — allowed", hook("lib/x.ts", []), 0)
expect("shadcn's own source — allowed", hook("components/ui/button.tsx", []), 0)
expect("a design skill's territory (a section) — allowed", hook("components/sections/section-hero/hero.tsx", []), 0)
expect("a design skill's territory (a prototype) — allowed", hook("app/[lang]/(protectedLayer)/prototypes/_pages/p1/sections/a.tsx", []), 0)
// 725-4: the architect's panel asks interface-design too.
fs.mkdirSync(path.join(root, ".claude/skills/interface-design"), { recursive: true }); fs.writeFileSync(path.join(root, ".claude/skills/interface-design/SKILL.md"), "x")
expect("a panel file without interface-design is refused", hook("app/[lang]/(architectLayer)/_components/x.client.tsx", ["use-primitives", "use-shadcn"]), 2, "«interface-design»")
expect("a panel file with the three skills — allowed", hook("components/architect/x.client.tsx", ["use-primitives", "use-shadcn", "interface-design"]), 0)
expect("743-7: any interface file asks interface-design too (core and elements alike)", hook("components/x/a.client.tsx", ["use-primitives", "use-shadcn"]), 2, "«interface-design»")
fs.rmSync(path.join(root, ".claude/skills/interface-design"), { recursive: true })
fs.rmSync(path.join(root, ".claude/skills/use-primitives"), { recursive: true })
expect("a project without use-primitives asks only for use-shadcn", hook("components/x/a.client.tsx", ["use-shadcn"]), 0)
// 730-4: элемент — навыки в группе, вызов с приставкой группы.
fs.rmSync(path.join(root, ".claude/skills/use-shadcn"), { recursive: true })
fs.mkdirSync(path.join(root, ".claude/skills/build-skills/skills/use-shadcn"), { recursive: true })
fs.writeFileSync(path.join(root, ".claude/skills/build-skills/skills/use-shadcn/SKILL.md"), "x")
expect("an element (skill in a group) without the skill is refused", hook("components/x/a.client.tsx", []), 2, "«use-shadcn»")
expect("an element skill called with its group prefix — allowed", hook("components/x/a.client.tsx", ["build-skills:use-shadcn"]), 0)
expect("an element widget is a design territory — allowed", hook("app/[lang]/(publicLayer)/blog/_widgets/static/w/w.tsx", []), 0)
// 743-7: the core is the architect's panel as a whole; a shell command that writes an interface file is held the same way.
const core = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-hook-core-"))
for (const n of ["use-primitives", "use-shadcn", "interface-design"]) { fs.mkdirSync(path.join(core, ".claude/skills", n), { recursive: true }); fs.writeFileSync(path.join(core, ".claude/skills", n, "SKILL.md"), "x") }
fs.mkdirSync(path.join(core, "WEB4-ITEMS-REGISTRY"), { recursive: true }); fs.writeFileSync(path.join(core, "WEB4-ITEMS-REGISTRY/web4-items.json"), "{}")
const coreLog = path.join(core, "t.jsonl")
const run = (tool, input, skills) => {
  fs.writeFileSync(coreLog, skills.map(skill).join(""))
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ tool_name: tool, cwd: core, transcript_path: coreLog, tool_input: input }), encoding: "utf8" })
}
const two = ["use-primitives", "use-shadcn"], three = [...two, "interface-design"]
expect("743-7: any folder of components/ asks interface-design", run("Edit", { file_path: path.join(core, "components/node-state/x.client.tsx") }, two), 2, "«interface-design»")
expect("743-7 core: with the three skills — allowed", run("Edit", { file_path: path.join(core, "components/hosting/x.client.tsx") }, three), 0)
expect("743-7 shell: python writing a core .tsx without the skills — refused", run("Bash", { command: `python3 - <<'EOF'\np='components/hosting/a.client.tsx'\ns=open(p).read(); open(p,'w').write(s)\nEOF` }, []), 2, "правка через оболочку")
expect("743-7 shell: sed -i on an absolute path to the core — refused", run("Bash", { command: `sed -i '' 's/a/b/' ${path.join(core, "components/node-state/b.client.tsx")}` }, two), 2, "«interface-design»")
expect("743-7 shell: reading a .tsx (cat, grep, 2>/dev/null) — allowed", run("Bash", { command: `cat components/hosting/a.client.tsx 2>/dev/null | grep x` }, []), 0)
expect("743-7 shell: writing a .tsx with the three skills loaded — allowed", run("Bash", { command: `sed -i '' 's/a/b/' components/hosting/a.client.tsx` }, three), 0)
expect("743-7 shell: writing a non-interface file — allowed", run("Bash", { command: `echo x > lib/a.ts` }, []), 0)
fs.rmSync(core, { recursive: true, force: true })
fs.rmSync(root, { recursive: true, force: true })
console.log(failed ? `\n===TEST_FAILED=== ${failed}` : "\n===TEST_OK===")
process.exit(failed ? 1 : 0)
