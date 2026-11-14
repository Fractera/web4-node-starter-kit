#!/usr/bin/env bash
# 743 probe 2 — the update knows whether its merge will pass BEFORE it touches the node, in seconds, on git 2.37 (no `merge-tree
# --write-tree`, which needs git ≥ 2.38: Apple git on the owner's Mac is 2.37.1). A throwaway worktree of the node's HEAD, the merge there,
# the verdict, the worktree removed. Two cases on the fixture of probe 1: clean (expected: passes) and a node commit that touches a file
# the fork also changed (expected: names the file). Proof that the node is untouched: its HEAD and `git status` before = after.
# Usage: dry-merge.sh <scratch> <core working copy> <BASE> <TARGET> <a file TARGET changed after BASE>
set -u
S="$1"; CORE="$2"; BASE="$3"; TARGET="$4"; HOT="$5"
W="$S/w2"; rm -rf "$W"; mkdir -p "$W"
git clone -q --bare "$CORE" "$W/fork.git"; git -C "$W/fork.git" update-ref refs/heads/main "$TARGET"
fixture() { # $1 folder, $2 file the node's own commit touches
  rm -rf "$1"; git clone -q "$W/fork.git" "$1"; git -C "$1" reset -q --hard "$BASE"
  if [ "$2" = "$HOT" ]; then sed -i '' 's/Собираю сайт заново/Собираю сайт заново (the node own words)/' "$1/$2"   # a line next to TARGET's change
  else printf '\nthe node own line\n' >> "$1/$2"; fi
  git -C "$1" -c user.name=n -c user.email=n@x.invalid commit -q -am "node's own commit"
}
dry() { # $1 node folder
  local before after t0 t1 wt="$1.dry"
  before="$(git -C "$1" rev-parse HEAD)$(git -C "$1" status --porcelain | shasum)"
  t0=$(python3 -c 'import time;print(time.time())')
  git -C "$1" worktree add -q --detach "$wt" HEAD
  if git -C "$wt" -c user.name="Fractera node" -c user.email=node@fractera.invalid merge -q --no-commit --no-ff origin/main >/dev/null 2>&1
  then echo "verdict: merge passes"
  else echo "verdict: merge stops at: $(git -C "$wt" diff --name-only --diff-filter=U | tr '\n' ' ')"; fi
  git -C "$1" worktree remove --force "$wt"; git -C "$1" worktree prune
  t1=$(python3 -c 'import time;print(time.time())')
  after="$(git -C "$1" rev-parse HEAD)$(git -C "$1" status --porcelain | shasum)"
  python3 -c "print('seconds: %.2f' % ($t1-$t0))"
  echo "node untouched: $([ "$before" = "$after" ] && echo yes || echo NO)"
}
echo "== clean: the node's own commit touches only its steps"; fixture "$W/clean" development-docs/development-steps/current-steps.md; dry "$W/clean"
echo "== conflict: the node's own commit touches $HOT"; fixture "$W/hot" "$HOT"; dry "$W/hot"
