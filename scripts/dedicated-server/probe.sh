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
# 744-3: OUR access, read from root's authorized_keys — the deadlines of the visits (the server's own `expiry-time`, its zone → UTC),
# whether the persistent node key of before 744-3 is still there, and how many other keys exist (a count only — never a foreign key).
# Arguments: [node folder name] [ssh port] [where to keep the answer]
FOLDER="${1:-web4-node-starter-kit}"
SSH_PORT="${2:-22}"
OUT="${3:-}"
NODE_DIR="/home/fractera/$FOLDER"
# 744-4 (D49, D52): WHO this node is — its origin (the fork it follows, credentials stripped), a 737 move's trace in its mark (`from`,
# `movedAt`: a copy of another computer, not a node launched from a fork) — and «behind» counted against ITS OWN FORK's main, the very
# branch its update merges (✗ measured 2026-11-14: counted against the original it said 25 while the update merged 23).
HEAD_SHA="" AHEAD="" BEHIND="" PHASE="" ORIGIN="" MOVED=""
if [ -d "$NODE_DIR/.git" ] && [ "${DRY_RUN:-0}" != 1 ] && id -u fractera >/dev/null 2>&1 && command -v runuser >/dev/null 2>&1; then
  HEAD_SHA="$(runuser -u fractera -- git -C "$NODE_DIR" rev-parse HEAD 2>/dev/null)"
  ORIGIN="$(runuser -u fractera -- git -C "$NODE_DIR" remote get-url origin 2>/dev/null | sed -E 's#^(https?://)[^/@]*@#\1#')"
  if timeout 40 runuser -u fractera -- git -C "$NODE_DIR" fetch --quiet origin main >/dev/null 2>&1; then
    read -r AHEAD BEHIND <<< "$(runuser -u fractera -- git -C "$NODE_DIR" rev-list --left-right --count HEAD...origin/main 2>/dev/null)"
  fi
  PHASE="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("phase") or "")' "$NODE_DIR/data/node/server.json" 2>/dev/null)"
  MOVED="$(python3 -c 'import json,sys; m=json.load(open(sys.argv[1])); print(json.dumps({"from": m.get("from"), "at": m.get("movedAt")}) if m.get("movedAt") else "")' "$NODE_DIR/data/node/server.json" 2>/dev/null)"
fi
# Other Fractera nodes in the node user's home (another fork's folder name): a server holding one is not this computer's.
OTHER_NODES="$(for d in /home/fractera/*/; do d="${d%/}"; [ "$d" = "$NODE_DIR" ] && continue; [ -f "$d/scripts/dedicated-server/launch.sh" ] && basename "$d"; done 2>/dev/null | paste -sd, -)"
if [ "${FRACTERA_HEAVY:-}" = 1 ]; then
  nice -n 10 du -x --block-size=1G --max-depth=3 / 2>/dev/null | sort -rn | awk '$1 >= 2 {print $2":"$1}' | head -25 > /root/.fractera/heavy.tmp && mv /root/.fractera/heavy.tmp /root/.fractera/heavy.txt
  rm -f /root/.fractera/heavy.running
  exit 0
fi
. /etc/os-release 2>/dev/null
# 806-2: the largest folders — `du` over a whole disk outlasts a probe (✗ 2026-11-19: 30 s cut it on 145 GB), so this script starts
# itself again detached in the measuring mode and the probe reads the last answer; a new one when the last is older than 10 minutes
H=/root/.fractera
if [ "${DRY_RUN:-0}" != 1 ] && [ -d "$H" ] && [ -z "$(find "$H/heavy.txt" -mmin -10 2>/dev/null)" ] && [ -z "$(find "$H/heavy.running" -mmin -30 2>/dev/null)" ]; then
  touch "$H/heavy.running"
  FRACTERA_HEAVY=1 setsid bash "$0" >/dev/null 2>&1 < /dev/null &
