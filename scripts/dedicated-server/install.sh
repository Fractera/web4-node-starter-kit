#!/usr/bin/env bash
# THE NODE IS INSTALLED ON ITS SERVER FROM ITS OWN COPY (node step 737-4). Run as the node's user, detached, after the first copy; every
# stage skips what is already done, so a cut-off run continues where it stopped.
# 🔒 NOT `npm run launch`: launch is for a FRESH clone (it would ask about memory and run `fresh-project.mjs`, which strips a starter's
# history — the moved node's mark `logs/fresh-project.json` travels and keeps it safe anyway). A moved node only needs its packages, its
# builds and its elements for THIS system.
set -u
cd "$(dirname "$0")/../.." || exit 1
NODE_DIR="$(pwd)"
mkdir -p logs/dedicated-server
export PROGRESS="$NODE_DIR/logs/dedicated-server/install.progress.jsonl" LOG="$NODE_DIR/logs/dedicated-server/install.log"
. "$NODE_DIR/scripts/dedicated-server/stages.sh"
export PATH="$HOME/.local/bin:$PATH" NODE_ENV=
emit install running

# No quick tunnel on the server: its public face is nginx (the IP, then the domain). `serve:start` reads this mark (serve.mjs, `unpublished`).
stage marks 'printf "{\n  \"url\": null,\n  \"unpublished\": true,\n  \"reason\": \"dedicated-server\"\n}\n" > logs/tunnel.json'
# preinstall: check-local, ensure-env, ensure-claude (the official installer → ~/.local/bin/claude), ensure-cloudflared;
# postinstall: ensure-pty (node-pty builds with build-essential + python3), ensure-eyes (Chromium; its system libraries come next).
stage deps 'lock=$(sha256sum package-lock.json | cut -c1-16); if [ ! -d node_modules ] || [ "$(cat logs/dedicated-server/deps.sha 2>/dev/null)" != "$lock" ]; then npm ci --no-audit --no-fund && echo "$lock" > logs/dedicated-server/deps.sha; fi'
soft_stage eyes 'sudo -n /usr/local/sbin/fractera-root playwright-deps && npm run -s eyes:install'
stage build 'head=$(git rev-parse HEAD); if [ ! -f .next/BUILD_ID ] || [ "$(cat logs/dedicated-server/build.sha 2>/dev/null)" != "$head" ]; then npm run build && echo "$head" > logs/dedicated-server/build.sha; fi'
# Every element: its packages and its build for Linux, its env file regenerated with this machine's paths (own and foreign keys kept),
# the graph's Python by its own prebuild. Nothing is started here — services:install restarts only what already runs.
stage elements 'npm run services:install'
emit install done
