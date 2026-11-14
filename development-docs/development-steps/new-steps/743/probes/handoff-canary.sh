#!/usr/bin/env bash
# 743-2 proof — the TARGET's updater does the update. A scratch fork whose head is BASE + one canary commit (its node-update.mjs prints
# CANARY-TARGET-UPDATER); a node at BASE, diverged as at install, no identity git may use.
#   1 stage 0                          → «run by the target <canary>», the canary printed, state.updater = canary, merge signed by the machine
#   2 the node's own updater directly  → no canary (negative control)
#   3 a target without @handoff v1     → the node's own updater runs, said in one line
#   4 kill -9 mid-run, then stage 0    → no worktree and no tmp folder left
# Usage: handoff-canary.sh <scratch> <core working copy> <BASE commit with stage 0> <an older commit without @handoff>
set -u
S="$1"; CORE="$2"; BASE="$3"; OLD="$4"
W="$S/w3"; rm -rf "$W"; mkdir -p "$W/home" "$W/bin" "$W/tmp"
printf '#!/bin/sh\necho "probe: npm $* refused by the probe"\nexit 1\n' > "$W/bin/npm"; chmod +x "$W/bin/npm"
git clone -q --bare "$CORE" "$W/fork.git"
canary() { # $1 = what the canary does after the check stage
  rm -rf "$W/c"; git clone -q "$W/fork.git" "$W/c"; git -C "$W/c" reset -q --hard "$BASE"
  python3 - "$W/c/scripts/node-update.mjs" "$1" <<'EOF'
import sys
p, extra = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
a = "stage('check', 'проверка')\n"
s = s.replace(a, a + "say('CANARY-TARGET-UPDATER')\n" + extra + "\n", 1)
open(p, 'w', encoding='utf-8').write(s)
EOF
  git -C "$W/c" -c user.name=t -c user.email=t@t.invalid commit -q -am "canary"
  git -C "$W/c" push -q -f "$W/fork.git" HEAD:main
  git -C "$W/c" rev-parse --short=8 HEAD
}
fixture() {
  rm -rf "$1"; git clone -q "$W/fork.git" "$1"; git -C "$1" reset -q --hard "$BASE"
  git -C "$1" config user.useConfigOnly true
  mkdir -p "$1/logs"; printf '{"verdict":"fork"}\n' > "$1/logs/origin.json"
  printf '\nThe node itself, written at install.\n' >> "$1/development-docs/development-steps/current-steps.md"
  git -C "$1" -c user.name="Fractera node" -c user.email=node@localhost commit -q -am "Fresh project"
}
E=(env -i HOME="$W/home" PATH="$W/bin:/usr/local/bin:/usr/bin:/bin" GIT_CONFIG_NOSYSTEM=1 FRACTERA_NO_WAKE=1)
leftovers() { echo "worktrees: $(git -C "$1" worktree list | wc -l | tr -d ' ') · tmp folders: $(ls /tmp | grep -c fractera-update-)"; }   # env -i: os.tmpdir() = /tmp (a symlink on macOS)

C=$(canary "")
echo "== 1: stage 0, target = canary $C"
fixture "$W/n1"; "${E[@]}" FRACTERA_BUILD_LOG="$W/n1.log" node "$W/n1/scripts/node-update-stage0.mjs" > "$W/n1.log" 2>&1
grep -m1 "stage 0:" "$W/n1.log"; echo "canary lines: $(grep -c CANARY-TARGET-UPDATER "$W/n1.log")"
python3 -c "import json;j=json.load(open('$W/n1/data/node/node-update.json'));print('state=%s stage=%s updater=%s' % (j['state'], j['stage'], j.get('updater')))"
M=$(git -C "$W/n1" reflog --format='%h %gs' | grep -m1 'merge origin/main' | cut -d' ' -f1); echo "merge $M signed: $(git -C "$W/n1" log -1 --format='%an <%ae> / %cn <%ce>' "$M")"
leftovers "$W/n1"

echo "== 2: the node's own updater directly (negative control)"
fixture "$W/n2"; "${E[@]}" FRACTERA_BUILD_LOG="$W/n2.log" node "$W/n2/scripts/node-update.mjs" > "$W/n2.log" 2>&1
echo "canary lines: $(grep -c CANARY-TARGET-UPDATER "$W/n2.log") · $(grep -m1 'обновляет:' "$W/n2.log")"

echo "== 3: a target without @handoff v1 ($OLD)"
git -C "$W/fork.git" update-ref refs/heads/main "$OLD"
fixture "$W/n3"; "${E[@]}" FRACTERA_BUILD_LOG="$W/n3.log" node "$W/n3/scripts/node-update-stage0.mjs" > "$W/n3.log" 2>&1
grep -m1 "stage 0:" "$W/n3.log"

echo "== 4: kill -9 in the middle, then stage 0 again"
C2=$(canary "await new Promise((r) => setTimeout(r, 120000))")
fixture "$W/n4"; ( "${E[@]}" FRACTERA_BUILD_LOG="$W/n4.log" node "$W/n4/scripts/node-update-stage0.mjs" > "$W/n4.log" 2>&1 & echo $! > "$W/n4.pid" )
for i in $(seq 1 40); do grep -q CANARY-TARGET-UPDATER "$W/n4.log" 2>/dev/null && break; sleep 0.5; done
echo "during the run: $(leftovers "$W/n4")"
pkill -9 -f "$W/n4" ; sleep 1
echo "after kill -9: $(leftovers "$W/n4")"
C3=$(canary "")
"${E[@]}" FRACTERA_BUILD_LOG="$W/n4b.log" node "$W/n4/scripts/node-update-stage0.mjs" > "$W/n4b.log" 2>&1
echo "after the next stage 0: $(leftovers "$W/n4")"
