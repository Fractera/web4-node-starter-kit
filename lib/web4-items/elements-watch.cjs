// ОДИН СТОРОЖ НА ВСЕ ЭЛЕМЕНТЫ (узел, шаг 663-6). Владелец 2026-11-06: «Включить в 663 (Рекомендую)» — 13 личных сторожей
// `fractera-svc-<id>-watch` по ~51 МБ (~660 МБ на его Mac) заменены одним `fractera-elements-watch` (`scripts/health-watch.mjs`,
// `FRACTERA_WATCH_SERVICE=*`, `ecosystem.config.cjs`). Здесь два действия, которые зовут запуск узла, установщик, рождение,
// включение и принятие элемента:
//   • `dropLegacyWatchers` — убрать из pm2 личных сторожей, оставшихся от прежних версий (иначе элемент сторожили бы дважды);
//   • `ensureElementsWatch` — поднять общего сторожа, если он не запущен (запущенного не трогать: его счётчики живут в памяти).
// Ошибки молчат: сторож — защита, а не условие запуска элемента.
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const NAME = 'fractera-elements-watch'
const IS_WIN = process.platform === 'win32'

// pm2 передаёт новому процессу окружение того, кто его зовёт: окружение Next ядра (`__NEXT_*`, `PORT`) детям не передаётся.
function childEnv() {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(__NEXT|NEXT_|AGI_)/.test(k) || ['PORT', 'HOSTNAME', 'NODE_ENV'].includes(k)) continue
    env[k] = v
  }
  return env
}

const pm2 = (root, args) => spawnSync(IS_WIN ? 'pm2.cmd' : 'pm2', args, { cwd: root, shell: IS_WIN, windowsHide: true, env: childEnv(), encoding: 'utf8' })

function list(root) {
  const r = pm2(root, ['jlist'])
  try { return JSON.parse((r.stdout || '').slice((r.stdout || '').indexOf('['))) } catch { return [] }
}

/** Удалить из pm2 личных сторожей элементов прежних версий. Возвращает их имена. */
function dropLegacyWatchers(root = process.cwd()) {
  const legacy = list(root).map((a) => a.name).filter((n) => /^fractera-svc-.+-watch$/.test(n))
  for (const n of legacy) pm2(root, ['delete', n])
  return legacy
}

// 663-4: привратник спящих элементов (`fractera-gatekeeper`) — такой же постоянный процесс узла; ✗ без этой строки его поднимал только
// `serve:start`, и узел, обновлённый `node:update`, оставался без привратника.
const GATEKEEPER = 'fractera-gatekeeper'

/** Поднять общего сторожа и привратника, если их нет или они не `online`. Возвращает true, если кого-то запускали. */
function ensureElementsWatch(root = process.cwd()) {
  const apps = list(root)
  let started = false
  for (const name of [NAME, GATEKEEPER]) {
    const me = apps.find((a) => a.name === name)
    if (me && me.pm2_env && me.pm2_env.status === 'online') continue
    if (me) pm2(root, ['delete', name])
    pm2(root, ['start', path.join(root, 'ecosystem.config.cjs'), '--only', name])
    started = true
  }
  return started
}

module.exports = { NAME, GATEKEEPER, dropLegacyWatchers, ensureElementsWatch }
