// npm run ask-person -- "<what to do, in the person's language>" [--href </ru/…|https://…>] [--why "<why only the person>"]
//   [--hint "<what may pop up on the way and what to press>"] [--copy "<a command the person pastes — the window gives it a copy button>"]
//   [--secret server-root --host <ip> [--port 22]]   768: the person types the server's root password in the window's masked field
//   [--secret element-admin --element <id>]   778-3: the admin of a custom element — e-mail and password, or «Пропустить» (the birth puts it itself)
//   [--signin]   777: «sign in as the architect» — the button's link is built by the node's one builder (lib/auth/sign-in-link.cjs):
//                the sign-in form with the way back to the same panel page on the node's own domain; never an --href of yours
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
const has = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true }

if (args[0] === 'list') {
  const open = asks.open(ROOT)
  console.log(open.length ? open.map((a) => `${a.id} · ${a.at.slice(11, 16)} UTC · ${a.text}${a.href ? ` → ${a.href}` : ''}`).join('\n') : 'no open requests')
} else if (args[0] === 'done') {
  // the person pressed «Готово · <id>» in Telegram and it reached you as their message: close it here (you are awake — no wake)
  const id = tg.doneId(args.slice(1).join(' ')) ?? args[1] ?? ''
  // 768: a key is saved only by the window's field — «Готово» without it would close the request with nothing written
  const waits = asks.open(ROOT).find((x) => x.id === id)?.secret?.kind
  if (waits === 'env' || waits === 'element-admin') { console.log(`===ASK_REFUSED=== ${id} waits for ${waits === 'env' ? 'a key' : 'the admin\'s e-mail and password (or «Пропустить»)'} typed in the window — it closes itself when the person saves it`); process.exit(1) }
  const a = asks.done(ROOT, id)
  const sent = a ? await tg.closed(ROOT, a, 'taken').catch((e) => String(e)) : null
  console.log(a ? `===ASK_DONE=== ${a.id} «${a.text}» — the window is closed (telegram: ${sent}); check the result yourself, then go on` : `===ASK_ALREADY=== ${id} is not open (closed in the panel already, or unknown) — tell the person it was already done`)
} else if (args[0] === 'drop') {
  const a = asks.drop(ROOT, args[1] ?? '')
  const sent = a ? await tg.closed(ROOT, a, 'dropped').catch((e) => String(e)) : null
  console.log(a ? `===ASK_DROPPED=== ${a.id} (telegram: ${sent})` : '===ASK_NOT_FOUND===')
  if (!a) process.exitCode = 1
} else {
  const signin = has('--signin') ? 'architect' : null
  const href = flag('--href')
  const why = flag('--why')
  const hint = flag('--hint')
  const copy = flag('--copy')
  // 768: the root password of a server, typed by the person in the window and posted by their browser to the launch door
  const secretKind = flag('--secret')
  const host = flag('--host')
  const port = flag('--port')
  const element = flag('--element')
  try {
    // 778-3: the admin of a custom element — its own module puts the request (the role from the registry, the name for people)
    if (secretKind === 'element-admin') {
      const out = await req(join(ROOT, 'lib', 'node', 'element-admin-ask.cjs')).askElementAdmin(ROOT, element ?? '')
      if (!out.ok) throw new Error(`--secret element-admin --element <id>: ${out.reason}`)
      console.log(`===ASK_PUT=== ${out.id}${out.already ? ' (already waiting)' : ''} — the admin of ${element}: the window in the panel${out.telegram ? ', and in Telegram with the form' : ''}; the e-mail and the password go straight to the sign-in, or «Пропустить» leaves the role to the architect. Nobody is woken when it closes.`)
      process.exit(0)
    }
    if (secretKind && secretKind !== 'server-root' && secretKind !== 'openai') throw new Error(`--secret ${secretKind}: the main agent asks server-root (--host <ip> [--port 22]), openai (the node's OpenAI key) or element-admin (--element <id>); an element's key is asked by that element`)
    const secret = secretKind === 'openai' ? { kind: 'openai' } : secretKind ? { kind: 'server-root', host, port: port ? Number(port) : 22 } : null
    if (signin && href) throw new Error('--signin builds its own link (the way back to the panel on the domain): drop --href')
    const a = asks.add(ROOT, { text: args.join(' '), href, why, hint, copy, secret, signin })
    const t = await tg.announce(ROOT, a)
    if (t.sent) asks.setTg(ROOT, a.id, { via: t.via, sent: t.sent })
    const how = a.secret?.kind === 'openai' ? ' The person types the key in the window or in the Telegram form (never in a chat); OpenAI checks it live, saving wakes you (person-done).' : a.secret ? ' The person types the password in the window\'s masked field (never in a chat); their browser opens the visit, and «Сохранить» wakes you (person-done).' : ''
    console.log(`===ASK_PUT=== ${a.id} — shown at the bottom of every panel page until «Готово»; the press wakes you (person-done).${how}${t.sent ? ` Also sent to Telegram (${t.detail})${a.secret?.kind === 'openai' ? ' with the button «Ввести здесь, в Telegram» when the node has an HTTPS address' : a.secret ? ' without a «Готово» button: a secret is typed only in the window' : `: their reply «Готово · ${a.id}» comes to you as a message — then npm run ask-person -- done ${a.id}`}.` : ' No Telegram bot: the window alone.'} Say one line to the person that the window waits for them.`)
  } catch (e) {
    console.log(`===ASK_REFUSED=== ${e instanceof Error ? e.message : e}`)
    process.exitCode = 1
  }
}
