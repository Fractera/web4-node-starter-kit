// THE KEYS OF THE WHOLE NODE IN AN ELEMENT'S ENVIRONMENT (node step 818-7c, the red team's H6). Before 818-7 the installer gave every
// element the node key (SETTINGS_SECRET, kind `secret` of the templates' `.env.example`): with it any element could wake any agent with
// any text, close another's session, speak in another's name and open every neighbour's doors. A custom element (registry kind `user`,
// root among them) now holds only its own key: its SETTINGS_SECRET is the same value as its ELEMENT_KEY (`<id>.<mac>`, an HMAC of
// DATA_SECRET over its id, lib/element-key.cjs), so the template's commands and doors work unchanged; the core names it by that key
// (lib/node/caller.ts) and calls it with that key (lib/node/element-call-key.cjs). DATA_SECRET — with which an element could make ANY
// element's key — is withheld even when an older template declares it. A native element keeps both, as before.
import { createRequire } from 'node:module'

const { elementKeyOf } = createRequire(import.meta.url)('../element-key.cjs')

export const NODE_KEYS = new Set(['SETTINGS_SECRET', 'DATA_SECRET'])

/** A custom element — the same test as the wall's (`lib/hosting/element-wall.cjs`). */
export const isCustomEntry = (entry) => entry?.kind === 'user'

/**
 * The value a CUSTOM element's environment gets for a key of the whole node, or undefined when `name` is not one or the element is
 * native (the installer's other rules decide). `sharedSecret(name)` — the node's value of a shared secret.
 */
export function nodeKeyValue(name, entry, sharedSecret) {
  if (!NODE_KEYS.has(name) || !isCustomEntry(entry)) return undefined
  if (name === 'SETTINGS_SECRET') return elementKeyOf(entry.id, sharedSecret('DATA_SECRET')) ?? ''
  return ''
}
