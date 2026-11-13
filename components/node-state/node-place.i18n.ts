// СЛОВА ЭКРАНА «ГДЕ РАЗМЕЩЁН ПРОЕКТ» — рядом с островком (276-3; человеческим языком — 276-6).
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ: островок получает уже выбранный язык пропсами, в браузер уезжает один набор
// строк. За этим следит `check:lang-delivery`.
//
// 737-18: место определяет узел (`lib/hosting/place.mjs`) — слова называют, как именно: по переезду или замером машины.
// 🛑 Язык — «проект», «размещён», «изоляция» (слово владельца 2026-09-23): «узел» и «стена» — жаргон.

export type NodePlaceWords = {
  loading: string
  doorSilent: string
  title: string
  currentHome: string
  currentServer: string
  currentUnknown: string
  /** how the node knows: the move's record or what it measured on this machine */
  how: Record<"moved" | "new-server" | "macos" | "windows" | "public-ip" | "private-address", string>
  note: string
}

const DICT: Record<string, NodePlaceWords> = {
  en: {
    loading: "Checking the project…",
    doorSilent: "The project did not answer. This means «unknown», not «nothing is set».",
    title: "Where is your project hosted?",
    currentHome: "Now: a local computer. You choose the apps yourself and answer for that choice — an app runs with your own rights.",
    currentServer: "Now: a dedicated server. This is the place to invite other developers to, once apps are isolated in containers.",
    currentUnknown: "Not known yet.",
    how: {
      moved: "The node knows it from the move that brought it here.",
      "new-server": "The node knows it from the installation that raised it on this server.",
      macos: "Measured: this machine runs macOS.",
      windows: "Measured: this machine runs Windows.",
      "public-ip": "Measured: this machine holds a public internet address on its own network card.",
      "private-address": "Measured: this machine sits behind a private address, as a home or office computer does.",
    },
    note: "Nobody sets this by hand: the node determines it, and it changes no access rights.",
  },
  ru: {
    loading: "Проверяю проект…",
    doorSilent: "Проект не ответил. Это значит «неизвестно», а не «ничего не задано».",
    title: "Где размещён ваш проект?",
    currentHome: "Сейчас: локальный компьютер. Приложения вы выбираете сами и за выбор отвечаете сами — приложение работает с вашими правами.",
    currentServer: "Сейчас: выделенный сервер. Сюда можно приглашать других разработчиков, когда приложения будут изолированы в контейнерах.",
    currentUnknown: "Пока неизвестно.",
    how: {
      moved: "Узел знает это по переезду, который привёз его сюда.",
      "new-server": "Узел знает это по установке, которая подняла его на этом сервере.",
      macos: "Измерено: эта машина работает на macOS.",
      windows: "Измерено: эта машина работает на Windows.",
      "public-ip": "Измерено: у этой машины на собственной сетевой карте публичный адрес в интернете.",
      "private-address": "Измерено: эта машина стоит за частным адресом, как домашний или офисный компьютер.",
    },
    note: "Это никто не переключает руками: узел определяет сам, и права доступа от этого не меняются.",
  },
}

export function nodePlaceWords(lang: string): NodePlaceWords {
  return DICT[lang] ?? DICT.en
}
