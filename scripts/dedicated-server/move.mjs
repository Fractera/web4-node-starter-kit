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
//   (telegram)                                the node's main bot on the server: moved with the node, the server's own, or later —
//                                             the person's choice, kept by the door `app/api/node/server` (no runner: nothing to run)
//   move                                      this computer stops, the last changes go, the server starts whole; failure → back here
//   start                                     737-11b, the road «Новый сервер»: the independent server starts live at once (no move)
//   greet                                     the server's main agent is woken to greet the person through the server's bot
//   clear · cancel                            a server that is not empty: freed (stopped and kept, never erased) and probed again,
//                                             or the installation cancelled (the node's key leaves the server, the server is forgotten)
// `--dry` runs the server scripts with DRY_RUN=1 (every command printed, none run) — the rehearsal of the runner itself.
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { insideChecks, outsideChecks } from '../../lib/hosting/checks.mjs'
import { isHostName } from '../../lib/hosting/hostnames.mjs'
import { judge, residentMb } from '../../lib/hosting/judge.mjs'
import { forget, serveStatusPage, startAgain, stopAll } from '../../lib/hosting/local-node.mjs'
import { mayStart, newRoadExcludes, patchMove, readMove, roadOf, serverKeeps, setRung } from '../../lib/hosting/move-state.mjs'
import { follow, q, startDetached } from '../../lib/hosting/remote.mjs'
import { connect, ensureKeyPair, exec, installKey, serverDir, upload } from '../../lib/hosting/ssh.mjs'
import { copyPhase, measure, remoteRootOf, REMOTE_USER } from '../../lib/hosting/transfer.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const nodeLine = createRequire(import.meta.url)('../../lib/agent-kit/node-line.cjs') // 698: the head of every message of the node to an agent
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
    const s0 = begin('copy')
    const road = roadOf(s0)
    const plan = s0.copyPlan ?? { variant: 'clone', data: true }
    // 737-11b: a copy again on the road «Новый сервер» replaces what runs there — its start is pressed again afterwards.
    if (road === 'new') patchMove(root, (s) => { delete s.rungs.start })
    const { client } = await asNode()
    try {
      if (road === 'new' && plan.variant === 'fresh') {
        const f = await freshClone(client)
        if (!f.ok) return end('copy', false, { detail: f.detail })
        setRung(root, 'copy', { stages: [{ id: 'clone', state: 'done', at: now(), detail: f.detail }] })
      } else {
        await exec(client, `mkdir -p ${q(REMOTE_ROOT)}`)
        setRung(root, 'copy', { stages: [{ id: 'copy', state: 'running', at: now() }] })
        const keep = road === 'new' ? newRoadExcludes(plan) : serverKeeps(readMove(root))
        const c = await copyPhase({ root, host: server().host, port: server().port, phase: 'silent', keep, ...(dry ? { target: `${REMOTE_ROOT}/` } : {}) })
        if (c.code !== 0) return end('copy', false, { detail: `rsync ${c.code}: ${c.tail.slice(-300)}` })
        setRung(root, 'copy', { stages: [{ id: 'copy', state: 'done', at: now(), detail: `${c.files ?? '?'} files, ${Math.round((c.bytes ?? 0) / 1048576)} MB` }] })
      }
      // 737-15: the server learns this node's domain now (the silent copy carries no logs/domain.json), so its names, records and
      // certificates can be ready before the move. An independent server has no domain of this node (737-11b).
      const zone = road === 'new' ? null : (() => { try { return JSON.parse(readFileSync(path.join(root, 'logs', 'domain.json'), 'utf8')).zone || null } catch { return null } })()
      const mark = JSON.stringify({ phase: 'silent', ip: server().host, sshPort: server().port, user: REMOTE_USER, folder: FOLDER, from: os.hostname(), at: now(), ...(zone ? { domain: zone } : {}) }, null, 2)
      await exec(client, `mkdir -p ${q(`${REMOTE_ROOT}/data/node`)} ${q(`${REMOTE_ROOT}/logs/dedicated-server`)} && printf '%s\\n' ${q(mark)} > ${q(`${REMOTE_ROOT}/data/node/server.json`)} && rm -f ${q(`${REMOTE_ROOT}/logs/dedicated-server/install.progress.jsonl`)}`)
      const copied = readMove(root).rungs?.copy?.stages?.[0] ?? { id: 'copy', state: 'done', at: now() }
      // ✗ The owner's test server 2026-11-13: a copy after a rehearsal built the core beside the rehearsal's 16 running processes and was
      // killed for memory. Before the move nothing on the server is live: the earlier copy stops before the build (the rehearsal starts it).
      // ✗ Same day: a copy started while the previous run's installer still built → «Another next build still in progress». One installer
      // at a time: the earlier one, its build and Next's build lock go first (never in a dry run — its «server» is this machine).
      await exec(client, dry ? PM2_STOP : `${PM2_STOP}; pkill -f 'dedicated-server/[i]nstall.sh'; pkill -f '[n]ext build'; sleep 2; rm -f ${q(`${REMOTE_ROOT}/.next/lock`)}; true`, { timeoutMs: 120_000 })
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
              const url = extractAuthUrl(buf)?.url ?? null
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
      // 737-15: the names are made ready here, before the move — DNS asked publicly, certificates issued for every name already pointing
      // here. Not a failure of the rehearsal: a domain may wake later; the move rung holds only what would break.
      const names = await namesReady(client)
      patchMove(root, (s) => { s.checks = checks; s.names = names })
      end('rehearse', checks.every((c) => c.ok), { stages: r.stages, detail: checks.filter((c) => !c.ok).map((c) => c.id).join(' ') })
    } catch (e) {
      end('rehearse', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  // 737-11b — THE ROAD «НОВЫЙ СЕРВЕР»: the independent node starts live at once (this computer keeps working and keeps its bot), and is
  // checked from outside and inside. The commit check holds only for a copy of this node; a fresh node runs its fork's own version.
  async start() {
    const s0 = begin('start')
    if (roadOf(s0) !== 'new') return end('start', false, { detail: 'the road of this server is the move' })
    const { client } = await asNode()
    try {
      const mark = JSON.stringify({ phase: 'live', independent: true, ip: server().host, sshPort: server().port, user: REMOTE_USER, folder: FOLDER, from: os.hostname(), at: now() }, null, 2)
      await exec(client, `mkdir -p ${q(`${REMOTE_ROOT}/data/node`)} && printf '%s\\n' ${q(mark)} > ${q(`${REMOTE_ROOT}/data/node/server.json`)}`)
      const r = await startServer(client, 'live', 'start')
      if (!r.ok) return end('start', false, { stages: r.stages, detail: `${r.failed?.id}: ${String(r.failed?.detail).slice(-300)}` })
      const checks = (await allChecks(client)).filter((c) => (s0.copyPlan?.variant === 'fresh' ? c.id !== 'commit' : true))
      patchMove(root, (s) => { s.checks = checks })
      end('start', checks.every((c) => c.ok), { stages: r.stages, detail: checks.filter((c) => !c.ok).map((c) => c.id).join(' ') || `http://${server().host}/` })
    } catch (e) {
      end('start', false, { detail: String(e.reason ?? e.message).slice(0, 300) })
    } finally { client.end() }
  },

  async move() {
    begin('move')
    const corePort = (() => { try { return JSON.parse(readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port || 24680 } catch { return 24680 } })()
    // The server is reached BEFORE this computer stops: a network that fails here leaves the node where it is.
    let client
    try { ({ client } = await asNode()) } catch (e) { return end('move', false, { detail: `server: ${e.reason ?? e.message}` }) }
    // 737-15c — no black screen (the owner, 2026-11-13): a name that already points straight at the server must have its certificate
    // before this computer stops; otherwise nothing stops and the rung names what waits. A name still on the tunnel is safe: the tunnel
    // comes to the server with the node.
    const names = await namesReady(client)
    patchMove(root, (s) => { s.names = names })
    if (names.waiting?.length) { client.end(); return end('move', false, { detail: `certificates still missing: ${names.waiting.join(' ')}` }) }
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
      const c = await copyPhase({ root, host: server().host, port: server().port, phase: 'live', keep: serverKeeps(readMove(root)), ...(dry ? { target: `${REMOTE_ROOT}/` } : {}) })
      if (c.code !== 0) return await back(`rsync ${c.code}`)
      const mark = JSON.stringify({ ...readServerMark(), phase: 'live', movedAt: now() }, null, 2)
      await exec(client, `printf '%s\\n' ${q(mark)} > ${q(`${REMOTE_ROOT}/data/node/server.json`)}`)
      const r = await startServer(client, 'live')
      if (!r.ok) return await back(`${r.failed?.id}: ${String(r.failed?.detail).slice(-200)}`)
      const checks = await allChecks(client)
      patchMove(root, (s) => { s.checks = checks })
      if (!checks.every((x) => x.ok)) return await back(`checks: ${checks.filter((x) => !x.ok).map((x) => x.id).join(' ')}`)
      // 737-11a: «приходит сообщение в Telegram приветствующие о готовности начать разработку но прежде знакомству» (the owner) — the
      // server's main agent is woken by the node and greets the person through the bot that now answers there. Never a reason to roll back.
      const welcome = await greet(client)
      patchMove(root, (s) => { s.welcome = welcome })
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

/** This node's fork as a clean public address — never a credential that may sit in the remote's URL. */
function forkUrl() {
  try {
    const raw = execSync('git remote get-url origin', { cwd: root, encoding: 'utf8' }).trim()
    const m = /github\.com[/:]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(raw)
    return m ? `https://github.com/${m[1]}/${m[2]}.git` : null
  } catch { return null }
}

/**
 * 737-11b, «Свежий узел»: the person's fork cloned on the server as a new install would clone it — nothing of this node travels, the
 * fork is checked as at every install (`check-origin`), the starter's history stripped (`fresh-project`), a new `.env.local` of its own
 * (`ensure-env`). An earlier folder there is moved aside, never erased. The installer and the build follow as for a copy.
 */
async function freshClone(client) {
  const url = forkUrl()
  if (!url) return { ok: false, detail: 'this node has no GitHub fork to clone' }
  const aside = `${REMOTE_ROOT}.before-${now().replace(/[:.]/g, '-')}`
  const clone = dry ? `mkdir -p ${q(REMOTE_ROOT)}` : `git clone --quiet ${q(url)} ${q(REMOTE_ROOT)}`
  const setup = dry ? 'true' : 'node scripts/ensure-env.mjs && node scripts/check-origin.mjs && node scripts/fresh-project.mjs'
  const r = await exec(client, `${PM2_STOP}; if [ -e ${q(REMOTE_ROOT)} ]; then mv ${q(REMOTE_ROOT)} ${q(aside)}; fi; ${clone} && cd ${q(REMOTE_ROOT)} && ${setup}`, { timeoutMs: 15 * 60_000 })
  if (r.code !== 0) return { ok: false, detail: `clone ${r.code}: ${(r.stderr || r.stdout).slice(-300)}` }
  // The installer comes with the clone; in a dry run the «server» folder is empty — the scripts are put there as the copy would.
  if (dry) execSync(`mkdir -p ${q(`${REMOTE_ROOT}/scripts`)} && cp -R ${q(path.join(root, 'scripts', 'dedicated-server'))} ${q(`${REMOTE_ROOT}/scripts/`)}`)
  return { ok: true, detail: url }
}

/**
 * 737-11a — the welcome after the live start: only when the server has the main bot (moved with the node, or its own). The main agent
 * there is woken by the node's own word (`wakeMainByNode`: the door `alarm`, no question in Telegram) and writes the first message.
 */
async function greet(client) {
  const t = readMove(root).telegram ?? {}
  if (!t.bot || (t.choice !== 'move' && t.choice !== 'new')) return { ok: false, reason: 'no-bot', at: now() }
  if (dry) return { ok: true, dry: true, at: now() }
  const where = roadOf(readMove(root)) === 'new'
    ? `this node has just started on its own server ${server().host} as an independent node of the person (set up from their computer, which keeps its own node), and its own Telegram bot @${t.bot} answers here`
    : `the move has finished — this node now lives on its dedicated server ${server().host}, and the person's Telegram bot @${t.bot} answers from here`
  const text = `${nodeLine.head('moved', 'build')}Node: ${where}. Write the person one short greeting in that chat, in their language: the node is ready to start development. If you hold no picture of the person yet (skill know-the-architect), get acquainted first, before any development. Then the conversation is theirs.`
  try {
    const r = await exec(client, `cd ${q(REMOTE_ROOT)} && node -e ${q("require('./lib/deploy/agent-return.cjs').wakeMainByNode(process.cwd(), process.argv[1]).then((r) => console.log(JSON.stringify({ ok: !r, reason: r || null })))")} ${q(text)}`, { timeoutMs: 90_000 })
    return { ...JSON.parse(r.stdout.trim().split('\n').pop()), at: now() }
  } catch (e) {
    return { ok: false, reason: String(e.reason ?? e.message).slice(0, 200), at: now() }
  }
}

/** The server's own answer on its names (`names-ready.mjs`); an empty answer when it cannot tell (it never holds the move by itself). */
async function namesReady(client) {
  try {
    const r = await exec(client, `cd ${q(REMOTE_ROOT)} && node scripts/dedicated-server/names-ready.mjs${dry ? ' --dry' : ''}`, { timeoutMs: 45 * 60_000 })
    return JSON.parse(r.stdout.trim().split('\n').pop())
  } catch (e) {
    return { zone: null, error: String(e.reason ?? e.message).slice(0, 200), waiting: [] }
  }
}

async function startServer(client, phase, rungId = null) {
  const progress = `${REMOTE_ROOT}/logs/dedicated-server/start-${phase}.progress.jsonl`
  await exec(client, `rm -f ${q(progress)}`)
  await startDetached(client, `${DRY}bash ${q(`${REMOTE_ROOT}/scripts/dedicated-server/start.sh`)} ${phase}`, `${REMOTE_ROOT}/logs/dedicated-server/start-${phase}.out`)
  const id = rungId ?? (phase === 'silent' ? 'rehearse' : 'move')
  return follow(client, progress, 'start', { script: 'start.sh', everyMs: POLL, timeoutMs: 60 * 60_000, onStages: (stages) => setRung(root, id, { stages, heartbeat: now() }) })
}

async function allChecks(client) {
  if (dry) return [{ id: 'dry', ok: true }]
  let commit = null
  try { commit = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim() } catch { /* no git */ }
  const outside = await outsideChecks(server().host, { commit })
  // ✗ The owner's test server 2026-11-13: the rehearsal failed «commit» because this node had written a state record (a commit touching
  // only development-docs/) after the copy. The same code is what matters: a difference of records alone keeps the check green.
  const c = outside.find((x) => x.id === 'commit')
  if (c && !c.ok && c.value && /^[0-9a-f]{7,40}$/.test(String(c.value))) {
    try {
      const changed = execSync(`git diff --name-only ${c.value} HEAD`, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
      if (changed.every((f) => f.startsWith('development-docs/'))) Object.assign(c, { ok: true, recordsOnly: changed.length })
    } catch { /* the server's commit is unknown here: a different version */ }
  }
  return [...outside, ...(await insideChecks(client, root))]
}

// BEFORE THE MOVE — WHEN THE SERVER IS NOT EMPTY (the owner, 2026-11-13: «если мы обнаружили что сервер занят … очистить сервер и
// подготовить к установке нового приложения Fractera или отменить установку … очистить должно иметь подтверждающий диалог»). Both are
// started from the tab's dialog (the door checks the confirmation); neither runs once the move rung has started.
const before = {
  // Free the server: root's pm2 programs and every foreign nginx site stopped and kept in a backup folder there (`clear.sh` — nothing
  // erased), then the probe runs again on the freed server.
  async clear() {
    patchMove(root, (s) => { s.clear = { state: 'running', at: now(), pid: process.pid } })
    let client
    try {
      ({ client } = await asRoot())
      await exec(client, `mkdir -p ${q(ROOT_DIR)} && chmod 700 ${q(ROOT_DIR)}`)
      await upload(client, `${ROOT_DIR}/clear.sh`, readFileSync(path.join(here, 'clear.sh')), 0o700)
      const r = await exec(client, `${DRY}bash ${ROOT_DIR}/clear.sh`, { timeoutMs: 180_000 })
      const out = JSON.parse(r.stdout.trim().split('\n').pop())
      patchMove(root, (s) => { s.clear = { state: 'done', at: now(), ...out } })
      console.log(`===MOVE_CLEARED=== ${out.stopped} programs stopped, sites moved: ${out.sites.join(',') || 'none'}, backup ${out.backup}`)
    } catch (e) {
      patchMove(root, (s) => { s.clear = { state: 'failed', at: now(), detail: String(e.reason ?? e.message).slice(0, 300) } })
      console.error(`===MOVE_CLEAR_FAILED=== ${String(e.reason ?? e.message).slice(0, 200)}`)
      process.exitCode = 1
      return
    } finally { client?.end() }
    await rungs.probe()
  },

  // Cancel the installation: the node's key leaves the server's authorized_keys, its work folder there is removed, and this computer
  // forgets the server (the move's state). Nothing else on the server is touched; what prepare already installed stays.
  async cancel() {
    if (readMove(root).rungs?.move?.state === 'done' || existsSync(path.join(root, 'data', 'node', 'moved.json'))) { console.error('===MOVE_CANCEL_REFUSED=== the node has moved — the road back is `return`'); process.exit(2) }
    const pub = readFileSync(path.join(serverDir(root), 'id_ed25519.pub'), 'utf8').trim()
    let detail = ''
    try {
      const { client } = await asRoot()
      try { await exec(client, `${dry ? 'true' : `grep -vxF ${q(pub)} ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.fractera-tmp; cat ~/.ssh/authorized_keys.fractera-tmp > ~/.ssh/authorized_keys; rm -f ~/.ssh/authorized_keys.fractera-tmp; rm -rf ${q(ROOT_DIR)}`}`) } finally { client.end() }
    } catch (e) { detail = `server not reached: ${e.reason ?? e.message}` }
    patchMove(root, (s) => { for (const k of Object.keys(s)) delete s[k]; s.rungs = {}; s.cancelled = { at: now(), detail } })
    rmSync(path.join(serverDir(root), 'known_hosts'), { force: true })
    rmSync(path.join(serverDir(root), 'known-host.json'), { force: true })
    console.log(`===MOVE_CANCELLED=== ${detail || 'the node key removed from the server, the server forgotten here'}`)
  },
}

// NOT RUNGS — the roads after a move, run from this computer in a terminal (its core is stopped: no panel here); the person's explicit word.
const roads = {
  // 737-11b: on the road «Новый сервер» the server is live before its bot exists — its main agent greets once the person is admitted
  // there (started by the door `/api/node/server/telegram`).
  async greet() {
    const s = readMove(root)
    if (roadOf(s) !== 'new' || s.rungs?.start?.state !== 'done') { console.error('===MOVE_GREET_REFUSED=== only an independent server that runs'); process.exit(2) }
    const { client } = await asNode()
    try {
      const welcome = await greet(client)
      patchMove(root, (x) => { x.welcome = welcome })
      console.log(`===MOVE_GREETED=== ${JSON.stringify(welcome)}`)
    } finally { client.end() }
  },

  // The node comes home: the server's node stops and is forgotten there, its copy comes back by the same rules (the bots' tokens too),
  // this computer's env files are written again for this machine, the node starts here. The server's copy stays as it was (cold).
  async return() {
    const moved = (() => { try { return JSON.parse(readFileSync(path.join(root, 'data', 'node', 'moved.json'), 'utf8')) } catch { return null } })()
    if (!moved && !dry) { console.error('===MOVE_RETURN_REFUSED=== this node has not moved'); process.exit(2) }
    patchMove(root, (s) => { s.return = { state: 'running', at: now() } })
    const { client } = await asNode()
    try {
      await exec(client, dry ? 'true' : 'pm2 stop all || true; pm2 delete all || true; pm2 save --force || true', { timeoutMs: 180_000 })
      const c = await copyPhase({ root, host: server().host, port: server().port, phase: 'live', back: true, keep: serverKeeps(readMove(root)), ...(dry ? { target: `${REMOTE_ROOT}/` } : {}) })
      if (c.code !== 0) throw new Error(`rsync ${c.code}: ${c.tail.slice(-200)}`)
      await exec(client, `printf '%s\\n' ${q(JSON.stringify({ ...readServerMark(), phase: 'returned', returnedAt: now() }))} > ${q(`${REMOTE_ROOT}/data/node/server.json`)}`)
      if (!dry) {
        rmSync(path.join(root, 'data', 'node', 'moved.json'), { force: true })
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
        execSync(`${npm} run services:install`, { cwd: root, stdio: 'inherit' })
        execSync(`${process.execPath} scripts/serve.mjs start`, { cwd: root, stdio: 'inherit' })
        execSync(process.platform === 'win32' ? 'pm2.cmd save' : 'pm2 save', { cwd: root, stdio: 'inherit' })
      }
      patchMove(root, (s) => { s.return = { state: 'done', at: now() }; s.rungs.move = { ...(s.rungs.move ?? {}), state: 'idle' } })
      console.log('===MOVE_RETURNED=== the node lives on this computer again')
    } catch (e) {
      patchMove(root, (s) => { s.return = { state: 'failed', at: now(), detail: String(e.message).slice(0, 300) } })
      console.error(`===MOVE_RETURN_FAILED=== ${String(e.message).slice(0, 300)}`)
      process.exitCode = 1
    } finally { client.end() }
  },

  // A window into the server's node from this computer: SSH forwards the core's and every element's port one to one, so
  // http://localhost:<core port> opens the server's panel with owner rights (the request reaches the server's loopback without nginx and
  // without the edge mark — the holder of the node's key is the owner). Before the domain this is the owner's panel; Ctrl+C closes it.
  async window() {
    const corePort = (() => { try { return JSON.parse(readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port || 24680 } catch { return 24680 } })()
    const { installedElements } = await import('../../lib/hosting/hostnames.mjs')
    const ports = [corePort, ...installedElements(root).map((e) => e.port)]
    const { createServer } = await import('node:net')
    const busy = []
    for (const p of ports) {
      const free = await new Promise((resolve) => { const s = createServer().once('error', () => resolve(false)).once('listening', () => s.close(() => resolve(true))).listen(p, '127.0.0.1') })
      if (!free) busy.push(p)
    }
    // 737-11b: an independent server is opened while this node keeps running here — its core's panel comes on a shifted port (+10000);
    // its elements answer by their own addresses there. The move's window keeps every port one to one (this computer's node is stopped).
    const independent = roadOf(readMove(root)) === 'new'
    if (busy.length && !independent) { console.error(`===MOVE_WINDOW_REFUSED=== ports busy here: ${busy.join(' ')} — the node still runs on this computer`); process.exit(2) }
    const key = path.join(serverDir(root), 'id_ed25519')
    const known = path.join(serverDir(root), 'known_hosts')
    const local = busy.length ? corePort + 10000 : corePort
    const forwards = busy.length ? ['-L', `${local}:127.0.0.1:${corePort}`] : ports.flatMap((p) => ['-L', `${p}:127.0.0.1:${p}`])
    console.log(`Окно в узел на сервере: http://localhost:${local} — закрыть: Ctrl+C · A window into the server's node: http://localhost:${local}`)
    const { spawn } = await import('node:child_process')
    const child = spawn('ssh', ['-N', ...forwards, '-i', key, '-p', String(server().port), '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes', '-o', `UserKnownHostsFile=${known}`, '-o', 'ExitOnForwardFailure=yes', `${REMOTE_USER}@${server().host}`], { stdio: 'inherit' })
    child.on('close', (code) => process.exit(code ?? 0))
  },
}

if (before[rung]) await before[rung]()
else if (roads[rung]) await roads[rung]()
else if (!rungs[rung]) {
  console.log('Переезд: connect · probe · prepare · copy · claude · rehearse · (telegram — выбор во вкладке) · move · Новый сервер: … · claude · start · (telegram) · до переезда: clear · cancel · дороги: return · window · greet   [--dry]')
  process.exit(rung ? 2 : 0)
} else await rungs[rung]()
