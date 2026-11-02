// ЭКРАН ЖИВОЙ СЕССИИ АГЕНТА — ТОЛЬКО ЧТЕНИЕ (узел, шаг 548-13): `npm run agent:screen -- <id элемента | build>`.
//
// Зачем: дверь пробуждения говорит только, что процесс `claude` родился. Стоит ли агент на вопросе разрешения, на пустом вводе
// или работает — видно лишь на его экране (✗ 2026-10-20: «its agent woke with the task», а поручение съел `--add-dir`, и агент
// сидел на пустом вводе). Прибор подключается так же, как страница терминала ядра: билет двери `agent-api/ticket` (на этой
// машине — без входа, как у кнопок ядра) → сокет `/pty/<служба>` с `start: false`: ничего не запускает и ничего не набирает.
// Печатает последние строки экрана без управляющих последовательностей.

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const WebSocket = createRequire(join(process.cwd(), 'package.json'))('ws')
const service = process.argv[2]
if (!service) { console.log('usage: npm run agent:screen -- <element id | build>'); process.exit(1) }
const port = (() => { try { return JSON.parse(readFileSync(join(process.cwd(), 'logs', 'runtime.json'), 'utf8')).port } catch { return 24680 } })()
const born = (() => { try { return JSON.parse(readFileSync(join(process.cwd(), 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')).services.some((s) => s.id === service && s.kind === 'user' && s.born) } catch { return false } })()
const t = await fetch(`http://localhost:${port}/en/architect/${encodeURIComponent(service)}/agent-api/ticket`, { method: 'POST' })
const tj = await t.json().catch(() => ({}))
if (!tj.ticket) { console.log(`===AGENT_SCREEN_FAIL=== no ticket (${t.status}) — ${born ? 'born element' : 'service'} ${service}`); process.exit(1) }
const ws = new WebSocket(`ws://localhost:${port}/pty/${service}`)
let buf = ''
let closed = ''
ws.on('open', () => ws.send(JSON.stringify({ type: 'init', ticket: tj.ticket, mode: 'agent', start: false })))
ws.on('message', (d) => { buf += d.toString() })
ws.on('close', (c, r) => { closed = `${c} ${String(r)}` })
setTimeout(() => {
  if (!buf && /not-running/.test(closed)) { console.log(`===AGENT_SCREEN=== ${service}: no live session`); process.exit(0) }
  const plain = buf.replace(/\x1b\[\d*C/g, ' ').replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '').replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '').replace(/\x1b[()][0-9A-Za-z]/g, '')
  console.log(`===AGENT_SCREEN=== ${service}`)
  console.log(plain.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l && !/^[─╌]+$/.test(l)).slice(-30).join('\n'))
  ws.close()
  process.exit(0)
}, 2500)
