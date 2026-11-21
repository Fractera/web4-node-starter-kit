// ОДНОРАЗОВЫЙ БИЛЕТ НА СОКЕТ ТЕРМИНАЛА (267-1, перенос `fractera-memory-starter/lib/fractera/pty-ticket.mjs`).
//
// 🔒 ЗАЧЕМ БИЛЕТ, ЕСЛИ ЕСТЬ СЕССИЯ. Сокет `/pty` принимает `server.js` ДО Next: ни
// замок слоя архитектора, ни `requireRoles` его не видят. Роль проверяет дверь
// `/api/terminal/ticket`, а сокет верит только билету, который она выдала.
//
// 🔒 ХРАНИЛИЩЕ В `globalThis`: дверь Next и сокет живут в ОДНОМ процессе (`server.js`
// поднимает Next у себя), но модуль у них загружен дважды — бандлом маршрута и
// `require` сервера. Общий у них только глобальный объект.
//
// 🔒 БИЛЕТ УДАЛЯЕТСЯ ДО ПРОВЕРКИ СРОКА: иначе просроченный можно предъявлять
// сколько угодно раз и так проверять чужие билеты на живость.

const { randomBytes } = require('node:crypto')

const TTL_MS = 60_000
const MAX_TICKETS = 64
const KEY = '__web4TerminalTickets'

function store() {
  if (!globalThis[KEY]) globalThis[KEY] = new Map()
  return globalThis[KEY]
}

function sweep(s, now) {
  for (const [id, t] of s) if (t.expiresAt <= now) s.delete(id)
}

/** Выдать билет вошедшему. Роль здесь не проверяется — это работа двери. */
// 834-2: a ticket names its element (`service`) — the socket of another element refuses it. Before 834 every ticket was the architect's,
// and any element's socket took it; once an element's own admin gets tickets for its own agent, that would open a neighbour's terminal.
/** @param {string} email @param {string | null} [service] */
function mintTicket(email, service = null) {
  const s = store()
  const now = Date.now()
  sweep(s, now)
  while (s.size >= MAX_TICKETS) {
    const oldest = [...s.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0]
    if (!oldest) break
    s.delete(oldest[0])
  }
  const ticket = randomBytes(32).toString('base64url')
  s.set(ticket, { email, service: typeof service === 'string' && service ? service : null, expiresAt: now + TTL_MS })
  return { ticket, expiresInMs: TTL_MS }
}

/** Погасить билет: почта владельца или `null`. */
/** @param {string} ticket @param {string | null} [service] */
function redeemTicket(ticket, service = null) {
  if (typeof ticket !== 'string' || !ticket) return null
  const s = store()
  const now = Date.now()
  sweep(s, now)
  const found = s.get(ticket)
  if (!found) return null
  s.delete(ticket)
  if (found.service && found.service !== service && !String(service ?? '').startsWith(`${found.service}--`)) return null // its work session «<id>--work» is its own
  return found.expiresAt > now ? found.email : null
}

module.exports = { mintTicket, redeemTicket, TICKET_TTL_MS: TTL_MS }
