// THE MOVE'S STATE ON THE PERSON'S COMPUTER (node step 737-7) — `data/node/server/move.json`, beside the node's SSH key (outside git).
// 🔒 THE LADDER LAW of the node's domain ladder (`components/domain/domain-ladder.client.tsx`): a rung opens when the one before it is done;
// the state is the node's, read by the screen — never remembered by the screen. A rung's stages are the server script's own JSON lines,
// mirrored here by the runner (`scripts/dedicated-server/move.mjs`), so the screen reads one local file and never opens SSH itself.
// 🔒 Nothing secret lives here: the server's address and key fingerprint, measured numbers, stage states. Never the password, never
// the Claude code (that one passes through `claude-code.txt` for a second and is deleted by the runner).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const RUNGS = ['connect', 'probe', 'prepare', 'copy', 'claude', 'rehearse', 'telegram', 'move']
// 737-11b — THE SECOND ROAD «НОВЫЙ СЕРВЕР» (the owner, 2026-11-13: «пользователи однажды устанавливают на свой домашний компьютер Fractera и
// в будущем поднимает множество независящих от него серверов»; D5: «both variant for choose. and if it will clon need second question -
// replace data or not»). An independent node on its own server: this computer keeps working and keeps its bot. It shares connect · probe
// · prepare · copy · claude · telegram with the move; `start` puts it live at once (it never rehearses: nothing here is replaced).
export const NEW_RUNGS = ['connect', 'probe', 'prepare', 'copy', 'claude', 'start', 'telegram']
export const ALL_RUNGS = [...new Set([...RUNGS, ...NEW_RUNGS])]
export const roadOf = (state) => (state?.road === 'new' ? 'new' : 'move')
export const rungsOf = (state) => (roadOf(state) === 'new' ? NEW_RUNGS : RUNGS)
/** The road may change only before anything is done on the server (prepare not started). */
export const mayChooseRoad = (state) => !['prepare', 'copy', 'claude', 'rehearse', 'start', 'telegram', 'move'].some((r) => state?.rungs?.[r]?.state)

// What never travels to an independent server, whatever is chosen: every bot (the server sets up its own), this node's identity (a new
// node code is made there), its wallets, the owner's template workshop, the session marks of this computer's agents (a server with them
// would «continue» conversations it never had), the old place declaration.
export const NEW_EXCLUDES = [
  '/data/services/*/channel/', '/data/node-code.json', '/data/services/*/wallet/', '/data/workshop/',
  '/data/services/*/session-mode.json', '/data/services/*/pulse.json', '/data/node/place.json',
]
// «Перенести данные этого узла?» — no: the accounts, every element's stores (each template keeps them in `data/`, `storage/` and
// `database.sqlite*`, measured in all 15 templates' .gitignore), the agents' memory, the node's diary and history, the person's own instructions
// of the main agent stay here; the code, the elements and their settings travel. `+` keeps the folders' own `.gitkeep` (git sees no loss).
export const DATA_EXCLUDES = [
  '+ /WEB4-ITEMS/*/*/data/.gitkeep', '+ /WEB4-ITEMS/*/*/storage/.gitkeep',
  '/WEB4-ITEMS/*/*/data/*', '/WEB4-ITEMS/*/*/storage/*', '/WEB4-ITEMS/*/*/database.sqlite*',
  '/data/services/auth/auth.db*', '/data/services/*/memory/', '/data/services/*/context.json',
  '/data/services/graph/lightrag/', '/data/services/graph/spaces/',
  '/data/node/memory/', '/data/node/usage/', '/data/node/*.jsonl', '/data/main-agent/',
]
/** The copy rules of the road «Новый сервер» for its plan: `{ variant: 'clone' | 'fresh', data: boolean }`. */
export const newRoadExcludes = (plan) => [...NEW_EXCLUDES, ...(plan?.data ? [] : DATA_EXCLUDES)]

// 737-11a — THE NODE'S MAIN BOT ON THE SERVER (the owner, 2026-11-13: «если уже подключён Telegram то спросить: переносить этот Telegram
// на сервер или создать другой … вызываем процедуру создание нового телеграмм бота прямо в этом окне … в аккордеоне»). The person's choice
// at the rung «Telegram»: 'move' — this node's bot travels with the move (one reader at a time: it starts there when this computer stops);
// 'new' — the server's own bot, set up in the tab through the server's own channel door; 'later' — no bot now (no bot here either).
export const TELEGRAM_CHOICES = ['move', 'new', 'later']
export const SERVER_BOT_DIR = '/data/services/build/channel/telegram/'
/** What every copy (silent, live, the road home) leaves untouched on the server: a bot of the server's own lives only there. */
export const serverKeeps = (state) => (state?.telegram?.choice === 'new' ? [SERVER_BOT_DIR] : [])
export const moveFile = (root) => join(root, 'data', 'node', 'server', 'move.json')

