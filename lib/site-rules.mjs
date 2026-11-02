// ПРАВИЛА САЙТА ДО АВТОМАТИЧЕСКОГО ДОСТУПА (шаг 556-1). Одна логика для команды главного агента (`scripts/site-rules.mjs`), двери
// ядра (`/api/node/site-rules`) и через неё — команды элемента. Владелец 2026-10-22: сайт, чьи правила запрещают разбор, не
// разбирается — человек даёт серию скриншотов; похожие сайты, чьи правила разрешают, разбирает `reverse` по одному.
//
// Машина судит только `robots.txt` (RFC 9309): группа `*` и группы агентов Claude, самое длинное правило побеждает, при равенстве —
// Allow; `*` и `$`; путь вместе с запросом; 4xx — файла нет, не запрещает; 5xx и сеть — неизвестно, считать закрытым. Условия сайта
// машина не судит: она находит на главной ссылки на них, читает их агент. Свои и частные адреса не проверяются: дверь ядра не должна
// стучаться внутрь машины.

const UA = 'Mozilla/5.0 (compatible; FracteraNode-SiteRules/1.0; +https://github.com/Fractera/WEB4)'
// Группы, которые мы читаем кроме `*`: так себя называют агенты Claude (самый строгий ответ побеждает).
const CLAUDE_AGENTS = ['claudebot', 'claude-user', 'claude-web', 'anthropic-ai']
const TERMS = /\b(terms|tos|legal|conditions|terms-of-service|terms-and-conditions|eula)\b|условия|condiciones/i
const AGENT_DOCS = /llms\.txt|agents\.json|openapi\.json|\/agents\/?$|\/mcp\/?$/i

/** Адрес → { url } или { error }. Только http(s) и публичные имена. */
export function parseTarget(input) {
  let url
  try { url = new URL(String(input ?? '').trim()) } catch { return { error: 'not a URL: give a full address, https://…' } }
  if (!/^https?:$/.test(url.protocol)) return { error: 'only http and https addresses' }
  const h = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  const v6 = h.includes(':')
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal') || (!v6 && !h.includes('.'))
    || /^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    || (v6 && (h === '::1' || h === '::' || /^f[cd]/.test(h) || /^fe80:/.test(h) || h.startsWith('::ffff:')))) {
    return { error: 'a private or local address: the node checks only public sites' }
  }
  return { url }
}

/** Текст robots.txt → группы [{ agents: [...], rules: [{ allow, pattern }] }], строки Content-Signal, число карт сайта. */
export function parseRobots(text) {
  const groups = []
  const contentSignal = []
  let sitemaps = 0
  let current = null
  let inAgents = false
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'user-agent') {
      if (!inAgents) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(value.toLowerCase())
      inAgents = true
      continue
    }
    if (key === 'sitemap') { sitemaps++; continue }
    if (key === 'content-signal') { contentSignal.push(value); continue }
    if ((key === 'allow' || key === 'disallow') && current) {
      inAgents = false
      if (value) current.rules.push({ allow: key === 'allow', pattern: value })
      continue
    }
    inAgents = false
  }
  return { groups, contentSignal, sitemaps }
}

function matches(pattern, path) {
  const anchored = pattern.endsWith('$')
  const body = anchored ? pattern.slice(0, -1) : pattern
  const re = new RegExp('^' + body.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (anchored ? '$' : ''))
  return re.test(path)
}

/** Решение одной группы для пути: самое длинное правило; при равенстве — Allow (RFC 9309, 2.2.2). */
export function decide(rules, path) {
  let best = null
  for (const r of rules) {
    if (!matches(r.pattern, path)) continue
    if (!best || r.pattern.length > best.pattern.length || (r.pattern.length === best.pattern.length && r.allow && !best.allow)) best = r
  }
  return best ? { allowed: best.allow, rule: `${best.allow ? 'Allow' : 'Disallow'}: ${best.pattern}` } : { allowed: true, rule: null }
}

/** Вердикт robots.txt для пути: `*` и группы агентов Claude; закрыто хоть одной — закрыто. */
export function verdict(parsed, path) {
  if (path === '/robots.txt') return { allowed: true, rule: null, group: null }
  const wanted = ['*', ...CLAUDE_AGENTS]
  let result = { allowed: true, rule: null, group: null }
  for (const agent of wanted) {
    const rules = parsed.groups.filter((g) => g.agents.includes(agent)).flatMap((g) => g.rules)
    if (!rules.length) continue
    const d = decide(rules, path)
    if (!d.allowed) return { ...d, group: agent }
    if (!result.rule && d.rule) result = { ...d, group: agent }
  }
  return result
}

