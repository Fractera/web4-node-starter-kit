// THE ELEMENT'S JOURNAL SAYS WHETHER A TASK WAS TAKEN (node steps 850-1, 850-2, 851-1). The bridge used to call a task «started» when
// any file of the element's conversation changed after the paste. ✗ 2026-11-24, fractera.ai (the server's main agent, Telegram 1288): the
// marketplace's journal moved because its running turn and the person's channel messages were written into it — the node logged «работа
// началась» while the three pasted tasks stood unsent and Roma's two Telegram messages stayed `enqueue` with no `dequeue` for 40 minutes.
// And behind the wall (a server) the journal is 0700 of `fe-<id>`: the core could not list it and called a live task «not started».
// Now the journal's CONTENT decides, read as the element where it is walled:
//   took    — a prompt of a person or of the node (a user entry with text, never a tool result) was written after the paste;
//   waiting — a message was put into the session's queue (`queue-operation: enqueue`) and never taken out — the session holds it;
//   not     — nothing of the kind after the paste;
//   unknown — the journal could not be read; never a reason to say «not started».
'use strict'

/**
 * Self-contained on purpose: its source runs as `node -e` AS the walled element, which reads nothing of the core (`inlineCode`).
 * @param {string} dir the element's Claude project folder of this session's cwd
 * @param {number} at the paste's time, ms
 * @returns {{ state: 'took'|'waiting'|'not'|'unknown', tookAt: number|null, waiting: { since: number, count: number }|null, files: number, why?: string }}
 */
function scan(dir, at) {
  const fs = require('fs')
  const path = require('path')
  const res = { state: 'not', tookAt: null, waiting: null, files: 0 }
  let names
  try { names = fs.readdirSync(dir) } catch (e) { return Object.assign(res, { state: e && e.code === 'ENOENT' ? 'not' : 'unknown', why: (e && e.code) || 'unreadable' }) }
  const isPrompt = (j) => {
    const c = j && j.message && j.message.content
    if (typeof c === 'string') return c.trim().length > 0
    return Array.isArray(c) && c.some((b) => b && b.type === 'text' && String(b.text || '').trim())
  }
  for (const n of names) {
    if (!n.endsWith('.jsonl')) continue
    const p = path.join(dir, n)
    let st
    try { st = fs.statSync(p) } catch (e) { continue }
    if (st.mtimeMs < at - 1000) continue
    res.files++
    let text
    try {
      const len = Math.min(st.size, 4 * 1024 * 1024)
      const buf = Buffer.alloc(len)
      const fd = fs.openSync(p, 'r')
      try { fs.readSync(fd, buf, 0, len, st.size - len) } finally { fs.closeSync(fd) }
      text = buf.toString('utf8')
    } catch (e) { return Object.assign(res, { state: 'unknown', why: (e && e.code) || 'unreadable' }) }
    let pending = 0
    let since = null
    for (const line of text.split('\n')) {
      if (line.charCodeAt(0) !== 123) continue
      let j
      try { j = JSON.parse(line) } catch (e) { continue }
      const t = Date.parse(j.timestamp || '')
      if (!(t >= at - 1000)) continue
      if (j.type === 'queue-operation') {
        if (j.operation === 'enqueue') { if (!pending) since = t; pending++ }
        else if (j.operation === 'dequeue' || j.operation === 'remove') { pending = Math.max(0, pending - 1); if (!pending) since = null }
      } else if (j.type === 'user' && isPrompt(j)) {
        if (res.tookAt === null || t < res.tookAt) res.tookAt = t
      }
    }
    if (pending && (!res.waiting || since < res.waiting.since)) res.waiting = { since, count: pending }
  }
  if (res.tookAt !== null) res.state = 'took'
  else if (res.waiting) res.state = 'waiting'
  return res
}

/** The same scan as one `node -e` program: `node -e <code> <dir> <at>` prints its JSON. */
function inlineCode() {
  return `process.stdout.write(JSON.stringify((${scan.toString()})(process.argv[1], Number(process.argv[2]))))`
}

module.exports = { scan, inlineCode }
