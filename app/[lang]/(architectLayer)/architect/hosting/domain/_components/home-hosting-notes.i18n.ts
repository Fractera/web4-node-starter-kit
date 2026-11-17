// КАРТОЧКА «КОГДА ПОДХОДИТ САЙТ С ДОМАШНЕГО КОМПЬЮТЕРА» (узел, шаг 344-5; 775 — the country card is removed by the owner's word,
// 2026-11-17: «чтобы не было никакого упоминания о России. Сейчас санкции не позволяют это делать»). Слово владельца 2026-09-30:
// «на вкладке где мы подключаем и настраиваем домен … очень подробно об этом рассказать … режим который необходимо использовать
// либо на ранней стадии загрузки проекта либо тогда когда проект вообще создается только для собственных нужд. В случае если
// лимит превышен пользователя предстоит выбрать перейти на оплату Cloud Flyer или приобрести в аренду vps … Российской Федерации
// … рекомендуется … использовать аренду vps»; «По умолчанию эти карточки должны быть закрыты».
//
// 🔒 ФАКТЫ — ИЗ ПЕРВОИСТОЧНИКОВ (проверено 2026-09-30), а не из пересказа:
//   лимиты и «не счёт, а отказ» — developers.cloudflare.com/workers/platform/pricing и /limits (Free: 100 000 запросов в сутки,
//   20 000 файлов на версию; «further operations of that type will fail with an error»; режим маршрута Fail open);

export type HomeHostingNotes = { title: string; home: { summary: string; text: string[] } }

const en: HomeHostingNotes = {
  title: "Before you rely on this mode",
  home: {
    summary: "Site from a home computer: when this mode fits",
    text: [
      "The node serves your site from this computer through a Cloudflare tunnel. Public pages are also kept as a copy in your own Cloudflare account, so they open even while the computer is off. Sign-in, the personal account and everything computed on the fly work only while the computer is on.",
      "This mode fits the start of a project and sites you build for yourself. It is free within the Cloudflare Workers limits: 100,000 requests a day to what is not in the copy, and up to 20,000 files in the copy. Going over a limit never produces a bill: extra requests simply skip the copy and go straight to the computer, as they would without it.",
      "When the project grows — many visitors, or sign-in that must work around the clock — choose one of two: a paid Cloudflare Workers plan, or a rented server (VPS) that is never switched off.",
    ],
  },
}

const ru: HomeHostingNotes = {
  title: "Прежде чем полагаться на этот режим",
  home: {
    summary: "Сайт с домашнего компьютера: когда этот режим подходит",
    text: [
      "Узел раздаёт ваш сайт с этого компьютера через туннель Cloudflare. Публичные страницы, кроме того, хранятся копией в вашем собственном аккаунте Cloudflare, поэтому они открываются и тогда, когда компьютер выключен. Вход, личный кабинет и всё, что считается на лету, работают, только пока компьютер включён.",
      "Этот режим хорош на старте проекта и для сайтов, которые вы делаете для себя. Он бесплатный в пределах лимитов Cloudflare Workers: 100 000 обращений в сутки к тому, чего нет в копии, и до 20 000 файлов в копии. Превышение лимита никогда не превращается в счёт: лишние запросы просто идут мимо копии прямо к компьютеру, как шли бы без неё.",
      "Когда проект вырастет — посетителей станет много или вход должен работать круглосуточно, — выберите одно из двух: платный тариф Cloudflare Workers или арендованный сервер (VPS), который не выключается.",
    ],
  },
}

export function homeHostingNotes(lang: string): HomeHostingNotes {
  return lang === "ru" ? ru : en
}
