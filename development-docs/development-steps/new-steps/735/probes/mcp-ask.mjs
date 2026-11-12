// Ask the core's MCP server one parts_find question from a given folder (as an agent session there would).
import { spawn } from 'node:child_process'
const [cwd, query] = process.argv.slice(2)
const server = (process.env.CORE ?? process.cwd()) + '/lib/agent-kit/skills/mcp.mjs' // CORE — the core's root (default: the folder the probe is run from)
const p = spawn(process.execPath, [server], { cwd, stdio: ['pipe', 'pipe', 'inherit'] })
let out = ''
const timer = setTimeout(() => { console.log('TIMEOUT'); p.kill(); process.exit(1) }, 60000)
p.stdout.on('data', (c) => {
  out += c
  const i = out.indexOf('\n')
  if (i < 0) return
  clearTimeout(timer)
  const m = JSON.parse(out.slice(0, i))
  console.log(m.result?.content?.[0]?.text ?? JSON.stringify(m))
  p.kill(); process.exit(0)
})
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'parts_find', arguments: { query } } }) + '\n')
