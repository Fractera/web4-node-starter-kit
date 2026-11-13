// THE MOVE RUNNER — ONE RUNG PER CALL (node step 737-7). The owner, 2026-11-13: «создают процесс при котором шаг за шагом автоматически
// и по возможности без искусственного интеллекта весь проект переносится на сервер и запускается там сначала по IP-адресу».
// `node scripts/dedicated-server/move.mjs <rung> [--dry]`, started detached by the door `app/api/node/server` (`connect` reads the password
// from stdin and is awaited — the password never enters argv, the environment or a file). Each rung writes its state into
// `data/node/server/move.json` (lib/hosting/move-state.mjs); the screen reads only that file.
//   connect  --host <IPv4|name> [--port 22]   the password once → the node's key on the server, the server's key pinned
//   probe                                     the server measured against this node's own needs → a verdict with numbers
//   prepare                                   the server prepared as root (packages, Node 22, the user, nginx, firewall…)
//   copy                                      the silent copy (no bot tokens, no named tunnel) → install and build on the server
//   claude                                    Claude Code signed in on the server: its link shown here, the code pasted here
//   rehearse                                  the silent start on the server and the checks from outside and inside
//   move                                      this computer stops, the last changes go, the server starts whole; failure → back here
// `--dry` runs the server scripts with DRY_RUN=1 (every command printed, none run) — the rehearsal of the runner itself.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { insideChecks, outsideChecks } from '../../lib/hosting/checks.mjs'
import { isHostName } from '../../lib/hosting/hostnames.mjs'
import { judge, residentMb } from '../../lib/hosting/judge.mjs'
import { forget, serveStatusPage, startAgain, stopAll } from '../../lib/hosting/local-node.mjs'
import { mayStart, patchMove, readMove, setRung } from '../../lib/hosting/move-state.mjs'
import { follow, q, startDetached } from '../../lib/hosting/remote.mjs'
import { connect, ensureKeyPair, exec, installKey, serverDir, upload } from '../../lib/hosting/ssh.mjs'
import { copyPhase, measure, remoteRootOf, REMOTE_USER } from '../../lib/hosting/transfer.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const rung = args[0]
const dry = args.includes('--dry')
// 🛑 In a dry run the «server» of the test is THIS machine (an ssh2 server in the test process runs commands here): every command
// that would act — `pm2 stop all`, `claude auth login`, stopping this node — is replaced, never sent. Only folders of the test change.
const root = (dry && process.env.FRACTERA_MOVE_NODE_ROOT) || path.resolve(here, '..', '..')
const PM2_STOP = dry ? 'true' : 'pm2 stop all || true'
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] ?? null : null }
const FOLDER = path.basename(root)
// The dry rehearsal of the runner (its test) points the «server» at temporary folders of this machine; a real run never reads these.
const REMOTE_ROOT = (dry && process.env.FRACTERA_MOVE_REMOTE_ROOT) || remoteRootOf(root)
const ROOT_DIR = (dry && process.env.FRACTERA_MOVE_ROOT_DIR) || '/root/.fractera'
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const now = () => new Date().toISOString()
const DRY = dry ? 'DRY_RUN=1 ' : ''
const POLL = (dry && Number(process.env.FRACTERA_MOVE_POLL_MS)) || 3000

function begin(id) {
  const s = readMove(root)
  if (id !== 'connect' && !mayStart(s, id)) { console.error(`===MOVE_REFUSED=== ${id}: the rung before it is not done, or another one runs`); process.exit(2) }
  setRung(root, id, { state: 'running', startedAt: now(), endedAt: null, detail: '', stages: [], heartbeat: now(), pid: process.pid })
  const beat = setInterval(() => setRung(root, id, { heartbeat: now() }), 20_000)
  beat.unref()
  return s
}
function end(id, ok, extra = {}) {
  setRung(root, id, { state: ok ? 'done' : 'failed', endedAt: now(), heartbeat: now(), ...extra })
  console.log(`===MOVE_${ok ? 'DONE' : 'FAILED'}=== ${id}${extra.detail ? ` ${extra.detail}` : ''}`)
  if (!ok) process.exitCode = 1
}
const server = () => readMove(root).server ?? {}
const asRoot = () => connect({ root, host: server().host, port: server().port })
const asNode = () => connect({ root, host: server().host, port: server().port, username: REMOTE_USER })

