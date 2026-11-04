// ПРИЧИНА УПАВШЕЙ СБОРКИ — ПРОСТЫМИ СЛОВАМИ (узел, шаг 642-4). Владелец 2026-11-04: «если процессе этого какая-то ошибка что должно
// произойти в идеальном сценарии так чтобы пользователю было понятно что прямо сейчас процесс в режиме отладки будет перезапущен?».
// По хвосту журнала — одна из известных причин. `passing: true` — причина проходящая (память, сеть): сборка повторяется ОДИН раз и
// говорит об этом до повтора; иначе повтора нет — ошибку разбирает агент (кнопка доски передаёт её главному агенту).
// Образцы — настоящие строки: память — 553-6 («memory allocation of 2147483648 bytes failed»), типы — `tsc`/`next build`, сторож —
// `===<ИМЯ>_FAIL===` скриптов `prebuild`, сеть — npm без сети (`npm error network`, `ENOTFOUND`).

const CAUSES = [
  { kind: 'memory', passing: true, re: /memory allocation of \d+ bytes failed|JavaScript heap out of memory|FATAL ERROR: .*Allocation failed|\bENOMEM\b|Killed: 9|exit code 137/i },
  { kind: 'network', passing: true, re: /npm (?:ERR!|error) network|\b(?:ETIMEDOUT|ECONNRESET|ENOTFOUND|EAI_AGAIN|ECONNREFUSED)\b|fetch failed|getaddrinfo/ },
  { kind: 'types', passing: false, re: /\berror TS\d+:|^Type error:|Failed to compile/m },
  { kind: 'guard', passing: false, re: /===([A-Z][A-Z0-9_]*)_FAIL===/ },
  { kind: 'seo', passing: false, re: /языковые сигналы в ней противоречат/ },
]

/** Строки журнала → { kind, passing, detail } | null (успешная сборка или незнакомая причина — `unknown`). */
function causeOf(lines, { failed = true } = {}) {
  if (!failed) return null
  const text = (Array.isArray(lines) ? lines : String(lines ?? '').split('\n')).slice(-400).join('\n')
  for (const c of CAUSES) {
    const m = text.match(c.re)
    if (m) {
      // Строка, где найдено, — без пути машины; у сторожа — его имя.
      const at = text.split('\n').find((l) => c.re.test(l)) ?? m[0]
      const detail = c.kind === 'guard' ? m[1].toLowerCase().replace(/_/g, '-') : at.replace(/\/(?:Users|home|private)\/[^\s:)]+\//g, '…/').trim().slice(0, 200)
      return { kind: c.kind, passing: c.passing, detail }
    }
  }
  return { kind: 'unknown', passing: false, detail: '' }
}

module.exports = { causeOf }
