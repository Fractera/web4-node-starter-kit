// WHAT «УБРАТЬ ИЗ СПИСКА» DOES WITH THE ZONE THE NODE ITSELF CREATED (node step 828-2).
// ✗ 2026-11-21: the typo «througsongs.com» left the list and its zone stayed in the owner's Cloudflare — made by the node, never used.
// 🔒 THE NODE TAKES BACK ONLY WHAT IT MADE AND NOBODY USES: its id was recorded at creation (`createdZoneId`), the zone with that id is
// still there, it is not active, it holds no DNS record. Anything else stays — an active zone may serve a site, a record was written by a
// person — and the answer says why. Deletion: Cloudflare `DELETE /zones/{zone_id}`, permission Zone Write.

/**
 * @param {{ createdZoneId?: string|null, zone: { id: string, status?: string }|null, hasRecords: boolean|null }} x
 * @returns {null|'delete'|'kept-active'|'kept-records'|'kept-failed'} `null` — no zone of the node's to speak of
 */
export function zoneFate({ createdZoneId, zone, hasRecords }) {
  if (!createdZoneId || !zone || zone.id !== createdZoneId) return null
  if (zone.status === 'active') return 'kept-active'
  if (hasRecords === null) return 'kept-failed'
  if (hasRecords) return 'kept-records'
  return 'delete'
}
