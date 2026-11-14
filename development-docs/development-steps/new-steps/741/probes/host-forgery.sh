#!/usr/bin/env bash
# 741 probe — the SERVER plane. READ ONLY: GET requests and TLS handshakes, never a write. Usage: host-forgery.sh <server IPv4>
# Which identity the node grants for a forged Host / X-Forwarded-Host through the server's nginx (the core on :80, the first named
# block on :443). Before 741 (2026-11-14, 213.199.61.7) — see README.md; after 741-1 every forged row must show 000 (nginx 444) or the
# static card, never `owner@temporary` or `visitor@showcase`; the control rows must keep their answers.
IP="${1:?server IPv4}"
code() { curl -s -m 10 -o /dev/null -w "%{http_code}" "$@"; }
who()  { curl -s -m 10 "$@" | python3 -c 'import json,sys
try:
  d=json.load(sys.stdin); print(d.get("userId") or d.get("error") or "?", "roles="+str(len(d.get("roles",[]))))
except Exception: print("not-json")' 2>/dev/null; }
row() {
  local label="$1"; shift
  printf "%-40s me=%-30s state=%s machine=%s passport=%s page/ru=%s\n" "$label" \
    "$(who "$@" "$BASE/api/me")" "$(code "$@" "$BASE/api/node/state")" "$(code "$@" "$BASE/api/node/machine")" \
    "$(code "$@" "$BASE/api/node/passport")" "$(code "$@" "$BASE/ru")"
}
BASE="http://$IP"
echo "== plain HTTP to the IP (nginx default_server)"
row "Host: nobody.invalid (control)"       -H "Host: nobody.invalid"
row "Host: <IP> (the bare IP)"
row "Host: fractera.ai (forged)"           -H "Host: fractera.ai"
row "Host: x.trycloudflare.com (forged)"   -H "Host: x.trycloudflare.com"
row "Host: 10.0.0.1 (forged IP)"           -H "Host: 10.0.0.1"
row "XFH fractera.ai + Host nobody"        -H "Host: nobody.invalid" -H "X-Forwarded-Host: fractera.ai"
for h in localhost localhost. 127.0.0.1:24680 "[::1]"; do printf "%-40s %s\n" "Host: $h (nginx drops: 000)" "$(code -H "Host: $h" "$BASE/api/me")"; done
echo "== HTTPS to the IP (443)"
BASE="https://$IP"
for sni in nobody.invalid fractera.ai; do
  printf "%-40s %s\n" "TLS SNI $sni → certificate" "$(openssl s_client -connect "$IP:443" -servername "$sni" </dev/null 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo 'handshake refused')"
done
for h in nobody.invalid 10.0.0.1 x.trycloudflare.com fractera.ai; do printf "%-40s %s\n" "https Host: $h → /api/me" "$(curl -sk -m 10 -H "Host: $h" "$BASE/api/me" | head -c 90)"; done
for p in 24680 24681; do printf "%-40s %s\n" "port $p from outside (must be 000)" "$(code -m 5 "http://$IP:$p/api/health")"; done
