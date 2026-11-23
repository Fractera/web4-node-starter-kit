// СЛОВА БАННЕРА «В GITHUB НОВЫЕ КОММИТЫ» НА СТРАНИЦЕ «ПРЕДПРОСМОТР И РАЗВЁРТЫВАНИЕ» ЭЛЕМЕНТА (узел, шаг 842). `en` основа, `ru`
// перевод; строки выбирает сервер и передаёт острову пропсом.

export type ElementPullUi = {
  behind: string
  upToDate: string
  never: string
  checkedAt: string
  hint: string
  check: string
  checking: string
  take: string
  taking: string
  taken: string
  errors: Record<string, string>
}

const DICT: Record<"en" | "ru", ElementPullUi> = {
  en: {
    behind: "New commits on GitHub: {n}",
    upToDate: "The element matches its GitHub repository",
    never: "GitHub has not been asked yet",
    checkedAt: "checked {time}",
    hint: "Commits that the element's agent or the workshop sent to its repository. Taken by fast-forward only, then «Preview» or «Deploy» below.",
    check: "Check again",
    checking: "Asking GitHub…",
    take: "Take",
    taking: "Taking…",
    taken: "Taken: {head}. Now «Preview» or «Deploy» below.",
    errors: {
      dirty: "The element has uncommitted work: commit it or ask its agent. Nothing was touched.",
      diverged: "The element has commits of its own that GitHub does not have: send them first («Send to GitHub» on the GitHub tab) or ask its agent to join the histories. Nothing was touched.",
      "nothing-new": "Nothing new on GitHub.",
      "not-connected": "No repository is connected: the GitHub tab.",
      "auth-failed": "GitHub did not accept the key: check it on the GitHub tab.",
      "repo-not-found": "GitHub does not show this repository to the key.",
      "fetch-failed": "GitHub did not answer. Try again in a minute.",
      "pull-failed": "The take stopped. Nothing was changed.",
      "temporary-address": "Open the panel on the node's own domain to do this.",
      unknown: "Did not work:",
    },
  },
  ru: {
    behind: "Новых коммитов в GitHub: {n}",
    upToDate: "Элемент совпадает со своим репозиторием в GitHub",
    never: "GitHub ещё не спрашивали",
    checkedAt: "проверено {time}",
    hint: "Коммиты, которые агент элемента или мастерская отправили в его репозиторий. Забираются только перемоткой вперёд, дальше «Предпросмотр» или «Развернуть» ниже.",
    check: "Проверить снова",
    checking: "Спрашиваю GitHub…",
    take: "Забрать",
    taking: "Забираю…",
    taken: "Забрано: {head}. Дальше «Предпросмотр» или «Развернуть» ниже.",
    errors: {
      dirty: "В элементе есть незакоммиченные правки: закоммитьте их или попросите его агента. Ничего не тронуто.",
      diverged: "У элемента есть свои коммиты, которых нет в GitHub: сначала отправьте их («Отправить в GitHub» на вкладке GitHub) или попросите агента свести историю. Ничего не тронуто.",
      "nothing-new": "В GitHub ничего нового.",
      "not-connected": "Репозиторий не подключён: вкладка GitHub.",
      "auth-failed": "GitHub не принял ключ: проверьте его на вкладке GitHub.",
      "repo-not-found": "GitHub не показывает ключу этот репозиторий.",
      "fetch-failed": "GitHub не ответил. Попробуйте через минуту.",
      "pull-failed": "Забрать не получилось. Ничего не изменено.",
      "temporary-address": "Откройте панель на собственном домене узла, чтобы это сделать.",
      unknown: "Не получилось:",
    },
  },
}

export function elementPullUi(lang: string): ElementPullUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
