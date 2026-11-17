'use strict'
// THE PULT'S MODEL CHOICE, CHECKED (node step 779-2). The owner, 2026-11-17 (Telegram 462): the main agent's card opens into a model list
// (Opus, Sonnet, Haiku, Ultracode) and an effort list; Ultracode only after the window with his words. The door `/api/node/tg-app`
// (action `model`) asks this before the bridge — a pure function, so the refusals are proven without a signed launch.
// Opus takes the chosen effort; Sonnet and Haiku run on medium, as the bot gives them (666); Ultracode is Opus · max and needs the
// person's «Включить» (`confirmed: true`) — the Telegram confirmation CLAUDE.md §6 asks before subagents.

const MODELS = ['opus', 'sonnet', 'haiku']
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']

/** @param {any} body @returns {{ ok: true, model: string, effort: string, ultracode: boolean } | { ok: false, reason: string }} */
function modelChoice(body) {
  const model = typeof body?.model === 'string' ? body.model : ''
  if (!MODELS.includes(model)) return { ok: false, reason: 'bad-model' }
  const ultracode = body?.ultracode === true
  if (ultracode && model !== 'opus') return { ok: false, reason: 'bad-model' }
  if (ultracode && body?.confirmed !== true) return { ok: false, reason: 'ultracode-needs-confirmation' }
  const effort = ultracode ? 'max' : model !== 'opus' ? 'medium' : typeof body?.effort === 'string' ? body.effort : ''
  if (!EFFORTS.includes(effort)) return { ok: false, reason: 'bad-effort' }
  return { ok: true, model, effort, ultracode }
}

module.exports = { modelChoice, MODELS, EFFORTS }
