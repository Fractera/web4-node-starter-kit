#!/usr/bin/env bash
# THE SERVER IS CHECKED BEFORE ANY WORK (node step 737-4). Run as root over SSH, seconds, changes nothing; prints ONE JSON line.
# ✓ Lesson of the Fractera easy starter (lib/bootstrap.sh, 2026-08-23): the hardware is named BEFORE the work — an install that died at
# 33 % with code 137 (out of memory) taught that a measured warning in advance beats a cut-off later. The node compares these numbers
# with its own measured needs (737-research.md § D: ≈2.3 GB resident) and the size of its copy; a weak server is a warning with
# numbers, never a silent refusal.
# ✗ Paid 2026-11-13 on the owner's test server: an earlier Fractera install lived there (12 pm2 processes of root, nginx sites
# «fractera» and «fractera-custom» on 80/443) and the probe said «ports ok» because nginx held them — prepare would have overwritten
# that install's nginx site of the same name. Now the probe names every nginx site that is not the node's own and the processes root's
# pm2 runs, and measures the memory AVAILABLE, not the total. pm2's own modules (pm2-logrotate) are not programs of an install: they
# stay after `pm2 delete all` and once made a freed server read «busy» again (the owner's run, 2026-11-13 16:26).
# 738-3 (the owner, 2026-11-14: «ты получишь состояние установлено ли уже Fractera …, если установлена то какая версия … насколько она
# отстает. От этого строится стратегия»): an install found here is measured ON THE SERVER — its commit, and how far it is from Fractera's
# main: `git fetch` of Fractera's main by the node's user, then `rev-list --left-right --count` (measured on 213.199.61.7: 1.4 s). A copy
# of a computer runs a commit GitHub never saw (compare → 404), so only the server itself can count. The fetch runs as the node's user:
# root's files in its .git would break the node's own updates later.
# The answer is ALSO kept on the server (`/root/.fractera/probe.json`) — the state of a server lives on that server, never on the computer.
# Arguments: [node folder name] [ssh port] [where to keep the answer]
FOLDER="${1:-web4-node-starter-kit}"
SSH_PORT="${2:-22}"
OUT="${3:-}"
NODE_DIR="/home/fractera/$FOLDER"
HEAD_SHA="" AHEAD="" BEHIND="" PHASE=""
if [ -d "$NODE_DIR/.git" ] && [ "${DRY_RUN:-0}" != 1 ] && id -u fractera >/dev/null 2>&1 && command -v runuser >/dev/null 2>&1; then
  HEAD_SHA="$(runuser -u fractera -- git -C "$NODE_DIR" rev-parse HEAD 2>/dev/null)"
  if timeout 40 runuser -u fractera -- git -C "$NODE_DIR" fetch --quiet https://github.com/Fractera/web4-node-starter-kit.git main >/dev/null 2>&1; then
    read -r AHEAD BEHIND <<< "$(runuser -u fractera -- git -C "$NODE_DIR" rev-list --left-right --count HEAD...FETCH_HEAD 2>/dev/null)"
  fi
  PHASE="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("phase") or "")' "$NODE_DIR/data/node/server.json" 2>/dev/null)"
fi
. /etc/os-release 2>/dev/null
busy() { ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q . && echo true || echo false; }
OS_ID="${ID:-unknown}" OS_VERSION="${VERSION_ID:-}" OS_PRETTY="${PRETTY_NAME:-Linux}" ARCH="$(uname -m)" \
CORES="$(nproc 2>/dev/null || echo 1)" \
RAM_MB="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
AVAIL_MB="$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
SWAP_MB="$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
DISK_FREE_GB="$(df -BG --output=avail /home 2>/dev/null | tail -1 | tr -dc '0-9')" \
IPV6="$([ -f /proc/net/if_inet6 ] && echo true || echo false)" \
PORT80="$(busy 80)" PORT443="$(busy 443)" \
NGINX="$(command -v nginx >/dev/null && echo true || echo false)" \
FOREIGN_SITES="$(for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do [ -f "$f" ] || continue; grep -q 'Managed by the Fractera node (step 737)' "$f" && continue; basename "$f"; done 2>/dev/null | paste -sd, -)" \
PM2_ROOT="$( (command -v pm2 >/dev/null && pm2 jlist 2>/dev/null | python3 -c 'import json,sys; t=sys.stdin.read(); print(len([p for p in json.loads(t[t.index("["):]) if not p.get("pm2_env", {}).get("pmx_module")])))') 2>/dev/null || echo 0)" \
SYSTEMD="$([ -d /run/systemd/system ] && echo true || echo false)" \
NODE_VERSION="$(node --version 2>/dev/null || true)" \
PUBLIC_IP="$([ "${DRY_RUN:-0}" = 1 ] || curl -s --max-time 6 https://api.ipify.org 2>/dev/null || true)" \
NODE_THERE="$([ -d "/home/fractera/$FOLDER" ] && echo true || echo false)" \
UFW="$(ufw status 2>/dev/null | head -1 | grep -qi active && echo active || echo inactive)" \
SSH_PORT="$SSH_PORT" HEAD_SHA="$HEAD_SHA" AHEAD="$AHEAD" BEHIND="$BEHIND" PHASE="$PHASE" \
LAUNCHING="$(pgrep -f '[f]ractera/launch.sh' >/dev/null 2>&1 && echo true || echo false)" \
python3 -c '
import json, os
e = os.environ
b = lambda k: e.get(k) == "true"
n = lambda k: int(e.get(k) or 0)
print(json.dumps({
  "os": {"id": e["OS_ID"], "version": e["OS_VERSION"], "pretty": e["OS_PRETTY"], "arch": e["ARCH"]},
  "cores": n("CORES"), "ramMb": n("RAM_MB"), "availMb": n("AVAIL_MB"), "swapMb": n("SWAP_MB"), "diskFreeGb": n("DISK_FREE_GB"),
  "ipv6": b("IPV6"), "port80Busy": b("PORT80"), "port443Busy": b("PORT443"), "nginx": b("NGINX"), "systemd": b("SYSTEMD"),
  "nodeVersion": e.get("NODE_VERSION") or None, "publicIp": e.get("PUBLIC_IP") or None, "nodeThere": b("NODE_THERE"),
  "ufw": e["UFW"], "sshPort": n("SSH_PORT"),
  "foreignSites": [x for x in (e.get("FOREIGN_SITES") or "").split(",") if x], "pm2Root": n("PM2_ROOT"),
  "fractera": {"head": e.get("HEAD_SHA") or None, "ahead": int(e["AHEAD"]) if e.get("AHEAD", "").isdigit() else None,
               "behind": int(e["BEHIND"]) if e.get("BEHIND", "").isdigit() else None, "phase": e.get("PHASE") or None,
               "launching": b("LAUNCHING")} if b("NODE_THERE") else None,
  "at": __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime()),
}))' | { if [ -n "$OUT" ]; then tee "$OUT.tmp" && mv "$OUT.tmp" "$OUT"; else cat; fi; }
