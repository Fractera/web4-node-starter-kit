#!/usr/bin/env bash
# THE RED TEAM, REPEATABLE (node step 818-6). The owner, 2026-11-20 (Telegram 251): «попытаться подобно хакеру взломать через этот
# элемент наш сервер … достаточно ли ты хорошо изолировал сервер». Every attack of 817, run AS a custom element's own user, with the
# verdict the wall must give: «HOLDS» or «HOLE <what>». Verdicts only — never a byte of what is read.
# Run as the node user on a walled server:  bash scripts/dedicated-server/redteam.sh <element id> [<neighbour id>]
#   it re-runs itself through `sudo -n /usr/local/sbin/fractera-element run <id> -- /bin/bash <this file> --inside`.
# Prints one line per attack and the last line `===REDTEAM=== <holds> holds, <holes> holes`; exit 1 when any hole.
set -u
if [ "${1:-}" != "--inside" ]; then
  id="${1:?element id}"; neighbour="${2:-}"
  copy="$(mktemp /tmp/redteam-XXXXXX.sh)"; cp -- "$0" "$copy"; chmod 0644 "$copy"
  NODE_DIR="$(cd -- "$(dirname -- "$0")/../.." && pwd -P)"
  sudo -n /usr/local/sbin/fractera-element run "$id" -- /bin/bash "$copy" --inside "$NODE_DIR" "$neighbour"; rc=$?
  rm -f -- "$copy"; exit "$rc"
fi
N="${2:?node dir}"; NB="${3:-}"; H="$(dirname -- "$N")"
holds=0; holes=0
ok()   { holds=$((holds + 1)); printf 'HOLDS  %s\n' "$1"; }
hole() { holes=$((holes + 1)); printf 'HOLE   %s\n' "$1"; }
readable() { [ -e "$1" ] && head -c1 -- "$1" >/dev/null 2>&1; }
listable() { [ -d "$1" ] && ls -- "$1" >/dev/null 2>&1; }
deny_read() { readable "$1" && hole "reads $1" || ok "cannot read $1"; }
deny_list() { listable "$1" && hole "lists $1" || ok "cannot list $1"; }
me="$(id -un)"
case "$me" in fe-*) ;; *) echo "not an element user ($me)"; exit 2 ;; esac

# 817-2 files of the node
for f in "$N/.env.local" "$N/WEB4-ITEMS-REGISTRY/web4-items.json" "$H/.claude/.credentials.json" "$H/.claude.json" "$H/.claude/settings.json" \
         "$H/.gitconfig" "$H/.pm2/dump.pm2" "$H/.pm2/pm2.log" /etc/shadow /etc/sudoers; do deny_read "$f"; done
