// БРАУЗЕР ДЛЯ ГЛАЗ АГЕНТА (шаг 647). Запуск: `postinstall` — то есть первая установка (`npm run launch`) и каждое обновление узла,
// сменившее пакеты (`node:update`). Сами глаза — `scripts/eyes.mjs`, `npm run eyes`.
//
// 🔒 НИКОГДА НЕ ВАЛИТ `npm install`. Нет сети, старая система, сервер без библиотек — узел работает и без глаз; причина и что
// поставить печатаются маркером, выход всегда 0.
// 🔒 ПО ОЧЕРЕДИ: 1) свой Chromium Playwright (`install chromium --only-shell`, ~100 МБ в общий кэш компьютера, один на ядро и все
// элементы; уже стоит — секунда); 2) нет поддержки системы — установленный Chrome или Edge: ✗ измерено 2026-11-04 на Mac владельца
// (macOS 12.7.6): «Playwright does not support chromium-headless-shell on mac12», а Chrome 150 водится без окна; 3) ничего —
// `===EYES_NO_BROWSER===`. В CI (`CI=true`) не качается ничего: три ОС сборки не смотрят страниц.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'node_modules', 'playwright', 'cli.js')

if (process.env.CI) {
  console.log('===EYES_SKIPPED=== CI: браузер для проверок не качается')
  process.exit(0)
}
if (!existsSync(cli)) {
  console.log('===EYES_NO_BROWSER=== пакета playwright нет — глаза агента недоступны, узел работает без них')
  process.exit(0)
}

const own = spawnSync(process.execPath, [cli, 'install', 'chromium', '--only-shell'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 600000 })
if (own.status === 0) {
  console.log('===EYES_OK=== playwright-chromium')
  process.exit(0)
}
const why = `${own.stderr ?? ''}${own.stdout ?? ''}`.split('\n').map((l) => l.trim()).find((l) => /error|not support/i.test(l)) ?? `код ${own.status}`

// Свой Chromium не встал — пробуем установленные браузеры тем же путём, каким их откроет `eyes`.
let chromium
try { ({ chromium } = await import('playwright')) } catch { /* без пакета — ниже NO_BROWSER */ }
for (const channel of ['chrome', 'msedge']) {
  try {
    const b = await chromium.launch({ headless: true, channel })
    const v = b.version()
    await b.close()
    console.log(`===EYES_OK=== ${channel} ${v} (свой Chromium не встал: ${why.slice(0, 120)})`)
    process.exit(0)
  } catch { /* следующий */ }
}
console.log(`===EYES_NO_BROWSER=== свой Chromium не встал (${why.slice(0, 160)}), Chrome и Edge не найдены.`)
console.log('Глаза агента недоступны — узел работает без них. Поставьте Google Chrome: https://www.google.com/chrome/')
if (process.platform === 'linux') console.log('На Linux-сервере: npx playwright install-deps chromium (нужны права root), затем npm run eyes:install')
process.exit(0)