export function readMove(root) {
  try {
    const s = JSON.parse(readFileSync(moveFile(root), 'utf8'))
    return s && typeof s === 'object' ? s : { rungs: {} }
  } catch {
    return { rungs: {} }
  }
}

/** Change the state through a function; written whole and renamed, so a reader never sees half a file. */
export function patchMove(root, fn) {
  const s = readMove(root)
  s.rungs = s.rungs ?? {}
  fn(s)
  s.updatedAt = new Date().toISOString()
  const file = moveFile(root)
  mkdirSync(join(root, 'data', 'node', 'server'), { recursive: true, mode: 0o700 })
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp, `${JSON.stringify(s, null, 2)}\n`)
  renameSync(tmp, file)
  return s
}

export function setRung(root, id, patch) {
  return patchMove(root, (s) => { s.rungs[id] = { ...(s.rungs[id] ?? {}), ...patch } })
}

/** The rung the person may press now: the first that is not done; a running one is the current one. */
export function currentRung(state) {
  for (const id of rungsOf(state)) if (state.rungs?.[id]?.state !== 'done') return id
  return 'done'
}

/** May this rung start: every rung before it done, nothing running. */
export function mayStart(state, id) {
  const order = rungsOf(state)
  const i = order.indexOf(id)
  if (i < 0) return false
  if (ALL_RUNGS.some((r) => state.rungs?.[r]?.state === 'running')) return false
  // 737-15: the domain's own run (nginx, DNS, certificates on the server) finishes before a rung touches the server.
  if (domainBusy(state)) return false
  // After the move the server's node is live: no rung runs again (a copy would stop it); the roads are `return` and `window`.
  if (roadOf(state) === 'move' && state.rungs?.move?.state === 'done') return false
  return order.slice(0, i).every((r) => state.rungs?.[r]?.state === 'done')
}

/** A runner that stopped writing its heartbeat for two minutes is gone: its rung reads as failed, not as running forever. */
export function settle(state, now = Date.now()) {
  for (const id of ALL_RUNGS) {
    const r = state.rungs?.[id]
    if (r?.state === 'running' && r.heartbeat && now - Date.parse(r.heartbeat) > 120_000) {
      r.state = 'failed'
      r.detail = r.detail || 'the runner stopped answering'
    }
  }
  return state
}

export const isMoved = (root) => existsSync(join(root, 'data', 'node', 'moved.json'))

/** A busy server (the probe named another install) may be freed while nothing runs and the move has not started. */
export function mayClear(state) {
  const ids = (state.verdict?.items ?? []).map((i) => i.id)
  return (ids.includes('sites') || ids.includes('others')) && !ALL_RUNGS.some((r) => state.rungs?.[r]?.state === 'running') && state.clear?.state !== 'running' && !['prepare', 'copy', 'claude', 'rehearse', 'start', 'telegram', 'move'].some((r) => state.rungs?.[r]?.state)
}

/** The domain's run is working: started under 2 minutes ago, or running under 50 (certbot's own limit is 40) — a dead one frees itself. */
export function domainBusy(state, now = Date.now()) {
  const d = state.domainRun
  const age = now - Date.parse(d?.at ?? '')
  return (d?.state === 'starting' && age < 2 * 60_000) || (d?.state === 'running' && age < 50 * 60_000)
}

/** A domain for the server may be typed while nothing runs on the move road and the node has not moved (737-15). */
export function mayDomain(state) {
  return Boolean(state.server?.host) && roadOf(state) === 'move' && !ALL_RUNGS.some((r) => state.rungs?.[r]?.state === 'running') && !domainBusy(state) && state.rungs?.move?.state !== 'done'
}

/** The installation may be cancelled while nothing runs and the node has not moved. */
export function mayCancel(state) {
  return Boolean(state.server?.host) && !ALL_RUNGS.some((r) => state.rungs?.[r]?.state === 'running') && state.clear?.state !== 'running' && state.rungs?.move?.state !== 'done'
}
