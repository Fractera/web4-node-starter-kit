// «ПУЛЬТ УЗЛА» IN TELEGRAM (node step 771). `npm run tg-app -- menu` — the main bot's menu button opens the panel at the node's HTTPS
// address (own domain, else the live temporary address; none — back to commands); `npm run tg-app -- status` — what Telegram holds now.
// The tunnel moves the button by itself when the temporary address changes (scripts/tunnel.mjs, 771-3). No model; the token never printed.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const menu = createRequire(import.meta.url)('../lib/node/tg-menu.cjs')
const cmd = process.argv[2] ?? 'status'

if (cmd === 'menu') {
  const r = await menu.refresh(ROOT)
  console.log(r.ok ? `===TG_MENU_OK=== ${r.state}${r.url ? ` → ${new URL(r.url).host}` : ' (no HTTPS address: the plain command menu)'}` : `===TG_MENU_FAIL=== ${r.why ?? r.state}`)
  process.exit(r.ok ? 0 : 1)
} else if (cmd === 'status') {
  const r = await menu.status(ROOT)
  const b = r.button
  console.log(r.ok ? `===TG_MENU=== ${b?.type ?? '?'}${b?.web_app?.url ? ` «${b.text}» → ${new URL(b.web_app.url).host}` : ''}` : `===TG_MENU_FAIL=== ${r.why ?? r.state}`)
  process.exit(r.ok ? 0 : 1)
} else {
  console.log('usage: npm run tg-app -- menu | status')
  process.exit(2)
}
