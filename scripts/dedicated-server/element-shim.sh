#!/usr/bin/env bash
# THE NODE'S HANDLE ON A WALLED ELEMENT'S SERVER (node step 811-4). pm2 runs this as the node's user in place of the element's program
# (`lib/hosting/element-wall.cjs` serveApp → ecosystem.config.cjs): it starts the element as the transient unit fractera-el-<id>-serve
# through the root helper (as fe-<id>), copies the unit's output to pm2's log, and stops the unit when pm2 stops or restarts it.
# 🔒 WHY NOT pm2 → sudo → the element: pm2's stop and its SIGKILL would hit a root process the node's user may not signal, and an element
# left behind keeps its port. Here pm2 only ever signals its own user's bash; systemd stops the element's whole group.
# The unit ending by itself (a crash) ends this script with 1 — pm2 restarts it as before (autorestart, backoff).
# Args: <id> [unit-start arguments: --in <sub> KEY=VALUE … -- <program> …]
set -u
id="${1:?id}"; shift
H=/usr/local/sbin/fractera-element
unit="fractera-el-$id-serve"
tailpid=""
stop() { sudo -n "$H" unit-stop "$id" >/dev/null 2>&1; [ -n "$tailpid" ] && kill "$tailpid" 2>/dev/null; exit 0; }
trap stop TERM INT HUP
sudo -n "$H" unit-start "$id" "$@" || exit 1
tail -n +1 -F "/var/log/fractera-el/$id-serve.log" 2>/dev/null & tailpid=$!
# systemctl is-active needs no privileges; the sleep runs in the background so a signal is handled at once
while systemctl is-active --quiet "$unit"; do sleep 3 & wait $!; done
kill "$tailpid" 2>/dev/null
echo "the unit $unit ended by itself"
exit 1