for d in "$N/data" "$N/logs" "$N/WEB4-ITEMS" "$H/.claude" "$H/.pm2" "$H/.ssh" /root /etc/letsencrypt/live; do deny_list "$d"; done
for f in /etc/nginx/sites-available/*; do [ -f "$f" ] && deny_read "$f"; done
# a neighbour
if [ -n "$NB" ]; then
  for f in "$N/WEB4-ITEMS/user/$NB" "$N/WEB4-ITEMS/user/$NB/.git"; do deny_list "$f"; done
  deny_read "$N/WEB4-ITEMS/user/$NB/.env.local"
  for pid in $(pgrep -u "fe-$NB" 2>/dev/null); do
    kill -0 "$pid" 2>/dev/null && hole "signals fe-$NB $pid" || ok "cannot signal fe-$NB"
    readable "/proc/$pid/environ" && hole "reads fe-$NB environ" || ok "cannot read fe-$NB environ"
  done
fi
# the node user's processes
for pid in $(pgrep -u "$(stat -c %U "$N")" 2>/dev/null | head -5); do
  kill -0 "$pid" 2>/dev/null && hole "signals the node's $pid" || ok "cannot signal the node's $pid"
  readable "/proc/$pid/environ" && hole "reads the node's environ $pid" || ok "cannot read the node's environ"
done
# 817-3 rights
sudo -n true 2>/dev/null && hole "sudo works" || ok "no sudo"
[ -w /var/run/docker.sock ] && hole "the docker socket is writable" || ok "no docker socket"
for s in "$H/.pm2/rpc.sock" "$H/.pm2/pub.sock"; do [ -S "$s" ] && [ -w "$s" ] && hole "pm2 socket $s" || ok "no pm2 socket $(basename "$s")"; done
for w in "$N" "$N/node_modules" "$N/lib" "$N/scripts" "$H" /usr/local/bin /etc/cron.d; do [ -w "$w" ] && hole "writes $w" || ok "cannot write $w"; done
crontab -l >/dev/null 2>&1 && hole "crontab usable" || ok "no crontab"
# 817-4 network: the core's doors
core="http://localhost:24680"
code() { curl -s -m6 -o /dev/null -w '%{http_code}' "$@"; }
for d in /api/node/update /api/node/deploy /api/node/launch /api/architect/environment /api/agents/sessions /api/node/wallet; do
  c="$(code "$core$d")"; [ "$c" = 401 ] || [ "$c" = 403 ] && ok "core $d → $c" || hole "core $d → $c"
  c="$(code -H 'Host: localhost' -H 'X-Forwarded-For: 127.0.0.1' -H 'X-Node-Key: guess' -H 'x-agent-identity: anyone' "$core$d")"
  [ "$c" = 401 ] || [ "$c" = 403 ] && ok "core $d forged → $c" || hole "core $d forged → $c"
done
me_json="$(curl -s -m6 -H 'x-agent-identity: anyone' "$core/api/me")"
case "$me_json" in *'"roles"'*) hole "the core names a self-written agent: $(printf '%s' "$me_json" | head -c 80)" ;; *) ok "no identity from x-agent-identity" ;; esac
# the stores with the element's own key
K="$(grep -h '^ELEMENT_KEY=' ./.env.local 2>/dev/null | head -1 | cut -d= -f2-)"
q() { curl -s -m6 -X POST -H 'Content-Type: application/json' ${2:+-H "X-Element-Key: $2"} -d "{\"sql\":\"$1\",\"params\":[]}" http://127.0.0.1:24682/db/migrate; }
case "$(q 'SELECT 1')" in *Unauthorized*|*unauthorized*|*element_key*) ok "data without a key refused" ;; *) hole "data answers without a key" ;; esac
if [ -n "$K" ]; then
  case "$(q "ATTACH DATABASE '/tmp/x.db' AS x" "$K")" in *outside-own-database*) ok "ATTACH refused" ;; *) hole "ATTACH not refused" ;; esac
  case "$(q 'SELECT 1' "auth.${K#*.}")" in *bad_element_key*) ok "a neighbour's key forged from own mac refused" ;; *) hole "a forged key accepted" ;; esac
  # the relay: its own key works, the node's transcript is refused
  r="$(curl -s -m20 -X POST -H 'content-type: application/json' -H "X-Element-Key: $K" -d '{"name":"window","stdin":"{}"}' "$core/api/node/hook-relay")"
  case "$r" in *'"ok":true'*) ok "the relay answers the element's own key" ;; *) hole "the relay is unreachable (F1): $(printf '%s' "$r" | head -c 60)" ;; esac
  r="$(curl -s -m20 -X POST -H 'content-type: application/json' -H "X-Element-Key: $K" -d "{\"name\":\"record\",\"stdin\":\"{\\\"transcript_path\\\":\\\"$H/.claude/projects/x/y.jsonl\\\"}\"}" "$core/api/node/hook-relay")"
  case "$r" in *'record refused'*) ok "record refuses a path outside its own session" ;; *) hole "record took a foreign path: $(printf '%s' "$r" | head -c 60)" ;; esac
fi
# 818-7 (H6): the element holds its own key, never the node's — and its key opens only its own affairs
S="$(grep -h '^SETTINGS_SECRET=' ./.env.local 2>/dev/null | head -1 | cut -d= -f2-)"; self="${me#fe-}"
# ✗ 2026-11-20 part C: run as root with no neighbour, `other` was root itself — «a neighbour's key» was root's own key (200, a false hole).
other="${NB:-root}"; [ "$other" = "$self" ] && other=""   # a custom neighbour, or none
forged="${other:-auth}"                                   # any element that is not this one
grep -q '^DATA_SECRET=.' ./.env.local 2>/dev/null && hole "holds the node's DATA_SECRET" || ok "no DATA_SECRET of the node"
[ -n "$S" ] && [ "$S" = "$K" ] && ok "SETTINGS_SECRET is its own key" || hole "SETTINGS_SECRET is not its own key (the node key?)"
if [ -n "$S" ]; then
  to() { curl -s -m8 -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -H "X-Node-Key: $1" -d "$2" "$3"; }
  no() { [ "$2" = 401 ] || [ "$2" = 403 ] && ok "$1 → $2" || hole "$1 → $2"; }
  for t in memory auth $other; do
    [ "$t" = "$self" ] && continue
    no "its key wakes $t's agent" "$(to "$S" "{\"service\":\"$t\",\"reason\":\"redteam\",\"text\":\"red team probe, ignore\"}" "$core/api/agents/wake")"
    no "its key reports done for $t" "$(to "$S" "{\"service\":\"$t\"}" "$core/api/agents/done")"
  done
  for d in /api/agents/trust /api/agents/telegram /api/agents/person-lang; do no "its key at the node-only $d" "$(to "$S" '{}' "$core$d")"; done
  no "a neighbour's key forged from its own mac ($forged)" "$(code -H "X-Node-Key: $forged.${S#*.}" "$core/api/node/a2a")"
  c="$(code -H "X-Node-Key: $S" "$core/api/node/pair-key?to=$self")"; [ "$c" = 400 ] && ok "no pair key for itself" || hole "a pair key for itself → $c"
  P=""; [ -n "$other" ] && P="$(curl -s -m6 -H "X-Node-Key: $S" "$core/api/node/pair-key?to=$other" | sed -n 's/.*"key":"\([^"]*\)".*/\1/p')"
  [ -n "$P" ] && no "its pair key for $other at the core" "$(code -H "X-Node-Key: $P" "$core/api/node/a2a")"
  urlof() { curl -s -m6 -H "X-Node-Key: $S" "$core/api/node/a2a?address=$1" | sed -n 's/.*"url":"\(http[^"]*\)".*/\1/p' | head -1; }
  u="$(urlof memory)"; [ -n "$u" ] && no "its key at memory's recall" "$(to "$S" '{"query":"x"}' "$u/v1/recall")"
  u="$(urlof stripe)"; [ -n "$u" ] && [ -n "$other" ] && no "a checkout in $other's name" \
    "$(to "$S" "{\"element\":\"$other\",\"reference\":\"rt\",\"successUrl\":\"https://x.example/s\",\"cancelUrl\":\"https://x.example/c\"}" "$u/api/stripe-checkout")"
  # CONFIG: reading the settings is public by design (GET /api/settings); the catalogue is written only with the node key. A body that is
  # not JSON writes nothing either way: 401 = the key refused, 400 «bad-json» = the key ACCEPTED.
  u="$(urlof config)"
  if [ -n "$u" ]; then
    for k in "$S" "${S}x"; do no "CONFIG's catalogue written with $([ "$k" = "$S" ] && echo its own || echo a garbled) key" \
      "$(code -X PUT -H 'content-type: application/json' -H "X-Settings-Key: $k" -d 'not-json' "$u/api/settings/catalog")"; done
  fi
  # 817-4 a neighbour's own doors on loopback: its key opens none of them; a pair key names the caller and never opens a door of the node.
  if [ -n "$other" ]; then
    nu="$(urlof "$other")"
    if [ -n "$nu" ]; then
      # Its doors and their methods (the templates: design and app GET PATCH, a2a/tasks POST, a2a POST, tg-menu GET); a body that is not
      # JSON writes nothing: 401 = refused, 400 = the key ACCEPTED. A pair key names the caller only at the i2i doors (a2a, tg-menu).
      for k in "$S" "$forged.${S#*.}" ${P:+"$P"}; do
        kn="$([ "$k" = "$S" ] && echo its own key || { [ "$k" = "$P" ] && echo its pair key || echo a forged key; })"
        no "$other's design read with $kn" "$(code -H "X-Settings-Key: $k" "$nu/api/settings/design")"
        for s in design app; do
          no "$other's $s settings written with $kn" "$(code -X PATCH -H 'content-type: application/json' -H "X-Settings-Key: $k" -d 'not-json' "$nu/api/settings/$s")"
        done
        no "$other's settings signal with $kn" "$(code -X POST -H "X-Settings-Key: $k" "$nu/api/settings/changed")"
        no "$other's A2A task with $kn" "$(to "$k" 'not-json' "$nu/api/a2a/tasks/redteam-probe")"
      done
      for k in "$S" "$forged.${S#*.}"; do
        kn="$([ "$k" = "$S" ] && echo its own || echo a forged) key"
        no "$other's A2A order with $kn" "$(to "$k" '{"jsonrpc":"2.0","id":1,"method":"tasks/get","params":{"id":"redteam-probe"}}' "$nu/api/a2a")"
        c="$(code -H "X-Node-Key: $k" "$nu/api/tg-menu")"; [ "$c" = 404 ] && ok "$other has no Telegram menu door (404)" || no "$other's Telegram menu with $kn" "$c"
        # the passport: open by design; its private fields (the author's e-mail, the server's IP, the ties) only with the element's own key
        pub="$(curl -s -m6 "$nu/api/own-service-props" | sha1sum | cut -c1-12)"; got="$(curl -s -m6 -H "X-Node-Key: $k" "$nu/api/own-service-props" | sha1sum | cut -c1-12)"
        [ "$pub" = "$got" ] && ok "$other's passport with $kn = the public card" || hole "$other's passport with $kn gives more than the public card"
      done
    fi
  fi
fi
# foreign services an element could reach
for p in 5000 8080 5432 3306 6379 27017; do
  (exec 3<>"/dev/tcp/127.0.0.1/$p") 2>/dev/null && hole "a foreign service listens on 127.0.0.1:$p" || ok "nothing on 127.0.0.1:$p"
done
echo "===REDTEAM=== $holds holds, $holes holes"
[ "$holes" = 0 ]
