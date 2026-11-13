// THE NODE'S PROCESSES ON THIS COMPUTER DURING THE MOVE (node step 737-7).
// 🔒 EVERY PROCESS OF THE NODE STOPS, NOT ONLY THE CORE: `serve:stop` stops the core and its watcher only (serve.mjs `stop`), while the
// elements, their watcher, the gatekeeper and the tunnels would live on — and a watcher left alone restarts what was stopped. Order:
// watchers, elements, the core, tunnels. Two copies of one node never answer at once (bots split, data diverges).
// 🔒 AFTER A GOOD MOVE THE PROCESSES ARE FORGOTTEN (`pm2 delete` + `pm2 save`): this computer's autostart (`pm2 resurrect`) must not raise
// the old copy after a reboot. The folder stays whole — the copy as of the move, the road back (`npm run server -- return`).
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { moveFile } from './move-state.mjs'

const isWin = process.platform === 'win32'
const pm2 = (args) => spawnSync(isWin ? 'pm2.cmd' : 'pm2', args, { encoding: 'utf8', shell: isWin, timeout: 60_000, maxBuffer: 64 * 1024 * 1024 })

/** The node's pm2 processes (name prefix `fractera-`, working folder inside this node). */
export function nodeProcesses(root) {
  const r = pm2(['jlist'])
  if (r.status !== 0) return []
  try {
    return JSON.parse(r.stdout.slice(r.stdout.indexOf('[')))
      .filter((p) => String(p.name ?? '').startsWith('fractera-') && String(p.pm2_env?.pm_cwd ?? '').startsWith(root))
      .map((p) => ({ name: p.name, status: p.pm2_env?.status ?? 'unknown' }))
  } catch { return [] }
}

const rank = (name) => (/-watch$|gatekeeper/.test(name) ? 0 : name.startsWith('fractera-svc-') ? 1 : name === 'fractera-web4' ? 2 : 3)

/** Stop every running process of the node, watchers first. Returns the names it stopped (for the road back). */
export function stopAll(root) {
  const running = nodeProcesses(root).filter((p) => p.status === 'online').map((p) => p.name).sort((a, b) => rank(a) - rank(b))
  for (const name of running) pm2(['stop', name])
  return running
}

/** The road back: start again what was stopped, the core first and the watchers last. */
export function startAgain(names) {
  for (const name of [...names].sort((a, b) => rank(b) - rank(a))) pm2(['start', name])
}

/** After a good move: forget the processes so this computer's autostart never raises the old copy. */
export function forget(root) {
  const names = nodeProcesses(root).map((p) => p.name)
  for (const name of names) pm2(['delete', name])
  pm2(['save', '--force'])
  return names
}

const RU = { connect: 'Сервер', probe: 'Проверка', prepare: 'Подготовка', copy: 'Копия и сборка', claude: 'Claude', rehearse: 'Репетиция', move: 'Переезд' }

/**
 * While the core is stopped, its port shows how the move goes — the person's open tab keeps telling the truth. Read-only, no secrets:
 * rung states and, at the end, the node's new address. Resolves the server; `close()` it when done.
 */
export function serveStatusPage(root, port) {
  const server = createServer((_req, res) => {
    let s = {}
    try { s = JSON.parse(readFileSync(moveFile(root), 'utf8')) } catch { /* not yet written */ }
    const rows = Object.entries(RU).map(([id, ru]) => `<li>${ru}: <b>${String(s.rungs?.[id]?.state ?? '—')}</b></li>`).join('')
    const done = s.rungs?.move?.state === 'done'
    const back = s.rungs?.move?.rolledBack === true
    const link = s.server?.host ? `http://${s.server.host}/` : ''
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Fractera — переезд</title>
${done || back ? '' : '<meta http-equiv="refresh" content="3">'}<body style="font:15px system-ui;max-width:640px;margin:40px auto;padding:0 16px" data-block="move-status">
<h1 style="font-size:20px">Узел переезжает на выделенный сервер · The node is moving to its server</h1><ul>${rows}</ul>
${done ? `<p>Готово. Узел живёт на сервере: <a href="${link}">${link}</a>. Telegram отвечает уже оттуда. · Done: the node lives at ${link}.</p>` : ''}
${back ? '<p>Переезд не удался — узел вернулся на этот компьютер и снова работает здесь. Причина — на вкладке «Выделенный сервер». · The move failed; the node is back on this computer.</p>' : ''}
</body>`)
  })
  return new Promise((resolve) => {
    server.once('error', () => resolve(null))
    server.listen(port, 'localhost', () => resolve(server))
  })
}
