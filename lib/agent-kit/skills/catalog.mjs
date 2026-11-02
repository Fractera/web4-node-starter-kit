// THE OPEN SKILLS CATALOG skills.sh AS THE FIRST STEP OF SKILLS_FIND (owner 2026-11-02: «на раннем этапе я бы хотел использовать этот
// проект целиком как он есть … а хотя бы хоть что-то сразу»). The node's own graph holds only its base (8 skills) and needs the OpenAI
// key; the catalog holds tens of thousands and needs no key. Later (owner, same day) a graph of the catalog's descriptions, marked once
// and shipped with every node — until then the catalog is asked live.
// 🔒 THE CLI, NOT THE API: skills.sh/api/v1/skills/search answers 401 without a Vercel OIDC token (measured 2026-11-02); `skills find`
// answers anyone. Version pinned — a new CLI must not change the output this parser reads without our word.
// 🔒 DISABLE_TELEMETRY=1: the CLI sends install statistics by default (skills.sh/docs/cli); the node sends nothing unasked.
// 🛑 WINDOWS: `npx.cmd` runs only through the shell (EINVAL after CVE-2024-27980), and the shell would read the query — so the query
// keeps only latin letters, digits, spaces and «-» (the agent gives English words anyway).
// 🛑 Nothing is installed here: a found skill is only named. Installing it into an element is the person's «yes» (`npx skills add`).
import { spawn } from 'node:child_process'

export const CLI = 'skills@1.7.5'
const MIN_INSTALLS = 100

const clean = (q) => String(q ?? '').replace(/[^A-Za-z0-9 -]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
const count = (s) => {
  const m = /^([\d.]+)([KM]?)$/i.exec(s)
  return m ? Math.round(Number(m[1]) * ({ K: 1e3, M: 1e6 }[m[2].toUpperCase()] ?? 1)) : 0
}

/** `owner/repo@skill 6.4K installs` + `└ https://skills.sh/…` → entries, most installed first. */
export function parseFind(out) {
  const lines = String(out).replace(/\x1b\[[0-9;]*m/g, '').split(/\r?\n/).map((l) => l.trim())
  const found = []
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^(\S+\/\S+?)@(.+?)\s+([\d.]+[KM]?)\s+installs?$/i.exec(lines[i])
    if (!m) continue
    const url = /^└\s*(https:\/\/\S+)/.exec(lines[i + 1] ?? '')?.[1] ?? null
    found.push({ source: m[1], skill: m[2], installs: count(m[3]), url, add: `npx skills add ${m[1]} --skill "${m[2]}" -a claude-code` })
  }
  return found.sort((a, b) => b.installs - a.installs)
}

/** Ask the catalog: `{ ok, query, found }` or `{ ok: false, error }`; never throws. */
export function findInCatalog(query, { limit = 5, timeout = 90_000 } = {}) {
  const q = clean(query)
  if (q.length < 2) return Promise.resolve({ ok: false, error: 'the query needs English words' })
  return new Promise((resolve) => {
    const win = process.platform === 'win32'
    let child
    try {
      child = spawn(win ? 'npx.cmd' : 'npx', ['-y', CLI, 'find', win ? `"${q}"` : q], {
        env: { ...process.env, DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: win,
      })
    } catch (err) {
      return resolve({ ok: false, error: err instanceof Error ? err.message : String(err) })
    }
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    const timer = setTimeout(() => child.kill(), timeout)
    child.on('error', (err) => { clearTimeout(timer); resolve({ ok: false, error: err.message }) })
    child.on('close', (code) => {
      clearTimeout(timer)
      const all = parseFind(out)
      if (!all.length && code !== 0) return resolve({ ok: false, error: `skills find ended with ${code}: ${out.slice(-200).trim()}` })
      resolve({ ok: true, query: q, found: all.filter((s) => s.installs >= MIN_INSTALLS).slice(0, limit) })
    })
  })
}

/** The catalog's answer for an agent: what to read before advising, and that installing waits for the person. */
export function catalogText(r) {
  if (!r.ok) return `The open catalog skills.sh did not answer (${r.error}).`
  if (!r.found.length) return `The open catalog skills.sh has no skill with ${MIN_INSTALLS}+ installs for «${r.query}».`
  return [
    `The open catalog skills.sh («${r.query}», most installed first):`,
    ...r.found.map((s) => `- ${s.source} · ${s.skill} · ${s.installs} installs · ${s.url ?? ''}`),
    'Before naming one to the person: read its SKILL.md (the url), its licence and the source repository; prefer 1K+ installs and known ' +
      'sources. Install only after the person\'s «yes», into the element\'s folder, never globally: ' +
      (r.found[0]?.add ?? 'npx skills add <owner/repo> --skill <name> -a claude-code') + ', and a SOURCE.md beside it.',
  ].join('\n')
}
