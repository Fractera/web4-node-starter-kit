// The words of «Сертификаты безопасности», a page of a server node only (node step 742-4). One set goes to the browser: the language is
// chosen on the server (`components/hosting/widgets.tsx`, `check:lang-delivery`).

export type ServerCertificatesWords = {
  onlyServer: string
  loading: string
  none: string
  head: { name: string; cert: string; days: string; source: string; https: string }
  calm: string
  attention: string
  renewNote: string
  lifetime: string
}

const en: ServerCertificatesWords = {
  onlyServer: "This page belongs to a server node: certificates live where the node answers by its own domain. On this computer the domain runs through Cloudflare, with no certificates of its own to watch.",
  loading: "Reading the server's certificates…",
  none: "The server has no domain yet: certificates come after «Активация домена».",
  head: { name: "Name", cert: "Certificate", days: "Left", source: "Issued by", https: "HTTPS" },
  calm: "Every name has a valid certificate.",
  attention: "Needs attention: {n} name(s) without a certificate or close to the end.",
  renewNote: "«Check and complete» issues the missing certificates and renews the ones with less than 30 days left (certbot --keep-until-expiring); a name that fails does not stop the others. Your own certificate replaces Let's Encrypt for its name.",
  lifetime: "A Let's Encrypt certificate lives 90 days.",
}

const ru: ServerCertificatesWords = {
  onlyServer: "Эта страница — для узла на сервере: сертификаты живут там, где узел отвечает по своему домену. На этом компьютере домен идёт через Cloudflare, своих сертификатов здесь нет.",
  loading: "Читаю сертификаты сервера…",
  none: "У сервера ещё нет домена: сертификаты появятся после «Активации домена».",
  head: { name: "Имя", cert: "Сертификат", days: "Осталось", source: "Кто выдал", https: "HTTPS" },
  calm: "У каждого имени действующий сертификат.",
  attention: "Требует внимания: имён без сертификата или с близким сроком — {n}.",
  renewNote: "«Проверить и дополнить» выпускает недостающие сертификаты и продлевает те, до конца которых меньше 30 дней (certbot --keep-until-expiring); имя со сбоем не останавливает остальные. Свой сертификат заменяет Let's Encrypt для своего имени.",
  lifetime: "Сертификат Let's Encrypt живёт 90 дней.",
}

export function serverCertificatesWords(lang: string): ServerCertificatesWords {
  return lang === "ru" ? ru : en
}
