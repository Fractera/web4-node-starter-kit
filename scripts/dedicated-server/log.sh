#!/usr/bin/env bash
# THE LIVE READER OF A SERVER'S INSTALL (node step 806-3). Run as root over SSH by the computer's launch runner (`launch.mjs log`), every
# few seconds while the page follows a launch; reads, under a second, and prints ONE JSON line.
# The owner, 2026-11-19: «ты можешь создать какой-то внешний чтец и показывать этот процесс установки сервера так как ты показываешь все
# процессы когда например собирается наш проект что-то вроде терминала? Я хочу видеть что что-то происходит» · «подними терминал и пусть
# отдельный чтец тебе возвращает живой файлы». ✗ 2026-11-19 18:56–19:37: the install ran 41 minutes and the page showed one line
# «install · running» — nobody could tell work from a hang.
# 🔒 NO PORT IS OPENED ON THE SERVER: the reader is this script, asked through the same SSH visit as every act of the page — it works while
# the server's node, its nginx and its sites are down (the core's build reader, lib/deploy/build-reader.cjs, through SSH).
# What it answers:
#   lines    the last lines of the log of the stage that runs now (or ran last): prepare · the launch's own · install · the update · start;
#            secrets masked as in state.sh
#   steps    the checklist — the launch's stages, the running stage's own steps, one line per element of `services:install` (its header
#            line carries the time, scripts/services-install.mjs) — each with its start, end, seconds, and the seconds of the last run
#   quietSec how long that log has not grown; cpuPct — the processor's load over half a second: a quiet log on a busy processor is a long
#            step without output (npm ci), a quiet log on an idle one is a hang
# 🔒 THE STOPWATCH: a finished launch's seconds per line go into `<dir>/timings.json` (kept by the clear, 806-1) — the next run shows
# «last time N min» beside each line. That is the only file this reader writes.
# Arguments: [node folder name] [the launch folder]
FOLDER="${1:-web4-node-starter-kit}"
DIR="${2:-/root/.fractera}"
NODE_DIR="/home/fractera/$FOLDER"
[ "${STATE_NODE_DIR:-}" ] && NODE_DIR="$STATE_NODE_DIR"
python3 - "$DIR" "$NODE_DIR" <<'PY'
import calendar, json, os, re, sys, time

d, node = sys.argv[1], sys.argv[2]
now = time.time()