async function get(url, timeoutMs) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) })
    return { status: r.status, text: r.ok ? await r.text() : '' }
  } catch (e) {
    return { status: 0, text: '', error: e instanceof Error ? e.message : String(e) }
  }
}

// Ссылка засчитывается по адресу или по КОРОТКОЙ подписи: карточка продукта со словом «legal» в описании — не условия (замер
// tinylaunch 2026-10-22).
function links(html, base, re) {
  const out = new Set()
  for (const m of String(html).matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!re.test(m[1]) && !(text.length <= 40 && re.test(text))) continue
    try { out.add(new URL(m[1], base).href) } catch { /* not a link */ }
    if (out.size >= 6) break
  }
  return [...out]
}

/** Правила сайта для адреса: robots.txt (машина) и ссылки на условия и на описания для агентов (их читает агент). */
export async function siteRules(input, { timeoutMs = 10000 } = {}) {
  const t = parseTarget(input)
  if (t.error) return { ok: false, error: t.error }
  const { url } = t
  const path = url.pathname + url.search
  const robotsAnswer = await get(`${url.origin}/robots.txt`, timeoutMs)
  let robots
  if (robotsAnswer.status >= 200 && robotsAnswer.status < 300) {
    const parsed = parseRobots(robotsAnswer.text)
    const v = verdict(parsed, path)
    robots = { state: 'found', status: robotsAnswer.status, verdict: v.allowed ? 'allowed' : 'disallowed', rule: v.rule, group: v.group,
      contentSignal: parsed.contentSignal, sitemaps: parsed.sitemaps }
  } else if (robotsAnswer.status >= 400 && robotsAnswer.status < 500) {
    robots = { state: 'missing', status: robotsAnswer.status, verdict: 'allowed', rule: null, group: null, contentSignal: [], sitemaps: 0 }
  } else {
    robots = { state: 'unreachable', status: robotsAnswer.status, error: robotsAnswer.error ?? null, verdict: 'unknown', rule: null,
      group: null, contentSignal: [], sitemaps: 0 }
  }
  const home = await get(`${url.origin}/`, timeoutMs)
  let terms = home.status >= 200 && home.status < 300 ? links(home.text, url.origin, TERMS) : []
  // Ссылки на главной нет (подвал рисует скрипт — Product Hunt, замер 2026-10-22) — обычные адреса условий; засчитывается только
  // страница, чей заголовок говорит об условиях: «мягкий 404» и страница входа отвечают 200 на любой адрес.
  if (!terms.length) {
    for (const p of ['/terms', '/tos', '/legal', '/terms-of-service']) {
      const page = await get(`${url.origin}${p}`, timeoutMs)
      const head = (page.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') + ' ' + (page.text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '')
      if (page.status >= 200 && page.status < 300 && TERMS.test(head.replace(/<[^>]+>/g, ' '))) { terms = [`${url.origin}${p}`]; break }
    }
  }
  const agentDocs = home.status >= 200 && home.status < 300 ? links(home.text, url.origin, AGENT_DOCS) : []
  return { ok: true, url: url.href, origin: url.origin, path, robots, home: home.status, terms, agentDocs }
}

/** Ответ человеческими строками — одна форма для команды главного агента, двери и команды элемента. */
export function siteRulesText(r) {
  if (!r.ok) return [`===SITE_RULES_FAILED=== ${r.error}`]
  const lines = [`site: ${r.origin}  path: ${r.path}`]
  const b = r.robots
  if (b.state === 'found') lines.push(`robots.txt: found · ${b.verdict === 'allowed' ? 'ALLOWED' : 'DISALLOWED'}${b.rule ? ` by "${b.rule}" (group ${b.group})` : ' (no rule matches)'}`)
  else if (b.state === 'missing') lines.push(`robots.txt: none (HTTP ${b.status}) — robots.txt does not forbid`)
  else lines.push(`robots.txt: unreachable (${b.status ? `HTTP ${b.status}` : b.error}) — UNKNOWN, treat as disallowed`)
  for (const s of b.contentSignal) lines.push(`content-signal: ${s}`)
  lines.push(r.terms.length
    ? `terms — read them before any automated access: ${r.terms.join(' · ')}`
    : `terms: no link found on the home page (HTTP ${r.home}) — find them by hand before any automated access`)
  if (r.agentDocs.length) lines.push(`published for agents: ${r.agentDocs.join(' · ')}`)
  lines.push(`===SITE_RULES=== ${b.verdict}`)
  return lines
}
