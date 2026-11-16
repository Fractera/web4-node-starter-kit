// Words of the bottom window «your action is needed» of the core panel (node step 761-16). Resolved on the server, passed as a prop.

export type PersonAskUi = { title: string; open: string; done: string; sent: string; failed: string; hint: string; from: string }

const UI: Record<string, PersonAskUi> = {
  en: { title: "Your action is needed", open: "Open", done: "Done", sent: "Sent — the agent checks and goes on", failed: "Not sent — press «Done» again", hint: "Hint:", from: "{name} asks:" },
  ru: { title: "Нужно ваше действие", open: "Открыть", done: "Готово", sent: "Отправлено — агент проверит и продолжит", failed: "Не отправилось — нажмите «Готово» ещё раз", hint: "Подсказка:", from: "{name} просит:" },
}

export function personAskUi(lang: string): PersonAskUi {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
