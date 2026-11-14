#!/usr/bin/env bash
# 744 probe 3 — is the server's node related to THIS computer's Fractera, and how far behind is it — against its fork and the original?
# Read-only, over the node's key of today (744-3 removes it; after that the same reads come from probe.sh through the visit key).
# Usage: server-relation.sh <node root> <server ip>
R="$1"; IP="$2"; K=(-i "$R/data/node/server/id_ed25519" -o "UserKnownHostsFile=$R/data/node/server/known_hosts" -o BatchMode=yes)
echo "this computer's fork: $(python3 -c 'import json,sys;print(json.load(open(sys.argv[1])).get("url"))' "$R/logs/origin.json")"
ssh "${K[@]}" "root@$IP" 'N=/home/fractera/web4-node-starter-kit; cd $N || exit; u() { runuser -u fractera -- "$@"; }
echo "server node origin: $(u git remote get-url origin)"
u git fetch -q origin main 2>/dev/null; echo "vs its fork:      ahead/behind $(u git rev-list --left-right --count HEAD...origin/main)"
u git fetch -q https://github.com/Fractera/web4-node-starter-kit.git main 2>/dev/null; echo "vs the original:  ahead/behind $(u git rev-list --left-right --count HEAD...FETCH_HEAD)"
python3 -c "import json;m=json.load(open(\"$N/data/node/server.json\"));print(\"mark:\", {k:m.get(k) for k in (\"from\",\"movedAt\",\"domain\",\"domainWay\",\"phase\")})"
echo "authorized_keys: $(grep -c . /root/.ssh/authorized_keys) lines; ours: $(grep -c "fractera-node\|fractera-visit" /root/.ssh/authorized_keys)"
sshd -T 2>/dev/null | grep -E "^(passwordauthentication|permitrootlogin) "; ssh -V 2>&1; date "+server clock %Y-%m-%d %H:%M %Z"'
