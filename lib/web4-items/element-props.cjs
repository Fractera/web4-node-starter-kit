// ONE READER OF AN ELEMENT'S OWN DESCRIPTION FOR THE NODE (step 417).
//
// The owner, 2026-10-06: the passport is the element's main door, and the old root OWN-SERVICE-PROPS.json — install contract,
// public description and A2A card mixed in one file — is taken apart. An element built the new way keeps three files:
//   OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json — the passport (who it is, its job);
//   OWN-SERVICE-PROPS/A2A-CARD.json          — its Google A2A card (name, description, version come from the passport);
//   NODE-CONTRACT.json                        — what the node needs to install and manage it (never served outside).
// Every reader in the core asks THIS module and gets the same shape as before, so one place knows both layouts:
// an element that still has the old root file (every element except the sample roman, for now) is read exactly as it was.

const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')

const OLD = 'OWN-SERVICE-PROPS.json'
const PASSPORT = join('OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json')
const CARD = join('OWN-SERVICE-PROPS', 'A2A-CARD.json')
const CONTRACT = 'NODE-CONTRACT.json'

function readJson(p) {
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

/** Does this folder hold an element description of either layout? */
function hasElementProps(dir) {
  return existsSync(join(dir, OLD)) || existsSync(join(dir, PASSPORT))
}

/**
 * The element's description in the old shape — `id`, `name`, `summary`, `designSkill`, the install fields, `settings`,
 * `provides`, `a2a.card` — or null when the folder holds none. New layout: assembled from the three files on every call.
 */
function readElementProps(dir) {
  const old = readJson(join(dir, OLD))
  if (old) return old
  const passport = readJson(join(dir, PASSPORT))
  if (!passport) return null
  const contract = readJson(join(dir, CONTRACT)) ?? {}
  const cardBody = readJson(join(dir, CARD))
  const version = readJson(join(dir, 'package.json'))?.version ?? ''
  const { _: _note, ...install } = contract
  const card = cardBody
    ? { ...cardBody, name: passport.name ?? '', description: passport.shortDescription ?? '', version: cardBody.version ?? version }
    : null
  return {
    ...install,
    id: passport.id,
    name: passport.name,
    summary: passport.shortDescription ?? '',
    // Owner 2026-10-07: the design skill lives in the passport (name or ""), not in the node contract.
    ...(typeof passport.designSkill === 'string' && passport.designSkill.trim() ? { designSkill: passport.designSkill.trim() } : {}),
    provides: card?.skills?.map((s) => s.id) ?? [],
    // 472 (owner 2026-10-13): which ways of talking the element has — H2A, H2H, A2A as true/false; the core menu and the registry read it.
    ...(passport.messengers && typeof passport.messengers === "object" ? { messengers: passport.messengers } : {}),
    // 544-3 (owner 2026-10-19): which template the element comes from — "custom" or "native"; the core menu puts a native one in the Native zone
    // and hides its Lagrix pages. ✗ Without this line the field stayed in the file and the core never saw it.
    ...(passport.elementType === "custom" || passport.elementType === "native" ? { elementType: passport.elementType } : {}),
    // 551-5 (owner 2026-10-20): a payment element of the node (the native Stripe element, step 573) says which tool it carries — `{ tool, name }`; the core
    // lists such elements on «Settings → Payments → Web2» of every element (lib/web4-items/payment-elements.ts).
    ...(passport.payment && typeof passport.payment === "object" && typeof passport.payment.tool === "string" ? { payment: { tool: passport.payment.tool, name: typeof passport.payment.name === "string" ? passport.payment.name : passport.payment.tool } } : {}),
    // 567 (owner 2026-10-22: «некоторые элементы приходят по дефолту выключенные … а некоторые … включенные»): the element's default
    // power state — `{ default: "off", reason }`; the node seeds its registry flag from it at install and birth (element-power.cjs).
    ...(passport.power && typeof passport.power === "object" && passport.power.default === "off" ? { power: passport.power } : {}),
    // 566 (owner 2026-10-22: the Passport card shows whether the element takes part in Web4): `network` — in the Web4 network, `node` — only inside the node.
    ...(passport.visibility === "network" || passport.visibility === "node" ? { visibility: passport.visibility } : {}),
    ...(card ? { a2a: { card } } : {}),
  }
}

/** The element's permanent id from either layout, or null. */
function elementIdOf(dir) {
  return readElementProps(dir)?.id ?? null
}

module.exports = { readElementProps, hasElementProps, elementIdOf, OLD, PASSPORT, CARD, CONTRACT }
