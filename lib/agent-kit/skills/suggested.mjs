// A SKILL THE PERSON SUGGESTED — WHERE ITS CHECKED COPY LIVES ON THE NODE (node step 628). The command `npm run skills -- adopt` judges
// a repository into `data/node/skills/suggested/<owner>__<repo>/` (outside git); `adopt-hand` packs one approved skill into
// `hand/<skill>.tar.gz`; the door `GET /api/skills/suggested?id=<owner>__<repo>/<skill>` gives that archive to the element's own agent.
// One id pattern for both sides: letters, digits, «.», «_», «-», one «__» between owner and repository, one «/» before the skill — a
// path walk («..», another «/») never matches.
import { join } from 'node:path'

const ID = /^[A-Za-z0-9._-]+__[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/

export const suggestedDir = (root) => join(root, 'data', 'node', 'skills', 'suggested')

/** The folder of one judged repository: `owner/repo` → `…/suggested/owner__repo`. */
export const repoDirOf = (root, source) => join(suggestedDir(root), String(source).replace('/', '__'))

/** `owner/repo@skill` → the door's id `owner__repo/skill`. */
export const idOf = (source, skill) => `${String(source).replace('/', '__')}/${skill}`

/** The archive an id names, or null when the id is not one (the door answers 400 then). */
export function archivePathOf(root, id) {
  if (typeof id !== 'string' || !ID.test(id) || id.includes('..')) return null
  const [repo, skill] = id.split('/')
  return join(suggestedDir(root), repo, 'hand', `${skill}.tar.gz`)
}
