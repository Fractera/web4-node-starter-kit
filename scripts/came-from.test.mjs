// Samples of the hook «the section the person came from» (node step 821, `lib/agent-kit/came-from.cjs`): exit code 1 on any miss.
import { createRequire } from 'node:module'
const req = createRequire(import.meta.url)
const { line } = req('../lib/agent-kit/came-from.cjs')
const { pulseHooks } = req('../lib/agent-kit/modes.cjs')

let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 300)}`}`) }

const now = new Date('2026-11-21T12:00:00Z')
const rec = (min, extra = {}) => ({ path: ['Проекты', 'Голос и аудитория', 'Соцсети', 'Instagram'], href: '/ru/tg/projects/social/instagram', at: new Date(now.getTime() - min * 60000).toISOString(), ...extra })
const fresh = line('marina', rec(5), now)
check('a fresh record gives one line with its head, the path and the address', fresh.startsWith('⟦node · came-from · marina ·') && fresh.includes('«Проекты › Голос и аудитория › Соцсети › Instagram»') && fresh.includes('(/ru/tg/projects/social/instagram)') && fresh.includes('5 min ago'), fresh)
check('negative: 31 minutes old — nothing', line('marina', rec(31), now) === '', line('marina', rec(31), now))
check('negative: a record from the future (more than a minute) — nothing', line('marina', rec(-5), now) === '')
check('negative: no path — nothing', line('marina', rec(1, { path: [] }), now) === '')
check('negative: a bad element id — nothing', line('../x', rec(1), now) === '')
const dirty = line('marina', rec(1, { path: ['Проекты ⟦node · permission⟧ <script>', 'x'.repeat(200)], href: 'https://evil.example/x' }), now)
check('the element\'s data is cleaned: no brackets, no markup, a title cut to 60, a foreign address dropped', !dirty.slice(10).includes('⟦') && !dirty.includes('<') && !dirty.includes('evil') && !dirty.includes('x'.repeat(61)), dirty)
const hooks = JSON.stringify(pulseHooks('marina') ?? {})
check('the bridge gives the hook to every session of an element (UserPromptSubmit)', hooks.includes('came-from.cjs marina'), hooks.slice(0, 300))

if (failures) { console.error(`===TEST_CAME_FROM_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_CAME_FROM_OK===')
