// СЛОВА ПОЛОСЫ «ВЕРСИЯ УСТАРЕЛА» (шаги 368, 632-4). `en` основа, `ru` перевод; выбирает сервер и передаёт острову пропсом.
// 632-4 (владелец 2026-11-03): после «Sync fork» полоса предлагает обновление. 641-2 (владелец 2026-11-04): «кроме кнопки скрыть должно
// быть кнопка синхронизировать … если уже синхронизировано но не обновлено этот баннер должен получить кнопку обновить сборку ядра. Эта
// кнопка не активна до сих пор синхронизации не прошла … должна отправлять на вкладку развёртывание».
// 651-1 (владелец 2026-11-05: «отсутствует баннер … Он всегда существовал в нём было три кнопки … куда он исчез и почему?»): `even`.
export type OriginNoticeWords = {
  forkBehind: string
  sync: string
  nodeBehind: string
  rebuild: string
  rebuildWaitSync: string
  rebuildNothing: string
  check: string
  checking: string
  /** 646: on the temporary address the check and the update are refused — they run on this computer. */
  checkHere: string
  openHere: string
  /** 646: the door refused the check for another reason — `{reason}`. */
  checkRefused: string
  running: string
  failed: string
  refused: string
  interrupted: string
  done: string
  /** 651-1: nothing is behind by the last mark — a quiet line, so «Check again» is never out of reach. `{date}` — the mark's time. */
  even: string
  /** 651-1: the fork was never compared with the original. */
  evenNever: string
  hide: string
  stages: Record<string, string>
}

const DICT: Record<"en" | "ru", OriginNoticeWords> = {
  en: {
    forkBehind: "The original Fractera has {n} new changes that your fork does not have yet. Press «Sync the fork», on GitHub press «Sync fork», then «Check again» here. Everything keeps working as it is.",
    sync: "Sync the fork",
    nodeBehind: "Your fork is synced: {n} changes are waiting for this node. «Update the core build» opens the Deployments tab: there the node takes them from the fork, puts the elements on their new versions and rebuilds the core — about 10–15 minutes.",
    rebuild: "Update the core build",
    rebuildWaitSync: "Sync the fork first, then «Check again»",
    rebuildNothing: "Nothing to take: this node is on its fork's version",
    check: "Check again",
    checking: "Checking…",
    checkHere: "Checking the fork and updating the node work only on this computer — the panel here is read-only.",
    openHere: "Open on this computer",
    checkRefused: "The check was refused: {reason}",
    running: "The node is updating — stage «{stage}». While the core builds, these pages do not answer: open this page again in a few minutes.",
    failed: "The update did not go through: {reason}",
    refused: "The update did not start: {reason}",
    interrupted: "The update was interrupted at stage «{stage}» (the computer was off or the process stopped). Check again and start it once more.",
    done: "The node is updated: {summary}",
    even: "The node matches the original Fractera as of {date}. The node does not ask GitHub by itself: press «Check again» to see whether there are new changes.",
    evenNever: "The fork has not been compared with the original Fractera yet: press «Check again».",
    hide: "Hide",
    stages: { check: "check", fetch: "taking the fork", backup: "backup", local: "local changes", merge: "merge", registry: "registry", deps: "dependencies", guards: "build guards", elements: "elements", core: "core build", skills: "skills base" },
  },
  ru: {
    forkBehind: "В оригинале Fractera {n} новых изменений, которых пока нет в вашем форке. Нажмите «Синхронизировать форк», на GitHub — «Sync fork», затем здесь «Проверить снова». Всё продолжает работать как есть.",
    sync: "Синхронизировать форк",
    nodeBehind: "Форк синхронизирован: {n} изменений ждут этот узел. «Обновить сборку ядра» откроет вкладку «Развёртывание»: там узел заберёт их из форка, поставит элементы на новые версии и пересоберёт ядро — около 10–15 минут.",
    rebuild: "Обновить сборку ядра",
    rebuildWaitSync: "Сначала синхронизируйте форк, затем «Проверить снова»",
    rebuildNothing: "Забирать нечего: узел на версии своего форка",
    check: "Проверить снова",
    checking: "Проверяю…",
    checkHere: "Проверить форк и обновить узел можно только на этом компьютере — здесь пульт работает только на чтение.",
    openHere: "Открыть на этом компьютере",
    checkRefused: "Проверка не выполнена: {reason}",
    running: "Узел обновляется — этап «{stage}». Пока собирается ядро, эти страницы не отвечают: откройте эту страницу снова через несколько минут.",
    failed: "Обновление не прошло: {reason}",
    refused: "Обновление не начато: {reason}",
    interrupted: "Обновление прервано на этапе «{stage}» (компьютер выключался или процесс остановлен). Проверьте снова и запустите ещё раз.",
    done: "Узел обновлён: {summary}",
    even: "Узел совпадает с оригиналом Fractera на {date}. Сам узел GitHub не спрашивает: нажмите «Проверить снова», чтобы узнать, есть ли новые изменения.",
    evenNever: "Форк ещё не сравнивался с оригиналом Fractera: нажмите «Проверить снова».",
    hide: "Скрыть",
    stages: { check: "проверка", fetch: "забираю форк", backup: "копия несохранённого", local: "разбор несохранённого", merge: "слияние", registry: "реестр", deps: "зависимости", guards: "сторожа сборки", elements: "элементы", core: "сборка ядра", skills: "база навыков" },
  },
}

export function originNoticeWords(lang: string): OriginNoticeWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
