// Samples of the team's results upload for a product quiz (core step 852-4, lib/web4-items/quiz-feedback.mjs): exit code 1 on any miss.
import assert from 'node:assert/strict'
import { MAX_BYTES, checkUpload, mainAgentText, safeName, stampOf } from '../lib/web4-items/quiz-feedback.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

t('a marked PDF, a Markdown file, a photo of a page are taken; the name is made safe, the extension kept', () => {
  assert.deepEqual(checkUpload({ name: 'Квиз v1 — правки команды.PDF', size: 2048, comment: 'see 2.3' }), { ok: true, value: { file: 'Квиз-v1-правки-команды.pdf', comment: 'see 2.3' } })
  assert.equal(checkUpload({ name: 'notes.md', size: 10 }).ok, true)
  assert.equal(checkUpload({ name: 'page 3.jpeg', size: 10 }).value.file, 'page-3.jpeg')
  assert.equal(safeName('../../etc/passwd.json'), 'passwd.json')
})

t('NEGATIVE: an executable, an empty file, more than 10 MB, a comment over 2000 characters are refused by kind', () => {
  assert.equal(checkUpload({ name: 'run.sh', size: 10 }).error, 'bad-kind')
  assert.equal(checkUpload({ name: 'x.exe', size: 10 }).error, 'bad-kind')
  assert.equal(checkUpload({ name: 'a.pdf', size: 0 }).error, 'empty')
  assert.equal(checkUpload({ name: 'a.pdf', size: MAX_BYTES + 1 }).error, 'too-big')
  assert.equal(checkUpload({ name: 'a.pdf', size: 1, comment: 'x'.repeat(2001) }).error, 'bad-comment')
})

t('the folder is the UTC moment; the main agent\'s line names the element, the path and the task by numbers', () => {
  assert.equal(stampOf(new Date('2026-11-25T01:02:03.456Z')), '2026-11-25T01-02-03Z')
  const text = mainAgentText({ id: 'cck60', rel: 'data/services/cck60/quiz-feedback/2026-11-25T01-02-03Z/notes.md', comment: 'see 2.3' })
  assert.match(text, /npm run task -- cck60/)
  assert.match(text, /numbers of its quiz tree/)
  assert.match(text, /«see 2\.3»/)
})

console.log(process.exitCode ? `===QUIZ_FEEDBACK_TEST_FAILED=== ${passed} passed` : `===QUIZ_FEEDBACK_TEST_OK=== ${passed} passed`)
