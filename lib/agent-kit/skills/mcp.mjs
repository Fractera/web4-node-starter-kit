// THE NODE'S SKILLS MEMORY AS A TOOL (node step 595-4): an MCP server of the core over stdio — JSON-RPC, one message per line, no SDK.
// The bridge gives it (`modes.mcpArgs`, its own --mcp-config) to every session the architect talks to: the main agent and the build
// sessions of elements; a working-process session (orders of other agents) does not get it. Two tools: skills_find — how other projects
// solved it; parts_find (725-2) — the ready part of THIS project before an interface piece is built. The node key is read here, never shown to the agent; nothing is written. 🛑 It must never fail at start — Claude Code keeps
// one failure cache per server name for the whole machine (node law 548-20): a refusal goes into the tool's answer instead.
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogFileText, findInCatalogFile } from './catalog-index.mjs'
import { findSkills } from './find.mjs'
import { findParts, partsText } from '../../parts/parts-find.mjs'
import { nodeTools } from '../../parts/node-index.mjs'

// SKILLS_MCP_ROOT: the node whose catalog and own skills are read — set only by a test run of new code over a live node's data (640-6).
const ROOT = process.env.SKILLS_MCP_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`)

const TOOL = {
  name: 'skills_find',
  description: 'How other projects solved it: the person\'s OWN skills (kept by them — they come first), the skills of the node\'s base ' +
    'and the skills catalog — thousands of skills checked and marked by Fractera, on this computer. Call it FIRST — before your first question — when a person names a goal or a wish («хочу ' +
    'постить в соцсети», «I want a shop»), when you plan a new task and when you are asked for an opinion. Give ' +
    'the task in one sentence (any language), a few short English themes and terms (the words a skill\'s name could have: "brand voice", ' +
    '"voice profile") and 2–3 rephrasings of the task from the side of the method. Returns at most three fragments of the base and up ' +
    'to seven catalog skills for a first look, each with what it brings, the verdict for this node, its stars, installs, licence and ' +
    'scripts; fewer than seven — it says what to try next. Only checked skills come back; the open skills.sh is looked at when the catalog gave fewer than ' +
    'seven after two rephrasings and the word search, or at the person\'s word (npm run skills -- market --live), and what it finds is named not checked. Speak of what you took in your own words; a skill goes into ' +
    'an element only after the person\'s «yes» (npm run skills -- hand <owner/repo@skill> --to <element> --send), a skill with scripts ' +
    'only after a separate yes.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The task or the question, one sentence.' },
      themes: { type: 'array', items: { type: 'string' }, description: '2–4 broad English themes, for example "delivery orders".' },
      terms: { type: 'array', items: { type: 'string' }, description: '2–6 concrete English terms, for example "geocoding".' },
      rephrasings: { type: 'array', items: { type: 'string' }, description: '2–3 other English sentences of the same task, from the side of the method, for example "build a voice profile from an author\'s posts". Always read with the sentence.' },
    },
    required: ['query'],
  },
}

const PARTS_TOOL = {
  name: 'parts_find',
  description: 'The ready parts of this project — tools (_tools), section kinds, composites (components/<folder>, e.g. the voice textarea, ' +
    'the one modal AppDialog, the table with search and pages) and shadcn primitives — from the parts map lib/parts/PARTS.json, by words ' +
    'and by meaning, in any language. Call it BEFORE you write any new interface file, a component, a widget or a tool: a part that exists ' +
    'is taken as it is (or extended in its own file), never built a second time. Give what you are about to build in one sentence and a ' +
    'few terms. Returns up to five parts with the path, how to use it, what it replaces and who uses it — or «nothing ready», and then ' +
    'the new file says on its first lines `// @part <id> — <what>` (with its card in the folder\'s parts.json) or `// @local — <why>`.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What you are about to build, one sentence, any language.' },
      terms: { type: 'array', items: { type: 'string' }, description: '1–5 short words of the thing, e.g. "textarea", "microphone".' },
      kinds: { type: 'array', items: { type: 'string', enum: ['tool', 'composite', 'primitive', 'section'] }, description: 'Optional: only these kinds.' },
    },
    required: ['query'],
  },
}

