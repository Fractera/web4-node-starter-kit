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
    # ✗ 2026-11-25…27, CI windows-latest red on every push: on Windows signal 0 IS CTRL_C_EVENT, and os.kill(0, 0) sent Ctrl+C to every
    # process of the console — the test runner died with exit 1 and no line. No pid recorded keeps the old answer of kill(0, 0) on Linux
    # (the group is alive); this script runs on the Ubuntu server, so on Windows (the CI's copy only) nothing is ever signalled.
    try:
        pid = int(pid)
    except Exception:
        return False
    if pid <= 0 or os.name == "nt":
        return True
    try:
        os.kill(pid, 0)
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
# 806-7 ✗ 2026-11-19 18:56–19:37: the row «launch» itself is «running» for the whole launch and stood first — the running stage read as
# «launch», which has no steps of its own, so the page showed no step of the install for 41 minutes. The launch row is never the stage.
running = next((s["id"] for s in progress if s.get("state") == "running" and s["id"] != "launch"), None) or next((s["id"] for s in progress if s.get("state") == "failed" and s["id"] != "launch"), None)
sub = stages(SUB[running]) if running in SUB else []
update = read(os.path.join(node, "data", "node", "node-update.json")) if running == "update" else None
# 784 ✗ 2026-11-18 16:07 (the install stopped and nobody — the page, the computer — could see why): a failed launch carries the last
# lines of the failed stage's own log, secrets masked (bot tokens, long keys), so the page and the computer's main agent read the reason.
import re
def tail(path, n=60):
    try:
        with open(path, errors="replace") as f:
            lines = f.read().splitlines()[-n:]
    except Exception:
        return None
    text = "\n".join(lines)
    text = re.sub(r"\d{6,}:[A-Za-z0-9_-]{30,}", "[token]", text)
    text = re.sub(r"[A-Za-z0-9_\-+/]{40,}", "[secret]", text)
    return text[-6000:]
LOGS = {"prepare": os.path.join(d, "prepare.log"), "install": os.path.join(node, "logs", "dedicated-server", "install.log"), "start": os.path.join(node, "logs", "dedicated-server", "start-live.log")}
fail_tail = None
if launch and launch.get("state") == "failed":
    failed = launch.get("failed") or running
    fail_tail = {"stage": failed, "log": tail(LOGS.get(failed, "")) if failed in LOGS else None, "out": tail(os.path.join(d, "launch.out"), 30)}
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
# 744-9: an element off by the server node's registry (`off`, step 567) — nginx holds its name with 503 by design; its row says so,
# and the computer's final check does not wait for its HTTPS (lib/hosting/final-check.mjs httpsDue). Read here, not trusted from the
# server node's code: a server installed before 744-9 does not mark it.
if isinstance(core, dict) and isinstance(core.get("rows"), list) and core.get("zone"):
    reg = read(os.path.join(node, "WEB4-ITEMS-REGISTRY", "web4-items.json")) or {}
    off = {f"{(e.get('address') or e.get('id'))}.{core['zone']}" for e in (reg.get("services") or []) if isinstance(e, dict) and isinstance(e.get("off"), dict)}
    for r in core["rows"]:
        if isinstance(r, dict):
            r["off"] = r.get("host") in off
print(json.dumps({
    "probe": read(os.path.join(d, "probe.json")),
    "preflight": read(os.path.join(d, "preflight.json")),
    "launch": launch,
    "progress": progress,
    "sub": sub,
    "failTail": fail_tail,
    "update": {k: update.get(k) for k in ("state", "stage", "summary", "reason")} if isinstance(update, dict) else None,
    "domain": read(os.path.join(d, "domain.json")),
    "mark": {k: mark.get(k) for k in ("phase", "domain", "domainWay", "domainActive", "ip", "at")} if isinstance(mark, dict) else None,
    "core": core,
    "nodeThere": os.path.isdir(os.path.join(node, ".git")),
}))
PY
