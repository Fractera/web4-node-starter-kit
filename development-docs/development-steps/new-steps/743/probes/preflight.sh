#!/usr/bin/env bash
# 743-4 proof — the update knows before touching. A scratch fork whose head is BASE + one commit that changes a line of scripts/serve.mjs;
# nodes at BASE with their own commit:
#   clean — the node's commit touches only its steps     → --preflight says ok; the real update goes past «preflight»
#   hot   — the node's commit changes the same serve.mjs line → --preflight names scripts/serve.mjs; the real update is refused AT
#           «preflight»: no backup folder, HEAD and `git status` byte-equal before and after
# Usage: preflight.sh <scratch> <core working copy> <BASE commit with 743-4>
set -u
S="$1"; CORE="$2"; BASE="$3"
W="$S/w4"; rm -rf "$W"; mkdir -p "$W/home" "$W/bin"
printf '#!/bin/sh\necho "probe: npm $* refused by the probe"\nexit 1\n' > "$W/bin/npm"; chmod +x "$W/bin/npm"
git clone -q --bare "$CORE" "$W/fork.git"
rm -rf "$W/c"; git clone -q "$W/fork.git" "$W/c"; git -C "$W/c" reset -q --hard "$BASE"
sed -i '' 's/Собираю сайт заново/Собираю сайт заново (the target words)/' "$W/c/scripts/serve.mjs"
git -C "$W/c" -c user.name=t -c user.email=t@t.invalid commit -q -am "target changes a serve.mjs line"; git -C "$W/c" push -q -f "$W/fork.git" HEAD:main
fixture() { # $1 folder, $2 clean|hot
  rm -rf "$1"; git clone -q "$W/fork.git" "$1"; git -C "$1" reset -q --hard "$BASE"; git -C "$1" config user.useConfigOnly true
  mkdir -p "$1/logs"; printf '{"verdict":"fork"}\n' > "$1/logs/origin.json"
  if [ "$2" = hot ]; then sed -i '' 's/Собираю сайт заново/Собираю сайт заново (the node own words)/' "$1/scripts/serve.mjs"
  else printf '\nThe node itself.\n' >> "$1/development-docs/development-steps/current-steps.md"; fi
  git -C "$1" -c user.name=n -c user.email=n@n.invalid commit -q -am "the node's own commit"
}
E=(env -i HOME="$W/home" PATH="$W/bin:/usr/local/bin:/usr/bin:/bin" GIT_CONFIG_NOSYSTEM=1 FRACTERA_NO_WAKE=1)
snap() { echo "$(git -C "$1" rev-parse HEAD) $(git -C "$1" status --porcelain | shasum | cut -c1-12) backups=$(ls "$1/logs/node-update" 2>/dev/null | wc -l | tr -d ' ') state=$([ -f "$1/data/node/node-update.json" ] && echo yes || echo no)"; }
for kind in clean hot; do
  N="$W/$kind"; fixture "$N" "$kind"
  echo "== $kind: --preflight"
  B="$(snap "$N")"; t0=$(python3 -c 'import time;print(time.time())')
  "${E[@]}" FRACTERA_BUILD_LOG="$N.pre.log" node "$N/scripts/node-update-stage0.mjs" --preflight > "$N.pre.log" 2>&1
  python3 -c "import time;print('seconds: %.2f' % (time.time()-$t0))"
  grep -m1 "===NODE_UPDATE_PREFLIGHT===" "$N.pre.log" | cut -c1-260
  echo "untouched by the preflight: $([ "$B" = "$(snap "$N")" ] && echo yes || echo NO) ($(snap "$N"))"
  echo "== $kind: the real update"
  "${E[@]}" FRACTERA_BUILD_LOG="$N.log" node "$N/scripts/node-update-stage0.mjs" > "$N.log" 2>&1
  python3 -c "import json;j=json.load(open('$N/data/node/node-update.json'));print('state=%s stage=%s conflicts=%s' % (j['state'], j['stage'], j.get('conflicts')))"
  echo "after: $(snap "$N")"
done
