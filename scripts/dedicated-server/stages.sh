#!/usr/bin/env bash
# STAGES OF A LONG SERVER SCRIPT — one JSON line per event into "$PROGRESS" (node step 737-4). Sourced by prepare.sh and install.sh.
# The node reads the file over SSH (`tail`) and folds the lines: the last line of a stage id is its state. A stage body runs in a
# subshell (`( eval … )`) so a `cd`, an `exit` or a changed variable never leaks into the next stage — ✗ paid in the Fractera easy
# starter (lib/bootstrap.sh): two installs froze at 57 % and 77 % before the subshell.
# DRY_RUN=1 prints every command instead of running it (the rehearsal without a server).

: "${PROGRESS:?PROGRESS is not set}"
: "${LOG:?LOG is not set}"

json_str() { python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }
now() { date -u +%Y-%m-%dT%H:%M:%SZ; }

emit() { # id state [detail]
  local detail="${3:-}"
  printf '{"id":"%s","state":"%s","at":"%s","detail":%s}\n' "$1" "$2" "$(now)" "$(printf '%s' "$detail" | json_str)" >> "$PROGRESS"
}

stage() { # id command — fatal on failure
  local id="$1"; shift
  emit "$id" running
  echo "### $(now) $id: $*" >> "$LOG"
  if [ "${DRY_RUN:-0}" = "1" ]; then echo "DRY $id: $*"; emit "$id" done "dry run"; return 0; fi
  if ( eval "$*" ) >> "$LOG" 2>&1; then
    emit "$id" done
  else
    local rc=$?
    emit "$id" failed "exit $rc: $(tail -c 700 "$LOG")"
    exit 1
  fi
}

soft_stage() { # id command — a failure is named and skipped
  local id="$1"; shift
  emit "$id" running
  echo "### $(now) $id (soft): $*" >> "$LOG"
  if [ "${DRY_RUN:-0}" = "1" ]; then echo "DRY $id: $*"; emit "$id" done "dry run"; return 0; fi
  if ( eval "$*" ) >> "$LOG" 2>&1; then emit "$id" done; else emit "$id" skipped "$(tail -c 400 "$LOG")"; fi
}

wait_for_apt() {
  local waited=0
  while fuser /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock >/dev/null 2>&1; do
    [ "$waited" -ge 600 ] && return 0
    sleep 5; waited=$((waited + 5))
  done
}
