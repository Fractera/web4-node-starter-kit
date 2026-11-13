// Быстрый туннель Cloudflare: входа там нет, `/login` отвечает честным 404 (257-8).
// 🛑 Сверяется только ХВОСТ имени: адрес быстрого туннеля — случайные слова, меняется при каждом перезапуске.
// Единственное место этого знания: `lib/auth/temporary-address.ts` сайта берёт его отсюда (285-3).
export const TEMPORARY_SUFFIXES = [".trycloudflare.com"]

// 737-2 (the owner, 2026-11-13: «запускается там сначала по IP-адресу»): THE DEDICATED SERVER'S BARE IP IS A TEMPORARY ADDRESS TOO.
// Before its domain the node on a server answers at `http://<IP>/` — public, plain HTTP, no certificate. The same law as the quick
// tunnel holds there: the panel is read-only, sign-in and registration are closed (a password never crosses plain HTTP). The machine's
// own loopback (127.0.0.0/8, ::1) is NOT such an address — it is the owner at the keyboard (`lib/auth/owner-at-machine.ts`). The node
// never listens on a network IP of the person's computer, so a bare IP reaches it only through a server's nginx.
export function isBareIpHostname(hostname: string): boolean {
  const host = (hostname ?? "").trim().toLowerCase()
  const v4 = host.replace(/:\d+$/, "")
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v4)) return !v4.startsWith("127.") && v4 !== "0.0.0.0"
  const v6 = host.match(/^\[([0-9a-f:.]+)\](?::\d+)?$/)
  return v6 !== null && v6[1] !== "::1"
}

// ✗ 737-2: the port was cut by `/:d+$/` (a lost backslash) — `name.trycloudflare.com:443` read as not temporary. Fixed to `\d`.
export function isTemporaryHostname(hostname: string): boolean {
  const bare = (hostname ?? "").trim().toLowerCase().replace(/:\d+$/, "")
  return TEMPORARY_SUFFIXES.some((suffix) => bare.endsWith(suffix)) || isBareIpHostname(hostname)
}
