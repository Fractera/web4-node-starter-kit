// СВЕЖИЙ ПРОЕКТ БЕЗ ЧУЖОЙ ИСТОРИИ. Запуск: `npm run launch`, этап 4 — после проверки форка, до сборки.
//
// 🔒 ЗАКОН УЖЕ БЫЛ, НАРУШАЛСЯ УСТРОЙСТВОМ. `development-steps/README.md`: «THIS FOLDER REACHES YOU EMPTY — BY LAW». С федерального
// шага 621-6 (2026-10-30) стартер разрабатывается в собственном репозитории, и его шаги ехали в каждый форк. ✗ Оплачено 2026-11-02:
// агент нового человека прочёл `current-steps.md` стартера и предложил ему шаги 545, 593, 603. Владелец: «новый проект не должен
// иметь никаких старых шагов».
//
// 🔒 ТОЛЬКО В ФОРКЕ И ОДИН РАЗ. Признак форка — запись `check-origin` (`logs/origin.json`, verdict `fork`): у оригинала и у машины
// автора (verdict `author`) история — своя и не трогается. Метка `logs/fresh-project.json` — сделано; повтор ничего не меняет.
// Чистятся только планы и итоги; README папок остаются, `current-steps.md` получает первый шаг нового проекта.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const MARK = path.join(root, 'logs', 'fresh-project.json')
const STEPS = path.join(root, 'development-docs', 'development-steps')
const PLAN = '1-first-launch-first-account-domain-telegram-task.md'

let origin = null
try { origin = JSON.parse(readFileSync(path.join(root, 'logs', 'origin.json'), 'utf8')) } catch { /* проверки форка не было */ }
if (origin?.verdict !== 'fork') {
  console.log(`===FRESH_SKIPPED=== ${origin?.verdict ?? 'no origin record'}: не форк — история проекта своя`)
  process.exit(0)
}
if (existsSync(MARK)) {
  console.log('===FRESH_OK=== проект уже свежий')
  process.exit(0)
}

const today = new Date().toISOString().slice(0, 10)
const removed = []
for (const dir of ['new-steps', 'completed-steps', path.join('pre-steps', 'handled')]) {
  const abs = path.join(STEPS, dir)
  if (!existsSync(abs)) continue
  for (const name of readdirSync(abs)) {
    if (name === 'README.md' || name === '.gitkeep') continue
    rmSync(path.join(abs, name), { recursive: true, force: true })
    removed.push(`${dir}/${name}`)
  }
}

writeFileSync(path.join(STEPS, 'current-steps.md'), `# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle. Updated by EVENT:
the person's decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the
start of a long or irreversible operation (before it), a changed next action. How the steps are planned, proven and closed — skill
\`use-development-steps\`.

**Active steps:** 1 — the first launch: the node is up, the person signs in to Claude Code, gets a Telegram bot and gives the first task
(\`new-steps/${PLAN}\`).

**Last change:** ${today} — the project was born from a fork of Fractera/web4-node-starter-kit; \`npm run launch\` installed and started the node.

**Next action:** 1-2 — the first account (the architect, it cannot be recovered), then 1-3 the own domain, 1-4 the Telegram bot, 1-5 the
first task. Ask nothing the node can find out itself.

## The person's decisions (verbatim)

- none yet

## Measured — do not measure again

- none yet
`, 'utf8')

mkdirSync(path.join(STEPS, 'new-steps'), { recursive: true })
writeFileSync(path.join(STEPS, 'new-steps', PLAN), `# 1 — The first launch: node up, Claude Code sign-in, a Telegram bot, the first task

## Why
A person who has never set up a server pasted the link to their fork and said «go». From here they must reach their first task without
a single question they cannot answer.

## Substeps
- **1-1 — the node is up.** Done by \`npm run launch\` on ${today}: packages, fork check, build, start, the browser opened on the first screen.
  Proof: \`npm run serve:status\` answers, \`===PUBLIC_URL===\` opens.
- **1-2 — the first account.** «Sign in» on the home page, the person chooses a login and a password. The first account is the
  architect for good and cannot be recovered — say it in the chat and keep it in front of them on the page. Later: Google or the
  Resend magic link for the architect (skill \`use-auth-providers\`), so the password can be restored by email. Proof: the person is in
  the control panel.
- **1-3 — the own domain.** The temporary Cloudflare address is only for a look. Serious intentions — a domain (for example porkbun.com,
  a .com about $12 a year, the price checked on the site); the person keeps the Claude Code chat open and you make the records that join
  the project, the registrar and Cloudflare (skill \`use-domain\`). Proof: the home page opens on the own domain.
- **1-4 — the Telegram bot.** @BotFather (https://t.me/BotFather), the token on the node's Telegram page. Proof: the bot answers the
  person's first message.
- **1-5 — the first task.** The person writes what they want to build, on the home page or to the bot (\`/api/node/first-task\`). Proof:
  the main agent answers and the task is routed (\`npm run find\` → an element, or \`npm run create\`). Any question about the
  architecture — skill \`explain-this-project\`.

## Closing
Close each substep with its own file in \`completed-steps/\` and the step with \`1-main.md\`; then this plan leaves \`new-steps/\`.
`, 'utf8')

mkdirSync(path.dirname(MARK), { recursive: true })
writeFileSync(MARK, JSON.stringify({ at: new Date().toISOString(), removed }, null, 2) + '\n', 'utf8')

// Коммит — чтобы дерево узла было чистым: следующие пересборки и развёртывания сверяются с git. Нет имени автора в git на чистом
// компьютере — коммит от имени узла, только для этого коммита (`-c`), глобальные настройки человека не трогаются.
const git = (...args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true })
const named = git('config', 'user.email').stdout.trim() !== ''
const identity = named ? [] : ['-c', 'user.name=Fractera node', '-c', 'user.email=node@localhost']
git('add', '-A', '--', 'development-docs/development-steps')
const commit = git(...identity, 'commit', '-m', 'Fresh project: start without the starter development history; step 1 is the first launch', '--', 'development-docs/development-steps')
console.log(`===FRESH_OK=== removed ${removed.length} starter step files; step 1 written${commit.status === 0 ? ', committed' : ' (not committed: ' + (commit.stderr || commit.stdout).trim().split('\n')[0] + ')'}`)
