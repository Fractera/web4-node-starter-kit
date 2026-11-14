#!/usr/bin/env bash
# 741 probe — the COMPUTER plane (negative control of the server's defect). READ ONLY. Usage: tunnel-forgery.sh <https://…trycloudflare.com>
# Cloudflare routes by name, so a forged Host through the quick tunnel never reaches the core: expect 403 from Cloudflare on the forged
# rows and `owner@temporary` (the accepted read-only trade of 243) on the tunnel's own name.
U="${1:?the node's quick-tunnel URL}"
for h in "" fractera.ai 213.199.61.7; do
  printf "%-26s " "Host: ${h:-<the tunnel itself>}"
  if [ -n "$h" ]; then curl -s -m 12 -w "  [%{http_code}]" -H "Host: $h" "$U/api/me" | head -c 110; else curl -s -m 12 -w "  [%{http_code}]" "$U/api/me" | head -c 110; fi
  echo
done
