// СБОРКА ИНСТРУМЕНТА «ОБОЛОЧКА ПРОЕКТА» (шаг 727-1). Слово владельца 2026-11-11: «верхнее меню со всеми его функциями это должен быть
// один отдельный инструмент в вкладке инструменты ядра … все остальные элементы должны получить его нативно»; 2026-11-12: «Да, берём A».
//
// Из ОДНОГО кода (`components/shell/` ядра + `_tools/shell-kit/`) — три вещи в `.shell-kit/` (вне git, вне сборки Next):
//   render.mjs            — сервер: дверь ядра рисует шапку и подвал в HTML (свой React, `react-dom/server`);
//   shell-kit.<hash>.js   — браузер: оживляет тот же HTML на странице элемента (тот же React);
//   shell-kit.<hash>.css  — утилиты Tailwind этих файлов без preflight, на токенах элемента (`var(--background)` …);
//   manifest.json         — имена файлов с хэшем и версия (по ней элемент понимает, что ядро сменило инструмент).
// 🔒 Next этот код не собирает: `next/link` и `next/navigation` подменены прокладками, директивы `"use client"` пакету не нужны.
// 🛑 Пустой CSS — громкий отказ: Tailwind без источников молча отдаёт файл без утилит (globals.css, 2026-08-12).
import { build } from 'esbuild'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = process.cwd()
const KIT = join(ROOT, '_tools', 'shell-kit')
const OUT = join(ROOT, '.shell-kit')
const SHIMS = { 'next/link': join(KIT, 'shims', 'next-link.tsx'), 'next/navigation': join(KIT, 'shims', 'next-navigation.ts') }
// shadcn-примитивы, которые тянет оболочка, — из её же импортов (`@/components/ui/<имя>`), без второго списка: ✗ 727-1, ручной список
// пропустил `navigation-menu`, и выпадающая панель меню вышла прозрачной.
const UI = [...new Set(readdirSync(join(ROOT, 'components', 'shell')).flatMap((f) =>
  [...readFileSync(join(ROOT, 'components', 'shell', f), 'utf8').matchAll(/@\/components\/ui\/([a-z0-9-]+)/g)].map((m) => m[1])))].sort()

const shims = {
  name: 'shell-kit-shims',
  setup(b) {
    b.onResolve({ filter: /^next\/(link|navigation)$/ }, (a) => ({ path: SHIMS[a.path] }))
    b.onResolve({ filter: /^next(\/|$)/ }, (a) => ({ errors: [{ text: `shell-kit: ${a.path} не подменён — оболочка вне Next его не получит` }] }))
  },
}

const common = {
  bundle: true,
  jsx: 'automatic',
  tsconfig: join(ROOT, 'tsconfig.json'),
  plugins: [shims],
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_DEFAULT_THEME': 'undefined' },
  logOverride: { 'module-level-directive': 'silent' },
  legalComments: 'none',
  write: false,
}

function themeBlock() {
  const css = readFileSync(join(ROOT, 'styles', 'globals.css'), 'utf8')
  const at = css.indexOf('@theme inline {')
  if (at < 0) throw new Error('styles/globals.css: нет @theme inline — токены инструменту взять неоткуда')
  let depth = 0
  for (let i = css.indexOf('{', at); i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1)
  }
  throw new Error('styles/globals.css: @theme inline не закрыт')
}

async function buildCss() {
  const rel = (p) => JSON.stringify(resolve(ROOT, p))
  const entry = [
    '@layer theme, base, components, utilities;',
    '@import "tailwindcss/theme.css" layer(theme);',
    '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
    `@import ${rel('node_modules/tw-animate-css/dist/tw-animate.css')};`,
    `@import ${rel('node_modules/shadcn/dist/tailwind.css')};`,
    `@source ${rel('components/shell')};`,
    `@source ${rel('_tools/shell-kit')};`,
    ...UI.map((u) => `@source ${rel(`components/ui/${u}.tsx`)};`),
    '@custom-variant dark (&:is(.dark *));',
    themeBlock(),
  ].join('\n')
  const from = join(OUT, 'kit.entry.css')
  writeFileSync(from, entry)
  const r = await postcss([tailwind({ base: ROOT, optimize: { minify: true } })]).process(entry, { from })
  if (!/\.bg-background\b/.test(r.css) || r.css.length < 4000) {
    throw new Error(`CSS инструмента без утилит (${r.css.length} байт) — Tailwind не нашёл источников`)
  }
  return r.css
}

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10)

// 🔒 ФАЙЛЫ ПРЕЖНИХ ВЕРСИЙ ЖИВУТ (727-2). Страница элемента закэширована вместе с именами файлов инструмента (ISR + кэш запросов Next,
// ✗ измерено 2026-11-12: ответ ядра лежит в кэше элемента 300 с, страница — `revalidate` 600 с). Сотри ядро прежние файлы при своей
// сборке — страницы элементов до четверти часа живут без стилей и без скрипта шапки. Поэтому новая сборка стирает только своё
// служебное, а файлы `shell-kit.<хэш>.js|css` хранит: последние KEEP по времени, остальные — прочь.
const KEEP = 12
const ASSET_FILE = /^shell-kit\.[0-9a-f]{10}\.(js|css)$/

function pruneOldAssets() {
  const old = readdirSync(OUT).filter((f) => ASSET_FILE.test(f))
    .map((f) => ({ f, t: statSync(join(OUT, f)).mtimeMs })).sort((a, b) => b.t - a.t)
  for (const { f } of old.slice(KEEP)) rmSync(join(OUT, f), { force: true })
}

export async function buildShellKit() {
  mkdirSync(OUT, { recursive: true })
  for (const f of readdirSync(OUT)) if (!ASSET_FILE.test(f)) rmSync(join(OUT, f), { recursive: true, force: true })

  const server = await build({ ...common, entryPoints: [join(KIT, 'server', 'render.tsx')], platform: 'node', format: 'esm', target: 'node20',
    // react-dom/server.node — CommonJS с `require('util')`: ESM-пакету нужен свой require.
    banner: { js: "import { createRequire as __kitRequire } from 'node:module'; const require = __kitRequire(import.meta.url);" } })
  const client = await build({
    ...common,
    entryPoints: [join(KIT, 'client', 'shell-kit.client.tsx')],
    platform: 'browser',
    format: 'iife',
    target: 'es2020',
    minify: true,
  })
  const js = client.outputFiles[0].text
  const css = await buildCss()

  const version = hash(js + css)
  const files = { js: `shell-kit.${hash(js)}.js`, css: `shell-kit.${hash(css)}.css` }
  writeFileSync(join(OUT, 'render.mjs'), server.outputFiles[0].text)
  writeFileSync(join(OUT, files.js), js)
  writeFileSync(join(OUT, files.css), css)
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ version, builtAt: new Date().toISOString(), ...files }, null, 2) + '\n')
  rmSync(join(OUT, 'kit.entry.css'), { force: true })
  pruneOldAssets()
  return { version, files, sizes: { js: js.length, css: css.length } }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build-shell-kit.mjs')) {
  buildShellKit()
    .then((r) => {
      console.log(`  ✓ shell-kit ${r.version}: ${r.files.js} ${Math.round(r.sizes.js / 1024)} КБ, ${r.files.css} ${Math.round(r.sizes.css / 1024)} КБ`)
      if (!existsSync(join(OUT, 'render.mjs')) || readdirSync(OUT).length < 4) process.exit(1)
    })
    .catch((err) => {
      console.error(`  ✗ shell-kit: ${err instanceof Error ? err.message : err}`)
      process.exit(1)
    })
}
