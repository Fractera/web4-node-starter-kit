# 744 — the owner's wish list of this branch (fixed only after 744 closes)

The owner, 2026-11-14 ~16:40 UTC, verbatim: «Теперь запомни будем идти на этом плане от начало до конца. Если я буду находить какие-то
проблемы то мы будем их записывать в лист пожеланий и пока не закроем эту ветку мелочи исправлять не будем потом пройдём отдельно исправим
мелочи которые найдём».

The rule: anything found during 744 that is not one of its substeps goes here — his words verbatim, the date, where it was seen. Nothing
here is fixed until 744 is closed; then one separate pass takes them in order (a new step with its own plan).

## Wishes
(none from the owner yet)

## Found by the main agent on the way (not the owner's words; fixed after 744 like the rest)
- 2026-11-14 18:32 UTC, the node's limit-resume (686-5) woke a session that was WORKING with «⟦node · limit-resume · 16:12⟧ The subscription
  limit stopped your turn at 16:12; it has reset» — that session had started at 16:36 (a reset) and was never stopped; the wake came right
  after the person changed the Claude login (/login twice). The resume should check the session's own last stop, not an older one.
- 2026-11-14 18:47 UTC, 744-9 live, the launch page in the owner's Chrome: the first visit after the node update showed the OLD page
  (the old password note, no ladder) until a reload — a cached client bundle survives a core update; the page should refresh itself.
- 2026-11-14 18:48 UTC, 744-9, the clear dialog: «Сразу перестанут отвечать сайты на этом сервере: —.» (an empty list printed as a dash —
  the line should go when there are none) and «(0 процессов pm2)» — the word pm2 shown to the person (law: the person never hears it).
- 2026-11-14 18:49 UTC, 744-9: after «Остановить и освободить» and after «Подключить домен» the buttons go grey for 10–40 s with no line of
  what is happening; the page should say «Освобождаю сервер…» / «Проверяю домен…».
- 2026-11-14 18:50 UTC, 744-9: the panel polls GET /api/node/menu-stamp about every 3 s while the page is open (35 calls in ~2 min) —
  check whether that rhythm is intended.
