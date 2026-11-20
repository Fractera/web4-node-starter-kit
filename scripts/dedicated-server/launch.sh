#!/usr/bin/env bash
# A FRACTERA NODE IS LAUNCHED ON THIS SERVER (node step 738-3). Run as root, detached, by the launch runner of the person's computer
# (`scripts/dedicated-server/launch.mjs install`); uploaded into /root/.fractera/ with prepare.sh, stages.sh and fractera-root.sh.
# 🔒 A LAUNCH, NEVER A MOVE (the owner, 2026-11-14: «Никакого переезда нет есть просто запуск сервера … в данном локальном компьютере
# меняться ничего не должно»): the server gets a FRESH node from the person's fork on GitHub — its own identity, its own keys, no data of
# the computer (D21; a copy of a computer runs a commit GitHub never saw, so its version could never be compared). The computer is not
# stopped, not rebuilt, not marked: it only watches this file.
# 🔒 THE STATE IS THIS SERVER'S: /root/.fractera/launch.json (running · done · failed) and launch.progress.jsonl (one line per stage);
# the page of any computer whose browser holds a visit to this server (744-3) reads them by this server's IP (`state.sh`). A second run continues: every stage
# skips what is already done (prepare, the packages, the build — each by its own mark).
#   install — no node here: prepare · source (clone of the fork, a fresh .env.local, the fork checked, the starter's history stripped) ·
#             install (packages, the core's build, every element) · mark · start · version
#   update  — a node is here and behind Fractera: prepare · update (743-5: this computer's stage 0 → the target's own updater: the fork merged, its records kept,
#             the core rebuilt with the closed lid) · mark · start · version
# Arguments: <node user> <node folder> <ssh port> <fork URL> <install|update> <server IP>
# 744-3: no key of the computer is given any more — the computer reaches this server by a visit of a day, never by a stored key.
set -u
NODE_USER="${1:?user}" FOLDER="${2:?folder}" SSH_PORT="${3:?ssh port}" FORK="${4:?fork}" MODE="${5:?install|update}" IP="${6:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
export PROGRESS="$HERE/launch.progress.jsonl" LOG="$HERE/launch.log"
. "$HERE/stages.sh"
NODE_DIR="${LAUNCH_NODE_DIR:-/home/$NODE_USER/$FOLDER}"
STATE="$HERE/launch.json"
bad() { printf '{"state":"failed","mode":"%s","detail":"%s"}\n' "$MODE" "$1" > "$STATE"; exit 2; }
[[ "$NODE_USER" =~ ^[a-z][a-z0-9-]{1,30}$ ]] || bad "bad user name"
[[ "$FOLDER" =~ ^[A-Za-z0-9._-]{1,100}$ ]] || bad "bad folder name"
[[ "$SSH_PORT" =~ ^[0-9]{1,5}$ ]] || bad "bad ssh port"
[[ "$FORK" =~ ^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\.git$ ]] || bad "bad fork address"
[[ "$MODE" = install || "$MODE" = update ]] || bad "mode is install or update"
[[ -z "$IP" || "$IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || bad "bad server address"
: > "$PROGRESS"

# launch.json is written whole and renamed: a reader never sees half a file.
put() { # python3 code that changes the dict `j`
  python3 - "$STATE" "$1" <<'PY'
import json, os, sys, time
path, code = sys.argv[1], sys.argv[2]
try:
    j = json.load(open(path))
except Exception:
    j = {}
now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
exec(code)
tmp = path + ".tmp"
with open(tmp, "w") as f:
    json.dump(j, f, indent=2)
os.replace(tmp, path)
PY
}
put "j.clear(); j.update(state='running', mode='$MODE', pid=$$, startedAt=now, fork='$FORK')"

# The end of the run, whatever stopped it: the state says done or failed and names the stage; a good end carries the version.
finish() {
  local rc="$1"
  put "
st = {}
for line in open('$PROGRESS'):
    try:
        s = json.loads(line)
    except Exception:
        continue
    st[s.get('id')] = s
failed = next((k for k, s in st.items() if s.get('state') == 'failed' and k != 'launch'), None)
v = {}
try:
    v = json.load(open('$HERE/version.json'))
except Exception:
    pass
ok = $rc == 0 and failed is None
j.update(state='done' if ok else 'failed', endedAt=now, failed=failed, detail=(st.get(failed) or {}).get('detail', '')[-400:] if failed else '', version=v or None)
j.pop('pid', None)
"
}
trap 'finish $?' EXIT

# Every act of the node itself runs as its user, in a login shell (its PATH, its HOME, its pm2). The stages call functions: a stage body
# runs in a subshell (`stages.sh`), and functions reach it whole — no command is built by nested quoting.
as_node() { runuser -l "$NODE_USER" -c "$1"; }

# Was this node ever live here? Its own mark (do_mark below) says so; no mark — never.
ever_live() { python3 -c 'import json,sys
try: print(json.load(open(sys.argv[1])).get("phase",""))
except Exception: print("")' "$NODE_DIR/data/node/server.json" 2>/dev/null | grep -qx live; }

do_source() {
  if [ ! -d "$NODE_DIR/.git" ]; then
    # An earlier folder without a node in it is moved aside, never erased.
    if [ -e "$NODE_DIR" ]; then mv "$NODE_DIR" "$NODE_DIR.before-$(date -u +%Y%m%dT%H%M%SZ)"; fi
    as_node "git clone --quiet $FORK $NODE_DIR" || return 1
  elif ! ever_live; then
    # 811-6 (live 2026-11-20 16:03): «Продолжить установку» ran the server's OLD copy of the installer — the fix pushed meanwhile never
    # reached it (only the helpers come from this computer). An install that never went live takes the fork's newest code on every
    # continue: nothing of a person lives in its tracked files yet (data/, logs/, .env.local and the elements are outside git and stay).
    # 🔒 Only when the server's own side since the fork holds nothing but the fresh project's documents; anything else stays as it is.
    as_node "cd $NODE_DIR && git fetch --quiet $FORK main" || return 1
    local own
    own="$(runuser -u "$NODE_USER" -- git -C "$NODE_DIR" diff --name-only FETCH_HEAD...HEAD | grep -v '^development-docs/' | head -1)"
    if [ -z "$own" ]; then
      as_node "cd $NODE_DIR && git reset --quiet --hard FETCH_HEAD && rm -f logs/fresh-project.json" || return 1
      echo "===SOURCE_RENEWED=== $(runuser -u "$NODE_USER" -- git -C "$NODE_DIR" rev-parse --short HEAD) (the install never went live)"
    else
      echo "===SOURCE_KEPT=== the server has its own change outside development-docs ($own) — the code is not renewed"
    fi
  fi
  as_node "cd $NODE_DIR && node scripts/ensure-env.mjs && node scripts/check-origin.mjs && node scripts/fresh-project.mjs"
}

do_update() {
  # 743-5: never the server's own updater — this computer's stage 0 (uploaded beside this script) hands the update to the TARGET's own
  # updater, whatever version the server runs (✗ 2026-11-14: the test server at 97a15ca2 ran its old updater and rolled back at the merge,
  # the 741-8 fix sitting unused in the target). It refuses with a list when someone's own work is uncommitted there, touching nothing.
  # The node's user cannot read this folder: a readable copy for this one run.
  local s0="/tmp/fractera-stage0-$$.mjs"
  install -m 644 "$HERE/node-update-stage0.mjs" "$s0" || return 1
  as_node "cd $NODE_DIR && node $s0 --root $NODE_DIR"
  rm -f "$s0"
  local s
  s="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("state",""))' "$NODE_DIR/data/node/node-update.json" 2>/dev/null)"
  if [ -n "$s" ] && [ "$s" != done ]; then echo "node:update: $s"; return 1; fi
  # The core was just built by the update: the start below must not build it again.
  as_node "cd $NODE_DIR && mkdir -p logs/dedicated-server && git rev-parse HEAD > logs/dedicated-server/build.sha"
}

# The server node's mark: live, its own (independent) node, the address it is reached by, and the domain chosen on the page — unless a
# domain is already switched on there (the server's own panel owns it then).
do_mark() {
  python3 - "$NODE_DIR/data/node/server.json" "$HERE/domain.json" "$IP" "$SSH_PORT" "$NODE_USER" "$FOLDER" <<'PY' || return 1
import json, os, sys, time
path, dom, ip, port, user, folder = sys.argv[1:7]
try:
    m = json.load(open(path))
except Exception:
    m = {}
try:
    d = json.load(open(dom))
except Exception:
    d = {}
m.update(phase="live", independent=True, ip=ip or m.get("ip"), sshPort=int(port), user=user, folder=folder, at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
if d.get("domain") and m.get("domainActive") is not True:
    m["domain"] = d["domain"]
    if d.get("way"):
        m["domainWay"] = d["way"]
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(m, f, indent=2)
PY
  chown -R "$NODE_USER:$NODE_USER" "$NODE_DIR/data/node"
}

# The version the server ended on, measured here against Fractera's main (the same count as the check of the server, probe.sh).
do_version() {
  local head ahead="" behind=""
  head="$(runuser -u "$NODE_USER" -- git -C "$NODE_DIR" rev-parse HEAD)" || return 1
  if timeout 40 runuser -u "$NODE_USER" -- git -C "$NODE_DIR" fetch --quiet https://github.com/Fractera/web4-node-starter-kit.git main; then
    read -r ahead behind <<< "$(runuser -u "$NODE_USER" -- git -C "$NODE_DIR" rev-list --left-right --count HEAD...FETCH_HEAD)"
  fi
  printf '{"head":"%s","ahead":%s,"behind":%s}\n' "$head" "${ahead:-null}" "${behind:-null}" > "$HERE/version.json"
}

emit launch running
stage prepare "bash '$HERE/prepare.sh' '$NODE_USER' '$FOLDER' '$SSH_PORT'"
if [ "$MODE" = install ]; then
  stage source do_source
  stage install "as_node 'bash $NODE_DIR/scripts/dedicated-server/install.sh'"
else
  stage update do_update
fi
stage mark do_mark
stage start "as_node 'bash $NODE_DIR/scripts/dedicated-server/start.sh live'"
stage version do_version
emit launch done
