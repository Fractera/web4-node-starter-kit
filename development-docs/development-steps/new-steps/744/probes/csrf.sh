#!/usr/bin/env bash
# 744 probe 2 — can a foreign web page make this node act on a server? A browser on https://evil.example sends a «simple» cross-site POST
# (no preflight: text/plain body) to http://localhost:24680 — the same headers as below. Only the read-only action «state» is sent.
# Expected today (the hole): 200 and the server's state read over SSH as root. Expected after 744-2: 403 before any SSH.
# Usage: csrf.sh <node port> <server ip>
PORT="${1:-24680}"; IP="${2:-213.199.61.7}"
for kind in same cross; do
  if [ "$kind" = cross ]; then H=(-H 'Origin: https://evil.example' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: no-cors' -H 'content-type: text/plain;charset=UTF-8')
  else H=(-H 'content-type: application/json'); fi
  printf '%-6s → ' "$kind"
  curl -s -o /tmp/csrf744.json -w '%{http_code} ' -X POST "${H[@]}" --data "{\"action\":\"state\",\"host\":\"$IP\",\"port\":22}" "http://localhost:$PORT/api/node/launch" --max-time 90
  head -c 90 /tmp/csrf744.json; echo; rm -f /tmp/csrf744.json
done
