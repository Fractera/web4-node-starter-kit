#!/usr/bin/env node
// THE START OF A SESSION REMINDS THE INTERFACE SKILLS (node step 743-7). The owner, 2026-11-14: «не будет лишним если каждый раз когда
// проект спускается в режиме строительства вызывается этот навык и это не только про ядро это про все элементы». A hook cannot call a
// skill; it puts one line into the new session's context, and the law that holds is the gate `shadcn-skills.mjs`: no interface file —
// in the core or in any element — is written until «interface-design», «use-primitives» and «use-shadcn» are loaded in THIS session.
// Installed in the core (`.claude/settings.json`) and in every element (`scripts/element-isolate.mjs`). Silent where the skills are absent.
import fs from "node:fs"
import path from "node:path"

let input = ""
for await (const chunk of process.stdin) input += chunk
let call = {}
try { call = JSON.parse(input) } catch { /* no input — the current folder */ }
const root = path.resolve(call?.cwd ?? process.cwd())
const dir = path.join(root, ".claude", "skills")
const groups = (() => { try { return fs.readdirSync(dir) } catch { return [] } })()
const named = (n) => (fs.existsSync(path.join(dir, n, "SKILL.md")) ? n : (groups.find((g) => fs.existsSync(path.join(dir, g, "skills", n, "SKILL.md"))) ?? null))
const have = ["interface-design", "use-primitives", "use-shadcn"].map((n) => { const g = named(n); return g === null ? null : g === n ? n : `${g}:${n}` }).filter(Boolean)
if (!have.includes("interface-design")) process.exit(0)
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: `A build session in this folder works with interfaces: load the skills ${have.map((n) => `«${n}»`).join(", ")} with the Skill tool before your first answer of a build task. The hook shadcn-skills refuses every interface file (.tsx in components/, app/, _tools/, sections/, _widgets/ — outside the design skill's territory), in the core and in every element, written by Edit, Write or the shell, until they are loaded in this session (step 743-7).`,
  },
}))
