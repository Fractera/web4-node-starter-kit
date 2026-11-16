// Words of the bottom window «your action is needed» of the core panel (node step 761-16). Resolved on the server, passed as a prop.

export type PersonAskUi = { title: string; open: string; done: string; sent: string; failed: string; hint: string; from: string; copy: string; copied: string; collapse: string; prev: string; next: string; counter: string; waiting: string }

const UI: Record<string, PersonAskUi> = {
  en: { title: "Your action is needed", open: "Open", done: "Done", sent: "Sent — the agent checks and goes on", failed: "Not sent — press «Done» again", hint: "Hint:", from: "{name} asks:", copy: "Copy the command", copied: "Copied — paste it into the terminal", collapse: "Collapse", prev: "Previous request", next: "Next request", counter: "{i} of {n}", waiting: "Your action is needed: {n}" },
  ru: { title: "Нужно ваше действие", open: "Открыть", done: "Готово", sent: "Отправлено — агент проверит и продолжит", failed: "Не отправилось — нажмите «Готово» ещё раз", hint: "Подсказка:", from: "{name} просит:", copy: "Скопировать команду", copied: "Скопировано — вставьте в терминал", collapse: "Свернуть", prev: "Предыдущий запрос", next: "Следующий запрос", counter: "{i} из {n}", waiting: "Нужно ваше действие: {n}" },
}

export function personAskUi(lang: string): PersonAskUi {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
