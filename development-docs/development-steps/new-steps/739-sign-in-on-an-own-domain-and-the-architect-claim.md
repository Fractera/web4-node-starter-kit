# 739 — sign-in on an own domain and the architect's claim (queued, not planned yet)

The owner, 2026-11-14: the sign-in error `http://127.0.0.1:24681/api/auth/error` — «можешь её запланировать как отдельный шаг»; the test
domain «http://throughsongs.com» (on THIS computer, through «Активация домена»; DNS at Cloudflare, needs his Cloudflare key; the live site
there will lead to this computer). Then: «да, D23 в 739, порядок 739 → 741 → 740».

## In it
- D23 (738-main.md §8): the first registration on a public domain only with a one-time code the launch/activation prints — a release of
  the sign-in template `fractera-auth-starter` (skill release-template), approved by the owner on 2026-11-14.
- «Never loopback» (moved from 738-6): a public name without `logs/domain.json` never sends a visitor to `127.0.0.1` — it says «вход ещё
  не включён» (the core's `authBaseFromHost` and the sign-in template's own env, the same release).
- The proof on throughsongs.com: the sign-in button leads to https://auth.throughsongs.com; negative: before the switch-on — no loopback.
