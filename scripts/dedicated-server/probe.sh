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
# Arguments: [node folder name] [ssh port]
FOLDER="${1:-web4-node-starter-kit}"
SSH_PORT="${2:-22}"
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
SSH_PORT="$SSH_PORT" \
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
}))'
