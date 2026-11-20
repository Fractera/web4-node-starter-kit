#!/usr/bin/env bash
# THE SERVER IS FREED FOR THE NODE (node steps 737-7, 744-4, 806-1). Run as root over SSH after the person confirmed it in the tab's dialog.
# The owner, 2026-11-13: «если мы обнаружили что сервер занят … действия очистить сервер и подготовить к установке нового приложения
# Fractera или отменить установку … очистить должно иметь подтверждающий диалог чтоб пользователь понимал с какими рисками сталкивается».
# 🔒 A STRANGER'S PROGRAMS AND SITES ARE SET ASIDE, NOT DELETED: root's pm2 programs are listed into the backup folder and removed from pm2
# (their folders stay where they are), pm2's root autostart is turned off, every nginx site that is not the node's own MOVES to the backup
# folder; a database or any other system service is not touched. Way back by hand: the backup folder (README inside).
# 🔒 A FRACTERA NODE IS ERASED (806-1). The owner, 2026-11-14 (744-4): «предлагает удалить предыдущее состояние»; 2026-11-19: «Когда я
# нажимаю кнопку очистить разве ты не должно предполагать очистку диска … Fractera Easy стартер всегда без проблем по 1000 раз
# устанавливался на этот сервер» · «должна быть нормальная чистая установка после удаления полная очистка». ✗ 744-4 had MOVED every
# cleared node whole into /root/fractera-cleared-<ts>: three clears of one server left three full nodes there, 7 GB free of the disk.
# Now, the Easy Starter's way (Fractera/fractera-easy-starter lib/wipe-script.ts): `--node <folder>` (repeated) — the node user's pm2 is
# killed and its autostart goes off, the node's folder is ERASED, and with it every older copy any earlier clear or launch left
# (`/root/fractera-cleared-*/nodes`, `…/launch-state`, `/home/fractera/*.before-*`), the node user's caches (npm, ~/.cache, pm2's logs)
# and the launch's records in `--dir`. KEPT: apt packages, /root/.ssh and the node user's ~/.ssh, its Claude Code sign-in (~/.claude*,
# ~/.local — the person's own act), /var/log, /etc/letsencrypt (Let's Encrypt's weekly limits), the server's bot token waiting in
# `--dir` (telegram.json), the stopwatch of earlier launches (timings.json).
# `--keep-site` (a fresh install of THIS node, 806-6): the node's own nginx site stays in place — with nothing behind it nginx answers its
# «the node is updating» page (lib/hosting/nginx.mjs, error_page 502 → 503) until the new node starts; otherwise it is deleted too.
# Prints ONE JSON line: { backup, stopped, sites, nodes, erased, docker, freedGb, freeGb }.
# Test roots (scripts/server-clear.test.mjs): CLEAR_HOME, CLEAR_ROOT, CLEAR_NGINX; CLEAR_TEST=1 runs no service command (pm2, systemctl,
# runuser, nginx) — the test machine's own processes are never touched.
set -u
NODES=() DIR=/root/.fractera KEEP_SITE=0
while [ $# -gt 0 ]; do
  case "$1" in
    # a folder name only — never «.» or «..» (an erase of /home/fractera/.. would take /home)
    --node) [[ "${2:-}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$ ]] && NODES+=("$2"); shift 2 ;;
    --dir) DIR="${2:-$DIR}"; shift 2 ;;
    --keep-site) KEEP_SITE=1; shift ;;
    *) shift ;;
  esac
done
HOME_DIR="${CLEAR_HOME:-/home/fractera}"
ROOT_DIR="${CLEAR_ROOT:-/root}"
NGINX_DIR="${CLEAR_NGINX:-/etc/nginx}"
TEST="${CLEAR_TEST:-0}"
TS="$(date -u +%Y%m%d-%H%M%S)"
BACKUP="$ROOT_DIR/fractera-cleared-$TS"
DRY="${DRY_RUN:-0}"
run() { if [ "$DRY" = 1 ]; then echo "DRY: $*" >&2; else "$@"; fi; }
service() { [ "$TEST" = 1 ] || run "$@"; }
free_kb() { df -Pk "$HOME_DIR" 2>/dev/null | awk 'NR==2 {print $4}'; }
FREE_BEFORE="$(free_kb)"
ERASED=()
erase() { # path — erased for good, named in the answer
  [ -e "$1" ] || [ -L "$1" ] || return 0
  run rm -rf -- "$1" && ERASED+=("$1")
}

