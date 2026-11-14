#!/usr/bin/env bash
# THE SERVER IS FREED FOR THE NODE — STOPPED, NOT DELETED (node step 737-7). Run as root over SSH after the person confirmed it in the
# tab's dialog. The owner, 2026-11-13: «если мы обнаружили что сервер занят … действия очистить сервер и подготовить к установке нового
# приложения Fractera или отменить установку … очистить должно иметь подтверждающий диалог чтоб пользователь понимал с какими рисками
# сталкивается».
# 🔒 NOTHING IS ERASED: root's pm2 programs are listed into the backup folder and removed from pm2 (their folders stay where they are),
# pm2's root autostart is turned off so they do not come back at reboot, every nginx site that is not the node's own MOVES to the backup
# folder; a database or any other system service is not touched. The old sites stop answering at once — that is the risk the dialog names.
# Way back by hand: the backup folder holds the pm2 list and the nginx files (README inside).
# 744-4 (the owner, 2026-11-14: «если сервер никак не связан с нашим текущим положением Fractera то предлагает удалить предыдущее
# состояние»): `--node <folder>` (repeated) sets aside a Fractera node NOT related to the computer that asks (a 737 move, another fork):
# the node user's pm2 programs stop and its autostart goes off, the node's folder MOVES into the backup whole (data, keys, history), its own
# nginx site and the launch's records in `--dir` go with it. A related node is never passed here: only its strangers are cleared.
# Prints ONE JSON line: { backup, stopped, sites, nodes }.
set -u
NODES=() DIR=/root/.fractera
while [ $# -gt 0 ]; do
  case "$1" in
    --node) [[ "${2:-}" =~ ^[A-Za-z0-9._-]{1,100}$ ]] && NODES+=("$2"); shift 2 ;;
    --dir) DIR="${2:-$DIR}"; shift 2 ;;
    *) shift ;;
  esac
done
TS="$(date -u +%Y%m%d-%H%M%S)"
BACKUP="/root/fractera-cleared-$TS"
DRY="${DRY_RUN:-0}"
run() { if [ "$DRY" = 1 ]; then echo "DRY: $*" >&2; else "$@"; fi; }
mkdir -p "$BACKUP/nginx"
STOPPED=0
if command -v pm2 >/dev/null; then
  pm2 jlist > "$BACKUP/pm2.json" 2>/dev/null || echo '[]' > "$BACKUP/pm2.json"
  STOPPED="$(python3 -c 'import json,sys; t=open(sys.argv[1]).read(); print(len([p for p in json.loads(t[t.index("["):]) if not p.get("pm2_env", {}).get("pmx_module")]) if "[" in t else 0)' "$BACKUP/pm2.json" 2>/dev/null || echo 0)"
  run pm2 delete all >/dev/null 2>&1 || true
  run pm2 save --force >/dev/null 2>&1 || true
  run pm2 unstartup systemd >/dev/null 2>&1 || true
fi
SITES=""
for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [ -e "$f" ] || continue
  grep -q 'Managed by the Fractera node (step 737)' "$f" 2>/dev/null && continue
  name="$(basename "$f")"
  real="$(readlink -f "$f")"
  run cp -a "$real" "$BACKUP/nginx/$name" 2>/dev/null || true
  run rm -f "$f"
  # The same-named file in sites-available would be overwritten by the node's own site: it moves too.
  [ "$real" != "$f" ] && [ -f "$real" ] && run mv "$real" "$BACKUP/nginx/$name.available"
  SITES="${SITES:+$SITES,}$name"
done
SET_ASIDE=""
if [ ${#NODES[@]} -gt 0 ]; then
  mkdir -p "$BACKUP/nodes" "$BACKUP/launch-state"
  if id -u fractera >/dev/null 2>&1; then
    [ "$DRY" = 1 ] || runuser -l fractera -c 'pm2 jlist' > "$BACKUP/nodes/pm2-fractera.json" 2>/dev/null || true
    run runuser -l fractera -c 'pm2 delete all; pm2 save --force' >/dev/null 2>&1 || true
    run systemctl disable --now pm2-fractera >/dev/null 2>&1 || true
  fi
  for n in "${NODES[@]}"; do
    [ -d "/home/fractera/$n" ] || [ "$DRY" = 1 ] || continue
    run mv "/home/fractera/$n" "$BACKUP/nodes/$n"
    SET_ASIDE="${SET_ASIDE:+$SET_ASIDE,}$n"
  done
  for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
    [ -e "$f" ] || continue
    grep -q 'Managed by the Fractera node (step 737)' "$f" 2>/dev/null || continue
    name="$(basename "$f")"; real="$(readlink -f "$f")"
    run cp -a "$real" "$BACKUP/nginx/$name.node" 2>/dev/null || true
    run rm -f "$f"
    [ "$real" != "$f" ] && [ -f "$real" ] && run mv "$real" "$BACKUP/nginx/$name.node.available"
  done
  # the records of the launch of the node set aside; the scripts stay (they are uploaded anew by every act)
  for x in launch.json launch.progress.jsonl launch.log launch.out version.json domain.json domain.json.tmp probe.json preflight.json prepare.progress.jsonl prepare.log; do
    [ -e "$DIR/$x" ] && run mv "$DIR/$x" "$BACKUP/launch-state/$x"
  done
fi
if command -v nginx >/dev/null && [ "$DRY" != 1 ]; then nginx -t >/dev/null 2>&1 && (systemctl reload nginx || systemctl restart nginx) >/dev/null 2>&1; fi
cat > "$BACKUP/README.txt" <<EOF
Freed for a Fractera node at $TS (UTC). Nothing was deleted.
pm2.json — the programs root's pm2 ran (their folders are untouched); start one again: pm2 start <its script> --name <name>.
nginx/   — the sites that answered on this server; put one back: cp nginx/<name> /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx.
nodes/   — a Fractera node set aside whole (744-4): move it back to /home/fractera/<name> and start its pm2 as the user fractera.
EOF
python3 -c 'import json,sys; print(json.dumps({"backup": sys.argv[1], "stopped": int(sys.argv[2] or 0), "sites": [s for s in sys.argv[3].split(",") if s], "nodes": [s for s in sys.argv[4].split(",") if s]}))' "$BACKUP" "$STOPPED" "$SITES" "$SET_ASIDE"