fi
busy() { ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q . && echo true || echo false; }
OS_ID="${ID:-unknown}" OS_VERSION="${VERSION_ID:-}" OS_PRETTY="${PRETTY_NAME:-Linux}" ARCH="$(uname -m)" \
CORES="$(nproc 2>/dev/null || echo 1)" \
RAM_MB="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
AVAIL_MB="$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
SWAP_MB="$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)" \
DISK_FREE_GB="$(df -BG --output=avail /home 2>/dev/null | tail -1 | tr -dc '0-9')" \
DISK_TOTAL_GB="$(df -BG --output=size /home 2>/dev/null | tail -1 | tr -dc '0-9')" \
DISK_USED_GB="$(df -BG --output=used /home 2>/dev/null | tail -1 | tr -dc '0-9')" \
COPIES="$(ls -d /root/fractera-cleared-*/nodes/*/ /home/fractera/*.before-*/ 2>/dev/null | sed 's#/$##' | paste -sd, -)" \
HEAVY="$(cat /root/.fractera/heavy.txt 2>/dev/null | paste -sd, -)" \
HEAVY_AT="$(date -u -r /root/.fractera/heavy.txt +%Y-%m-%dT%H:%M:%SZ 2>/dev/null)" \
COPIES_GB="$(c="$(ls -d /root/fractera-cleared-*/nodes/*/ /home/fractera/*.before-*/ 2>/dev/null)"; [ -n "$c" ] && timeout 20 du -scBG $c 2>/dev/null | awk '$2 == "total" {print $1}' | tr -dc '0-9')" \
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
SSH_PORT="$SSH_PORT" HEAD_SHA="$HEAD_SHA" AHEAD="$AHEAD" BEHIND="$BEHIND" PHASE="$PHASE" ORIGIN="$ORIGIN" MOVED="$MOVED" OTHER_NODES="$OTHER_NODES" \
LAUNCHING="$(pgrep -f '[f]ractera/launch.sh' >/dev/null 2>&1 && echo true || echo false)" \
python3 -c '
import json, os
e = os.environ
b = lambda k: e.get(k) == "true"
n = lambda k: int(e.get(k) or 0)
def access():
  import re, time
  try:
    lines = open(os.path.expanduser("~/.ssh/authorized_keys")).read().splitlines()
  except Exception:
    lines = []
  visit, legacy, others = [], False, 0
  for l in (x.strip() for x in lines):
    if not l or l.startswith("#"):
      continue
    if l.endswith(" fractera-node"):
      legacy = True
    elif "fractera-visit" in l:
      m = re.search("expiry-time=.([0-9]{12}).", l)
      try:
        visit.append(time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.mktime(time.strptime(m.group(1), "%Y%m%d%H%M")))))
      except Exception:
        pass
    else:
      others += 1
  return {"visit": sorted(visit), "legacy": legacy, "others": others}
print(json.dumps({
  "os": {"id": e["OS_ID"], "version": e["OS_VERSION"], "pretty": e["OS_PRETTY"], "arch": e["ARCH"]},
  "cores": n("CORES"), "ramMb": n("RAM_MB"), "availMb": n("AVAIL_MB"), "swapMb": n("SWAP_MB"), "diskFreeGb": n("DISK_FREE_GB"),
  "disk": {"totalGb": n("DISK_TOTAL_GB"), "usedGb": n("DISK_USED_GB"), "copies": [x for x in (e.get("COPIES") or "").split(",") if x],
           "copiesGb": int(e["COPIES_GB"]) if e.get("COPIES_GB", "").isdigit() else None,
           "heavyAt": e.get("HEAVY_AT") or None,
           # 806-2 (the owner, 2026-11-19: «чем может быть занята 74 ГБ после очистки»): the largest folders, GB (≥ 2), depth 3
           "heavy": [{"path": x.rsplit(":", 1)[0], "gb": int(x.rsplit(":", 1)[1])} for x in (e.get("HEAVY") or "").split(",") if ":" in x and x.rsplit(":", 1)[1].isdigit()]},
  "ipv6": b("IPV6"), "port80Busy": b("PORT80"), "port443Busy": b("PORT443"), "nginx": b("NGINX"), "systemd": b("SYSTEMD"),
  "nodeVersion": e.get("NODE_VERSION") or None, "publicIp": e.get("PUBLIC_IP") or None, "nodeThere": b("NODE_THERE"),
  "ufw": e["UFW"], "sshPort": n("SSH_PORT"),
  "foreignSites": [x for x in (e.get("FOREIGN_SITES") or "").split(",") if x], "pm2Root": n("PM2_ROOT"),
  "fractera": {"head": e.get("HEAD_SHA") or None, "ahead": int(e["AHEAD"]) if e.get("AHEAD", "").isdigit() else None,
               "behind": int(e["BEHIND"]) if e.get("BEHIND", "").isdigit() else None, "phase": e.get("PHASE") or None,
               "origin": e.get("ORIGIN") or None, "movedFrom": json.loads(e["MOVED"]) if e.get("MOVED") else None,
               "launching": b("LAUNCHING")} if b("NODE_THERE") else None,
  "otherNodes": [x for x in (e.get("OTHER_NODES") or "").split(",") if x],
  "access": access(),
  "at": __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime()),
}))' | { if [ -n "$OUT" ]; then tee "$OUT.tmp" && mv "$OUT.tmp" "$OUT"; else cat; fi; }
