#!/usr/bin/env bash
# THE NODE STARTS ON ITS SERVER (node step 737-4). Run as the node's user after a copy: `silent` (the rehearsal — no bot tokens and no
# named tunnel arrived, agent wakes are refused by the mark in data/node/server.json) or `live` (after the move's last copy).
set -u
PHASE="${1:?silent|live}"
[ "$PHASE" = silent ] || [ "$PHASE" = live ] || { echo "phase is silent or live" >&2; exit 2; }
cd "$(dirname "$0")/../.." || exit 1
NODE_DIR="$(pwd)"
mkdir -p logs/dedicated-server
export PROGRESS="$NODE_DIR/logs/dedicated-server/start-$PHASE.progress.jsonl" LOG="$NODE_DIR/logs/dedicated-server/start-$PHASE.log"
: > "$PROGRESS"
. "$NODE_DIR/scripts/dedicated-server/stages.sh"
export PATH="$HOME/.local/bin:$PATH" NODE_ENV=
emit start running

# The last copy brought this computer's element env files back (with its paths): the installer writes them again for this machine —
# quick when packages and builds are already here — and rebuilds only what the copy changed.
stage elements 'npm run services:install'
stage build 'head=$(git rev-parse HEAD); if [ ! -f .next/BUILD_ID ] || [ "$(cat logs/dedicated-server/build.sha 2>/dev/null)" != "$head" ]; then npm run build && echo "$head" > logs/dedicated-server/build.sha; fi'
stage serve 'npm run serve:start'
stage nginx 'node scripts/server.mjs nginx --write && sudo -n /usr/local/sbin/fractera-root nginx-apply'
stage save 'pm2 save'
# The instruction's first line asks whether the node is installed (`logs/launch.json` → `started`): on the server it is.
stage launch-mark 'node -e "
const fs = require(\"fs\"), { execSync } = require(\"child_process\"), { createHash } = require(\"crypto\");
const f = \"logs/launch.json\"; let j = {}; try { j = JSON.parse(fs.readFileSync(f, \"utf8\")) } catch {}
const head = execSync(\"git rev-parse HEAD\").toString().trim();
Object.assign(j, { started: head, startedAt: new Date().toISOString(), build: head, deps: createHash(\"sha256\").update(fs.readFileSync(\"package-lock.json\")).digest(\"hex\").slice(0, 16), server: true });
fs.writeFileSync(f, JSON.stringify(j, null, 2) + \"\\n\")"'
emit start done
