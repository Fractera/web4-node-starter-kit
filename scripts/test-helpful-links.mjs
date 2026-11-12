// test-helpful-links — the node's helpful links (step 726-6): `npm run test:helpful-links`.
//
// Plane: the module and the command over a fixture list and the real one. Negative controls, all must stay red:
//   • a need no link fits gets NO link (never a link pushed against the need);
//   • a plain link carries NO disclosure; a partner link always does;
//   • a word inside another word does not match («server» does not fire on «observer») — a word starts at a boundary, its ending is free.

import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

const { LIST, findLinks, present, lineOf } = createRequire(import.meta.url)('../lib/helpful-links.cjs')
let failed = 0
const say = (ok, line) => { if (!ok) failed++; console.log(`${ok ? '  ✓' : '  ✗'} ${line}`) }

const FIXTURE = {
  disclosure: { en: 'partner link — it supports Fractera', ru: 'партнёрская ссылка — поддерживает Fractera' },
  links: [
    { id: 'search', kind: 'web-search', words: ['web search', 'поиск в интернете'], name: 'Search X', url: 'https://example.com/?ref=roma', referral: true, for: 'f', verdict: 'v' },
    { id: 'vps', kind: 'vps', words: ['vps', 'server', 'сервер'], name: 'VPS Y', url: 'https://example.org/vps', referral: false, for: 'f', verdict: 'v' },
  ],
}

console.log('the fixture:')
say(findLinks('нужен поиск в интернете для агента', FIXTURE).map((l) => l.id).join() === 'search', 'a need for web search → the search link')
say(findLinks('web-search', FIXTURE).map((l) => l.id).join() === 'search', 'the kind named exactly → the search link')
say(findLinks('нарисуй логотип для блога', FIXTURE).length === 0, 'negative: a need no link fits → nothing')
say(findLinks('', FIXTURE).length === 0, 'negative: an empty need → nothing')
say(findLinks('the observer pattern in code', FIXTURE).length === 0, 'negative: «server» inside another word («observer») does not fire')
say(findLinks('узел должен жить на сервере', FIXTURE).map((l) => l.id).join() === 'vps', 'an inflected word («на сервере») → the VPS link')
const partner = present(FIXTURE.links[0], 'ru', FIXTURE)
const plain = present(FIXTURE.links[1], 'ru', FIXTURE)
say(partner.disclosure === 'партнёрская ссылка — поддерживает Fractera' && lineOf(partner).includes(partner.disclosure), `a partner link carries the disclosure in the person's language: «${partner.disclosure}»`)
say(present(FIXTURE.links[0], 'de', FIXTURE).disclosure === FIXTURE.disclosure.en, 'a language the list has no words for → the English disclosure, never none')
say(plain.disclosure === '' && !lineOf(plain).includes('Fractera'), 'negative: a plain link carries no disclosure')
say(!('words' in partner), 'a reader never gets the internal words')

console.log('the real list:')
for (const l of LIST.links) {
  say(/^https:\/\//.test(l.url) && l.for && l.verdict && l.kind && Array.isArray(l.words) && typeof l.referral === 'boolean', `${l.id}: url, for, verdict, kind, words, referral`)
}
say(findLinks('мне нужен сервер для узла').some((l) => l.id === 'contabo-cloud-vps-10'), 'a node that must run 24/7 on a server → Contabo Cloud VPS 10')
const none = execFileSync('node', ['scripts/recommend.mjs', 'поиск в интернете для агента'], { encoding: 'utf8' })
say(none.includes('===RECOMMEND_NONE==='), 'the command: a need no real link fits → RECOMMEND_NONE')

if (failed) { console.error(`===HELPFUL_LINKS_FAILED=== ${failed}`); process.exit(1) }
console.log('===HELPFUL_LINKS_OK===')