def read(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None

def epoch(at):
    try:
        return calendar.timegm(time.strptime(at, "%Y-%m-%dT%H:%M:%SZ"))
    except Exception:
        return None

def stages(path):
    """Every id once, in its first order: its first «running», its last state and time."""
    order, rows = [], {}
    try:
        with open(path, errors="replace") as f:
            for line in f:
                try:
                    s = json.loads(line)
                except Exception:
                    continue
                if not isinstance(s, dict) or not isinstance(s.get("id"), str):
                    continue
                i = s["id"]
                r = rows.get(i)
                if r is None:
                    order.append(i)
                    r = rows[i] = {"id": i, "state": s.get("state"), "start": epoch(s.get("at") or ""), "end": None, "detail": ""}
                r["state"] = s.get("state")
                if s.get("state") == "running":
                    r["start"] = r["start"] or epoch(s.get("at") or "")
                else:
                    r["end"] = epoch(s.get("at") or "")
                    r["detail"] = (s.get("detail") or "")[-300:]
    except Exception:
        return []
    return [rows[i] for i in order]

def tail(path, n=150):
    try:
        with open(path, "rb") as f:
            f.seek(0, 2)
            size = f.tell()
            f.seek(max(0, size - 200_000))
            text = f.read().decode("utf-8", "replace")
    except Exception:
        return None, 0, None
    lines = [l[-400:] for l in text.splitlines()[-n:]]
    out = "\n".join(lines)
    out = re.sub(r"\d{6,}:[A-Za-z0-9_-]{30,}", "[token]", out)
    out = re.sub(r"[A-Za-z0-9_\-+/]{40,}", "[secret]", out)
    try:
        mtime = os.path.getmtime(path)
    except Exception:
        mtime = None
    return out.split("\n") if out else [], size, mtime

# a server on an older core prints the header without its time: the element is still a line, only its seconds are unknown
HEADER = re.compile(r"^── (\S+) — .*?(?: · (\d\d):(\d\d):(\d\d))?$")

def elements(log_path, parent):
    """One line per element of the last `services:install` in this log; `parent` — the step that ran it (its start, end and state):
    the last element runs while its parent runs, every other one ended where the next began."""
    since = parent.get("start")
    try:
        with open(log_path, errors="replace") as f:
            text = f.read()
    except Exception:
        return []
    # only the run of this stage: the text after the last «### <time> elements:» line
    k = text.rfind(" elements: npm run services:install")
    if k >= 0:
        text = text[text.rfind("\n", 0, k) + 1:]
    rows, cur = [], None
    day = time.strftime("%Y-%m-%d", time.gmtime(since or now))
    last = None
    for line in text.splitlines():
        m = HEADER.match(line)
        if m:
            t = epoch(f"{day}T{m.group(2)}:{m.group(3)}:{m.group(4)}Z") if m.group(2) else None
            if t is not None and last is not None and t < last - 3600:  # past midnight
                t += 86400
            last = t
            if cur:
                cur["end"] = t
            cur = {"id": m.group(1), "state": "done", "start": t, "end": None, "detail": ""}
            rows.append(cur)
        elif cur and "ОШИБКА" in line:
            cur["state"] = "failed"
            cur["detail"] = line.strip()[-300:]
    if rows and rows[-1]["end"] is None:
        if parent.get("state") == "running":
            rows[-1]["state"] = "failed" if rows[-1]["state"] == "failed" else "running"
        else:
            rows[-1]["end"] = parent.get("end")
    return rows

launch = read(os.path.join(d, "launch.json")) or {}
top = stages(os.path.join(d, "launch.progress.jsonl"))
SUB = {
    "prepare": (os.path.join(d, "prepare.progress.jsonl"), os.path.join(d, "prepare.log")),
    "install": (os.path.join(node, "logs", "dedicated-server", "install.progress.jsonl"), os.path.join(node, "logs", "dedicated-server", "install.log")),
    "start": (os.path.join(node, "logs", "dedicated-server", "start-live.progress.jsonl"), os.path.join(node, "logs", "dedicated-server", "start-live.log")),
    "update": (None, os.path.join(node, "logs", "node-update.log")),
}
LAUNCH_LOG = os.path.join(d, "launch.log")

steps = []
current = None  # the stage whose log is shown
for s in top:
    if s["id"] == "launch":
        continue
    steps.append({**s, "kind": "stage", "parent": None})
    if s["state"] in ("running", "failed"):
        current = current or s["id"]
    sub = SUB.get(s["id"])
    if sub and sub[0] and os.path.exists(sub[0]):
        for x in stages(sub[0]):
            if x["id"] in ("prepare", "install", "start"):
                continue
            steps.append({**x, "kind": "sub", "parent": s["id"]})
            if x["id"] == "elements":
                for e in elements(sub[1], x):
                    steps.append({**e, "kind": "element", "parent": f"{s['id']}/elements"})
    elif s["id"] == "update" and sub:
        for e in elements(sub[1], s):
            steps.append({**e, "kind": "element", "parent": "update"})
if current is None:
    last = [s for s in top if s["id"] != "launch"]
    current = last[-1]["id"] if last else None
# the stopwatch of the last finished run
timings = read(os.path.join(d, "timings.json")) or {}
prev = timings.get("sec") or {}
def key(x):
    return f"{x['kind']}:{x.get('parent') or ''}:{x['id']}"
for x in steps:
    end = x["end"] or (now if x["state"] == "running" else None)
    x["sec"] = int(end - x["start"]) if x["start"] and end else None
    x["lastSec"] = prev.get(key(x))
    x["startedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(x["start"])) if x["start"] else None
    x.pop("start", None); x.pop("end", None)
if launch.get("state") == "done" and launch.get("startedAt") and timings.get("run") != launch.get("startedAt"):
    try:
        tmp = os.path.join(d, "timings.json.tmp")
        with open(tmp, "w") as f:
            json.dump({"run": launch.get("startedAt"), "mode": launch.get("mode"), "sec": {key(x): x["sec"] for x in steps if x["sec"] is not None and x["state"] == "done"}}, f)
        os.replace(tmp, os.path.join(d, "timings.json"))
    except Exception:
        pass

log_path = (SUB.get(current) or (None, LAUNCH_LOG))[1] if current else LAUNCH_LOG
lines, size, mtime = tail(log_path)
if lines is None:
    lines, size, mtime = tail(LAUNCH_LOG)
    log_path = LAUNCH_LOG

def cpu():
    def sample():
        with open("/proc/stat") as f:
            v = [int(x) for x in f.readline().split()[1:]]
        return sum(v), v[3] + (v[4] if len(v) > 4 else 0)
    try:
        t1, i1 = sample(); time.sleep(0.5); t2, i2 = sample()
        return round(100 * (1 - (i2 - i1) / max(1, t2 - t1)))
    except Exception:
        return None

def mem():
    try:
        with open("/proc/meminfo") as f:
            m = dict(l.split(":", 1) for l in f)
        return int(m["MemAvailable"].split()[0]) // 1024
    except Exception:
        return None

def disk():
    try:
        st = os.statvfs("/home" if os.path.isdir("/home") else "/")
        return round(st.f_bavail * st.f_frsize / 1073741824, 1)
    except Exception:
        return None

print(json.dumps({
    "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
    "launch": {k: launch.get(k) for k in ("state", "mode", "startedAt", "endedAt", "failed")} if launch else None,
    "stage": current,
    "file": os.path.basename(log_path),
    "size": size,
    "quietSec": int(now - mtime) if mtime else None,
    "cpuPct": cpu(),
    "memAvailMb": mem(),
    "diskFreeGb": disk(),
    "lines": lines or [],
    "steps": steps,
}))
PY
