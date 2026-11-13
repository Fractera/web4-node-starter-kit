import type { WorkspacePageWords } from '@/lib/collection/types'

// 261-7: the public Host page's button leads here. See the Russian cell for the owner's word.
export const en: WorkspacePageWords = {
  title: 'Dedicated server',
  lead: 'The node moves itself to your own Ubuntu server: the site runs around the clock, even when this computer is off, and the domain, the code and the data stay yours. The order: the server answers by its IP over HTTP first; then your domain gets A records for every name to the server\'s IP and a certificate for each — Let\'s Encrypt or your own; the steps are below, each checked by the node.',
}