async function callParts(args) {
  try {
    // 725-5: the session's own folder first — an element's build session asks ITS map (the server starts in the session's folder).
    // 735 A5 (D1): the asker is the session's folder whenever it is not the core's root — an element with NO map of its own (a newborn
    // with an empty `_tools/`, a native before its parts machinery) was answered as if it were the core: «Yours — it is in this
    // repository» for the core's modal, sections and primitives, and the take command never shown. `findParts` answers a mapless folder
    // with the node's tools alone, the same answer `npm run parts -- --as <id>` gives.
    const here = process.cwd()
    const core = resolve(here) === resolve(ROOT)
    // 733-4: an element searches itself first, then the node — the core's «any» tools and its neighbours' (metadata, no code).
    const node = core ? [] : nodeTools(ROOT, here)
    const r = await findParts(here, { query: args?.query ?? '', terms: args?.terms, kinds: args?.kinds, node })
    return { content: [{ type: 'text', text: partsText(r, args?.query ?? '') }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `The parts map did not answer (${error instanceof Error ? error.message : String(error)}); read lib/parts/PARTS.json yourself before building.` }], isError: true }
  }
}

/** The node's memory (its base in the graph, needs the OpenAI key) — its text, or why it is silent. */
async function memory(args) {
  try {
    const r = await findSkills(ROOT, { query: args?.query ?? '', themes: args?.themes, terms: args?.terms })
    if (r.error) return { ok: false, text: `The node's skills memory did not answer (${r.error}).` }
    const answer = r.found ? r.text : 'No skill in the node\'s memory is close enough to this task.'
    return { ok: true, text: r.notice ? `${answer}\n\n${r.notice}` : answer }
  } catch (error) {
    return { ok: false, text: `The node's skills memory did not answer (${error instanceof Error ? error.message : String(error)}).` }
  }
}

// 627-4 (owner 2026-11-03: «да, согласен, меняй 627-4»): two checked sources — the base in the graph and the catalog file; the live
// skills.sh is no longer asked here. The catalog reads the whole sentence by meaning, in any language — and, since 640-5, the agent's
// terms and its rephrasings with it (the themes stay for the graph memory).
async function call(args) {
  // 640-5b: the terms only — a broad theme («social media») pulled cards of anything social above the task (measured).
  const terms = Array.isArray(args?.terms) ? args.terms : []
  const [mine, open] = await Promise.all([memory(args), findInCatalogFile(ROOT, { query: args?.query ?? '', terms, rephrasings: args?.rephrasings })])
  const text = `${mine.text}\n\n${catalogFileText(open)}`
  return !mine.ok && !open.ok
    ? { content: [{ type: 'text', text: `${text}\nGo on without skills and say so.` }], isError: true }
    : { content: [{ type: 'text', text }] }
}

async function handle(line) {
  let m
  try { m = JSON.parse(line) } catch { return }
  if (m.method === 'initialize') {
    send({ jsonrpc: '2.0', id: m.id, result: { protocolVersion: m.params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'node-skills', version: '1.0.0' } } })
  } else if (m.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: m.id, result: { tools: [TOOL, PARTS_TOOL] } })
  } else if (m.method === 'tools/call') {
    if (m.params?.name === TOOL.name) send({ jsonrpc: '2.0', id: m.id, result: await call(m.params.arguments) })
    else if (m.params?.name === PARTS_TOOL.name) send({ jsonrpc: '2.0', id: m.id, result: await callParts(m.params.arguments) })
    else send({ jsonrpc: '2.0', id: m.id, error: { code: -32602, message: `unknown tool ${m.params?.name}` } })
  } else if (m.method === 'ping') {
    send({ jsonrpc: '2.0', id: m.id, result: {} })
  } else if (m.id !== undefined && m.method) {
    send({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: `${m.method} is not supported` } })
  }
}

let buffer = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  let i
  while ((i = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, i).trim()
    buffer = buffer.slice(i + 1)
    if (line) handle(line)
  }
})
process.stdin.on('end', () => process.exit(0))
