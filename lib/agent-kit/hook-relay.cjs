#!/usr/bin/env node
// THE HOOK RELAY OF A WALLED ELEMENT (node step 811-5a). On a dedicated server a custom element's agent runs as its own Linux user
// `fe-<id>`, which reads nothing of the core — and the node's hooks of every session (the diary, the pulse, the window line, the Telegram
// progress, the limits line) are the core's files that read the node's secrets. So the bridge gives a walled session THIS file instead:
// the one file of the core an element user may read (scripts/dedicated-server/element-readable.txt). It carries the hook's event to the
// core's door `/api/node/hook-relay` with the element's own key; the core runs the real hook as the node's user for THAT element only
// (the key names it, never an argument) and gives back its output and exit code.
// 🔒 NOTHING OF THE CORE IS REQUIRED HERE — node's builtins only: an element user cannot read another core file.
// 🔒 A HOOK NEVER BREAKS THE SESSION: the core silent or refusing → exit 0 with nothing printed (the same as a missing hook).
// Usage: node hook-relay.cjs <name> [arg]       — one hook event: stdin → the door → stdout, stderr, exit code
//        node hook-relay.cjs mcp <server>       — an MCP server over stdio: every JSON-RPC line → the door → its answer lines
// Environment (given by the bridge to the walled session): FRACTERA_HOOK_KEY (the element's own key), FRACTERA_CORE_PORT.
const http = require('node:http')

const KEY = process.env.FRACTERA_HOOK_KEY || ''
const PORT = Number(process.env.FRACTERA_CORE_PORT || 0)

function post(body, timeoutMs) {
  return new Promise((resolve) => {
    if (!KEY || !PORT) return resolve(null)
    const data = Buffer.from(JSON.stringify(body))
    const req = http.request({ host: '127.0.0.1', port: PORT, path: '/api/node/hook-relay', method: 'POST', timeout: timeoutMs,
      headers: { 'content-type': 'application/json', 'content-length': data.length, 'x-element-key': KEY } }, (res) => {
      let out = ''
      res.setEncoding('utf8')
      res.on('data', (c) => { out += c })
      res.on('end', () => { try { resolve(JSON.parse(out)) } catch { resolve(null) } })
    })
    req.on('timeout', () => { req.destroy(); resolve(null) })
    req.on('error', () => resolve(null))
    req.end(data)
  })
}

function readAll() {
  return new Promise((resolve) => {
    let s = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => { s += c })
    process.stdin.on('end', () => resolve(s))
    process.stdin.on('error', () => resolve(s))
  })
}

async function hook(name, arg) {
  const r = await post({ name, arg: arg ?? null, stdin: await readAll() }, 60_000)
  if (!r || !r.ok) process.exit(0)
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  process.exit(Number.isInteger(r.code) ? r.code : 0)
}

function mcp(server) {
  // One request at a time is not assumed: each line goes on its own; answers are written as they come.
  let buffer = ''
  let open = 0
  let ended = false
  const finish = () => { if (ended && open === 0) process.exit(0) }
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    buffer += chunk
    let i
    while ((i = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, i).trim()
      buffer = buffer.slice(i + 1)
      if (!line) continue
      open++
      post({ name: `mcp:${server}`, stdin: line }, 120_000).then((r) => {
        if (r?.ok && r.stdout) process.stdout.write(r.stdout.endsWith('\n') ? r.stdout : `${r.stdout}\n`)
        else if (!r?.ok) {
          // a request with an id must get an answer, or Claude Code waits for it
          try {
            const m = JSON.parse(line)
            if (m.id !== undefined) process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: m.id, error: { code: -32603, message: 'the core did not answer the relay' } })}\n`)
          } catch { /* not JSON — nothing to answer */ }
        }
        open--
        finish()
      })
    }
  })
  process.stdin.on('end', () => { ended = true; finish() })
}

const [name, arg] = process.argv.slice(2)
if (name === 'mcp') mcp(arg)
else if (name) hook(name, arg)
else process.exit(0)
