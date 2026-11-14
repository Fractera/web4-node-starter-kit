// THE DOMAIN OF A SERVER BEING LAUNCHED — its four facts and the two questions (node step 744-5, D46). The owner, 2026-11-14: «если
// сервер новый то при активации домена мы должны проверять и спрашивать пользователя есть ли у неё доступ к регистратора и если нет у него
// доступа к регистратору то есть у него доступ к Cloud Flyer»; and «ты конечно имел право показать мне что домен к серверу уже подключён и
// какой именно режим выбрали и только тогда открыть четвёртый шаг».
// 🔒 ONE RECORD, ONE READING: the record lives on the server (`/root/.fractera/domain.json`); the page's step 3 and the runner's `install`
// read it through `domainSteps` alike — the page never opens the installation, and the runner never starts it, past an unready domain.
// 🔒 A DOMAIN THE SERVER ALREADY HOLDS (its node's mark carries it — `from: "server"`) is connected: where its records live and their
// first check belong to a NEW domain; the second check (step 5) still measures every name.
// 🔒 THE QUESTIONS FOLLOW WHERE THE RECORDS LIVE (the detection, step 3.2): Cloudflare is asked only when the records are kept there — a
// Cloudflare account cannot write records of a domain whose name servers are elsewhere; with only the registrar such a domain moves its
// records back to it (way `migrate`, «Только у регистратора»).

/**
 * The four facts of step 3 — each true when done.
 * @param {{ domain?: string, detect?: { dnsHost?: string } | null, way?: string | null, check?: { results?: unknown[] } | null, from?: string } | null | undefined} record
 */
export function domainSteps(record) {
  const held = record?.from === 'server' && Boolean(record?.domain)
  return {
    domain: Boolean(record?.domain),
    where: held || Boolean(record?.detect && record.detect.dnsHost !== 'none'),
    who: Boolean(record?.way && record.way !== 'none'),
    records: held || Boolean(record?.check?.results?.length),
  }
}

/** What is missing before the installation may start — `[]` when step 3 is done. */
export function domainMissing(record) {
  return Object.entries(domainSteps(record)).filter(([, done]) => !done).map(([id]) => id)
}

/**
 * The two questions → the way the records are written; `null` while the next question is still to be asked.
 * @param {{ cloudflareDns: boolean, registrar?: 'yes' | 'no' | null, cloudflare?: 'yes' | 'no' | null }} a
 * @returns {'dns' | 'cloudflare' | 'migrate' | 'none' | null}
 */
export function wayOf({ cloudflareDns, registrar = null, cloudflare = null }) {
  if (!cloudflareDns) return registrar === 'yes' ? 'dns' : registrar === 'no' ? 'none' : null
  if (!registrar) return null
  if (cloudflare === 'yes') return 'cloudflare'
  if (cloudflare === 'no') return registrar === 'yes' ? 'migrate' : 'none'
  return null
}

/** The answers a recorded way tells (a reload or a look back shows them); `null` where the way does not say. */
export function answersOf(way, cloudflareDns) {
  if (!way) return { registrar: null, cloudflare: null }
  if (!cloudflareDns) return { registrar: way === 'dns' ? 'yes' : way === 'none' ? 'no' : null, cloudflare: null }
  return {
    registrar: way === 'migrate' ? 'yes' : way === 'none' ? 'no' : null,
    cloudflare: way === 'cloudflare' ? 'yes' : way === 'migrate' || way === 'none' ? 'no' : null,
  }
}
