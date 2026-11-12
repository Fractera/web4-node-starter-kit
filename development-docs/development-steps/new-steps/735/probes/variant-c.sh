#!/bin/sh
# Variant C measured in a scratch copy of one native's source at its pin: the dead tool island removed exactly as the native template
# did in 733-6 (b508490), the template's parts machinery and cards brought in, the map built, the guards run, types checked with the
# source's own node_modules (a symlink — nothing is written there). Nothing outside the scratchpad is written.
CORE=${CORE:-$(pwd)}
S=${SCRATCH:-$(mktemp -d)}
PROBES=$(cd "$(dirname "$0")" && pwd)
T=${TEMPLATE:-$CORE/data/workshop/fractera-native-item-starter}
TIP=${TIP:-v0.1.67}
name=$1; src=${SOURCES:-$HOME/fractera-dev}/fractera-$name-starter; tag=$(git -C $src describe --tags --abbrev=0)
d=$S/c-$name; rm -rf $d; mkdir -p $d; git -C $src archive $tag | tar -x -C $d; cd $d
# 1. the island, the template's own list
rm -rf _tools/tool-* _tools/README.md _tools/TOOLS.json app/api/tools/tool-socials-ai app/api/tools/tool-voice-input components/form/mic-icon.tsx components/form/parts.json components/form/voice-control.client.tsx
rmdir components/form 2>/dev/null; rmdir app/api/tools 2>/dev/null; mkdir -p _tools; : > _tools/.gitkeep
left_form=$(ls components/form 2>/dev/null | tr '\n' ' ')
# 2. the machinery and the cards of the native template
for f in lib/parts/parts-find.mjs lib/parts/parts-map.mjs scripts/build-parts-map.mjs scripts/check-parts-map.mjs scripts/check-parts-dup.mjs scripts/parts.mjs scripts/tool-take.mjs scripts/build-tools-map.mjs scripts/check-tools-map.mjs; do mkdir -p $(dirname $f); git -C $T show $TIP:$f > $f; done
for f in $(git -C $T ls-tree -r --name-only $TIP | grep -E "parts\.json$"); do [ -d "$(dirname $f)" ] && git -C $T show $TIP:$f > $f; done
git init -q . ; git add -A >/dev/null 2>&1
node scripts/build-parts-map.mjs > map.log 2>&1; maprc=$?
git add -A >/dev/null 2>&1
mapline=$(tail -1 map.log | cut -c1-80); left=$(grep -c "✗" map.log)
chk=$(node scripts/check-parts-map.mjs 2>&1 | tail -1 | cut -c1-34)
dup=$(node scripts/check-parts-dup.mjs 2>&1 | tail -1 | cut -c1-28)
# 3. types
tscres="no node_modules"
if [ -d "$src/node_modules" ]; then ln -s "$src/node_modules" node_modules; npx tsc --noEmit -p . > tsc.log 2>&1; n=$(grep -c "error TS" tsc.log); tscres="tsc errors: $n"; fi
take=$(CORE=$CORE node $PROBES/plan-all.mjs $d 2>&1 | tail -1)
printf "%-12s %-9s %s · left ✗:%s · %s · %s · %s · %s%s\n" "$name" "$tag" "$mapline" "$left" "$chk" "$dup" "$tscres" "$take" "${left_form:+ · components/form keeps: $left_form}"
[ "$left" != "0" ] && grep "✗" map.log | cut -c1-210 | head -6
[ -f tsc.log ] && grep "error TS" tsc.log | cut -c1-230 | head -8
exit 0
