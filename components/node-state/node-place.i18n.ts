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
  how: Record<"moved" | "new-server" | "launch" | "migration" | "macos" | "windows" | "public-ip" | "private-address", string>
  /** 741-2: the measurement sees it differently — `{how}` is the measurement's own words */
  mismatch: string
  /** 741-2: the record came with a copied folder from another machine */
  foreign: string
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
      launch: "The node knows it from its installation on this computer.",
      migration: "The node recorded it at its first start after the update, from what it knew then.",
      macos: "Measured: this machine runs macOS.",
      windows: "Measured: this machine runs Windows.",
      "public-ip": "Measured: this machine holds a public internet address on its own network card.",
      "private-address": "Measured: this machine sits behind a private address, as a home or office computer does.",
    },
    mismatch: "The machine measures differently ({how}). The installation's record counts — this happens in clouds behind a provider's NAT or on a computer with a public address.",
    foreign: "The record was written on another machine — the project's folder was copied here. Until the project is installed here, the node goes by what it measures.",
    note: "Nobody sets this by hand: the installation records it. On a server, temporary addresses and the bare IP never open the panel.",
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
      launch: "Узел знает это по своей установке на этом компьютере.",
      migration: "Узел записал это при первом запуске после обновления — по тому, что знал тогда.",
      macos: "Измерено: эта машина работает на macOS.",
      windows: "Измерено: эта машина работает на Windows.",
      "public-ip": "Измерено: у этой машины на собственной сетевой карте публичный адрес в интернете.",
      "private-address": "Измерено: эта машина стоит за частным адресом, как домашний или офисный компьютер.",
    },
    mismatch: "Замер машины видит иначе ({how}). Главнее запись установки — так бывает в облаках за NAT провайдера или на компьютере с публичным адресом.",
    foreign: "Запись сделана на другой машине — папку проекта скопировали сюда. Пока проект не установлен здесь, узел идёт по замеру.",
    note: "Это никто не переключает руками: место записывает установка. На сервере временные адреса и голый IP пульт не открывают.",
  },
}

export function nodePlaceWords(lang: string): NodePlaceWords {
  return DICT[lang] ?? DICT.en
}
