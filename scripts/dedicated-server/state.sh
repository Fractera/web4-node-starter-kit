#!/usr/bin/env bash
# THE STATE OF ONE SERVER, READ ON THAT SERVER (node step 738-4). Run as root over SSH by the computer's launch runner; reads only,
# under a second; prints ONE JSON line.
# 🔒 THE STATE OF A SERVER LIVES ON THE SERVER (the owner, 2026-11-14: «в данном локальном компьютере меняться ничего не должно … в
# любой момент перезагрузить эту страницу и пока идёт какой-то из процессов начать работать со вторым … с 10-м и с 100-м сервером»):
# the computer keeps no record of a launch — the page asks the server by its IP, and the server answers from its own files:
#   /root/.fractera/probe.json             the last check of the server (probe.sh), its Fractera version included
#   /root/.fractera/launch.json            the launch: running · done · failed, its mode, times, the version it ended on (launch.sh)
#   /root/.fractera/launch.progress.jsonl  the launch's stages; the running stage's own steps come from its script's progress file
#   /root/.fractera/domain.json            the domain chosen on the page, where its DNS lives, who writes the records, the first check
#   <node>/data/node/server.json           the server node's own mark (phase, domain, switched on)
#   the server node's door /api/node/server/domain on loopback — its names, records, certificates and HTTPS, measured there (737-8)
# Arguments: [node folder name] [the launch folder]
FOLDER="${1:-web4-node-starter-kit}"
DIR="${2:-/root/.fractera}"
NODE_DIR="/home/fractera/$FOLDER"
[ "${STATE_NODE_DIR:-}" ] && NODE_DIR="$STATE_NODE_DIR"
python3 - "$DIR" "$NODE_DIR" <<'PY'
import json, os, subprocess, sys

d, node = sys.argv[1], sys.argv[2]

def read(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None

def stages(path):
    order, last = [], {}
    try:
        with open(path) as f:
            for line in f:
                try:
                    s = json.loads(line)
                except Exception:
                    continue
                if not isinstance(s, dict) or not isinstance(s.get("id"), str):
                    continue
                if s["id"] not in last:
                    order.append(s["id"])
                last[s["id"]] = s
    except Exception:
        return []
    return [last[i] for i in order]

def alive(pid):
    try:
        os.kill(int(pid), 0)
        return True
    except Exception:
        return False

launch = read(os.path.join(d, "launch.json"))
if launch and launch.get("state") == "running" and not alive(launch.get("pid") or 0):
    launch["state"] = "failed"
    launch["detail"] = launch.get("detail") or "the launch stopped without its last line"
progress = stages(os.path.join(d, "launch.progress.jsonl"))
# The steps of the stage that runs now, from its own script: prepare as root, install and start as the node's user, an update by node:update.
SUB = {
    "prepare": os.path.join(d, "prepare.progress.jsonl"),
    "install": os.path.join(node, "logs", "dedicated-server", "install.progress.jsonl"),
    "start": os.path.join(node, "logs", "dedicated-server", "start-live.progress.jsonl"),
}
# The stage that runs — or the one that failed: its own steps name what stopped it.
running = next((s["id"] for s in progress if s.get("state") == "running"), None) or next((s["id"] for s in progress if s.get("state") == "failed" and s["id"] != "launch"), None)
sub = stages(SUB[running]) if running in SUB else []
update = read(os.path.join(node, "data", "node", "node-update.json")) if running == "update" else None
mark = read(os.path.join(node, "data", "node", "server.json"))
core = None
runtime = read(os.path.join(node, "logs", "runtime.json")) or {}
port = runtime.get("port")
if mark and mark.get("phase") == "live" and isinstance(port, int):
    try:
        out = subprocess.run(["curl", "-s", "--max-time", "8", f"http://localhost:{port}/api/node/server/domain"], capture_output=True, text=True, timeout=12).stdout
        core = json.loads(out) if out.strip().startswith("{") else None
    except Exception:
        core = None
print(json.dumps({
    "probe": read(os.path.join(d, "probe.json")),
    "launch": launch,
    "progress": progress,
    "sub": sub,
    "update": {k: update.get(k) for k in ("state", "stage", "summary", "reason")} if isinstance(update, dict) else None,
    "domain": read(os.path.join(d, "domain.json")),
    "mark": {k: mark.get(k) for k in ("phase", "domain", "domainWay", "domainActive", "ip", "at")} if isinstance(mark, dict) else None,
    "core": core,
    "nodeThere": os.path.isdir(os.path.join(node, ".git")),
}))
PY