async function readStdin() {
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  return text.replace(/\r?\n$/, '')
}

const rungs = {
  async connect() {
    const host = String(opt('host') ?? '').trim().toLowerCase()
    const port = Number(opt('port') ?? 22)
    if (!(IPV4.test(host) || isHostName(host)) || !Number.isInteger(port) || port < 1 || port > 65535) { console.error('===MOVE_FAILED=== connect bad-address'); process.exit(2) }
    const password = await readStdin()
    const before = readMove(root).server
    if (before?.host && (before.host !== host || before.port !== port)) patchMove(root, (s) => { s.rungs = {}; delete s.probe; delete s.verdict; delete s.checks; delete s.claude })
    patchMove(root, (s) => { s.server = { host, port, user: REMOTE_USER, folder: FOLDER } })
    begin('connect')
    try {
      const r = await installKey({ root, host, port, password })
      patchMove(root, (s) => { s.server.fingerprint = r.fingerprint })
      end('connect', true, { detail: r.fingerprint })
    } catch (e) {
      end('connect', false, { detail: e.reason ?? 'unreachable' })
    }
  },

  async probe() {
    begin('probe')
    const { client } = await asRoot()
    try {
      await exec(client, `mkdir -p ${q(ROOT_DIR)} && chmod 700 ${q(ROOT_DIR)}`)
      await upload(client, `${ROOT_DIR}/probe.sh`, readFileSync(path.join(here, 'probe.sh')), 0o700)
      const r = await exec(client, `${DRY}bash ${ROOT_DIR}/probe.sh ${q(FOLDER)} ${server().port}`, { timeoutMs: 60_000 })
      const probe = JSON.parse(r.stdout.trim().split('\n').pop())
      const copy = measure(root)
      const needs = { ramMb: residentMb(root), copyBytes: copy.bytes, copyFiles: copy.files }
      const verdict = judge(probe, needs, server().host)
      patchMove(root, (s) => { s.probe = probe; s.needs = needs; s.verdict = verdict })
      end('probe', verdict.level !== 'fail', { detail: verdict.level })
    } catch (e) {
      end('probe', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  async prepare() {
    begin('prepare')
    const { client } = await asRoot()
    try {
      await exec(client, `mkdir -p ${q(ROOT_DIR)} && chmod 700 ${q(ROOT_DIR)} && rm -f ${q(`${ROOT_DIR}/prepare.progress.jsonl`)}`)
      for (const f of ['stages.sh', 'prepare.sh', 'fractera-root.sh']) await upload(client, `${ROOT_DIR}/${f}`, readFileSync(path.join(here, f)), 0o700)
      const { publicLine } = ensureKeyPair(root)
      await startDetached(client, `${DRY}bash ${ROOT_DIR}/prepare.sh ${REMOTE_USER} ${q(FOLDER)} ${server().port} ${q(publicLine)}`, `${ROOT_DIR}/prepare.out`)
      const r = await follow(client, `${ROOT_DIR}/prepare.progress.jsonl`, 'prepare', { script: 'prepare.sh', everyMs: POLL, timeoutMs: 45 * 60_000, onStages: (stages) => setRung(root, 'prepare', { stages, heartbeat: now() }) })
      end('prepare', r.ok, { stages: r.stages, detail: r.failed ? `${r.failed.id}: ${String(r.failed.detail).slice(-300)}` : '' })
    } catch (e) {
      end('prepare', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  async copy() {
    begin('copy')
    const { client } = await asNode()
    try {
      await exec(client, `mkdir -p ${q(REMOTE_ROOT)}`)
      setRung(root, 'copy', { stages: [{ id: 'copy', state: 'running', at: now() }] })
      const c = await copyPhase({ root, host: server().host, port: server().port, phase: 'silent', ...(dry ? { target: `${REMOTE_ROOT}/` } : {}) })
      if (c.code !== 0) return end('copy', false, { detail: `rsync ${c.code}: ${c.tail.slice(-300)}` })
      const mark = JSON.stringify({ phase: 'silent', ip: server().host, sshPort: server().port, user: REMOTE_USER, folder: FOLDER, from: os.hostname(), at: now() }, null, 2)
      await exec(client, `mkdir -p ${q(`${REMOTE_ROOT}/data/node`)} ${q(`${REMOTE_ROOT}/logs/dedicated-server`)} && printf '%s\\n' ${q(mark)} > ${q(`${REMOTE_ROOT}/data/node/server.json`)} && rm -f ${q(`${REMOTE_ROOT}/logs/dedicated-server/install.progress.jsonl`)}`)
      const copied = { id: 'copy', state: 'done', at: now(), detail: `${c.files ?? '?'} files, ${Math.round((c.bytes ?? 0) / 1048576)} MB` }
      await startDetached(client, `${DRY}bash ${q(`${REMOTE_ROOT}/scripts/dedicated-server/install.sh`)}`, `${REMOTE_ROOT}/logs/dedicated-server/install.out`)
      const r = await follow(client, `${REMOTE_ROOT}/logs/dedicated-server/install.progress.jsonl`, 'install', { script: 'install.sh', everyMs: POLL, timeoutMs: 150 * 60_000, onStages: (stages) => setRung(root, 'copy', { stages: [copied, ...stages], heartbeat: now() }) })
      end('copy', r.ok, { stages: [copied, ...r.stages], detail: r.failed ? `${r.failed.id}: ${String(r.failed.detail).slice(-300)}` : '' })
    } catch (e) {
      end('copy', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  async claude() {
    begin('claude')
    if (dry) return end('claude', true, { detail: 'dry run' })
    const codeFile = path.join(serverDir(root), 'claude-code.txt')
    rmSync(codeFile, { force: true })
    const { client } = await asNode()
    const { extractAuthUrl } = await import(pathToFileURL(path.join(root, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'client', 'terminal-auth.mjs')).href)
    try {
      const ok = await new Promise((resolve) => {
        client.exec(`bash -lc ${q('export PATH="$HOME/.local/bin:$PATH"; claude auth login')}`, { pty: { term: 'xterm', cols: 400, rows: 40 } }, (err, stream) => {
          if (err) return resolve(false)
          let buf = ''
          let shown = false
          let sent = false
          const give = setTimeout(() => { stream.close(); resolve(false) }, 20 * 60_000)
          const poll = setInterval(() => {
            if (!shown || sent || !existsSync(codeFile)) return
            const code = readFileSync(codeFile, 'utf8').trim()
            rmSync(codeFile, { force: true })
            if (!/^[A-Za-z0-9_#.-]{8,400}$/.test(code)) return
            sent = true
            stream.write(`${code}\r`)
          }, 1000)
          stream.on('data', (d) => {
            buf += d.toString()
            if (!shown) {
              const url = extractAuthUrl(buf)
              if (url) { shown = true; patchMove(root, (s) => { s.claude = { url, at: now() } }) }
            }
          })
          stream.on('close', () => { clearTimeout(give); clearInterval(poll); resolve(sent) })
        })
      })
      const st = await exec(client, `bash -lc ${q('export PATH="$HOME/.local/bin:$PATH"; claude auth status')}`, { timeoutMs: 30_000 })
      let state = null
      try { state = JSON.parse(st.stdout.slice(st.stdout.indexOf('{'))) } catch { /* not JSON */ }
      const email = typeof state?.email === 'string' ? state.email.replace(/^(.{2}).*(@.*)$/, '$1…$2') : null
      patchMove(root, (s) => { s.claude = { ...(s.claude ?? {}), url: null, email, plan: state?.subscriptionType ?? null } })
      end('claude', ok && state?.loggedIn === true, { detail: state?.loggedIn === true ? (email ?? 'signed in') : 'not signed in' })
    } catch (e) {
      end('claude', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { rmSync(codeFile, { force: true }); client.end() }
  },

  async rehearse() {
    begin('rehearse')
    const { client } = await asNode()
    try {
      const r = await startServer(client, 'silent')
      if (!r.ok) return end('rehearse', false, { stages: r.stages, detail: `${r.failed?.id}: ${String(r.failed?.detail).slice(-300)}` })
      const checks = await allChecks(client)
      patchMove(root, (s) => { s.checks = checks })
      end('rehearse', checks.every((c) => c.ok), { stages: r.stages, detail: checks.filter((c) => !c.ok).map((c) => c.id).join(' ') })
    } catch (e) {
      end('rehearse', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  async move() {
    begin('move')
    const corePort = (() => { try { return JSON.parse(readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port || 24680 } catch { return 24680 } })()
    // The server is reached BEFORE this computer stops: a network that fails here leaves the node where it is.
    let client
    try { ({ client } = await asNode()) } catch (e) { return end('move', false, { detail: `server: ${e.reason ?? e.message}` }) }
    const stopped = dry ? [] : stopAll(root)
    setRung(root, 'move', { stopped })
    const page = dry ? null : await serveStatusPage(root, corePort)
    const back = async (why) => {
      try { await exec(client, `${PM2_STOP}; printf '%s\\n' ${q(JSON.stringify({ ...readServerMark(), phase: 'silent' }))} > ${q(`${REMOTE_ROOT}/data/node/server.json`)}`) } catch { /* the server may be gone */ }
      page?.close()
      if (!dry) startAgain(stopped)
      end('move', false, { rolledBack: true, detail: why })
    }
    try {
      await exec(client, PM2_STOP, { timeoutMs: 120_000 })
      const c = await copyPhase({ root, host: server().host, port: server().port, phase: 'live', ...(dry ? { target: `${REMOTE_ROOT}/` } : {}) })
      if (c.code !== 0) return await back(`rsync ${c.code}`)
      const mark = JSON.stringify({ ...readServerMark(), phase: 'live', movedAt: now() }, null, 2)
      await exec(client, `printf '%s\\n' ${q(mark)} > ${q(`${REMOTE_ROOT}/data/node/server.json`)}`)
      const r = await startServer(client, 'live')
      if (!r.ok) return await back(`${r.failed?.id}: ${String(r.failed?.detail).slice(-200)}`)
      const checks = await allChecks(client)
      patchMove(root, (s) => { s.checks = checks })
      if (!checks.every((x) => x.ok)) return await back(`checks: ${checks.filter((x) => !x.ok).map((x) => x.id).join(' ')}`)
      if (!dry) {
        writeFileSync(path.join(root, 'data', 'node', 'moved.json'), `${JSON.stringify({ to: server().host, port: server().port, user: REMOTE_USER, folder: FOLDER, at: now() }, null, 2)}\n`)
        forget(root)
      }
      end('move', true, { stages: r.stages, detail: `http://${server().host}/` })
      if (page) setTimeout(() => page.close(), 30 * 60_000)
    } catch (e) {
      await back(String(e.reason ?? e.message).slice(0, 200))
    } finally { client.end() }
  },
}

let serverMark = null
function readServerMark() {
  serverMark = serverMark ?? { ip: server().host, sshPort: server().port, user: REMOTE_USER, folder: FOLDER, from: os.hostname(), at: now() }
  return serverMark
}

async function startServer(client, phase) {
  const progress = `${REMOTE_ROOT}/logs/dedicated-server/start-${phase}.progress.jsonl`
  await exec(client, `rm -f ${q(progress)}`)
  await startDetached(client, `${DRY}bash ${q(`${REMOTE_ROOT}/scripts/dedicated-server/start.sh`)} ${phase}`, `${REMOTE_ROOT}/logs/dedicated-server/start-${phase}.out`)
  const id = phase === 'silent' ? 'rehearse' : 'move'
  return follow(client, progress, 'start', { script: 'start.sh', everyMs: POLL, timeoutMs: 60 * 60_000, onStages: (stages) => setRung(root, id, { stages, heartbeat: now() }) })
}

async function allChecks(client) {
  if (dry) return [{ id: 'dry', ok: true }]
  let commit = null
  try { commit = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim() } catch { /* no git */ }
  return [...(await outsideChecks(server().host, { commit })), ...(await insideChecks(client, root))]
}

if (!rungs[rung]) {
  console.log('Ступени: connect · probe · prepare · copy · claude · rehearse · move   [--dry]')
  process.exit(rung ? 2 : 0)
}
await rungs[rung]()
