// THE PRECONDITIONS OF A SERVER LAUNCH (node step 738-1) — above the island «Запустить сервер». The owner, 2026-11-14: «предварительно
// условия: … сервер как минимум 8 ГБ и четыре ядра если ещё не купили можете подобрать здесь партнёркой ссылка. На сервере должна быть
// установлена операционной системы Ubuntu». Ubuntu 24.04 LTS is the system every server step was measured on (737, 213.199.61.7).

export type LaunchNotes = { title: string; server: string; link: string; ubuntu: string; access: string }

const en: LaunchNotes = {
  title: "Preconditions",
  server: "A server with at least 8 GB of memory and 4 cores. If you have not bought one yet,",
  link: "you can choose one here",
  ubuntu: "Ubuntu is installed on the server (24.04 LTS recommended).",
  access: "The server's IP address and its root password — from your provider's letter.",
}

const ru: LaunchNotes = {
  title: "Предварительные условия",
  server: "Сервер с памятью не меньше 8 ГБ и 4 ядрами. Если ещё не купили,",
  link: "можно подобрать здесь",
  ubuntu: "На сервере установлена Ubuntu (рекомендуем 24.04 LTS).",
  access: "IP-адрес сервера и пароль root — из письма провайдера.",
}

export function launchNotes(lang: string): LaunchNotes {
  return lang === "ru" ? ru : en
}
