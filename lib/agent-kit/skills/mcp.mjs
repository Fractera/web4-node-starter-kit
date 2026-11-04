// THE NODE'S SKILLS MEMORY AS A TOOL (node step 595-4): an MCP server of the core over stdio — JSON-RPC, one message per line, no SDK.
// The bridge gives it (`modes.mcpArgs`, its own --mcp-config) to every session the architect talks to: the main agent and the build
// sessions of elements; a working-process session (orders of other agents) does not get it. One tool, skills_find: how other projects
// solved it. The node key is read here, never shown to the agent; nothing is written. 🛑 It must never fail at start — Claude Code keeps
// one failure cache per server name for the whole machine (node law 548-20): a refusal goes into the tool's answer instead.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogFileText, findInCatalogFile } from './catalog-index.mjs'
import { findSkills } from './find.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`)

const TOOL = {
  name: 'skills_find',
  description: 'How other projects solved it: the skills of the node\'s base and the skills catalog — thousands of skills checked and ' +
    'marked by Fractera, on this computer. Call it FIRST — before your first question — when a person names a goal or a wish («хочу ' +
    'постить в соцсети», «I want a shop»), when you plan a new task and when you are asked for an opinion. Give ' +
    'the task in one sentence (any language) and a few English themes and terms. Returns at most three fragments of the base and three ' +
    'catalog skills, each with what it brings, the verdict for this node, its stars, installs, licence and scripts, or says that nothing ' +
    'is close enough. Only checked skills come back; the open skills.sh is looked at only when the person asks for it ' +
    '(npm run skills -- market --live), and what it finds is not checked. Speak of what you took in your own words; a skill goes into ' +
    'an element only after the person\'s «yes», a skill with scripts only after a separate yes.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The task or the question, one sentence.' },
      themes: { type: 'array', items: { type: 'string' }, description: '2–4 broad English themes, for example "delivery orders".' },
      terms: { type: 'array', items: { type: 'string' }, description: '2–6 concrete English terms, for example "geocoding".' },
    },
    required: ['query'],
  },
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
// skills.sh is no longer asked here. The catalog reads the whole sentence by meaning, in any language.
async function call(args) {
  const [mine, open] = await Promise.all([memory(args), findInCatalogFile(ROOT, { query: args?.query ?? '' })])
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
    send({ jsonrpc: '2.0', id: m.id, result: { tools: [TOOL] } })
  } else if (m.method === 'tools/call') {
    if (m.params?.name !== TOOL.name) send({ jsonrpc: '2.0', id: m.id, error: { code: -32602, message: `unknown tool ${m.params?.name}` } })
    else send({ jsonrpc: '2.0', id: m.id, result: await call(m.params.arguments) })
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
