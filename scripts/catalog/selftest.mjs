// THE CATALOG'S HELPERS PROVE THEMSELVES (node step 627-1): `npm run catalog -- selftest`. No network, no files — only `lib.mjs`.
import assert from 'node:assert/strict'
import { cardPieces, catalogMark, usefulCards } from './build.mjs'
import { searchIndex } from '../../lib/agent-kit/skills/catalog-index.mjs'
import { blobShaOf, blobShaOfBuffer, dedupeBySha, folderShaOf, frontmatterName, installsOf, isScript, parseList, shaOf, skillPaths, urlOf, validateCard } from './lib.mjs'

let checks = 0
const check = (name, fn) => {
  try {
    fn()
    checks += 1
  } catch (err) {
    console.log(`===CATALOG_SELFTEST_FAILED=== ${name}: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}

check('installsOf', () => {
  assert.equal(installsOf('1.2M'), 1_200_000)
  assert.equal(installsOf('936.7K'), 936_700)
  assert.equal(installsOf('141'), 141)
  assert.equal(installsOf('x'), 0)
})

check('parseList', () => {
  const rows = parseList('# the leaderboard\n1 | vercel-labs/skills | find-skills | 4.2M\n26 | uizze.sh | ui-taste | 924.5K\n\n')
  assert.deepEqual(rows, [{ rank: 1, source: 'vercel-labs/skills', skill: 'find-skills', installs: 4_200_000 }])
})

check('shaOf', () => {
  assert.match(shaOf('a'), /^[0-9a-f]{16}$/)
  assert.equal(shaOf('same text'), shaOf('same text'))
  assert.notEqual(shaOf('one text'), shaOf('another text'))
})

check('blobShaOf', () => {
  // `printf 'hello\n' | git hash-object --stdin`
  assert.equal(blobShaOf('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
  assert.equal(blobShaOfBuffer(Buffer.from('hello\n')), 'ce013625030ba8dba906f756967f9e9ca394464a')
  assert.equal(folderShaOf([['b', '2'], ['a', '1']]), folderShaOf([['a', '1'], ['b', '2']]))
  assert.notEqual(folderShaOf([['a', '1']]), folderShaOf([['a', '2']]))
})

check('frontmatterName', () => {
  assert.equal(frontmatterName('---\nname: grill-me\ndescription: x\n---\n# body'), 'grill-me')
  assert.equal(frontmatterName('---\nname: "x y"\n---\n'), 'x y')
  assert.equal(frontmatterName('# no frontmatter\nname: nope'), null)
})

check('skillPaths', () => {
  const { named, all } = skillPaths(['README.md', 'skills/grill-me/SKILL.md', 'skills/tdd/SKILL.md'], 'grill-me')
  assert.deepEqual(named, ['skills/grill-me/SKILL.md'])
  assert.deepEqual(all, ['skills/grill-me/SKILL.md', 'skills/tdd/SKILL.md'])
})

check('dedupeBySha', () => {
  const { keep, duplicates } = dedupeBySha([
    { rank: 1, source: 'a/one', skill: 's', installs: 10, stars: 5, sha: 'f'.repeat(16) },
    { rank: 2, source: 'b/two', skill: 's', installs: 20, stars: 50, sha: 'f'.repeat(16) },
    { rank: 3, source: 'c/three', skill: 't', installs: 1, stars: 0, sha: 'e'.repeat(16) },
  ])
  assert.deepEqual(keep.map((r) => r.source), ['b/two', 'c/three'])
  assert.deepEqual(duplicates, [{ id: 'a/one@s', duplicateOf: 'b/two@s' }])
})

check('urlOf', () => {
  assert.equal(urlOf('claude-office-skills/skills', 'Twitter/X Automation'), 'https://skills.sh/claude-office-skills/skills/twitter-x-automation')
})

const good = {
  id: 'mattpocock/skills@grill-me', source: 'mattpocock/skills', skill: 'grill-me', installs: 1_500_000, stars: 1200, licence: 'MIT',
  url: 'https://skills.sh/mattpocock/skills/grill-me', sha: '0123456789abcdef',
  summary: 'The skill makes the agent interview the person about a plan, one hard question at a time, until the plan holds up.',
  tasks: ['stress-test a product plan'], tags: ['planning', 'interview'], tools: [], value: 'high', use: 'install', needs: [],
  files: 1, scripts: [], licenceFrom: 'repository', quality: 4, qualityWhy: 'Clear steps and a stop rule; no examples.',
  why: 'Pure conversation; nothing in it depends on a stack.', risks: [], markedBy: 'claude-haiku-5-5', markedAt: '2026-11-02T20:00:00.000Z',
}

check('isScript', () => {
  assert.equal(isScript('scripts/check-quota.sh'), true)
  assert.equal(isScript('tools/Render.PY'), true)
  assert.equal(isScript('references/guide.md'), false)
})

check('validateCard', () => {
  assert.deepEqual(validateCard(good), [])
  assert.deepEqual(validateCard({ ...good, value: 'maybe' }), ['value'])
  assert.deepEqual(validateCard({ ...good, use: 'later' }), ['use'])
  assert.deepEqual(validateCard({ ...good, risks: ['runs a remote script'] }), ['risks-need-skip'])
  assert.deepEqual(validateCard({ ...good, risks: ['runs a remote script'], use: 'skip' }), [])
  assert.deepEqual(validateCard({ ...good, files: 0 }), ['files'])
  assert.deepEqual(validateCard({ ...good, quality: 6 }), ['quality'])
  assert.deepEqual(validateCard({ ...good, tags: ['SEO'] }), ['tags'])
  assert.deepEqual(validateCard({ ...good, blob: 'ce013625030ba8dba906f756967f9e9ca394464a' }), [])
  assert.deepEqual(validateCard({ ...good, blob: 'short' }), ['blob'])
})

// 627-2: a card's pieces — the summary and each task; no slash in the mark; a skip or risky card is not searchable.
check('cardPieces', () => {
  const card = { id: 'a/b@x', source: 'a/b', skill: 'x', summary: 'Writes headlines.', tasks: ['write a headline', 'test two headlines'], use: 'install' }
  assert.equal(catalogMark(card), 'catalog:a~b:x')
  assert.deepEqual(cardPieces(card), [['x — Writes headlines.', 0], ['x: write a headline', 1], ['x: test two headlines', 2]])
  assert.equal(usefulCards([card, { ...card, use: 'skip' }, { ...card, risks: ['runs curl | sh'] }]).length, 1)
})
check('searchIndex', () => {
  const index = { rows: [['m1', 0], ['m1', 1], ['m2', 0]], dims: 2, matrix: Float32Array.from([1, 0, 0.8, 0.6, 0, 1]) }
  assert.deepEqual(searchIndex(index, [1, 0], { threshold: 0.5 }).map((f) => [f.mark, f.piece]), [['m1', 0]])
  assert.deepEqual(searchIndex(index, [0, 1], { threshold: 0.5 }).map((f) => f.mark), ['m2', 'm1'])
  assert.equal(searchIndex(index, [-1, 0], { threshold: 0.5 }).length, 0)
})

console.log(`===CATALOG_SELFTEST_OK=== ${checks} checks`)
