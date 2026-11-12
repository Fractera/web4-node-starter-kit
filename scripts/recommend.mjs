// npm run recommend -- "<the person's need, any words>" [--lang ru] [--json]   (step 726-6)
//   npm run recommend -- --all
//
// The node's checked helpful links that fit a need (`lib/helpful-links.json`, skill `helpful-links`) — no model, no network. Nothing
// fits → «no helpful link for this need», and the agent recommends nothing. An element asks the same list through the core's door
// (`GET /api/node/helpful-links?q=`, its own `npm run recommend`).

import { createRequire } from 'node:module'

const { LIST, findLinks, present, lineOf } = createRequire(import.meta.url)('../lib/helpful-links.cjs')
const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const lang = flag('--lang') ?? 'en'
const query = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--lang').join(' ')
const found = (args.includes('--all') ? LIST.links : findLinks(query)).map((l) => present(l, lang))
if (args.includes('--json')) { console.log(JSON.stringify({ query, links: found })); process.exit(0) }
if (!found.length) { console.log(`===RECOMMEND_NONE=== no helpful link for «${query}» — recommend nothing`); process.exit(0) }
for (const p of found) console.log(`- ${lineOf(p)}`)
console.log(`===RECOMMEND_OK=== ${found.length} link(s); retell in the person's words, the disclosure kept next to a partner link`)
