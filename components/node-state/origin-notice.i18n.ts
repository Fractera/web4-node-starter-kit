// СЛОВА ПОЛОСЫ «ВЕРСИЯ УСТАРЕЛА» (шаги 368, 632-4). `en` основа, `ru` перевод; выбирает сервер и передаёт острову пропсом.
// 632-4 (владелец 2026-11-03): после «Sync fork» полоса предлагает «Обновить узел», а «открыть форк» — только пока форк отстаёт.
export type OriginNoticeWords = {
  forkBehind: string
  openFork: string
  nodeBehind: string
  update: string
  check: string
  checking: string
  starting: string
  running: string
  failed: string
  refused: string
  interrupted: string
  done: string
  hide: string
  stages: Record<string, string>
}

const DICT: Record<"en" | "ru", OriginNoticeWords> = {
  en: {
    forkBehind: "The original Fractera has {n} new changes that your fork does not have yet. Open your fork, press «Sync fork», then «Check again». Everything keeps working as it is.",
    openFork: "Open your fork",
    nodeBehind: "Your fork is synced: {n} changes are waiting for this node. «Update the node» takes them, puts the elements on their new versions and rebuilds the core — about 10–15 minutes; while the core builds, the node is stopped and these pages do not answer.",
    update: "Update the node",
    check: "Check again",
    checking: "Checking…",
    starting: "Starting…",
    running: "The node is updating — stage «{stage}». While the core builds, these pages do not answer: open this page again in a few minutes.",
    failed: "The update did not go through: {reason}",
    refused: "The update did not start: {reason}",
    interrupted: "The update was interrupted at stage «{stage}» (the computer was off or the process stopped). Check again and start it once more.",
    done: "The node is updated: {summary}",
    hide: "Hide",
    stages: { check: "check", fetch: "taking the fork", backup: "backup", local: "local changes", merge: "merge", registry: "registry", deps: "dependencies", guards: "build guards", elements: "elements", core: "core build", skills: "skills base" },
  },
  ru: {
    forkBehind: "В оригинале Fractera {n} новых изменений, которых пока нет в вашем форке. Откройте форк, нажмите «Sync fork», затем «Проверить снова». Всё продолжает работать как есть.",
    openFork: "Открыть ваш форк",
    nodeBehind: "Форк синхронизирован: {n} изменений ждут этот узел. «Обновить узел» заберёт их, поставит элементы на новые версии и пересоберёт ядро — около 10–15 минут; пока собирается ядро, узел остановлен и эти страницы не отвечают.",
    update: "Обновить узел",
    check: "Проверить снова",
    checking: "Проверяю…",
    starting: "Запускаю…",
    running: "Узел обновляется — этап «{stage}». Пока собирается ядро, эти страницы не отвечают: откройте эту страницу снова через несколько минут.",
    failed: "Обновление не прошло: {reason}",
    refused: "Обновление не начато: {reason}",
    interrupted: "Обновление прервано на этапе «{stage}» (компьютер выключался или процесс остановлен). Проверьте снова и запустите ещё раз.",
    done: "Узел обновлён: {summary}",
    hide: "Скрыть",
    stages: { check: "проверка", fetch: "забираю форк", backup: "копия несохранённого", local: "разбор несохранённого", merge: "слияние", registry: "реестр", deps: "зависимости", guards: "сторожа сборки", elements: "элементы", core: "сборка ядра", skills: "база навыков" },
  },
}

export function originNoticeWords(lang: string): OriginNoticeWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
