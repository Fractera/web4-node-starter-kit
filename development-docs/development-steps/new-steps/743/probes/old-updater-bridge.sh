#!/usr/bin/env bash
# 743 probe 1 — a fix in the updater never reaches the node that needs it, because the node runs its OWN (old) updater.
# Fixture = a node installed at BASE (before 741-8), diverged from birth by its own commit (as scripts/fresh-project.mjs does at every
# install), with no git identity it may use; its fork = a bare copy of Fractera at TARGET (which already carries the 741-8 fix).
#   A (negative control): the node's own updater (BASE)            → expected: failed at «merge» (no identity), node restored
#   B (the principle)     : the TARGET's updater on the same node   → expected: merge passes; stopped later by a fake npm (stage deps/guards)
# Model-free; touches only the scratch folder given as $1. Usage: old-updater-bridge.sh <scratch> <core working copy> <BASE> <TARGET>
set -u
S="$1"; CORE="$2"; BASE="$3"; TARGET="$4"
rm -rf "$S/w"; mkdir -p "$S/w/home" "$S/w/bin"
W="$S/w"
# A fake npm: the updater's stages after the merge (deps, guards) call npm; it refuses so nothing heavy runs and the rollback is measured.
printf '#!/bin/sh\necho "probe: npm $* refused by the probe"\nexit 1\n' > "$W/bin/npm"; chmod +x "$W/bin/npm"
git clone -q --bare "$CORE" "$W/fork.git"
git -C "$W/fork.git" update-ref refs/heads/main "$TARGET"

fixture() { # $1 = folder
  rm -rf "$1"; git clone -q "$W/fork.git" "$1"
  git -C "$1" reset -q --hard "$BASE"
  git -C "$1" config user.useConfigOnly true          # the server's case: git may not invent an identity from the host name
  mkdir -p "$1/logs"; printf '{"verdict":"fork"}\n' > "$1/logs/origin.json"
  printf '\nThe node itself, written at install.\n' >> "$1/development-docs/development-steps/current-steps.md"
  git -C "$1" -c user.name="Fractera node" -c user.email=node@localhost commit -q -am "Fresh project (as scripts/fresh-project.mjs at install)"
}
run_update() { # $1 = folder, $2 = updater file to run
  env -i HOME="$W/home" PATH="$W/bin:/usr/local/bin:/usr/bin:/bin" GIT_CONFIG_NOSYSTEM=1 FRACTERA_BUILD_LOG="$1.log" FRACTERA_NO_WAKE=1 \
    node "$2" > "$1.log" 2>&1
  echo "exit=$?"
}
report() { # $1 = folder, $2 = HEAD before
  python3 - "$1/data/node/node-update.json" <<'EOF'
import json,sys
j=json.load(open(sys.argv[1])); print("state=%s stage=%s reason=%s" % (j.get("state"), j.get("stage"), (j.get("reason") or "")[:160].replace("\n"," ")))
EOF
  echo "identity error in log: $(grep -c -E 'identity unknown|Please tell me who you are|auto-detection is disabled' "$1.log")"
  echo "HEAD restored: $([ "$(git -C "$1" rev-parse HEAD)" = "$2" ] && echo yes || echo NO)"
}

echo "== whoami for git in the fixture (must be empty): '$(env -i HOME="$W/home" GIT_CONFIG_NOSYSTEM=1 PATH=/usr/bin:/bin git -C "$CORE" config user.email)'"

echo "== A: the node's own updater ($(git -C "$CORE" rev-parse --short "$BASE")) updates to $(git -C "$CORE" rev-parse --short "$TARGET")"
fixture "$W/a"; HA="$(git -C "$W/a" rev-parse HEAD)"
run_update "$W/a" "$W/a/scripts/node-update.mjs"; report "$W/a" "$HA"

echo "== B: the TARGET's updater on the same node"
fixture "$W/b"; HB="$(git -C "$W/b" rev-parse HEAD)"
mkdir -p "$W/target"; git -C "$W/fork.git" archive "$TARGET" scripts/node-update.mjs lib/deploy | tar -x -C "$W/target"
# the target's updater placed where the node would load it (its ROOT is its own folder today — 743-1 removes that limit)
cp "$W/target/scripts/node-update.mjs" "$W/b/scripts/node-update.mjs"; cp "$W/target/lib/deploy/"*.{cjs,mjs} "$W/b/lib/deploy/" 2>/dev/null
run_update "$W/b" "$W/b/scripts/node-update.mjs"; report "$W/b" "$HB"
echo "merge passed in B: $(grep -c 'узел на ' "$W/b.log") (the line «узел на <head>» is printed only after a successful merge)"