mkdir -p "$BACKUP/nginx"
STOPPED=0
if [ "$TEST" != 1 ] && command -v pm2 >/dev/null; then
  pm2 jlist > "$BACKUP/pm2.json" 2>/dev/null || echo '[]' > "$BACKUP/pm2.json"
  STOPPED="$(python3 -c 'import json,sys; t=open(sys.argv[1]).read(); print(len([p for p in json.loads(t[t.index("["):]) if not p.get("pm2_env", {}).get("pmx_module")]) if "[" in t else 0)' "$BACKUP/pm2.json" 2>/dev/null || echo 0)"
  if [ "${STOPPED:-0}" -gt 0 ]; then
    run pm2 delete all >/dev/null 2>&1 || true
    run pm2 save --force >/dev/null 2>&1 || true
    run pm2 unstartup systemd >/dev/null 2>&1 || true
  fi
fi
SITES=""
for f in "$NGINX_DIR"/sites-enabled/* "$NGINX_DIR"/conf.d/*.conf; do
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
GONE=""
if [ ${#NODES[@]} -gt 0 ]; then
  if [ "$TEST" != 1 ] && id -u fractera >/dev/null 2>&1; then
    # a full kill, not `pm2 delete all` (the Easy Starter's lesson): the daemon itself goes, so nothing of the old node restarts
    run runuser -l fractera -c 'pm2 kill' >/dev/null 2>&1 || true
    run systemctl disable --now pm2-fractera >/dev/null 2>&1 || true
  fi
  for n in "${NODES[@]}"; do
    [ -d "$HOME_DIR/$n" ] || [ "$DRY" = 1 ] || continue
    erase "$HOME_DIR/$n"
    GONE="${GONE:+$GONE,}$n"
  done
  # every older copy an earlier clear or launch left behind (744-4 moved nodes whole; a launch moved a folder without a node aside)
  for b in "$ROOT_DIR"/fractera-cleared-*; do
    [ -d "$b" ] && [ "$b" != "$BACKUP" ] || continue
    erase "$b/nodes"; erase "$b/launch-state"
    # an old backup that kept nothing of a stranger's is empty now: it goes whole
    if [ -z "$(find "$b/nginx" -type f 2>/dev/null | head -1)" ] && ! grep -q '"name"' "$b/pm2.json" 2>/dev/null; then erase "$b"; fi
  done
  # 811-2: the elements' own users go with the node — their processes, accounts, homes and root's records of them (the group and the
  # helper stay: prepare.sh owns them and the next install needs them)
  if [ "$TEST" != 1 ]; then
    for u in $(getent passwd 2>/dev/null | cut -d: -f1 | grep -E '^fe-[a-z0-9-]+$'); do
      run pkill -KILL -u "$u" >/dev/null 2>&1 || true
      run userdel "$u" >/dev/null 2>&1 || true
    done
  fi
  for h in "${CLEAR_BASE:-}"/var/lib/fractera-el/*; do erase "$h"; done
  for r in "${CLEAR_BASE:-}"/etc/fractera/elements/*; do erase "$r"; done
  for c in "$HOME_DIR"/*.before-*; do erase "$c"; done
  erase "$HOME_DIR/.npm"; erase "$HOME_DIR/.cache"; erase "$HOME_DIR/.pm2"
  # ✗ measured 2026-11-19 after a clear: root's own npm cache held 24 GB (the installs' global packages, earlier installers) — a cache only,
  # npm fetches again what it needs
  erase "$ROOT_DIR/.npm/_cacache"
  if [ "$KEEP_SITE" != 1 ]; then
    for f in "$NGINX_DIR"/sites-enabled/* "$NGINX_DIR"/conf.d/*.conf; do
      [ -e "$f" ] || continue
      grep -q 'Managed by the Fractera node (step 737)' "$f" 2>/dev/null || continue
      real="$(readlink -f "$f")"
      erase "$f"
      [ "$real" != "$f" ] && erase "$real"
    done
  fi
  # 806-8 (the owner, 2026-11-19: «Не просто стереть а всегда стирать … очищаем сервер значит очищаем на 100%»): a clear of a node
  # always erases what earlier installers left too — the Easy Starter's trees, root's caches, Docker's unused (`leftovers.sh`, beside
  # this script; ✗ that day 20 GB of them stayed after a clear)
  LEFT="$(LEFT_ROOT="${CLEAR_BASE:-}" LEFT_TEST="$TEST" bash "$(dirname "$0")/leftovers.sh" 2>/dev/null | tail -n 1)"
  # the records of the launch of the node; the scripts stay (uploaded anew by every act), and so do the bot token and the stopwatch
  for x in launch.json launch.progress.jsonl launch.log launch.out version.json domain.json domain.json.tmp probe.json preflight.json prepare.progress.jsonl prepare.log; do
    erase "$DIR/$x"
  done
fi
if [ "$TEST" != 1 ] && command -v nginx >/dev/null && [ "$DRY" != 1 ]; then nginx -t >/dev/null 2>&1 && (systemctl reload nginx || systemctl restart nginx) >/dev/null 2>&1; fi
# the backup holds only what a stranger had; with nothing of theirs it is not left on the disk
if [ -z "$SITES" ] && [ "${STOPPED:-0}" -eq 0 ]; then
  rm -rf -- "$BACKUP"; BACKUP=""
else
  cat > "$BACKUP/README.txt" <<EOF
Freed for a Fractera node at $TS (UTC). The other programs and sites were set aside, not deleted.
pm2.json — the programs root's pm2 ran (their folders are untouched); start one again: pm2 start <its script> --name <name>.
nginx/   — the sites that answered on this server; put one back: cp nginx/<name> /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx.
A Fractera node cleared here was erased (step 806-1), not kept.
EOF
fi
FREE_AFTER="$(free_kb)"
python3 - "$BACKUP" "${STOPPED:-0}" "$SITES" "$GONE" "${FREE_BEFORE:-0}" "${FREE_AFTER:-0}" "${LEFT:-}" "${ERASED[@]+"${ERASED[@]}"}" <<'PY'
import json, sys
backup, stopped, sites, nodes, before, after, left, *erased = sys.argv[1:]
try:
    left = json.loads(left) if left else {}
except Exception:
    left = {}
erased += left.get("erased") or []
gb = lambda kb: round(int(kb or 0) / 1048576, 1)
print(json.dumps({"backup": backup or None, "stopped": int(stopped or 0), "sites": [s for s in sites.split(",") if s],
                  "nodes": [s for s in nodes.split(",") if s], "erased": erased, "docker": left.get("docker"),
                  "purged": left.get("purged") or [], "pm2Killed": left.get("pm2Killed") or [], "foreignListening": left.get("foreignListening") or [],
                  "freedGb": max(0.0, round(gb(after) - gb(before), 1)), "freeGb": gb(after)}))
PY
