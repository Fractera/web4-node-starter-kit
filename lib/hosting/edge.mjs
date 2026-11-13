// THE EDGE MARK — HOW THE NODE KNOWS A REQUEST CAME THROUGH ITS SERVER'S NGINX (node step 737-2).
// 🛑 THE HOLE IT CLOSES (found 2026-11-13 while planning the move): `isOwnerAtMachine` grants the architect layer without sign-in to a
// request whose `Host` is `localhost` and which carries no Cloudflare headers. On the person's computer that is exactly the person at
// the keyboard. Behind nginx on a server it would be anyone on the internet: `curl -H 'Host: localhost' http://<IP>/` — nginx passes the
// name, adds no `cf-*`, and the stranger gets the terminal of the server.
// 🔒 TWO WALLS, EITHER IS ENOUGH: (1) nginx refuses loopback names outright (444 in every `server {}` of the site); (2) nginx sets this header on
// EVERY proxied request — `proxy_set_header` replaces whatever the client sent, so a client can neither forge its absence nor remove
// it — and the core reads its presence as «not the owner at the keyboard». An SSH window to the server (`npm run server -- window`)
// arrives on the server's loopback without nginx, without the mark: that is the owner, by his key.
export const EDGE_HEADER = 'x-fractera-edge'
