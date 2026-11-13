#!/usr/bin/env bash
# THE SERVER IS CHECKED BEFORE ANY WORK (node step 737-4). Run as root over SSH, seconds, changes nothing; prints ONE JSON line.
# ✓ Lesson of the Fractera easy starter (lib/bootstrap.sh, 2026-08-23): the hardware is named BEFORE the work — an install that died at
# 33 % with code 137 (out of memory) taught that a measured warning in advance beats a cut-off later. The node compares these numbers
# with its own measured needs (737-research.md § D: ≈2.3 GB resident) and the size of its copy; a weak server is a warning with
# numbers, never a silent refusal.
# Arguments: [node folder name] [ssh port]
FOLDER="${1:-web4-node-starter-kit}"
SSH_PORT="${2:-22}"
. /etc/os-release 2>/dev/null
busy() { ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q . && echo true || echo false; }
OS_ID="${ID:-unknown}" OS_VERSION="${VERSION_ID:-}" OS_PRETTY="${PRETTY_NAME:-Linux}" ARCH="$(uname -m)" \
CORES="$(nproc 2>/dev/null || echo 1)" \
RAM_MB="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
SWAP_MB="$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
DISK_FREE_GB="$(df -BG --output=avail /home 2>/dev/null | tail -1 | tr -dc '0-9')" \
IPV6="$([ -f /proc/net/if_inet6 ] && echo true || echo false)" \
PORT80="$(busy 80)" PORT443="$(busy 443)" \
NGINX="$(command -v nginx >/dev/null && echo true || echo false)" \
SYSTEMD="$([ -d /run/systemd/system ] && echo true || echo false)" \
NODE_VERSION="$(node --version 2>/dev/null || true)" \
PUBLIC_IP="$(curl -s --max-time 6 https://api.ipify.org 2>/dev/null || true)" \
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
  "cores": n("CORES"), "ramMb": n("RAM_MB"), "swapMb": n("SWAP_MB"), "diskFreeGb": n("DISK_FREE_GB"),
  "ipv6": b("IPV6"), "port80Busy": b("PORT80"), "port443Busy": b("PORT443"), "nginx": b("NGINX"), "systemd": b("SYSTEMD"),
  "nodeVersion": e.get("NODE_VERSION") or None, "publicIp": e.get("PUBLIC_IP") or None, "nodeThere": b("NODE_THERE"),
  "ufw": e["UFW"], "sshPort": n("SSH_PORT"),
}))'
