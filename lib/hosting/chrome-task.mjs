// THE READY TASK «CLAUDE ВПИШЕТ ЭТИ ЗАПИСИ В ВАШЕМ CHROME» (node step 760-9). The owner, 2026-11-16: «На каждом шаге где мы заполняем эти записи
// сделать кнопку которая отправит в Claude Code Agent готовый запрос и пользователь сможет просто наблюдать». Pure: the launch's records rung
// builds the text from what the server answered; the test reads it. It names the cabinet by the name servers (760-8: Cloudflare for
// fractera.ai, never «the registrar»), every record exactly, the records in the way — and never a password, a code or a token.
// `null` — nothing to hand over yet (no domain or no server address): the card is not drawn.

const fill = (t, map) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), String(t))

/**
 * @param {{ task: string, cabinetCf: string, cabinetOther: string, none: string }} words
 * @param {{ zone: string, dnsHost?: string | null, ns?: string[], registrar?: string | null, at: string, star: string, ip: string, conflicts?: string[] }} f
 * @returns {{ cabinet: string, task: string } | null}
 */
export function chromeTask(words, f) {
  if (!f?.zone || !/^\d{1,3}(\.\d{1,3}){3}$/.test(String(f.ip ?? ''))) return null
  const cabinet = f.dnsHost === 'cloudflare'
    ? fill(words.cabinetCf, { zone: f.zone })
    : fill(words.cabinetOther, { ns: (f.ns ?? []).join(', '), registrar: f.registrar ? ` (${f.registrar})` : '' })
  const conflicts = f.conflicts?.length ? f.conflicts.join(', ') : words.none
  return { cabinet, task: fill(words.task, { zone: f.zone, cabinet, at: f.at, star: f.star, ip: f.ip, conflicts }) }
}

// 760-10 (the owner, 2026-11-16: «войдите в Telegram Web и оставьте вкладку открытой чтобы агент смог настроить вашего бота»): the server's bot
// made by the main agent in the person's Telegram Web. 🔒 THE TOKEN STAYS THE PERSON'S: the task forbids reading BotFather's answer after the
// address and typing the token anywhere — a token the agent reads lands in its session journal on this computer, while step 5 keeps it only on
// the server (758). The person pastes it; the agent asks what BotFather answered instead of looking.

/** A Telegram address for the server's bot from its domain (or IP): 5–32 letters, digits and «_», ending in «bot». */
export function botUsername(server) {
  const base = String(server ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 21)
  const head = /^[a-z]/.test(base) ? base : `ip_${base}`.slice(0, 21)
  return `${head.replace(/_+$/, '')}_server_bot`
}

/**
 * @param {{ telegramTask: string, botName: string }} words
 * @param {{ zone?: string | null, ip?: string | null }} f
 * @returns {{ name: string, username: string, task: string } | null}
 */
export function telegramTask(words, f) {
  const server = f?.zone || (/^\d{1,3}(\.\d{1,3}){3}$/.test(String(f?.ip ?? '')) ? f.ip : '')
  if (!server) return null
  const name = fill(words.botName, { server })
  const username = botUsername(server)
  return { name, username, task: fill(words.telegramTask, { server, name, username }) }
}
