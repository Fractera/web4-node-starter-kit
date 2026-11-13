#!/usr/bin/env bash
# THE SERVER IS FREED FOR THE NODE — STOPPED, NOT DELETED (node step 737-7). Run as root over SSH after the person confirmed it in the
# tab's dialog. The owner, 2026-11-13: «если мы обнаружили что сервер занят … действия очистить сервер и подготовить к установке нового
# приложения Fractera или отменить установку … очистить должно иметь подтверждающий диалог чтоб пользователь понимал с какими рисками
# сталкивается».
# 🔒 NOTHING IS ERASED: root's pm2 programs are listed into the backup folder and removed from pm2 (their folders stay where they are),
# pm2's root autostart is turned off so they do not come back at reboot, every nginx site that is not the node's own MOVES to the backup
# folder; a database or any other system service is not touched. The old sites stop answering at once — that is the risk the dialog names.
# Way back by hand: the backup folder holds the pm2 list and the nginx files (README inside).
# Prints ONE JSON line: { backup, stopped, sites }.
set -u
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
if command -v nginx >/dev/null && [ "$DRY" != 1 ]; then nginx -t >/dev/null 2>&1 && (systemctl reload nginx || systemctl restart nginx) >/dev/null 2>&1; fi
cat > "$BACKUP/README.txt" <<EOF
Freed for a Fractera node at $TS (UTC). Nothing was deleted.
pm2.json — the programs root's pm2 ran (their folders are untouched); start one again: pm2 start <its script> --name <name>.
nginx/   — the sites that answered on this server; put one back: cp nginx/<name> /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx.
EOF
python3 -c 'import json,sys; print(json.dumps({"backup": sys.argv[1], "stopped": int(sys.argv[2] or 0), "sites": [s for s in sys.argv[3].split(",") if s]}))' "$BACKUP" "$STOPPED" "$SITES"
