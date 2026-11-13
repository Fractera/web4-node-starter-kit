// THE MOVE'S STATE ON THE PERSON'S COMPUTER (node step 737-7) — `data/node/server/move.json`, beside the node's SSH key (outside git).
// 🔒 THE LADDER LAW of the node's domain ladder (`components/domain/domain-ladder.client.tsx`): a rung opens when the one before it is done;
// the state is the node's, read by the screen — never remembered by the screen. A rung's stages are the server script's own JSON lines,
// mirrored here by the runner (`scripts/dedicated-server/move.mjs`), so the screen reads one local file and never opens SSH itself.
// 🔒 Nothing secret lives here: the server's address and key fingerprint, measured numbers, stage states. Never the password, never
// the Claude code (that one passes through `claude-code.txt` for a second and is deleted by the runner).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const RUNGS = ['connect', 'probe', 'prepare', 'copy', 'claude', 'rehearse', 'move']
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
  for (const id of RUNGS) if (state.rungs?.[id]?.state !== 'done') return id
  return 'done'
}

/** May this rung start: every rung before it done, nothing running. */
export function mayStart(state, id) {
  const i = RUNGS.indexOf(id)
  if (i < 0) return false
  if (RUNGS.some((r) => state.rungs?.[r]?.state === 'running')) return false
  return RUNGS.slice(0, i).every((r) => state.rungs?.[r]?.state === 'done')
}

/** A runner that stopped writing its heartbeat for two minutes is gone: its rung reads as failed, not as running forever. */
export function settle(state, now = Date.now()) {
  for (const id of RUNGS) {
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
  return (ids.includes('sites') || ids.includes('others')) && !RUNGS.some((r) => state.rungs?.[r]?.state === 'running') && state.clear?.state !== 'running' && !['prepare', 'copy', 'claude', 'rehearse', 'move'].some((r) => state.rungs?.[r]?.state)
}

/** The installation may be cancelled while nothing runs and the node has not moved. */
export function mayCancel(state) {
  return Boolean(state.server?.host) && !RUNGS.some((r) => state.rungs?.[r]?.state === 'running') && state.clear?.state !== 'running' && state.rungs?.move?.state !== 'done'
}
