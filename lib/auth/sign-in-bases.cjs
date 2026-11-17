'use strict'
// WHERE THE NODE'S SIGN-IN AND PANEL ANSWER (step 777) — read from the node's own records, never guessed: the activation record of the
// main domain (`logs/domain.json`: the panel on `architect.<zone>`, sign-in on `auth.<zone>`), the registry (the sign-in element's port
// on this computer) and the runtime record (the core's port). The node's one link builder (`sign-in-link.cjs`) turns them into a link;
// the place door hands the same bases to the browser, so the window and Telegram build the identical link.
const fs = require('node:fs')
const path = require('node:path')

const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

/** @returns {{ site: string | null, web: string | null, webAuth: string | null, localAuth: string | null, here: string }} */
function signInBases(root) {
  const d = readJson(path.join(root, 'logs', 'domain.json'))
  const connected = d && typeof d.activatedAt === 'string' && typeof d.hostname === 'string' && d.hostname
  const site = connected ? `https://${d.hostname}` : null
  const web = connected ? `https://${typeof d.architectHostname === 'string' && d.architectHostname ? d.architectHostname : d.hostname}` : null
  const webAuth = connected && typeof d.authHostname === 'string' && d.authHostname ? `https://${d.authHostname}` : null
  const reg = readJson(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'))
  const auth = Array.isArray(reg?.services) ? reg.services.find((s) => s && s.id === 'auth') : null
  const localAuth = auth && Number.isInteger(auth.port) ? `http://localhost:${auth.port}` : null
  const rt = readJson(path.join(root, 'logs', 'runtime.json'))
  const here = `http://localhost:${rt && Number.isInteger(rt.port) ? rt.port : 24680}`
  return { site, web, webAuth, localAuth, here }
}

module.exports = { signInBases }
