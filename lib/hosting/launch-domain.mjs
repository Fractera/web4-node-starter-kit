// THE DOMAIN OF A SERVER BEING LAUNCHED — its four facts and the two questions (node step 744-5, D46). The owner, 2026-11-14: «если
// сервер новый то при активации домена мы должны проверять и спрашивать пользователя есть ли у неё доступ к регистратора и если нет у него
// доступа к регистратору то есть у него доступ к Cloud Flyer»; and «ты конечно имел право показать мне что домен к серверу уже подключён и
// какой именно режим выбрали и только тогда открыть четвёртый шаг».
// 🔒 ONE RECORD, ONE READING: the record lives on the server (`/root/.fractera/domain.json`); the page's step 3 and the runner's `install`
// read it through `domainSteps` alike — the page never opens the installation, and the runner never starts it, past an unready domain.
// 🔒 A DOMAIN THE SERVER ALREADY HOLDS (its node's mark carries it — `from: "server"`) is connected: where its records live and their
// first check belong to a NEW domain; the second check (step 5) still measures every name.
// 🔒 ONE WAY SINCE 759: the registrar — the records are written by hand where the domain's DNS is kept.

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
 * 759 (the owner, 2026-11-16: «единственное возможный вариант подключения только через регистратора»): one question — access to the
 * registrar → the records are written by hand where the domain's DNS is kept (`dns`), or the instruction goes to whoever has it (`none`).
 * The Cloudflare branch (`cloudflare`, `migrate`) is gone; a record written with it earlier reads as `dns` (`normalWay`).
 * @param {{ registrar?: 'yes' | 'no' | null }} a
 * @returns {'dns' | 'none' | null}
 */
export function wayOf({ registrar = null }) {
  return registrar === 'yes' ? 'dns' : registrar === 'no' ? 'none' : null
}

/** A way as this ladder knows it: the removed `cloudflare` and `migrate` of an earlier record read as `dns`. */
export function normalWay(way) {
  return way === 'none' ? 'none' : way ? 'dns' : null
}

/** The answer a recorded way tells (a reload or a look back shows it). */
export function answersOf(way) {
  const w = normalWay(way)
  return { registrar: w === 'dns' ? 'yes' : w === 'none' ? 'no' : null }
}
