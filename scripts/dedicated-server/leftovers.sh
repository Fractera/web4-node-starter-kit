#!/usr/bin/env bash
# WHAT EARLIER INSTALLERS LEFT ON A SERVER, ERASED (node step 806-8). Run as root over SSH after the person's confirm on the page.
# The owner, 2026-11-19, to «Easy Starter in /opt/fractera* (11 GB) and Docker in /var/lib/containerd (9 GB) — erase them for good?»:
# «yes of course 100%». Measured that day on his test server after a clean of the node: 74 of 145 GB used, the node itself 3.
# ERASED: the Fractera Easy Starter's own trees (its wipe list, Fractera/fractera-easy-starter lib/wipe-script.ts: /opt/fractera,
# /opt/fractera-main, /opt/hermes-webui, /usr/local/lib/hermes-agent, root's ~/.hermes, ~/.bun, uv's share and cache), root's caches
# (~/.cache, npm's _cacache), and Docker's unused images, containers, networks and volumes (`docker system prune -af --volumes` — a
# running container and what it uses stay).
# 🔒 NEVER TOUCHED: this node (/home/fractera), /etc/fractera (the node's own settings and certificates — prepare.sh), /etc/letsencrypt,
# /root/.ssh, the swap file, the system's journals. Works beside a running install: nothing of the node is named here.
# Prints ONE JSON line: { erased, docker, freedGb, freeGb }. Test roots: LEFT_ROOT (default /), LEFT_TEST=1 runs no docker.
set -u
R="${LEFT_ROOT:-}"
free_kb() { df -Pk "${R:-/}" 2>/dev/null | awk 'NR==2 {print $4}'; }
BEFORE="$(free_kb)"
ERASED=()
erase() { [ -e "$1" ] || [ -L "$1" ] || return 0; rm -rf -- "$1" && ERASED+=("$1"); }
for p in /opt/fractera /opt/fractera-main /opt/hermes-webui /usr/local/lib/hermes-agent /root/.hermes /root/.bun /root/.local/share/uv /root/.cache /root/.npm/_cacache; do
  erase "$R$p"
done
DOCKER="none"
if [ "${LEFT_TEST:-0}" != 1 ] && command -v docker >/dev/null 2>&1; then
  if docker system prune -af --volumes >/dev/null 2>&1; then DOCKER="pruned"; else DOCKER="failed"; fi
fi
AFTER="$(free_kb)"
python3 - "$DOCKER" "${BEFORE:-0}" "${AFTER:-0}" "${ERASED[@]+"${ERASED[@]}"}" <<'PY'
import json, sys
docker, before, after, *erased = sys.argv[1:]
gb = lambda kb: round(int(kb or 0) / 1048576, 1)
print(json.dumps({"erased": erased, "docker": docker, "freedGb": max(0.0, round(gb(after) - gb(before), 1)), "freeGb": gb(after)}))
PY
