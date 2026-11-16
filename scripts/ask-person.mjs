// npm run ask-person -- "<what to do, in the person's language>" [--href </ru/…|https://…>] [--why "<why only the person>"]
//   [--hint "<what may pop up on the way and what to press>"] [--copy "<a command the person pastes — the window gives it a copy button>"]
// npm run ask-person -- list | drop <id> | done <id>   (done: the person answered «Готово · <id>» in Telegram — you close it, no wake)
// Node step 761-16: a step needs the person's own hands — the request shows at the bottom of every page of the panel until «Готово»,
// and that press wakes you with the node line `person-done`. Never a chat line instead (the owner, 2026-11-16).
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const asks = req(join(ROOT, 'lib', 'node', 'person-asks.cjs'))
const tg = req(join(ROOT, 'lib', 'node', 'person-asks-telegram.cjs'))
const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v ?? null }

if (args[0] === 'list') {
  const open = asks.open(ROOT)
  console.log(open.length ? open.map((a) => `${a.id} · ${a.at.slice(11, 16)} UTC · ${a.text}${a.href ? ` → ${a.href}` : ''}`).join('\n') : 'no open requests')
} else if (args[0] === 'done') {
  // the person pressed «Готово · <id>» in Telegram and it reached you as their message: close it here (you are awake — no wake)
  const id = tg.doneId(args.slice(1).join(' ')) ?? args[1] ?? ''
  const a = asks.done(ROOT, id)
  const sent = a ? await tg.closed(ROOT, a, 'taken').catch((e) => String(e)) : null
  console.log(a ? `===ASK_DONE=== ${a.id} «${a.text}» — the window is closed (telegram: ${sent}); check the result yourself, then go on` : `===ASK_ALREADY=== ${id} is not open (closed in the panel already, or unknown) — tell the person it was already done`)
} else if (args[0] === 'drop') {
  const a = asks.drop(ROOT, args[1] ?? '')
  const sent = a ? await tg.closed(ROOT, a, 'dropped').catch((e) => String(e)) : null
  console.log(a ? `===ASK_DROPPED=== ${a.id} (telegram: ${sent})` : '===ASK_NOT_FOUND===')
  if (!a) process.exitCode = 1
} else {
  const href = flag('--href')
  const why = flag('--why')
  const hint = flag('--hint')
  const copy = flag('--copy')
  try {
    const a = asks.add(ROOT, { text: args.join(' '), href, why, hint, copy })
    const t = await tg.announce(ROOT, a)
    if (t.sent) asks.setTg(ROOT, a.id, { via: t.via, sent: t.sent })
    console.log(`===ASK_PUT=== ${a.id} — shown at the bottom of every panel page until «Готово»; the press wakes you (person-done).${t.sent ? ` Also sent to Telegram (${t.detail}): their reply «Готово · ${a.id}» comes to you as a message — then npm run ask-person -- done ${a.id}.` : ' No Telegram bot: the window alone.'} Say one line to the person that the window waits for them.`)
  } catch (e) {
    console.log(`===ASK_REFUSED=== ${e instanceof Error ? e.message : e}`)
    process.exitCode = 1
  }
}
