// One headless Chrome, frames through the DevTools protocol: render(t) in the page, a screenshot of 848×208 per frame.
// node capture.mjs <page.html> <out dir> <fps> <seconds> [t1,t2,… — only these times]
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const [page, out, fpsArg, secArg, onlyArg] = process.argv.slice(2)
const fps = Number(fpsArg ?? 16.67), seconds = Number(secArg ?? 4.4)
const times = onlyArg ? onlyArg.split(',').map(Number) : Array.from({ length: Math.round(fps * seconds) }, (_, i) => i / fps)
mkdirSync(out, { recursive: true })
const prof = join(out, '..', 'cdp-prof')
rmSync(prof, { recursive: true, force: true })
const port = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=848,208', '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page') } catch { /* not up yet */ } }
if (!target) { chrome.kill(); throw new Error('chrome did not start') }
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 848, height: 208, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: `file://${page}` })
await sleep(1200)
let n = 0
for (const t of times) {
  await send('Runtime.evaluate', { expression: `render(${t})` })
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 848, height: 208, scale: 1 } })
  writeFileSync(join(out, `f${String(n++).padStart(3, '0')}.png`), Buffer.from(shot.result.data, 'base64'))
}
ws.close(); chrome.kill('SIGTERM')
await sleep(500)
rmSync(prof, { recursive: true, force: true })
console.log(`===FRAMES=== ${n} in ${out}`)
