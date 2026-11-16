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
