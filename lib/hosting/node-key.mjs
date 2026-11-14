// THE PERSISTENT NODE KEY RETIRES (node step 744-3, D45: «the persistent node key goes: deleted here when 744-3 ships; its line removed
// from each server at that server's next visit»). Before 744-3 one ed25519 key in `data/node/server/id_ed25519` opened every server this
// computer ever launched, with no end; since 744-3 access is a visit the server itself ends within a day, and nothing of it reaches the
// node's disk (`lib/hosting/ssh.mjs`). The two files are DELETED, not set aside: a private key kept anywhere on the disk is the very
// danger D45 removes. The line it left in a server's `authorized_keys` goes at that server's next visit (`openVisit`).
// Bare node (fs only): its migration runs at install time, before the packages may be complete.
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

export const KEY_FILES = ['id_ed25519', 'id_ed25519.pub']

/** Deletes this node's persistent server key; the paths deleted, `[]` when there was none. Called only by its migration (744-3). */
export function retireNodeKey(root) {
  const gone = []
  for (const f of KEY_FILES) {
    const p = join(root, 'data', 'node', 'server', f)
    if (existsSync(p)) {
      rmSync(p, { force: true })
      gone.push(`data/node/server/${f}`)
    }
  }
  return gone
}
