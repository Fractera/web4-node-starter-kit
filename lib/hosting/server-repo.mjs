// THE SERVER'S OWN GITHUB REPOSITORY, STEP 4 OF THE LAUNCH (node step 808). The owner, 2026-11-20 (Telegram 37): «при входе по умолчанию
// стоит тоже самое репозиторий … Есть второй режим: поднять чистый стартер Fractera на любом vps … зарегистрируйте аккаунт GitHub кнопка
// сделано – в собственном аккаунте GitHub сделайте Fork репозитория Fractera … – введите ссылку на свой Repository. Кнопка проверить».
// 🔒 THE LAW OF 368 HOLDS: the server installs only from a DIRECT fork of the original — the original itself and a fork of a fork are
// refused here exactly as `scripts/check-origin.mjs` refuses them on the server at its first stage (✗ 2026-11-20: «install from the
// original» was asked and would have died there). This check runs on THIS computer before anything is kept, so the person hears the
// reason at «Проверить», not as a failed installation twenty minutes later.
// 🔒 The choice is kept ON the server (`/root/.fractera/repo.json`, 738: this computer keeps no state of a server). No file — «the same
// project» (this node's fork), the default. Pure: no files, the network only through the `get` given.

/** The original, as `scripts/check-origin.mjs` names it (a fork must have it as its parent). */
export const ORIGINAL = 'fractera/web4-node-starter-kit'
export const ORIGINAL_URL = 'https://github.com/Fractera/web4-node-starter-kit'

/**
 * The address a person typed as the one shape `launch.sh` accepts: `https://github.com/<owner>/<repo>.git`; null when it is not GitHub.
 * @param {unknown} text
 * @returns {string | null}
 */
export function repoUrl(text) {
  const s = String(text ?? '').trim()
  const m = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i.exec(s)
  if (!m || m[2] === '.' || m[2] === '..') return null
  return `https://github.com/${m[1]}/${m[2]}.git`
}

/** `owner/repo` in lower case — how two addresses are compared. */
export const repoSlug = (url) => {
  const m = /github\.com[/:]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(String(url ?? ''))
  return m ? `${m[1]}/${m[2]}`.toLowerCase() : null
}

/**
 * GitHub's own answer: is this a direct fork of the original? The reasons are words of the page (`server-launch.i18n.ts`, `repo.errors`).
 * @param {string} text the address as typed
 * @param {typeof fetch} [get]
 * @returns {Promise<{ ok: true, url: string, name: string } | { ok: false, reason: 'bad-url' | 'original' | 'fork-of-fork' | 'not-fork' | 'not-found' | 'github-limit' | 'github-silent', parent?: string }>}
 */
export async function forkCheck(text, get = fetch) {
  const url = repoUrl(text)
  if (!url) return { ok: false, reason: 'bad-url' }
  const slug = repoSlug(url)
  if (slug === ORIGINAL) return { ok: false, reason: 'original' }
  let r
  try {
    r = await get(`https://api.github.com/repos/${slug}`, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'fractera-node' }, signal: AbortSignal.timeout(15_000) })
  } catch {
    return { ok: false, reason: 'github-silent' }
  }
  if (r.status === 404) return { ok: false, reason: 'not-found' }
  if (r.status === 403 || r.status === 429) return { ok: false, reason: 'github-limit' }
  if (!r.ok) return { ok: false, reason: 'github-silent' }
  const repo = await r.json().catch(() => null)
  const name = String(repo?.full_name ?? '').toLowerCase()
  const parent = String(repo?.parent?.full_name ?? '').toLowerCase()
  if (name === ORIGINAL) return { ok: false, reason: 'original' } // a renamed address that leads to the original
  if (!repo?.fork) return { ok: false, reason: 'not-fork' }
  if (parent !== ORIGINAL) return { ok: false, reason: 'fork-of-fork', parent: repo?.parent?.full_name ?? '' }
  return { ok: true, url: `https://github.com/${repo.full_name}.git`, name: repo.full_name }
}

/**
 * The server's record as the page and the runner read it.
 * `same` — this node's fork (`sameUrl`); `own` — the person's fork, `url` only once GitHub confirmed it; `account`/`fork` — the person's
 * «Сделано» on the two rungs before the address. `url` is what the installation clones; null — the step is not done.
 * @param {string} text the file's text, '' when there is none
 * @param {string | null} sameUrl this node's fork
 * @returns {{ mode: 'same' | 'own', url: string | null, account: boolean, fork: boolean, checkedAt: string | null }}
 */
export function readRepo(text, sameUrl) {
  let v = null
  try { v = JSON.parse(text || 'null') } catch { v = null }
  if (v?.mode !== 'own') return { mode: 'same', url: sameUrl ?? null, account: false, fork: false, checkedAt: null }
  const url = repoUrl(v.url)
  return { mode: 'own', url, account: v.account === true || Boolean(url), fork: v.fork === true || Boolean(url), checkedAt: url && typeof v.checkedAt === 'string' ? v.checkedAt : null }
}

/**
 * One act on the record → the record to keep. `own` from `same` starts the small ladder from its first rung; a new address is kept only
 * with GitHub's yes (the caller passes `checked`).
 * @param {ReturnType<typeof readRepo>} now
 * @param {{ op: 'same' | 'own' | 'account' | 'fork' | 'url', url?: string, at?: string }} act
 */
export function nextRepo(now, act) {
  if (act.op === 'same') return { mode: 'same' }
  const base = now.mode === 'own' ? { mode: 'own', account: now.account, fork: now.fork, ...(now.url ? { url: now.url, checkedAt: now.checkedAt } : {}) } : { mode: 'own', account: false, fork: false }
  if (act.op === 'own') return base
  if (act.op === 'account') return { ...base, account: true }
  if (act.op === 'fork') return { ...base, account: true, fork: true }
  if (act.op === 'url' && act.url) return { mode: 'own', account: true, fork: true, url: act.url, checkedAt: act.at ?? new Date().toISOString() }
  return base
}
