// ЧУЖОЕ — ВОН ИЗ СПИСКА АГЕНТА УЗЛА (узел, шаг 548-7). Одно место для агентов элементов (`scripts/element-isolate.mjs`) и главного
// агента (`scripts/main-agent-install.mjs`).
//
// ✗ Замерено 548-6 (журнал агента template 2026-10-19 22:02): в списке навыков 82 имени, у 23 нет описания — среди них свои
// `product-quiz`, `node-elements-detection`, `own-service-props-detection`. Бюджет списка — 1 % окна, при переполнении Claude Code
// снимает описания у наименее вызываемых (code.claude.com/docs/en/skills, «Skill descriptions are cut short»), а место занимали
// 34 чужих навыка. Каждый ключ ниже — из справочника настроек (code.claude.com/docs/en/settings-reference):
//   `skillOverrides: off` — навыки человека из `~/.claude/skills` (не плагины: на плагины `skillOverrides` не действует);
//   `disableBundledSkills` — встроенные навыки Claude Code;
//   `syncClaudeAiSkills` / `syncClaudeAiPlugins: false` — навыки и плагины аккаунта claude.ai; 🛑 только в ЛОКАЛЬНЫХ настройках:
//     в пользовательских Claude Code ещё и переносит их в корзину для всей машины, в локальных — лишь не грузит в этой папке;
//   `enabledPlugins: false` — плагины, которые человек включил себе, кроме канала Telegram (через него агенту пишет человек);
//   `disableClaudeAiConnectors` — коннекторы claude.ai (почта, календарь, документы) агенту узла не нужны.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const KEEP_PLUGIN = 'telegram@claude-plugins-official'
const BUILTIN_LEFT = ['plugin-authoring']

/** Одно поле фронтматтера SKILL.md (многострочное — склеенным). */
export function skillField(text, key) {
  const lines = String(text ?? '').replace(/\r/g, '').split('\n')
  if (lines[0]?.trim() !== '---') return ''
  const end = lines.indexOf('---', 1)
  const fm = lines.slice(1, end > 0 ? end : undefined)
  const i = fm.findIndex((l) => l.startsWith(`${key}:`))
  if (i < 0) return ''
  const out = [fm[i].slice(key.length + 1)]
  for (let j = i + 1; j < fm.length && !/^[A-Za-z_-]+:/.test(fm[j]); j++) out.push(fm[j])
  return out.join(' ').replace(/^\s*[>|][-+]?/, '').replace(/\s+/g, ' ').trim()
}

const readText = (f) => { try { return readFileSync(f, 'utf8') } catch { return '' } }

/** Ключи локальных настроек, убирающие всё чужое; `skillOverrides` — только для чужих навыков, свои дописывает вызывающий. */
export function foreignOff(home = homedir()) {
  const base = join(home, '.claude', 'skills')
  const userSkills = existsSync(base)
    ? readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== 'synced' && !d.name.startsWith('.'))
      .map((d) => skillField(readText(join(base, d.name, 'SKILL.md')), 'name') || d.name)
    : []
  let plugins = []
  try { plugins = Object.entries(JSON.parse(readText(join(home, '.claude', 'settings.json'))).enabledPlugins ?? {}).filter(([k, v]) => v && k !== KEEP_PLUGIN).map(([k]) => k) } catch { /* нет настроек */ }
  return {
    userSkills,
    plugins,
    settings: {
      // 548-13: встроенный навык, который disableBundledSkills не снимает (замерено журналом 2026-10-20: остался в списке у трёх агентов).
      skillOverrides: Object.fromEntries([...userSkills, ...BUILTIN_LEFT].map((n) => [n, 'off'])),
      disableBundledSkills: true,
      syncClaudeAiSkills: false,
      syncClaudeAiPlugins: false,
      disableClaudeAiConnectors: true,
      enabledPlugins: Object.fromEntries(plugins.map((p) => [p, false])),
    },
  }
}
