// NEVER «AVAILABLE» BEFORE EVERY CERTIFICATE AND THE FINAL CHECK (node step 744-6). The owner, 2026-11-14: «И в заключении мы не должны
// говорить пользу о том что сервер доступен если все сертификаты безопасности не установлены и на последнем этапе заключительной проверки
// перед разрешением использовать сервер мы эти проверки не завершили».
// 🔒 ONE READING FOR THE PAGE AND THE RUNNER, over the server's own answer (`state.core` — its node's names, certificates and HTTPS asked
// from the internet; `state.domain.signin` — where sign-in leads, asked from the internet):
//   namesReady  every required name has a valid certificate, and answers HTTPS when it is due (`httpsDue`) — the domain may be
//               switched on only then;
//   finalCheck  namesReady + the domain switched on + sign-in leading to auth.<zone> — only then «Ваш сервер готов», the links, the
//               architect's code and this computer's «launched» mark.
// ✗ Measured before (744 plan): the runner marked the server launched right after switching its domain on and at every sign-in check,
// whatever sign-in answered; the ready words sat in a rung held by no rule and no test.

const VALID = new Set(['ok', 'expiring'])

/**
 * Must this name answer HTTPS before the domain is switched on? (744-9, the owner's yes 2026-11-14 after the live walk)
 * Not sign-in: auth answers 503 «Sign-in is not switched on yet» until the domain is on — finalCheck proves it after, by where sign-in
 * leads. Not an element off by its node's registry (`off`, step 567 — the Redis cache, Stripe before its keys): nginx holds its name
 * with 503 by design. Its certificate is still required.
 * ✗ Measured 2026-11-14 on the test server: namesReady demanded HTTPS of auth, cache and stripe, the runner refused `activate`
 * until namesReady — the domain could never be switched on, on every fresh server.
 * @param {{ optional?: boolean, kind?: string, off?: boolean }} r
 */
export function httpsDue(r) {
  return !r.optional && r.kind !== 'auth' && r.off !== true
}

/**
 * Every required name: a valid certificate; HTTPS from the internet where it is due (`httpsDue`).
 * @param {{ core?: { zone?: string | null, rows?: Array<{ host: string, optional?: boolean, kind?: string, off?: boolean, cert?: string, https?: boolean | null }> } | null } | null | undefined} s
 * @returns {{ ok: boolean, missing: Array<{ host: string | null, what: 'cert' | 'https' | 'signin' }> }}
 */
export function namesReady(s) {
  const zone = s?.core?.zone ?? null
  const need = (s?.core?.rows ?? []).filter((r) => !r.optional)
  if (!need.length) return { ok: false, missing: [{ host: zone, what: 'cert' }, { host: zone, what: 'https' }] }
  const missing = need.flatMap((r) => [
    ...(VALID.has(String(r.cert)) ? [] : [{ host: r.host, what: /** @type {const} */ ('cert') }]),
    ...(r.https === true || !httpsDue(r) ? [] : [{ host: r.host, what: /** @type {const} */ ('https') }]),
  ])
  return { ok: missing.length === 0, missing }
}

/**
 * The final check before the server may be called usable.
 * @param {{ core?: { zone?: string | null, rows?: Array<{ host: string, optional?: boolean, cert?: string, https?: boolean | null }>, steps?: { active?: boolean } } | null, domain?: { signin?: { ok?: boolean } | null } | null } | null | undefined} s
 */
export function finalCheck(s) {
  const zone = s?.core?.zone ?? null
  const names = namesReady(s)
  const signed = s?.core?.steps?.active === true && s?.domain?.signin?.ok === true
  const missing = [...names.missing, ...(signed ? [] : [{ host: zone ? `auth.${zone}` : null, what: /** @type {const} */ ('signin') }])]
  return { ok: missing.length === 0, missing }
}
