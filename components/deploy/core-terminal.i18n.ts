import { originNoticeWords } from '@/components/node-state/origin-notice.i18n'
import type { CoreTerminalWords } from './core-terminal.client'
import type { FailureWords } from './failure-note.client'

// СЛОВА ТЕРМИНАЛА СБОРКИ ЯДРА (642-2, 642-4) — одни на доску развёртываний и на терминал агента (675-2): там и тут один и тот же
// терминал сборки, и две копии слов разошлись бы молча.
// 642-4: итог упавшего развёртывания — причина простыми словами, прежняя версия, повтор, разбор с главным агентом.
const FAILURE: Record<'en' | 'ru', FailureWords> = {
  en: {
    causes: {
      memory: 'Not enough memory for the build.',
      network: 'The network broke off during the build (npm or a download).',
      types: 'A type error in the code — the build stopped at the check.',
      guard: 'A build guard refused the build.',
      seo: 'The language signals of the built pages contradict each other — the site was not published.',
      unknown: 'The build failed; its cause is not one of the known ones — see the last lines.',
    },
    where: 'Where: {detail}',
    previousUp: 'The previous version is back and working (it answers).',
    previousDown: 'The previous version does NOT answer — ask the main agent at once.',
    retried: 'It was a passing cause, so the build was tried once more — and failed again. No more automatic tries.',
    debug: 'Work it out with the main agent',
    debugSent: 'Passed to the main agent: it will find the cause, give the element\'s agent the fix if it is in its code, and write to you in Telegram.',
    debugPending: 'The main agent is asleep — it was asked in Telegram to turn on; it will take the task then.',
    debugRefused: 'The main agent did not take it (not enough memory or not running) — write to it in Telegram.',
  },
  ru: {
    causes: {
      memory: 'Не хватило памяти на сборку.',
      network: 'Во время сборки оборвалась сеть (npm или загрузка).',
      types: 'Ошибка типов в коде — сборка остановилась на проверке.',
      guard: 'Сторож сборки не пропустил её.',
      seo: 'Языковые сигналы собранных страниц противоречат друг другу — сайт не выложен.',
      unknown: 'Сборка не удалась, и причина не из известных — смотрите последние строки.',
    },
    where: 'Где: {detail}',
    previousUp: 'Прежняя версия возвращена и работает (отвечает).',
    previousDown: 'Прежняя версия НЕ отвечает — сразу позовите главного агента.',
    retried: 'Причина была проходящей, поэтому сборка была повторена один раз — и снова не удалась. Больше автоматических попыток нет.',
    debug: 'Разобрать с главным агентом',
    debugSent: 'Передано главному агенту: он найдёт причину, если она в коде элемента — поручит починку агенту элемента, и напишет вам в Telegram.',
    debugPending: 'Главный агент спит — его попросили включиться в Telegram; задачу он возьмёт тогда.',
    debugRefused: 'Главный агент не взял задачу (мало памяти или он не запущен) — напишите ему в Telegram.',
  },
}

// 642-2: слова терминала ядра; этапы обновления — те же, что у полосы обновления.
const TERMINAL: Record<'en' | 'ru', Omit<CoreTerminalWords, 'stages' | 'failure'>> = {
  en: {
    building: 'The core is building. The node is stopped for the build; the lines below are the build itself.',
    updating: 'The node is updating — stage «{stage}».',
    fromReader: 'The core is stopped for the build: these lines come from the build reader on this computer.',
    silent: 'The core is starting… (the build log is shown only on this computer)',
    done: 'The core is built and running.',
    failed: 'The core build failed — the previous build is back and working. The cause is in the last lines.',
    updateDone: 'The node is updated.',
    updateFailed: 'The update did not finish — the node keeps working on the previous build. The cause is in the last lines.',
    reload: 'Reload the page',
  },
  ru: {
    building: 'Ядро собирается. На время сборки узел остановлен; ниже — сама сборка.',
    updating: 'Узел обновляется — этап «{stage}».',
    fromReader: 'Ядро остановлено на время сборки: эти строки даёт чтец сборки на этом компьютере.',
    silent: 'Ядро поднимается… (журнал сборки виден только на этом компьютере)',
    done: 'Ядро собрано и работает.',
    failed: 'Сборка ядра не удалась — прежняя сборка возвращена и работает. Причина — в последних строках.',
    updateDone: 'Узел обновлён.',
    updateFailed: 'Обновление не закончилось — узел работает на прежней сборке. Причина — в последних строках.',
    reload: 'Обновить страницу',
  },
}


/** Итог упавшей сборки простыми словами — на выбранном языке; незнакомый язык — английский. */
export function buildFailureWords(lang: string): FailureWords {
  return FAILURE[lang as 'en' | 'ru'] ?? FAILURE.en
}

/** Слова терминала сборки ядра с этапами обновления узла и итогом отказа. */
export function coreTerminalWords(lang: string): CoreTerminalWords {
  return { ...(TERMINAL[lang as 'en' | 'ru'] ?? TERMINAL.en), stages: originNoticeWords(lang).stages, failure: buildFailureWords(lang) }
}
